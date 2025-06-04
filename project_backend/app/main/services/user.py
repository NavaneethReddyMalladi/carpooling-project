from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError,IntegrityError
from app.main.models.user import User
from app.main.models.drivers import Drivers
from app import db    #update based on ypur db file
from werkzeug.security import generate_password_hash,check_password_hash
import re

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def is_valid_phone(phone):
    return re.match(r"^\d{1,}$", phone)
def get_user_by_id(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Fetch driver details using user_id
        driver = Drivers.query.filter_by(user_id=user_id).first()

        user_data = {
            "user_id": user.user_id,
            "user_name": user.user_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "is_verified": user.is_verified,
            "gender": user.gender,
            "role_id": user.role_id,
            "create_datetime": user.create_datetime,
            "driver_id": driver.driver_id if driver else None  # Add driver_id if exists
        }

        return jsonify(user_data), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal Server Error"}), 500

    
def get_all_users():
    try:
        users = User.query.all()
        output = []
        for user in users:
            user_data = {
                "user_id": user.user_id,
                "user_name": user.user_name,
                "email": user.email,
                "phone_number": user.phone_number,
                "gender": user.gender,
                "is_verified": user.is_verified,
                "role_id": user.role_id,
                "created_at": user.create_datetime
            }
            output.append(user_data)
        return jsonify(output), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal Server Error"}), 500

def update_user(user_id,data):
    try:
        user=User.query.get(user_id)
        if not user:
            return jsonify({"message":"User Not Found"}),404
        email=data.get('email')
        phone=data.get('phone_number')

        if email and email !=user.email and User.query.filter_by(email=email).first():
            return jsonify({"message":"Email already in use"}),409
        if phone and phone != user.phone_number and User.query.filter_by(phone_number=phone).first():
            return jsonify({"message": "Phone number already in use"}), 409
        
        user.user_name=data.get('user_name',user.user_name)
        user.email = email or user.email
        # if email:
        #     user.email=email
        # else:
        #     user.email=user.email

        user.phone_number = phone or user.phone_number
        user.gender = data.get('gender', user.gender)
        user.is_verified = data.get('is_verified', user.is_verified)
        user.role_id = data.get('role_id', user.role_id)

        if 'password' in data:
            user.password = generate_password_hash(data['password'])

        db.session.commit()
        return jsonify({"message": "User updated successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        print(e)
        return jsonify({"message": "Database error"}), 500
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal Server Error"}), 500

def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        print(e)
        return jsonify({"message": "Database error"}), 500
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal Server Error"}), 500
   


    

