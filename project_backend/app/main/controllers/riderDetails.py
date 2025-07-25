from flask import Blueprint, request
from app.main.services.riderDetails import (
    add_rider_details,
    get_all_rider_details,
    get_rider_details_by_id,
    update_rider_details,
    delete_rider_details,
    get_rider_details_by_rider
)

rider_details_bp = Blueprint('rider_details_bp', __name__)



@rider_details_bp.route('/rider-details', methods=['POST'])
def create_rider_details():
    data = request.get_json()
    return add_rider_details(data)




@rider_details_bp.route('/rider-details', methods=['GET'])
def fetch_all_rider_details():
    return get_all_rider_details()




@rider_details_bp.route('/rider-details/<int:details_id>', methods=['GET'])
def fetch_rider_details_by_id(details_id):
    return get_rider_details_by_id(details_id)



@rider_details_bp.route('/rider-details/<int:details_id>', methods=['PUT'])
def modify_rider_details(details_id):
    data = request.get_json()
    return update_rider_details(details_id, data)



@rider_details_bp.route('/rider-details/<int:details_id>', methods=['DELETE'])
def remove_rider_details(details_id):
    return delete_rider_details(details_id)



@rider_details_bp.route('/rider-details/rider/<int:rider_id>', methods=['GET'])
def fetch_rider_details_by_rider(rider_id):
    return get_rider_details_by_rider(rider_id)
