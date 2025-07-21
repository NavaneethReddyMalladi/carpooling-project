from flask import Blueprint, request
from app.main.services.routeStops import (
    create_route_stop,
    get_all_route_stops,
    get_route_stop_by_id,
    update_route_stop,
    delete_route_stop,
    add_multiple_routes_service,
    get_all_source_stops,
    get_all_destination_stops    
)

route_stops_bp = Blueprint('route_stops_bp', __name__)

@route_stops_bp.route('/route-stops', methods=['POST'])
def create_stop():
    data = request.get_json()
    return create_route_stop(data)

@route_stops_bp.route('/route-stops', methods=['GET'])
def fetch_all_stops():
    return get_all_route_stops()

@route_stops_bp.route('/route-stops/<int:route_stop_id>', methods=['GET'])
def fetch_stop_by_id(route_stop_id):
    return get_route_stop_by_id(route_stop_id)

@route_stops_bp.route('/route-stops/<int:route_stop_id>', methods=['PUT'])
def update_stop(route_stop_id):
    data = request.get_json()
    return update_route_stop(route_stop_id, data)

@route_stops_bp.route('/route-stops/<int:route_stop_id>', methods=['DELETE'])
def delete_stop(route_stop_id):
    return delete_route_stop(route_stop_id)

@route_stops_bp.route('/routes-stops', methods=['POST'])
def add_multiple_routes():
    data_list = request.get_json()
    return add_multiple_routes_service(data_list)


@route_stops_bp.route('/route-stops/sources', methods=['GET'])
def get_sources():
    return get_all_source_stops()

@route_stops_bp.route('/route-stops/destinations', methods=['GET'])
def get_destinations():
    source_stop_id = request.args.get('source_stop_id', type=int)
    if not source_stop_id:
        return {"error": "source_stop_id is required"}, 400
    return get_all_destination_stops(source_stop_id)
