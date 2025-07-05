from flask import jsonify, request
from app.main.models.rides import Rides
from app.main.models.stops import Stops
from app.main.models.routeStops import RouteStop
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app import db

# --- Helper Functions ---

def find_valid_route_id(origin_stop_id, destination_stop_id):
    origin_routes = db.session.query(Stops.route_id)\
        .filter_by(stop_id=origin_stop_id).subquery()
    destination_routes = db.session.query(Stops.route_id)\
        .filter_by(stop_id=destination_stop_id).subquery()

    common_routes = db.session.query(Stops.route_id)\
        .filter(Stops.route_id.in_(origin_routes.select()))\
        .filter(Stops.route_id.in_(destination_routes.select()))\
        .distinct().all()

    route_ids = [r[0] for r in common_routes]
    for route_id in route_ids:
        origin = Stops.query.filter_by(route_id=route_id, stop_id=origin_stop_id).first()
        dest = Stops.query.filter_by(route_id=route_id, stop_id=destination_stop_id).first()
        if origin and dest and origin.stop_order < dest.stop_order:
            return route_id
    return None


# --- CRUD: Create Ride ---

def create_ride(data):
    try:
        origin_stop_id = data['origin_stop_id']
        destination_stop_id = data['destination_stop_id']
        route_id = find_valid_route_id(origin_stop_id, destination_stop_id)

        if not route_id:
            return jsonify({"error": "No valid route found with proper stop order"}), 400

        new_ride = Rides(
            driver_id=data['driver_id'],
            origin_stop_id=origin_stop_id,
            destination_stop_id=destination_stop_id,
            route_id=route_id,
            departure_time=datetime.strptime(data['departure_time'], '%Y-%m-%d %H:%M:%S'),
            available_seats=data['available_seats'],
            status=data.get('status', 'Active')
        )

        db.session.add(new_ride)
        db.session.commit()
        return jsonify({"message": "Ride created", "ride_id": new_ride.ride_id}), 201

    except (KeyError, ValueError) as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# --- CRUD: Get All Rides ---

def get_all_rides(filters=None):
    try:
        query = Rides.query
        if filters:
            query = query.filter_by(**filters)
        rides = query.all()

        result = [{
            "ride_id": r.ride_id,
            "driver_id": r.driver_id,
            "origin_stop_id": r.origin_stop_id,
            "destination_stop_id": r.destination_stop_id,
            "route_id": r.route_id,
            "departure_time": r.departure_time.strftime('%Y-%m-%d %H:%M:%S'),
            "available_seats": r.available_seats,
            "status": r.status,
            "create_datetime": r.create_datetime,
            "update_datetime": r.update_datetime
        } for r in rides]

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- CRUD: Get Ride by ID ---

def get_ride_by_id(ride_id):
    ride = Rides.query.get(ride_id)
    if not ride:
        return jsonify({"message": "Ride not found"}), 404

    return jsonify({
        "ride_id": ride.ride_id,
        "driver_id": ride.driver_id,
        "origin_stop_id": ride.origin_stop_id,
        "destination_stop_id": ride.destination_stop_id,
        "route_id": ride.route_id,
        "departure_time": ride.departure_time.strftime('%Y-%m-%d %H:%M:%S'),
        "available_seats": ride.available_seats,
        "status": ride.status,
        "create_datetime": ride.create_datetime,
        "update_datetime": ride.update_datetime
    }), 200


# --- CRUD: Update Ride ---

