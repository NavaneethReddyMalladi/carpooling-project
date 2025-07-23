from flask import jsonify, request
from app import db
from app.main.models.rideRequests import RideRequestsTable
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app.main.models.rides import Rides
from app.main.models.user import User  # Adjust import as needed

from sqlalchemy.orm import joinedload


def create_ride_request(data):
    try:
        new_request = RideRequestsTable(
            ride_id=data['ride_id'],
            rider_id=data['rider_id'],
            status=data.get('status', 'Pending'),
            requested_at=datetime.utcnow()
        )
        db.session.add(new_request)
        db.session.commit()
        return jsonify({"message": "Ride request created successfully"}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500





def get_all_ride_requests():
    try:
        requests = RideRequestsTable.query.all()
        result = []
        for r in requests:
            result.append({
                "request_id": r.request_id,
                "ride_id": r.ride_id,
                "rider_id": r.rider_id,
                "status": r.status,
                "requested_at": r.requested_at
            })
        return jsonify(result), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500




def get_ride_request_by_id(request_id):
    try:
        r = RideRequestsTable.query.get(request_id)
        if not r:
            return jsonify({"message": "Ride request not found"}), 404

        return jsonify({
            "request_id": r.request_id,
            "ride_id": r.ride_id,
            "rider_id": r.rider_id,
            "status": r.status,
            "requested_at": r.requested_at
        }), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500




def update_ride_request(request_id, data):
    try:
        r = RideRequestsTable.query.get(request_id)
        if not r:
            return jsonify({"message": "Ride request not found"}), 404

        r.status = data.get('status', r.status)
        db.session.commit()
        return jsonify({"message": "Ride request updated successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500




def delete_ride_request(request_id):
    try:
        r = RideRequestsTable.query.get(request_id)
        if not r:
            return jsonify({"message": "Ride request not found"}), 404

        db.session.delete(r)
        db.session.commit()
        return jsonify({"message": "Ride request deleted successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500




def get_ride_requests_by_ride(ride_id):
    try:
        requests = RideRequestsTable.query.filter_by(ride_id=ride_id).all()
        result = [{
            "request_id": r.request_id,
            "ride_id": r.ride_id,
            "rider_id": r.rider_id,
            "status": r.status,
            "requested_at": r.requested_at
        } for r in requests]
        return jsonify(result), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500




def get_ride_requests_by_rider(rider_id):
    try:
        requests = (
            RideRequestsTable.query
            .join(Rides, RideRequestsTable.ride_id == Rides.ride_id)
            .options(joinedload(RideRequestsTable.ride), joinedload(RideRequestsTable.rider))
            .filter(RideRequestsTable.rider_id == rider_id)
            .order_by(RideRequestsTable.requested_at.desc())
            .all()
        )

        result = []
        for req in requests:
            ride = req.ride
            # Get driver information from the ride
            driver = None
            if ride and ride.driver_id:
                # You'll need to import and join with your User/Driver model
                # Assuming you have a User model that contains driver info
                driver = User.query.get(ride.driver_id)

            result.append({
                "request_id": req.request_id,
                "ride_id": req.ride_id,
                "rider_id": req.rider_id,
                "status": req.status,
                "requested_at": req.requested_at,
                "ride": {
                    "origin_stop_id": ride.origin_stop_id,
                    "destination_stop_id": ride.destination_stop_id,
                    "departure_time": ride.departure_time,
                    "available_seats": ride.available_seats,
                    "price": getattr(ride, 'price', None)  # If price exists in Rides model
                } if ride else None,
                "driver": {
                    "driver_id": ride.driver_id,
                    "driver_name": getattr(driver, "user_name", "Unknown Driver"),
                    "phone": getattr(driver, "phone_number", None),
                } if driver else {
                    "driver_id": ride.driver_id if ride else None,
                    "driver_name": "Unknown Driver",
                    "phone": None
                }
            })

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



def get_ride_requests_by_driver(driver_id):
   
    try:
        requests = (
            RideRequestsTable.query
            .join(Rides, RideRequestsTable.ride_id == Rides.ride_id)
            .options(joinedload(RideRequestsTable.ride), joinedload(RideRequestsTable.rider))
            .filter(Rides.driver_id == driver_id)
            .order_by(RideRequestsTable.requested_at.desc())
            .all()
        )

        result = []
        for req in requests:
            ride = req.ride
            rider = req.rider 

            result.append({
                "request_id"   : req.request_id,
                "ride_id"      : req.ride_id,
                "rider_id"     : req.rider_id,
                "status"       : req.status,
                "requested_at" : req.requested_at,
                "ride": {
                    "origin_stop_id"   : ride.origin_stop_id,
                    "destination_stop_id": ride.destination_stop_id,
                    "departure_time"   : ride.departure_time,
                    "available_seats"  : ride.available_seats
                } if ride else None,
                "rider": {
                    "user_name" : getattr(rider, "user_name", None),
                    "phone"     : getattr(rider, "phone_number", None),
                } if rider else None
            })

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
