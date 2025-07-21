from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.main.models.drivers import Drivers
from app.main.models.user import User
from app import db 
from datetime import datetime

def add_driver(data):
    try:
        user_id = data.get('user_id')
        driver_name = data.get('driver_name')
        experience = data.get('experience')
        license_number = data.get('license_number')

       
        if not all([user_id, driver_name, experience, license_number]):
            return jsonify({"message": "All fields are required"}), 400
        

  
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404


        existing_driver = Drivers.query.filter_by(user_id=user_id).first()
        if existing_driver:
            return jsonify({"message": "User already registered as driver"}), 409
        



        # Validate experience is a positive integer
        if not isinstance(experience, int) or experience < 0:
            return jsonify({"message": "Experience must be a non-negative integer"}), 400

        new_driver = Drivers(
            user_id=user_id,
            driver_name=driver_name,
            experience=experience,
            license_number=license_number,
            create_datetime=datetime.utcnow()
        )

        db.session.add(new_driver)
        db.session.commit()

        return jsonify({"message": "Driver added successfully"}), 201

    except IntegrityError as e:
        db.session.rollback()
        print(e)
        return jsonify({"message": "Integrity error occurred"}), 409
    except SQLAlchemyError as e:
        db.session.rollback()
        print(e)
        return jsonify({"message": "Database error occurred"}), 500
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error"}), 500

def get_driver_by_id(driver_id):
    try:
        driver = Drivers.query.get(driver_id)
        if not driver:
            return jsonify({"message": "Driver not found"}), 404

        driver_data = {
            "driver_id": driver.driver_id,
            "user_id": driver.user_id,
            "driver_name": driver.driver_name,
            "experience": driver.experience,
            "license_number": driver.license_number,
            "created_at": driver.create_datetime,
            "updated_at": driver.update_datetime
        }
        return jsonify(driver_data), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error"}), 500

def get_all_drivers():
    try:
        drivers = Drivers.query.all()
        output = []
        for driver in drivers:
            driver_data = {
                "driver_id": driver.driver_id,
                "user_id": driver.user_id,
                "driver_name": driver.driver_name,
                "experience": driver.experience,
                "license_number": driver.license_number,
                "created_at": driver.create_datetime,
                "updated_at": driver.update_datetime
            }
            output.append(driver_data)
        return jsonify(output), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error"}), 500

def update_driver(driver_id, data):
    try:
        driver = Drivers.query.get(driver_id)
        if not driver:
            return jsonify({"message": "Driver not found"}), 404

        user_id = data.get('user_id')
        driver_name = data.get('driver_name')
        experience = data.get('experience')
        license_number = data.get('license_number')


        if user_id and user_id != driver.user_id:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404

     
            if Drivers.query.filter_by(user_id=user_id).first():
                return jsonify({"message": "Another driver already registered with this user_id"}), 409

            driver.user_id = user_id

        if driver_name:
            driver.driver_name = driver_name

        if experience is not None:
            if not isinstance(experience, int) or experience < 0:
                return jsonify({"message": "Experience must be a non-negative integer"}), 400
            driver.expirence = experience

        if license_number:
            driver.license_number = license_number

        driver.update_datetime = datetime.utcnow()

        db.session.commit()
        return jsonify({"message": "Driver updated successfully"}), 200

    except IntegrityError as e:
        db.session.rollback()
        print(e)
        return jsonify({"message": "Integrity error occurred"}), 409
    except SQLAlchemyError as e:
        db.session.rollback()
        print(e)
        return jsonify({"message": "Database error occurred"}), 500
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error"}), 500

def delete_driver(driver_id):
    try:
        driver = Drivers.query.get(driver_id)
        if not driver:
            return jsonify({"message": "Driver not found"}), 404

        db.session.delete(driver)
        db.session.commit()
        return jsonify({"message": "Driver deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        print(e)
        return jsonify({"message": "Database error occurred"}), 500
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error"}), 500
