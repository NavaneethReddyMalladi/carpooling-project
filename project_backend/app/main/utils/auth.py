from flask import Blueprint, request, jsonify
from app import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.main.models.user import User
from werkzeug.security import generate_password_hash, check_password_hash
import re
from sqlalchemy.exc import SQLAlchemyError,IntegrityError
from app.main.models.drivers import Drivers
auth_bp = Blueprint('auth', __name__)

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def is_valid_phone(phone):
    return re.match(r"^\d{1,}$", phone)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        name = data.get('user_name')
        email = data.get('email')
        phone_number = data.get('phone_number')
        gender = data.get('gender')
        password = data.get('password')
        role_id = data.get('role_id')

        # Validate required fields
        if not all([name, email, phone_number, gender, password, role_id]): 
            return jsonify({"message": "All fields are required"}), 400

        if not is_valid_email(email):
            return jsonify({"message": "Invalid email format"}), 400

        if not is_valid_phone(phone_number):
            return jsonify({"message": "Invalid phone number"}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"message": "Email already registered"}), 409

        if User.query.filter_by(phone_number=phone_number).first():
            return jsonify({"message": "Phone number already registered"}), 409

        hashed_password = generate_password_hash(password)

        # Create a new user
        new_user = User(
            user_name=name,
            email=email,
            phone_number=phone_number,
            gender=gender,
            password=hashed_password,
            role_id=role_id
        )

        # If role_id == 1, create associated driver details
        if int(role_id) == 1:
            experience = data.get('experience')
            license_number = data.get('license_number')

            if not all([experience, license_number]):
                return jsonify({"message": "Driver details required for role_id 1"}), 400

            new_user.driver = Drivers(
                driver_name=name,
                experience=experience,
                license_number=license_number
            )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User added successfully"}), 201

    except IntegrityError as e:
        db.session.rollback()
        print(e)
        return jsonify({"message": "Integrity Error"}), 409

    except SQLAlchemyError as e:
        db.session.rollback()
        print(e)
        return jsonify({"message": "Database Error"}), 500

    except Exception as e:
        print("❌ DATABASE ERROR:", e)
        return jsonify({"message": "Internal Server Error"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not all(k in data for k in ("email", "password")):
        return jsonify({"message": "Missing email or password"}), 400

    user = User.query.filter_by(email=data['email']).first()

    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity={"user_id": user.user_id, "role_id": user.role_id})
        return jsonify({"token": access_token, "role_id": user.role_id,     # send role_id separately
        "user_id": user.user_id  }), 200

    return jsonify({"message": "Invalid email or password"}), 401


@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"logged_in_as": current_user}), 200
