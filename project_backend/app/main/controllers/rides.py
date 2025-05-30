from flask import Blueprint, request
from app.main.services.rides import (
    create_ride,
    get_ride_by_id,
    get_all_rides,
    update_ride,
    delete_ride
)

rides_bp = Blueprint('rides_bp', __name__)

# -----------------------
# POST /rides - Create a new ride
# -----------------------
@rides_bp.route('/rides', methods=['POST'])
def create_new_ride():
    data = request.get_json()
    return create_ride(data)

# -----------------------------
# GET /rides/<int:ride_id> - Get ride by ID
# -----------------------------
@rides_bp.route('/rides/<int:ride_id>', methods=['GET'])
def get_ride(ride_id):
    return get_ride_by_id(ride_id)

# -----------------------
# GET /rides - Get all rides (optionally with filters)
# -----------------------
@rides_bp.route('/rides', methods=['GET'])
def get_rides():
    filters = request.args.to_dict()
    return get_all_rides(filters)

# -----------------------------
# PUT /rides/<int:ride_id> - Update ride
# -----------------------------
@rides_bp.route('/rides/<int:ride_id>', methods=['PUT'])
def update_ride_by_id(ride_id):
    data = request.get_json()
    return update_ride(ride_id, data)

# -----------------------------
# DELETE /rides/<int:ride_id> - Delete ride
# -----------------------------
@rides_bp.route('/rides/<int:ride_id>', methods=['DELETE'])
def delete_ride_by_id(ride_id):
    return delete_ride(ride_id)
