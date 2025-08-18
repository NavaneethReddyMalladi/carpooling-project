from flask import Blueprint, request, jsonify
from app import db
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.main.models.user import User
from werkzeug.security import generate_password_hash, check_password_hash
import re
from sqlalchemy.exc import SQLAlchemyError,IntegrityError

from app.main.models.drivers import Drivers

from itsdangerous import URLSafeTimedSerializer
from flask import current_app

from app import mail   # 👈 import mail from your app/__init__.py

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
        print(" DATABASE ERROR:", e)
        return jsonify({"message": "Internal Server Error"}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not all(k in data for k in ("email", "password")):
        return jsonify({"message": "Missing email or password"}), 400

    user = User.query.filter_by(email=data['email']).first()

    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity={"user_id": user.user_id, "role_name": user.role.role_name})
        return jsonify({"token": access_token, "role_name": user.role.role_name,    
        "user_id": user.user_id  }), 200

    return jsonify({"message": "Invalid email or password"}), 401


@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"logged_in_as": current_user}), 200




def generate_reset_token(email):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(email, salt="password-reset-salt")

def verify_reset_token(token, expiration=3600):  # 1 hour expiry
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt="password-reset-salt", max_age=expiration)
    except Exception:
        return None
    return email



from flask_mail import Message
from app import mail   # import mail object

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    if not email or not is_valid_email(email):
        return jsonify({"message": "Valid email required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Generate token
    token = generate_reset_token(email)
    reset_url = f"http://localhost:4200/reset-password?token={token}"  # frontend link

    # Send email
    try:
        msg = Message(
            subject="Password Reset Request - CarConnect",
            recipients=[email],
            body=f"Hi {user.user_name},\n\nClick the link below to reset your password:\n{reset_url}\n\nIf you didn't request this, please ignore this email."
        )
        mail.send(msg)
    except Exception as e:
        print("Email Error:", e)
        return jsonify({"message": "Error sending email"}), 500

    return jsonify({"message": "Password reset link sent to your email"}), 200



@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("password")

    if not token or not new_password:
        return jsonify({"message": "Token and new password required"}), 400

    email = verify_reset_token(token)
    if not email:
        return jsonify({"message": "Invalid or expired token"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.password = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"message": "Password reset successful"}), 200