def update_ride(ride_id, data):
    ride = Rides.query.get(ride_id)
    if not ride:
        return jsonify({"message": "Ride not found"}), 404

    try:
        origin_id = data.get('origin_stop_id', ride.origin_stop_id)
        destination_id = data.get('destination_stop_id', ride.destination_stop_id)

        if 'origin_stop_id' in data or 'destination_stop_id' in data:
            new_route_id = find_valid_route_id(origin_id, destination_id)
            if not new_route_id:
                return jsonify({"error": "No valid route for updated stops"}), 400
            ride.route_id = new_route_id

        ride.driver_id = data.get('driver_id', ride.driver_id)
        ride.origin_stop_id = origin_id
        ride.destination_stop_id = destination_id

        if 'departure_time' in data:
            ride.departure_time = datetime.strptime(data['departure_time'], '%Y-%m-%d %H:%M:%S')

        ride.available_seats = data.get('available_seats', ride.available_seats)
        ride.status = data.get('status', ride.status)
        ride.update_datetime = datetime.utcnow()

        db.session.commit()
        return jsonify({"message": "Ride updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# --- CRUD: Delete Ride ---

def delete_ride(ride_id):
    ride = Rides.query.get(ride_id)
    if not ride:
        return jsonify({"message": "Ride not found"}), 404

    try:
        db.session.delete(ride)
        db.session.commit()
        return jsonify({"message": "Ride deleted successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# --- Rider Search Functionality ---

def rider_search(origin_stop_id, destination_stop_id):
    if not origin_stop_id or not destination_stop_id:
        return jsonify({"error": "Both origin_stop_id and destination_stop_id are required"}), 400

    route_id = find_valid_route_id(origin_stop_id, destination_stop_id)
    if not route_id:
        return jsonify({"message": "No valid route with proper stop order"}), 404

    rides = Rides.query.filter_by(route_id=route_id).all()

    result = []
    for ride in rides:
        origin = Stops.query.filter_by(stop_id=ride.origin_stop_id).first()
        destination = Stops.query.filter_by(stop_id=ride.destination_stop_id).first()
        driver = ride.driver if hasattr(ride, 'driver') else None

        route_detail = RouteStop.query.filter_by(
            start_stop_id=origin_stop_id,
            end_stop_id=destination_stop_id
        ).first()

        cost = route_detail.cost if route_detail else "N/A"
        distance = route_detail.distance if route_detail else "N/A"
        estimated_time = f"{distance * 2} minutes" if isinstance(distance, (int, float)) else "N/A"

        result.append({
            "ride_id": ride.ride_id,
            "driver_name": getattr(driver, 'driver_name', 'Unknown'),
            "origin_stop_id": ride.origin_stop_id,
            "origin_name": origin.stop_name if origin else "Unknown",
            "destination_stop_id": ride.destination_stop_id,
            "destination_name": destination.stop_name if destination else "Unknown",
            "departure_time": ride.departure_time.strftime('%Y-%m-%d %H:%M:%S'),
            "available_seats": ride.available_seats,
            "status": ride.status,
            "distance": distance,
            "cost": cost,
            "estimated_time": estimated_time
        })

    return jsonify(result), 200


from sqlalchemy.orm import aliased   # ⬅️ add at top of file

def get_rides_by_driver_id(driver_id):
    """
    Get all rides for a specific driver, including origin/destination stop names.
    """
    try:
        # ── Alias the stops table ────────────────────────────────────────────────
        origin      = aliased(Stops)
        destination = aliased(Stops)

        rides = db.session.query(
                    Rides,
                    origin.stop_name.label('origin_name'),
                    destination.stop_name.label('destination_name')
                )\
                .join(origin,      Rides.origin_stop_id      == origin.stop_id)\
                .join(destination, Rides.destination_stop_id == destination.stop_id)\
                .filter(Rides.driver_id == driver_id)\
                .order_by(Rides.departure_time.desc())\
                .all()

        # If the aliased join returned nothing, fall back to the simple query.
        if not rides:
            rides_data  = Rides.query.filter_by(driver_id=driver_id)\
                                     .order_by(Rides.departure_time.desc())\
                                     .all()

            rides_list = []
            for ride in rides_data:
                origin_stop      = Stops.query.get(ride.origin_stop_id)
                destination_stop = Stops.query.get(ride.destination_stop_id)

                rides_list.append({
                    'ride_id'         : ride.ride_id,
                    'driver_id'       : ride.driver_id,
                    'origin_stop_id'  : ride.origin_stop_id,
                    'destination_stop_id': ride.destination_stop_id,
                    'route_id'        : ride.route_id,
                    'departure_time'  : ride.departure_time.isoformat() if ride.departure_time else None,
                    'available_seats' : ride.available_seats,
                    'status'          : ride.status,
                    'created_at'      : ride.create_datetime.isoformat() if ride.create_datetime else None,
                    'updated_at'      : ride.update_datetime.isoformat() if ride.update_datetime else None,
                    'origin_name'     : origin_stop.stop_name if origin_stop else 'Unknown',
                    'destination_name': destination_stop.stop_name if destination_stop else 'Unknown'
                })
            return jsonify(rides_list), 200

        # ── Normal case: process aliased join results ───────────────────────────
        rides_list = []
        for ride, origin_name, destination_name in rides:
            rides_list.append({
                'ride_id'         : ride.ride_id,
                'driver_id'       : ride.driver_id,
                'origin_stop_id'  : ride.origin_stop_id,
                'destination_stop_id': ride.destination_stop_id,
                'route_id'        : ride.route_id,
                'departure_time'  : ride.departure_time.isoformat() if ride.departure_time else None,
                'available_seats' : ride.available_seats,
                'status'          : ride.status,
                'created_at'      : ride.create_datetime.isoformat() if ride.create_datetime else None,
                'updated_at'      : ride.update_datetime.isoformat() if ride.update_datetime else None,
                'origin_name'     : origin_name,
                'destination_name': destination_name
            })

        return jsonify(rides_list), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500






# ⬇️ add just below get_rides_by_driver_id(...)
from datetime import datetime, date
from sqlalchemy import func

def get_driver_stats(driver_id):
    """
    Return ride statistics for a given driver_id.
    Fields returned:
      todayEarnings, totalRides, completedRides,
      cancelledRides, activeRides, averageRating, onlineHours
    """
    try:
        # All rides for this driver
        rides = Rides.query.filter_by(driver_id=driver_id).all()

        total_rides      = len(rides)
        completed_rides  = sum(r.status == 'completed' for r in rides)
        cancelled_rides  = sum(r.status == 'cancelled' for r in rides)
        active_rides     = sum(r.status == 'active'    for r in rides)

        # Earnings just for today
        today = date.today()
        today_earnings = sum(
            (r.fare_amount or 0)
            for r in rides
            if r.status == 'completed' and r.departure_time.date() == today
        )

        # If you store per‑ride driver rating
        ratings = [r.rating for r in rides if hasattr(r, "rating") and r.rating]
        average_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0

        # TODO: Replace with real online‑hours calculation if you track it
        online_hours = 0

        return jsonify({
            "todayEarnings": today_earnings,
            "totalRides": total_rides,
            "completedRides": completed_rides,
            "cancelledRides": cancelled_rides,
            "activeRides": active_rides,
            "averageRating": average_rating,
            "onlineHours": online_hours
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
