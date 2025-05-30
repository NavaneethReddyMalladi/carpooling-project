from flask import jsonify, request
from app.main.models.rides import  Rides
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app import db


# Create a new ride
def create_ride(data):
    try:
        new_ride = Rides(
            driver_id=data['driver_id'],
            origin_stop_id=data['origin_stop_id'],
            destination_stop_id=data['destination_stop_id'],
            route_id=data['route_id'],
            departure_time=datetime.strptime(data['departure_time'], '%Y-%m-%d %H:%M:%S'),
            available_seats=data['available_seats'],
            status=data.get('status', 'Active')
        )
        db.session.add(new_ride)
        db.session.commit()
        return jsonify({"message": "Ride created", "ride_id": new_ride.ride_id}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Get all rides (with optional filters)
def get_all_rides(filters=None):
    try:
        query = Rides.query

        if filters:
            if 'driver_id' in filters:
                query = query.filter_by(driver_id=filters['driver_id'])
            if 'route_id' in filters:
                query = query.filter_by(route_id=filters['route_id'])
            if 'status' in filters:
                query = query.filter_by(status=filters['status'])

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

# Get ride by ID
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

# Update a ride
def update_ride(ride_id, data):
    ride = Rides.query.get(ride_id)
    if not ride:
        return jsonify({"message": "Ride not found"}), 404
    try:
        ride.driver_id = data.get('driver_id', ride.driver_id)
        ride.origin_stop_id = data.get('origin_stop_id', ride.origin_stop_id)
        ride.destination_stop_id = data.get('destination_stop_id', ride.destination_stop_id)
        ride.route_id = data.get('route_id', ride.route_id)
        if 'departure_time' in data:
            ride.departure_time = datetime.strptime(data['departure_time'], '%Y-%m-%d %H:%M:%S')
        ride.available_seats = data.get('available_seats', ride.available_seats)
        ride.status = data.get('status', ride.status)
        ride.update_datetime = datetime.utcnow()
        db.session.commit()
        return jsonify({"message": "Ride updated successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Delete a ride
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
