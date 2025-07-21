from flask import jsonify, request
from app import db
from app.main.models.riderDetails import RiderDetails
from sqlalchemy.exc import SQLAlchemyError


def add_rider_details(data):
    try:
        new_details = RiderDetails(
            rider_id=data['rider_id'],
            start_stop_id=data['start_stop_id'],
            end_stop_id=data['end_stop_id'],
            gender_preference=data.get('gender_preference')
        )
        db.session.add(new_details)
        db.session.commit()

        return jsonify({"message": "Rider details added successfully"}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



def get_all_rider_details():
    try:
        details = RiderDetails.query.all()
        result = []
        for d in details:
            result.append({
                "rider_details_id": d.rider_details_id,
                "rider_id": d.rider_id,
                "start_stop_id": d.start_stop_id,
                "end_stop_id": d.end_stop_id,
                "gender_preference": d.gender_preference
            })
        return jsonify(result), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500




def get_rider_details_by_id(details_id):
    try:
        d = RiderDetails.query.get(details_id)
        if not d:
            return jsonify({"message": "Rider details not found"}), 404

        return jsonify({
            "rider_details_id": d.rider_details_id,
            "rider_id": d.rider_id,
            "start_stop_id": d.start_stop_id,
            "end_stop_id": d.end_stop_id,
            "gender_preference": d.gender_preference
        }), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500




def update_rider_details(details_id, data):
    try:
        d = RiderDetails.query.get(details_id)
        if not d:
            return jsonify({"message": "Rider details not found"}), 404

        d.rider_id = data.get('rider_id', d.rider_id)
        d.start_stop_id = data.get('start_stop_id', d.start_stop_id)
        d.end_stop_id = data.get('end_stop_id', d.end_stop_id)
        d.gender_preference = data.get('gender_preference', d.gender_preference)

        db.session.commit()
        return jsonify({"message": "Rider details updated successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500




def delete_rider_details(details_id):
    try:
        d = RiderDetails.query.get(details_id)
        if not d:
            return jsonify({"message": "Rider details not found"}), 404

        db.session.delete(d)
        db.session.commit()
        return jsonify({"message": "Rider details deleted successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



def get_rider_details_by_rider(rider_id):
    try:
        details = RiderDetails.query.filter_by(rider_id=rider_id).all()
        output = [{
            "rider_details_id": d.rider_details_id,
            "rider_id": d.rider_id,
            "start_stop_id": d.start_stop_id,
            "end_stop_id": d.end_stop_id,
            "gender_preference": d.gender_preference
        } for d in details]
        return jsonify(output), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500
