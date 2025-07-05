# from flask import Blueprint, request
# # from flask_jwt_extended import jwt_required,get_jwt_identity
# from app.main.services.rides import (
#     create_ride,
#     get_ride_by_id,
#     get_all_rides,
#     update_ride,
#     delete_ride,
#     rider_search
# )

# rides_bp = Blueprint('rides_bp', __name__)

# # -----------------------
# # POST /rides - Create a new ride

# @rides_bp.route('/rides', methods=['POST'])
# # @jwt_required()
# def create_new_ride():
#     data = request.get_json()
#     # user_id=get_jwt_identity()
#     return create_ride(data)

# # -----------------------------
# # GET /rides/<int:ride_id> - Get ride by ID
# # -----------------------------
# @rides_bp.route('/rides/<int:ride_id>', methods=['GET'])
# def get_ride(ride_id):
#     return get_ride_by_id(ride_id)

# # -----------------------
# # GET /rides - Get all rides (optionally with filters)
# # -----------------------
# @rides_bp.route('/rides', methods=['GET'])
# def get_rides():
#     filters = request.args.to_dict()
#     return get_all_rides(filters)

# # -----------------------------
# # PUT /rides/<int:ride_id> - Update ride
# # -----------------------------
# @rides_bp.route('/rides/<int:ride_id>', methods=['PUT'])
# def update_ride_by_id(ride_id):
#     data = request.get_json()
#     return update_ride(ride_id, data)

# # -----------------------------
# # DELETE /rides/<int:ride_id> - Delete ride
# # -----------------------------
# @rides_bp.route('/rides/<int:ride_id>', methods=['DELETE'])
# def delete_ride_by_id(ride_id):
#     return delete_ride(ride_id)


# @rides_bp.route('/rides/search', methods=['GET'])
# def rider_search_route():
#     origin_stop_id = request.args.get('origin_stop_id', type=int)
#     destination_stop_id = request.args.get('destination_stop_id', type=int)

#     # Call service function with parameters
#     return rider_search(origin_stop_id,destination_stop_id)








from flask import Blueprint, request
# from flask_jwt_extended import jwt_required,get_jwt_identity
from app.main.services.rides import (
    create_ride,
    get_ride_by_id,
    get_all_rides,
    update_ride,
    delete_ride,
    rider_search,
    get_rides_by_driver_id,
    get_driver_stats 
)

rides_bp = Blueprint('rides_bp', __name__)

# -----------------------
# POST /rides - Create a new ride

@rides_bp.route('/rides', methods=['POST'])
# @jwt_required()
def create_new_ride():
    data = request.get_json()
    # user_id=get_jwt_identity()
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
# GET /rides/driver/<int:driver_id> - Get rides by driver ID
# -----------------------------
@rides_bp.route('/rides/driver/<int:driver_id>', methods=['GET'])
def get_rides_by_driver(driver_id):
    return get_rides_by_driver_id(driver_id)

# -----------------------------
# PUT /rides/<int:ride_id> - Update ride
# -----------------------------
@rides_bp.route('/rides/<int:ride_id>', methods=['PUT'])
def update_ride_by_id(ride_id):
    data = request.get_json()
    return update_ride(ride_id, data)

# -----------------------------
# PATCH /rides/<int:ride_id> - Update ride (partial update)
# -----------------------------
@rides_bp.route('/rides/<int:ride_id>', methods=['PATCH'])
def patch_ride_by_id(ride_id):
    data = request.get_json()
    return update_ride(ride_id, data)

# -----------------------------
# DELETE /rides/<int:ride_id> - Delete ride
# -----------------------------
@rides_bp.route('/rides/<int:ride_id>', methods=['DELETE'])
def delete_ride_by_id(ride_id):
    return delete_ride(ride_id)

@rides_bp.route('/rides/search', methods=['GET'])
def rider_search_route():
    origin_stop_id = request.args.get('origin_stop_id', type=int)
    destination_stop_id = request.args.get('destination_stop_id', type=int)

    # Call service function with parameters
    return rider_search(origin_stop_id,destination_stop_id)


@rides_bp.route('/rides/driver/<int:driver_id>/stats', methods=['GET'])
# @requires_roles(1, 3)                # 1 = driver, 3 = admin
def driver_stats(driver_id):
    return get_driver_stats(driver_id)



