# from flask import Blueprint, request
# from app.main.services.riders import (
#     create_rider,
#     get_all_riders,
#     get_rider_by_id,
#     get_rider_by_user_id,
#     update_rider,
#     delete_rider
# )

# rider_bp = Blueprint('rider_bp', __name__)

# # --------------------------------
# # POST /riders - Create a new rider
# # --------------------------------
# @rider_bp.route('/riders', methods=['POST'])
# def add_rider():
#     data = request.get_json()
#     return create_rider(data)

# # --------------------------------
# # GET /riders - Get all riders
# # --------------------------------
# @rider_bp.route('/riders', methods=['GET'])
# def fetch_all_riders():
#     return get_all_riders()

# # -----------------------------------------
# # GET /riders/<int:rider_id> - Get rider by ID
# # -----------------------------------------
# @rider_bp.route('/riders/<int:rider_id>', methods=['GET'])
# def fetch_rider_by_id(rider_id):
#     return get_rider_by_id(rider_id)

# # ------------------------------------------------
# # GET /riders/user/<int:user_id> - Get rider by user_id
# # ------------------------------------------------
# @rider_bp.route('/riders/user/<int:user_id>', methods=['GET'])
# def fetch_rider_by_user_id(user_id):
#     return get_rider_by_user_id(user_id)

# # ---------------------------------------------
# # PUT /riders/<int:rider_id> - Update rider details
# # ---------------------------------------------
# @rider_bp.route('/riders/<int:rider_id>', methods=['PUT'])
# def modify_rider(rider_id):
#     data = request.get_json()
#     return update_rider(rider_id, data)

# # ---------------------------------------------
# # DELETE /riders/<int:rider_id> - Delete a rider
# # ---------------------------------------------
# @rider_bp.route('/riders/<int:rider_id>', methods=['DELETE'])
# def remove_rider(rider_id):
#     return delete_rider(rider_id)
