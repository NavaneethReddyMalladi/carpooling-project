from flask import jsonify
from app import db
from app.main.models.stops import Stops, StopTypeEnum
from sqlalchemy.exc import SQLAlchemyError

# Create a stop
def create_stop(data):
    try:
        # Convert string to Enum
        stop_type = StopTypeEnum[data['stop_type']] if 'stop_type' in data else StopTypeEnum.INTERMEDIATE

        new_stop = Stops(
            stop_name=data['stop_name'],
            stop_type=stop_type,
            route_id=data['route_id'],
            stop_order=data['stop_order']
        )
        db.session.add(new_stop)
        db.session.commit()
        return jsonify({"message": "Stop created", "stop_id": new_stop.stop_id}), 201
    except (KeyError, ValueError) as e:
        return jsonify({"error": f"Invalid stop_type: {str(e)}"}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Get all stops
def get_all_stops():
    try:
        stops = Stops.query.order_by(Stops.route_id, Stops.stop_order).all()
        result = [{
            "stop_id": stop.stop_id,
            "stop_name": stop.stop_name,
            "stop_type": stop.stop_type.name,  # .name gives 'ORIGIN' etc.
            "route_id": stop.route_id,
            "stop_order": stop.stop_order,
            "create_datetime": stop.create_datetime.isoformat()
        } for stop in stops]
        return jsonify(result), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

# Get stop by ID
def get_stop_by_id(stop_id):
    stop = Stops.query.get(stop_id)
    if not stop:
        return jsonify({"message": "Stop not found"}), 404
    return jsonify({
        "stop_id": stop.stop_id,
        "stop_name": stop.stop_name,
        "stop_type": stop.stop_type.name,
        "route_id": stop.route_id,
        "stop_order": stop.stop_order,
        "create_datetime": stop.create_datetime.isoformat()
    }), 200

# Update stop
def update_stop(stop_id, data):
    stop = Stops.query.get(stop_id)
    if not stop:
        return jsonify({"message": "Stop not found"}), 404
    try:
        if 'stop_type' in data:
            stop.stop_type = StopTypeEnum[data['stop_type']]  # Validate enum
        stop.stop_name = data.get('stop_name', stop.stop_name)
        stop.route_id = data.get('route_id', stop.route_id)
        stop.stop_order = data.get('stop_order', stop.stop_order)
        db.session.commit()
        return jsonify({"message": "Stop updated"}), 200
    except (KeyError, ValueError) as e:
        return jsonify({"error": f"Invalid stop_type: {str(e)}"}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Delete stop
def delete_stop(stop_id):
    stop = Stops.query.get(stop_id)
    if not stop:
        return jsonify({"message": "Stop not found"}), 404
    try:
        db.session.delete(stop)
        db.session.commit()
        return jsonify({"message": "Stop deleted"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
