from flask import Blueprint, request
from app.main.services.rideRequests import (
    create_ride_request,
    get_all_ride_requests,
    get_ride_request_by_id,
    update_ride_request,
    delete_ride_request,
    get_ride_requests_by_ride,
    get_ride_requests_by_rider,
    get_ride_requests_by_driver
)

ride_requests_bp = Blueprint('ride_requests_bp', __name__)

# Create a new ride request
@ride_requests_bp.route('/ride-requests', methods=['POST'])
def create_request():
    data = request.get_json()
    return create_ride_request(data)

# Get all ride requests
@ride_requests_bp.route('/ride-requests', methods=['GET'])
def fetch_all_requests():
    return get_all_ride_requests()

# Get a ride request by request_id
@ride_requests_bp.route('/ride-requests/<int:request_id>', methods=['GET'])
def fetch_request_by_id(request_id):
    return get_ride_request_by_id(request_id)

# Update a ride request (e.g., status)
@ride_requests_bp.route('/ride-requests/<int:request_id>', methods=['PUT'])
def update_request(request_id):
    data = request.get_json()
    return update_ride_request(request_id, data)

# Delete a ride request
@ride_requests_bp.route('/ride-requests/<int:request_id>', methods=['DELETE'])
def delete_request(request_id):
    return delete_ride_request(request_id)

# Get all ride requests for a specific ride
@ride_requests_bp.route('/ride-requests/ride/<int:ride_id>', methods=['GET'])
def get_requests_by_ride(ride_id):
    return get_ride_requests_by_ride(ride_id)

# Get all ride requests by a specific rider
@ride_requests_bp.route('/ride-requests/rider/<int:rider_id>', methods=['GET'])
def get_requests_by_rider(rider_id):
    return get_ride_requests_by_rider(rider_id)


@ride_requests_bp.route('/ride-requests/driver/<int:driver_id>', methods=['GET'])
def get_requests_by_driver(driver_id):
    return get_ride_requests_by_driver(driver_id)