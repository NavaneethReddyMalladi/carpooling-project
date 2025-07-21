from flask import jsonify
from app import db
from app.main.models.routeStops import RouteStop
from app.main.models.stops import Stops
from sqlalchemy.exc import SQLAlchemyError

from sqlalchemy import text

def create_route_stop(data):
    try:
        start_stop = Stops.query.get(data['start_stop_id'])
        end_stop = Stops.query.get(data['end_stop_id'])


        if not start_stop or not end_stop:
            return jsonify({"error": "Start or end stop not found"}), 404
        if start_stop.stop_type.name not in ['ORIGIN', 'INTERMEDIATE']:
            return jsonify({"error": "Start stop must be ORIGIN or INTERMEDIATE"}), 400

        if start_stop.route_id != end_stop.route_id:
            return jsonify({"error": "Start and end stop must belong to the same route"}), 400

        new_route = RouteStop(
            start_stop_id=start_stop.stop_id,
            end_stop_id=end_stop.stop_id,
            distance=data['distance'],
            cost=data['cost']
        )

        db.session.add(new_route)
        db.session.commit()
        return jsonify({"message": "Route stop created", "route_id": new_route.route_id}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500




def get_all_route_stops():
    try:
        route_stops = RouteStop.query.all()
        result = [{
            "route_id": stop.route_id,
            "start_stop_id": stop.start_stop_id,
            "end_stop_id": stop.end_stop_id,
            "distance": stop.distance,
            "cost": stop.cost
        } for stop in route_stops]
        return jsonify(result), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500



def get_route_stop_by_id(route_stop_id):
    stop = RouteStop.query.get(route_stop_id)
    if not stop:
        return jsonify({"message": "Route stop not found"}), 404
    return jsonify({
        "route_id": stop.route_stop_id,
        "start_stop_id": stop.start_stop_id,
        "end_stop_id": stop.end_stop_id,
        "distance": stop.distance,
        "cost": stop.cost
    }), 200




def update_route_stop(route_stop_id, data):
    stop = RouteStop.query.get(route_stop_id)
    if not stop:
        return jsonify({"message": "Route stop not found"}), 404
    try:
        stop.start_stop_id = data.get('start_stop_id', stop.start_stop_id)
        stop.end_stop_id = data.get('end_stop_id', stop.end_stop_id)
        stop.distance = data.get('distance', stop.distance)
        stop.cost = data.get('cost', stop.cost)
        db.session.commit()
        return jsonify({"message": "Route stop updated"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500




def delete_route_stop(route_stop_id):
    stop = RouteStop.query.get(route_stop_id)
    if not stop:
        return jsonify({"message": "Route stop not found"}), 404
    try:
        db.session.delete(stop)
        db.session.commit()
        return jsonify({"message": "Route stop deleted"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
 


def add_multiple_routes_service(data_list):
    for data in data_list:
        route = RouteStop(
            start_stop_id=data['start_stop_id'],
            end_stop_id=data['end_stop_id'],
            distance=data['distance'],
            cost=data['cost']
        )
        db.session.add(route)
    db.session.commit()
    return {"message": "All routes added successfully"}




def get_all_source_stops():
    try:
        sources = Stops.query.filter(
            Stops.stop_type.in_(['ORIGIN', 'INTERMEDIATE'])
        ).order_by(Stops.route_id, Stops.stop_order).all()

        result = [{"stop_id": s.stop_id, "stop_name": s.stop_name} for s in sources]
        return jsonify(result), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500



def get_all_destination_stops(source_stop_id):
    try:
        source_stop = Stops.query.get(source_stop_id)
        if not source_stop:
            return jsonify({"error": "Source stop not found"}), 404

        destinations = Stops.query.filter(
            Stops.route_id == source_stop.route_id,
            Stops.stop_order > source_stop.stop_order
        ).order_by(Stops.stop_order).all()

        result = [{"stop_id": d.stop_id, "stop_name": d.stop_name} for d in destinations]
        return jsonify(result), 200

    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500


