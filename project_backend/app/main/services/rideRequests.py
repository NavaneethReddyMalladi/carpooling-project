from flask import jsonify, request
from app import db
from app.main.models.rideRequests import RideRequestsTable
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

# Create a new ride request
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

# Get all ride requests
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

# Get a ride request by ID
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

# Update a ride request (e.g., status)
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

# Delete a ride request
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

# Get all ride requests for a specific ride
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

# Get all ride requests by a specific rider
def get_ride_requests_by_rider(rider_id):
    try:
        requests = RideRequestsTable.query.filter_by(rider_id=rider_id).all()
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


# ⬇️ add at top of file
from app.main.models.rides import Rides
from sqlalchemy.orm import joinedload

# -----------------------------------------------------------
# Get all ride requests for a specific driver  (NEW FUNCTION)
# -----------------------------------------------------------
def get_ride_requests_by_driver(driver_id):
    """
    Return all requests whose ride belongs to the given driver_id.
    Includes rider & ride information for convenience.
    """
    try:
        # Eager‑load ride & rider info to avoid N+1 queries
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
            rider = req.rider  # assuming FK relationship rider_id → User table

            result.append({
                "request_id"   : req.request_id,
                "ride_id"      : req.ride_id,
                "rider_id"     : req.rider_id,
                "status"       : req.status,
                "requested_at" : req.requested_at,
                # optional nested data
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
