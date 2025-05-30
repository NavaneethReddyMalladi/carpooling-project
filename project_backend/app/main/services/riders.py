# from flask import jsonify, request
# from app.main.models.riders import db, Riders
# from sqlalchemy.exc import SQLAlchemyError
# from datetime import datetime

# # Create a new rider
# def create_rider(data):
#     try:
#         new_rider = Riders(
#             user_id=data['user_id'],
#             rider_name=data['rider_name'],
#             rider_gender=data['rider_gender'],
#             phone_number=data['phone_number'],
#             email=data['email'],
#             create_datetime=datetime.utcnow()
#         )
#         db.session.add(new_rider)
#         db.session.commit()
#         return jsonify({"message": "Rider created successfully", "rider_id": new_rider.rider_id}), 201
#     except SQLAlchemyError as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500

# # Get all riders
# def get_all_riders():
#     try:
#         riders = Riders.query.all()
#         result = [{
#             "rider_id": r.rider_id,
#             "user_id": r.user_id,
#             "rider_name": r.rider_name,
#             "rider_gender": r.rider_gender,
#             "phone_number": r.phone_number,
#             "email": r.email,
#             "create_datetime": r.create_datetime,
#             "update_datetime": r.update_datetime
#         } for r in riders]
#         return jsonify(result), 200
#     except Exception:
#         return jsonify({"message": "Internal server error"}), 500

# # Get rider by ID
# def get_rider_by_id(rider_id):
#     rider = Riders.query.get(rider_id)
#     if not rider:
#         return jsonify({"message": "Rider not found"}), 404
#     return jsonify({
#         "rider_id": rider.rider_id,
#         "user_id": rider.user_id,
#         "rider_name": rider.rider_name,
#         "rider_gender": rider.rider_gender,
#         "phone_number": rider.phone_number,
#         "email": rider.email,
#         "create_datetime": rider.create_datetime,
#         "update_datetime": rider.update_datetime
#     }), 200

# # Get rider by user_id
# def get_rider_by_user_id(user_id):
#     rider = Riders.query.filter_by(user_id=user_id).first()
#     if not rider:
#         return jsonify({"message": "Rider not found"}), 404
#     return jsonify({
#         "rider_id": rider.rider_id,
#         "user_id": rider.user_id,
#         "rider_name": rider.rider_name,
#         "rider_gender": rider.rider_gender,
#         "phone_number": rider.phone_number,
#         "email": rider.email,
#         "create_datetime": rider.create_datetime,
#         "update_datetime": rider.update_datetime
#     }), 200

# # Update rider
# def update_rider(rider_id, data):
#     rider = Riders.query.get(rider_id)
#     if not rider:
#         return jsonify({"message": "Rider not found"}), 404
#     try:
#         rider.rider_name = data.get('rider_name', rider.rider_name)
#         rider.rider_gender = data.get('rider_gender', rider.rider_gender)
#         rider.phone_number = data.get('phone_number', rider.phone_number)
#         rider.email = data.get('email', rider.email)
#         rider.update_datetime = datetime.utcnow()
#         db.session.commit()
#         return jsonify({"message": "Rider updated successfully"}), 200
#     except SQLAlchemyError as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500

# # Delete rider
# def delete_rider(rider_id):
#     rider = Riders.query.get(rider_id)
#     if not rider:
#         return jsonify({"message": "Rider not found"}), 404
#     try:
#         db.session.delete(rider)
#         db.session.commit()
#         return jsonify({"message": "Rider deleted successfully"}), 200
#     except SQLAlchemyError as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500
