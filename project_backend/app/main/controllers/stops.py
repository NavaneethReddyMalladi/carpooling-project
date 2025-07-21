from flask import Blueprint, request
from app.main.services.stops import (
    create_stop,
    get_all_stops,
    get_stop_by_id,
    update_stop,
    delete_stop
)

stops_bp = Blueprint('stops_bp', __name__)



@stops_bp.route('/stops', methods=['POST'])
def create():
    data = request.get_json()
    return create_stop(data)


@stops_bp.route('/stops', methods=['GET'])
def fetch_all():
    return get_all_stops()



@stops_bp.route('/stops/<int:stop_id>', methods=['GET'])
def fetch_by_id(stop_id):
    return get_stop_by_id(stop_id)



@stops_bp.route('/stops/<int:stop_id>', methods=['PUT'])
def update(stop_id):
    data = request.get_json()
    return update_stop(stop_id, data)



@stops_bp.route('/stops/<int:stop_id>', methods=['DELETE'])
def delete(stop_id):
    return delete_stop(stop_id)

