from flask import Flask,request,jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

# now i need rider dash board 
# i rider canselect  the routes which are mentioned in routestops and stops table.
# the rider can select all the intermidiate and source stops but nmot destinations.basd on the source selected then show the destiinations torider.
# for example if rider selects d as source soq him e nad f not previpus  a,b,c.
# and then rider can search the available rides

app=Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI']="postgres://navaneeth:Mittu1821@localhost:5432/test"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']=False

db=SQLAlchemy(app)

class User(db.Model):
    __tablename__="user"
    __table__args__=None  #chage later with your schema name
    
    user_id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    user_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    profile_picture = db.Column(db.LargeBinary, nullable=False)
    phone_number = db.Column(db.String(15), unique=True, nullable=False)  
    is_verified = db.Column(db.Boolean, default=False)
    gender = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(128), nullable=False)
    role_id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    create_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)  # Fix: DateTime, not Datetime
    update_datetime = db.Column(db.DateTime, onupdate=datetime.utcnow) 


class Drivers(db.Model):
    __tablename__='driver'
    __table_args__=None

    driver_id=db.Column(db.Integer,primary_key=True,autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False, unique=True)
    driver_name=db.Column(db.String(50),nullable=False)
    expirence=db.Column(db.Integer,nullable=False)
    license_number=db.Column(db.String(50),nullable=False)
    create_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)  # Fix: DateTime, not Datetime
    update_datetime = db.Column(db.DateTime, onupdate=datetime.utcnow) 

class Riders(db.Model):
    __tablename__="rider"
    __table_args__=None

    rider_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id=db.Column(db.Integer,db.ForeignKey('user.user_id'),nullable=False,unique=True)
    rider_name=db.Column(db.String(50),nullable=False)
    rider_gender=db.Column(db.String(20),nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    


class Rides(db.Model):
    __tablename__='rides'
    __table_args__=None
    
    ride_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.driver_id'), nullable=False)
    origin_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)
    destination_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.route_id'), nullable=False)
    departure_time = db.Column(db.DateTime, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Active')
    create_datetime = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    update_datetime = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships 
    origin_stop = db.relationship('Stop', foreign_keys=[origin_stop_id])
    destination_stop = db.relationship('Stop', foreign_keys=[destination_stop_id])


class RideRequestsTable(db.Model):
    __tablename__='ride_requests'
    __table_args__=None

    request_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    ride_id = db.Column(db.Integer, db.ForeignKey('rides.ride_id'), nullable=False)
    rider_id = db.Column(db.Integer, db.ForeignKey('riders.rider_id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Pending')  # Accepted, Rejected, etc.
    requested_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    ride = db.relationship('Ride', backref=db.backref('ride_requests', lazy=True))
    rider = db.relationship('Rider', backref=db.backref('ride_requests', lazy=True))


class PaymentsTable(db.Model):
    __tablename__='payments_table'
    __table_args__=None

    payment_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    driver_wallet_id = db.Column(db.String(36), db.ForeignKey('wallet.wallet_id'), nullable=False)
    payer_wallet_id = db.Column(db.String(36), db.ForeignKey('wallet.wallet_id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(20), nullable=False)  # e.g., Pending, Completed
    payment_method = db.Column(db.String(50), nullable=False)  # e.g., Cash, Card, UPI
    create_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    driver_wallet = db.relationship('Wallet', foreign_keys=[driver_wallet_id], backref=db.backref('received_payments', lazy=True))
    payer_wallet = db.relationship('Wallet', foreign_keys=[payer_wallet_id], backref=db.backref('sent_payments', lazy=True))
    

class Review(db.Model):
    __tablename__ = 'reviews'
    __table_args__=None

    review_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    ride_id = db.Column(db.Integer, db.ForeignKey('rides.ride_id'), nullable=False)
    rider_id = db.Column(db.Integer, db.ForeignKey('riders.rider_id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False) 
    comment = db.Column(db.Text)
    create_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    ride = db.relationship('Ride', backref=db.backref('reviews', lazy=True))
    rider = db.relationship('Rider', backref=db.backref('reviews', lazy=True))


class Message(db.Model):
    __tablename__ = 'messages'
    __table_args__=None

    message_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    
    sender_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    
    ride_id = db.Column(db.Integer, db.ForeignKey('rides.ride_id'), nullable=True)
    
    message_text = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    sender = db.relationship('User', foreign_keys=[sender_id], backref=db.backref('sent_messages', lazy=True))
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref=db.backref('received_messages', lazy=True))
    ride = db.relationship('Ride', backref=db.backref('messages', lazy=True))


class Stops(db.Model):
    __tablename__='stops'
    __table_args__=None


    stop_id=db.Column(db.Integer,primary_key=True,autoincrement=True)
    stop_name=db.Column(db.String(100),nullable=False)
    stop_type=db.Column(db.String(100),nullable=False)
    route_id=db.Column(db.Integer,db.Foreignkey('routes.route_id'),nullable=False)
    stop_order=db.Column(db.Integer,nullable=False)
    create_datetime=db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    #relations
    route=db.relationship('Route',backref=db.backref('stops',lazy=True,order_by='stop.stop_order'))



class RiderDetails(db.Model):
    __tablename__ = 'rider_details'
    __table_args__=None

    rider_details_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    
    # Foreign Keys
    rider_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False)
    start_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)
    end_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)

    # Additional fields
    gender_preference = db.Column(db.String(10), nullable=True)

    # Relationships
    rider = db.relationship('User', backref=db.backref('rider_details', lazy=True))
    start_stop = db.relationship('Stop', foreign_keys=[start_stop_id], backref=db.backref('start_rider_details', lazy=True))
    end_stop = db.relationship('Stop', foreign_keys=[end_stop_id], backref=db.backref('end_rider_details', lazy=True))


class RouteStop(db.Model):
    __tablename__ = 'route_stops'
    __table_args__=None

    route_stop_id = db.Column(db.Integer,primary_key=True,autoincrement=True)

    # Foreign keys referencing Stop table
    start_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)
    end_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)

    # Other fields
    distance = db.Column(db.Integer, nullable=False)
    cost = db.Column(db.Integer, nullable=False)

    # Relationships
    start_stop = db.relationship('Stop', foreign_keys=[start_stop_id], backref=db.backref('routes_starting_here', lazy=True))
    end_stop = db.relationship('Stop', foreign_keys=[end_stop_id], backref=db.backref('routes_ending_here', lazy=True))

    
class Wallet(db.Model):
    __tablename__ = 'wallet'
    __table_args__=None

    wallet_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False, unique=True)
    balance = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship to User
    user = db.relationship('User', backref=db.backref('wallet', uselist=False, lazy=True))
    

if __name__=="__main__":
    app.run(debug=True)


# {
#   "user_name": "Malladi Navaneeth Reddy",
#   "email": "navaneeth@example.com",
#   "phone_number": "9876543210",
#   "is_verified": true,
#   "gender": "Male",
#   "password": "securepassword123",
#   "role_id": 1
# }


# {
#   "driver_id": 1,
#   "origin_stop_id": 101,
#   "destination_stop_id": 105,
#   "route_id": 12,
#   "departure_time": "2025-06-01 09:30:00",
#   "available_seats": 4,
#   "status": "Active"
# }




all the models:

from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
# from app.main.models.rides import Rides
# from app.main.models.user import User

from app import db

class Drivers(db.Model):
    __tablename__ = 'drivers'

    driver_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False, unique=True)
    driver_name = db.Column(db.String(50), nullable=False)
    experience = db.Column(db.Integer, nullable=False)
    license_number = db.Column(db.String(50), nullable=False)
    create_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    update_datetime = db.Column(db.DateTime, onupdate=datetime.utcnow)

    # 🔗 Relationships
    # user = db.relationship('User', backref=db.backref('driver', uselist=False, lazy=True))
    # rides = db.relationship('Rides', backref='driver', lazy=True)


from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app import db

from app.main.models.rides import Rides

class Message(db.Model):
    __tablename__ = 'messages'

    message_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    
    sender_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    
    ride_id = db.Column(db.Integer, db.ForeignKey('rides.ride_id'), nullable=True)
    
    message_text = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    # sender = db.relationship('User', foreign_keys=[sender_id], backref=db.backref('sent_messages', lazy=True))
    # receiver = db.relationship('User', foreign_keys=[receiver_id], backref=db.backref('received_messages', lazy=True))
    ride = db.relationship('Rides', backref=db.backref('messages', lazy=True))



from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app import db
class PaymentsTable(db.Model):
    __tablename__='payments_table'

    payment_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    driver_wallet_id = db.Column(db.Integer, db.ForeignKey('wallet.wallet_id'), nullable=False)
    payer_wallet_id = db.Column(db.Integer, db.ForeignKey('wallet.wallet_id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(20), nullable=False)  # e.g., Pending, Completed
    payment_method = db.Column(db.String(50), nullable=False)  # e.g., Cash, Card, UPI
    create_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    driver_wallet = db.relationship('Wallet', foreign_keys=[driver_wallet_id], backref=db.backref('received_payments', lazy=True))
    payer_wallet = db.relationship('Wallet', foreign_keys=[payer_wallet_id], backref=db.backref('sent_payments', lazy=True))
    



from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app import db

class Review(db.Model):
    __tablename__ = 'reviews'

    review_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    ride_id = db.Column(db.Integer, db.ForeignKey('rides.ride_id'), nullable=False)
    rider_id = db.Column(db.Integer, db.ForeignKey('riders.rider_id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False) 
    comment = db.Column(db.Text)
    create_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    ride = db.relationship('Rides', backref=db.backref('reviews', lazy=True))
    rider = db.relationship('Riders', backref=db.backref('reviews', lazy=True))


from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app import db
class RiderDetails(db.Model):
    __tablename__ = 'rider_details'

    rider_details_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    
    # Foreign Keys
    rider_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    start_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)
    end_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)

    # Additional fields
    gender_preference = db.Column(db.String(10), nullable=True)

    # Relationships
    # rider = db.relationship('User', backref=db.backref('rider_details', lazy=True))
    start_stop = db.relationship('Stops', foreign_keys=[start_stop_id], backref=db.backref('start_rider_details', lazy=True))
    end_stop = db.relationship('Stops', foreign_keys=[end_stop_id], backref=db.backref('end_rider_details', lazy=True))


from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app import db
class RideRequestsTable(db.Model):
    __tablename__='ride_requests'

    request_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    ride_id = db.Column(db.Integer, db.ForeignKey('rides.ride_id'), nullable=False)
    rider_id = db.Column(db.Integer, db.ForeignKey('riders.rider_id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Pending')  # Accepted, Rejected, etc.
    requested_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    ride = db.relationship('Rides', backref=db.backref('ride_requests', lazy=True))
    rider = db.relationship('Riders', backref=db.backref('ride_requests', lazy=True))


from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app import db
class Rides(db.Model):
    __tablename__='rides'
    
    ride_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.driver_id'), nullable=False)
    origin_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)
    destination_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.route_id'), nullable=False)
    departure_time = db.Column(db.DateTime, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Active')
    create_datetime = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    update_datetime = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships 
    origin_stop = db.relationship('Stops', foreign_keys=[origin_stop_id])
    destination_stop = db.relationship('Stops', foreign_keys=[destination_stop_id])



from datetime import datetime
from app import db

class Role(db.Model):
    __tablename__ = 'roles'
    
    role_id = db.Column(db.Integer, primary_key=True,autoincrement=True)

    role_name = db.Column(db.String(50), nullable=False, unique=True)

    # Optional: Relationship to User table
    users = db.relationship('User', backref='role', lazy=True)


from app import db

class RouteStop(db.Model):
    __tablename__ = 'routes'

    route_id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    start_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)
    end_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)

    distance = db.Column(db.Integer, nullable=False)
    cost = db.Column(db.Integer, nullable=False)

    start_stop = db.relationship('Stops', foreign_keys=[start_stop_id], backref=db.backref('routes_starting_here', lazy=True))
    end_stop = db.relationship('Stops', foreign_keys=[end_stop_id], backref=db.backref('routes_ending_here', lazy=True))


from datetime import datetime
from app import db
import enum

# Step 1: Define the Enum
class StopTypeEnum(enum.Enum):
    ORIGIN = 'Origin'
    DESTINATION = 'Destination'
    INTERMEDIATE = 'Intermediate'

# Step 2: Update the model
class Stops(db.Model):
    __tablename__ = 'stops'

    stop_id = db.Column(db.Integer, primary_key=True)
    stop_name = db.Column(db.String(100), nullable=False)
    
    stop_type = db.Column(db.Enum(StopTypeEnum), nullable=False, default=StopTypeEnum.INTERMEDIATE)
# origin, intermediate, destination
    route_id = db.Column(db.Integer, nullable=False)
    stop_order = db.Column(db.Integer, nullable=False)
    create_datetime = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app import db
import base64
# from app.main.models.drivers import Drivers

class User(db.Model):
    __tablename__ = "user"

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    # profile_picture = db.Column(db.LargeBinary, nullable=False)

    phone_number = db.Column(db.String(15), unique=True, nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    gender = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(256), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.role_id'), nullable=False)

    create_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    update_datetime = db.Column(db.DateTime, onupdate=datetime.utcnow)

    # --- Relationships ---

    # One-to-one relationship with Driver (User can be a driver)
    driver = db.relationship('Drivers', backref='user', uselist=False)

    # One-to-one relationship with Rider (User can be a rider)
    rider = db.relationship('Riders', backref='user', uselist=False)

    # One-to-one relationship with Wallet
    wallet = db.relationship('Wallet', backref='user', uselist=False)

    # Messages sent and received
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender_user', lazy=True)
    received_messages = db.relationship('Message', foreign_keys='Message.receiver_id', backref='receiver_user', lazy=True)

    # RiderDetails entries associated with this user
    rider_details = db.relationship('RiderDetails', backref='user', lazy=True)


from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app import db

class Wallet(db.Model):
    __tablename__ = 'wallet'


    wallet_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False, unique=True)
    balance = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship to User
    # user = db.relationship('User', backref=db.backref('wallet', uselist=False, lazy=True))
    
all services:
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

        # Validate required fields
        if not all([user_id, driver_name, experience, license_number]):
            return jsonify({"message": "All fields are required"}), 400

        # Check if user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Check if user already registered as a driver (unique user_id)
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

        # If user_id is being updated, check if user exists and unique constraint
        if user_id and user_id != driver.user_id:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404

            # Check if another driver with this user_id exists
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


from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.main.models.messages import Message
from app.main.models.user import User
from app.main.models.rides import Rides 
from app import db 
from datetime import datetime 



def add_message(data):
    try:
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        ride_id = data.get('ride_id')  # optional
        message_text = data.get('message_text')

        # Validate required fields
        if not all([sender_id, receiver_id, message_text]):
            return jsonify({"message": "sender_id, receiver_id, and message_text are required"}), 400

        # Check if sender exists
        sender = User.query.get(sender_id)
        if not sender:
            return jsonify({"message": "Sender not found"}), 404

        # Check if receiver exists
        receiver = User.query.get(receiver_id)
        if not receiver:
            return jsonify({"message": "Receiver not found"}), 404

        # If ride_id is provided, check if ride exists
        if ride_id:
            ride = Rides.query.get(ride_id)
            if not ride:
                return jsonify({"message": "Ride not found"}), 404

        new_message = Message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            ride_id=ride_id,
            message_text=message_text,
            sent_at=datetime.utcnow()
        )

        db.session.add(new_message)
        db.session.commit()

        return jsonify({"message": "Message sent successfully", "message_id": new_message.message_id}), 201

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


def get_message_by_id(message_id):
    try:
        message = Message.query.get(message_id)
        if not message:
            return jsonify({"message": "Message not found"}), 404

        data = {
            "message_id": message.message_id,
            "sender_id": message.sender_id,
            "receiver_id": message.receiver_id,
            "ride_id": message.ride_id,
            "message_text": message.message_text,
            "sent_at": message.sent_at
        }
        return jsonify(data), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error"}), 500


def get_all_messages():
    try:
        messages = Message.query.all()
        output = []
        for msg in messages:
            output.append({
                "message_id": msg.message_id,
                "sender_id": msg.sender_id,
                "receiver_id": msg.receiver_id,
                "ride_id": msg.ride_id,
                "message_text": msg.message_text,
                "sent_at": msg.sent_at
            })
        return jsonify(output), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error"}), 500


def get_messages_between_users(sender_id, receiver_id):
    try:
        messages = Message.query.filter(
            ((Message.sender_id == sender_id) & (Message.receiver_id == receiver_id)) |
            ((Message.sender_id == receiver_id) & (Message.receiver_id == sender_id))
        ).order_by(Message.sent_at.asc()).all()

        if not messages:
            return jsonify({"message": "No messages found between these users"}), 404

        output = [{
            "message_id": msg.message_id,
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "ride_id": msg.ride_id,
            "message_text": msg.message_text,
            "sent_at": msg.sent_at
        } for msg in messages]

        return jsonify(output), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error"}), 500


def delete_message(message_id):
    try:
        message = Message.query.get(message_id)
        if not message:
            return jsonify({"message": "Message not found"}), 404

        db.session.delete(message)
        db.session.commit()
        return jsonify({"message": "Message deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        print(e)
        return jsonify({"message": "Database error occurred"}), 500
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error"}), 500

from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app import db
from app.main.models.payments import PaymentsTable
from app.main.models.wallet import Wallet
from datetime import datetime

VALID_STATUSES = {'Pending', 'Completed'}
VALID_METHODS = {'Cash', 'Card', 'UPI'}

def add_payment(data):
    try:
        driver_wallet_id = data.get('driver_wallet_id')
        payer_wallet_id = data.get('payer_wallet_id')
        amount = data.get('amount')
        payment_status = data.get('payment_status')
        payment_method = data.get('payment_method')

        # Validate required fields
        if not all([driver_wallet_id, payer_wallet_id, amount, payment_status, payment_method]):
            return jsonify({"message": "All fields are required"}), 400

        # Validate amount
        if not isinstance(amount, (int, float)) or amount <= 0:
            return jsonify({"message": "Amount must be a positive number"}), 400

        # Validate status and method
        if payment_status not in VALID_STATUSES:
            return jsonify({"message": f"Invalid payment status. Must be one of {VALID_STATUSES}"}), 400
        if payment_method not in VALID_METHODS:
            return jsonify({"message": f"Invalid payment method. Must be one of {VALID_METHODS}"}), 400

        # Validate wallets
        driver_wallet = Wallet.query.get(driver_wallet_id)
        if not driver_wallet:
            return jsonify({"message": "Driver wallet not found"}), 404

        payer_wallet = Wallet.query.get(payer_wallet_id)
        if not payer_wallet:
            return jsonify({"message": "Payer wallet not found"}), 404

        new_payment = PaymentsTable(
            driver_wallet_id=driver_wallet_id,
            payer_wallet_id=payer_wallet_id,
            amount=amount,
            payment_status=payment_status,
            payment_method=payment_method,
            create_datetime=datetime.utcnow()
        )

        db.session.add(new_payment)
        db.session.commit()

        return jsonify({"message": "Payment added successfully"}), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Integrity error occurred"}), 409
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"message": "Database error occurred"}), 500
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def get_payment_by_id(payment_id):
    try:
        payment = PaymentsTable.query.get(payment_id)
        if not payment:
            return jsonify({"message": "Payment not found"}), 404

        payment_data = {
            "payment_id": payment.payment_id,
            "driver_wallet_id": payment.driver_wallet_id,
            "payer_wallet_id": payment.payer_wallet_id,
            "amount": payment.amount,
            "payment_status": payment.payment_status,
            "payment_method": payment.payment_method,
            "created_at": payment.create_datetime
        }

        return jsonify(payment_data), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def get_all_payments():
    try:
        payments = PaymentsTable.query.all()
        output = []
        for payment in payments:
            output.append({
                "payment_id": payment.payment_id,
                "driver_wallet_id": payment.driver_wallet_id,
                "payer_wallet_id": payment.payer_wallet_id,
                "amount": payment.amount,
                "payment_status": payment.payment_status,
                "payment_method": payment.payment_method,
                "created_at": payment.create_datetime
            })
        return jsonify(output), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def update_payment(payment_id, data):
    try:
        payment = PaymentsTable.query.get(payment_id)
        if not payment:
            return jsonify({"message": "Payment not found"}), 404

        # Optional updates
        if 'driver_wallet_id' in data:
            wallet = Wallet.query.get(data['driver_wallet_id'])
            if not wallet:
                return jsonify({"message": "Driver wallet not found"}), 404
            payment.driver_wallet_id = data['driver_wallet_id']

        if 'payer_wallet_id' in data:
            wallet = Wallet.query.get(data['payer_wallet_id'])
            if not wallet:
                return jsonify({"message": "Payer wallet not found"}), 404
            payment.payer_wallet_id = data['payer_wallet_id']

        if 'amount' in data:
            amount = data['amount']
            if not isinstance(amount, (int, float)) or amount <= 0:
                return jsonify({"message": "Amount must be a positive number"}), 400
            payment.amount = amount

        if 'payment_status' in data:
            if data['payment_status'] not in VALID_STATUSES:
                return jsonify({"message": f"Invalid payment status. Must be one of {VALID_STATUSES}"}), 400
            payment.payment_status = data['payment_status']

        if 'payment_method' in data:
            if data['payment_method'] not in VALID_METHODS:
                return jsonify({"message": f"Invalid payment method. Must be one of {VALID_METHODS}"}), 400
            payment.payment_method = data['payment_method']

        db.session.commit()
        return jsonify({"message": "Payment updated successfully"}), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Integrity error occurred"}), 409
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"message": "Database error occurred"}), 500
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def delete_payment(payment_id):
    try:
        payment = PaymentsTable.query.get(payment_id)
        if not payment:
            return jsonify({"message": "Payment not found"}), 404

        db.session.delete(payment)
        db.session.commit()
        return jsonify({"message": "Payment deleted successfully"}), 200

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"message": "Database error occurred"}), 500
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app import db
from app.main.models.reviews import Review
from app.main.models.rides import Rides
from app.main.models.riders import Riders
from datetime import datetime

def add_review(data):
    try:
        Rides_id = data.get('Rides_id')
        Riders_id = data.get('Riders_id')
        rating = data.get('rating')
        comment = data.get('comment')

        # Validate required fields
        if not all([Rides_id, Riders_id, rating is not None]):
            return jsonify({"message": "Rides_id, Riders_id, and rating are required"}), 400

        if not isinstance(rating, int) or not (1 <= rating <= 5):
            return jsonify({"message": "Rating must be an integer between 1 and 5"}), 400

        # Validate foreign keys
        if not Rides.query.get(Rides_id):
            return jsonify({"message": "Rides not found"}), 404
        if not Riders.query.get(Riders_id):
            return jsonify({"message": "Riders not found"}), 404

        review = Review(
            Rides_id=Rides_id,
            Riders_id=Riders_id,
            rating=rating,
            comment=comment,
            create_datetime=datetime.utcnow()
        )

        db.session.add(review)
        db.session.commit()
        return jsonify({"message": "Review added successfully", "review_id": review.review_id}), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Integrity error occurred"}), 409
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"message": "Database error occurred"}), 500
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def get_review_by_id(review_id):
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"message": "Review not found"}), 404

        review_data = {
            "review_id": review.review_id,
            "Rides_id": review.Rides_id,
            "Riders_id": review.Riders_id,
            "rating": review.rating,
            "comment": review.comment,
            "create_datetime": review.create_datetime
        }
        return jsonify(review_data), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def get_all_reviews():
    try:
        reviews = Review.query.all()
        output = []
        for review in reviews:
            output.append({
                "review_id": review.review_id,
                "Rides_id": review.Rides_id,
                "Riders_id": review.Riders_id,
                "rating": review.rating,
                "comment": review.comment,
                "create_datetime": review.create_datetime
            })
        return jsonify(output), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def update_review(review_id, data):
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"message": "Review not found"}), 404

        if 'Rides_id' in data:
            if not Rides.query.get(data['Rides_id']):
                return jsonify({"message": "Rides not found"}), 404
            review.Rides_id = data['Rides_id']

        if 'Riders_id' in data:
            if not Riders.query.get(data['Riders_id']):
                return jsonify({"message": "Riders not found"}), 404
            review.Riders_id = data['Riders_id']

        if 'rating' in data:
            rating = data['rating']
            if not isinstance(rating, int) or not (1 <= rating <= 5):
                return jsonify({"message": "Rating must be an integer between 1 and 5"}), 400
            review.rating = rating

        if 'comment' in data:
            review.comment = data['comment']

        db.session.commit()
        return jsonify({"message": "Review updated successfully"}), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Integrity error occurred"}), 409
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"message": "Database error occurred"}), 500
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def delete_review(review_id):
    try:
        review = Review.query.get(review_id)
        if not review:
            return jsonify({"message": "Review not found"}), 404

        db.session.delete(review)
        db.session.commit()
        return jsonify({"message": "Review deleted successfully"}), 200

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"message": "Database error occurred"}), 500
    except Exception:
        return jsonify({"message": "Internal server error"}), 500

from flask import jsonify, request
from app import db
from app.main.models.riderDetails import RiderDetails
from sqlalchemy.exc import SQLAlchemyError

# Create RiderDetails
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

# Get All RiderDetails
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

# Get RiderDetails by ID
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

# Update RiderDetails
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

# Delete RiderDetails
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

# Get RiderDetails by Rider ID
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



from flask import jsonify, request
from app import db
from app.main.models.rideRequests import RideRequestsTable
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

# Create a new ride request
def create_ride_request(data):
    try:
        new_request = RideRequestsTable(
            ride_id=data['ride_id'],
            rider_id=data['rider_id'],
            status=data.get('status', 'Pending'),
            requested_at=datetime.utcnow()
        )
        db.session.add(new_request)
        db.session.commit()
        return jsonify({"message": "Ride request created successfully"}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Get all ride requests
def get_all_ride_requests():
    try:
        requests = RideRequestsTable.query.all()
        result = []
        for r in requests:
            result.append({
                "request_id": r.request_id,
                "ride_id": r.ride_id,
                "rider_id": r.rider_id,
                "status": r.status,
                "requested_at": r.requested_at
            })
        return jsonify(result), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500

# Get a ride request by ID
def get_ride_request_by_id(request_id):
    try:
        r = RideRequestsTable.query.get(request_id)
        if not r:
            return jsonify({"message": "Ride request not found"}), 404

        return jsonify({
            "request_id": r.request_id,
            "ride_id": r.ride_id,
            "rider_id": r.rider_id,
            "status": r.status,
            "requested_at": r.requested_at
        }), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500

# Update a ride request (e.g., status)
def update_ride_request(request_id, data):
    try:
        r = RideRequestsTable.query.get(request_id)
        if not r:
            return jsonify({"message": "Ride request not found"}), 404

        r.status = data.get('status', r.status)
        db.session.commit()
        return jsonify({"message": "Ride request updated successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Delete a ride request
def delete_ride_request(request_id):
    try:
        r = RideRequestsTable.query.get(request_id)
        if not r:
            return jsonify({"message": "Ride request not found"}), 404

        db.session.delete(r)
        db.session.commit()
        return jsonify({"message": "Ride request deleted successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Get all ride requests for a specific ride
def get_ride_requests_by_ride(ride_id):
    try:
        requests = RideRequestsTable.query.filter_by(ride_id=ride_id).all()
        result = [{
            "request_id": r.request_id,
            "ride_id": r.ride_id,
            "rider_id": r.rider_id,
            "status": r.status,
            "requested_at": r.requested_at
        } for r in requests]
        return jsonify(result), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500

# Get all ride requests by a specific rider
def get_ride_requests_by_rider(rider_id):
    try:
        requests = RideRequestsTable.query.filter_by(rider_id=rider_id).all()
        result = [{
            "request_id": r.request_id,
            "ride_id": r.ride_id,
            "rider_id": r.rider_id,
            "status": r.status,
            "requested_at": r.requested_at
        } for r in requests]
        return jsonify(result), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


from flask import jsonify, request
from app.main.models.rides import  Rides
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from app import db


# Create a new ride
def create_ride(data):
    try:
        new_ride = Rides(
            driver_id=data['driver_id'],
            origin_stop_id=data['origin_stop_id'],
            destination_stop_id=data['destination_stop_id'],
            route_id=data['route_id'],
            departure_time=datetime.strptime(data['departure_time'], '%Y-%m-%d %H:%M:%S'),
            available_seats=data['available_seats'],
            status=data.get('status', 'Active')
        )
        db.session.add(new_ride)
        db.session.commit()
        return jsonify({"message": "Ride created", "ride_id": new_ride.ride_id}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Get all rides (with optional filters)
def get_all_rides(filters=None):
    try:
        query = Rides.query

        if filters:
            if 'driver_id' in filters:
                query = query.filter_by(driver_id=filters['driver_id'])
            if 'route_id' in filters:
                query = query.filter_by(route_id=filters['route_id'])
            if 'status' in filters:
                query = query.filter_by(status=filters['status'])

        rides = query.all()
        result = [{
            "ride_id": r.ride_id,
            "driver_id": r.driver_id,
            "origin_stop_id": r.origin_stop_id,
            "destination_stop_id": r.destination_stop_id,
            "route_id": r.route_id,
            "departure_time": r.departure_time.strftime('%Y-%m-%d %H:%M:%S'),
            "available_seats": r.available_seats,
            "status": r.status,
            "create_datetime": r.create_datetime,
            "update_datetime": r.update_datetime
        } for r in rides]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get ride by ID
def get_ride_by_id(ride_id):
    ride = Rides.query.get(ride_id)
    if not ride:
        return jsonify({"message": "Ride not found"}), 404
    return jsonify({
        "ride_id": ride.ride_id,
        "driver_id": ride.driver_id,
        "origin_stop_id": ride.origin_stop_id,
        "destination_stop_id": ride.destination_stop_id,
        "route_id": ride.route_id,
        "departure_time": ride.departure_time.strftime('%Y-%m-%d %H:%M:%S'),
        "available_seats": ride.available_seats,
        "status": ride.status,
        "create_datetime": ride.create_datetime,
        "update_datetime": ride.update_datetime
    }), 200

# Update a ride
def update_ride(ride_id, data):
    ride = Rides.query.get(ride_id)
    if not ride:
        return jsonify({"message": "Ride not found"}), 404
    try:
        ride.driver_id = data.get('driver_id', ride.driver_id)
        ride.origin_stop_id = data.get('origin_stop_id', ride.origin_stop_id)
        ride.destination_stop_id = data.get('destination_stop_id', ride.destination_stop_id)
        ride.route_id = data.get('route_id', ride.route_id)
        if 'departure_time' in data:
            ride.departure_time = datetime.strptime(data['departure_time'], '%Y-%m-%d %H:%M:%S')
        ride.available_seats = data.get('available_seats', ride.available_seats)
        ride.status = data.get('status', ride.status)
        ride.update_datetime = datetime.utcnow()
        db.session.commit()
        return jsonify({"message": "Ride updated successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Delete a ride
def delete_ride(ride_id):
    ride = Rides.query.get(ride_id)
    if not ride:
        return jsonify({"message": "Ride not found"}), 404
    try:
        db.session.delete(ride)
        db.session.commit()
        return jsonify({"message": "Ride deleted successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



from app import db
from app.main.models.roles import Role
# Create a new role
def create_role(role_name):
    role = Role(role_name=role_name)
    db.session.add(role)
    db.session.commit()
    return role

# Get all roles
def get_all_roles():
    return Role.query.all()

# Get a single role by ID
def get_role_by_id(role_id):
    return Role.query.get(role_id)

# Update an existing role
def update_role(role_id, new_role_name):
    role = Role.query.get(role_id)
    if not role:
        return None
    role.role_name = new_role_name
    db.session.commit()
    return role

# Delete a role
def delete_role(role_id):
    role = Role.query.get(role_id)
    if not role:
        return False
    db.session.delete(role)
    db.session.commit()
    return True


from flask import jsonify
from app import db
from app.main.models.routeStops import RouteStop
from app.main.models.stops import Stops
from sqlalchemy.exc import SQLAlchemyError

def create_route_stop(data):
    try:
        start_stop = Stops.query.get(data['start_stop_id'])
        end_stop = Stops.query.get(data['end_stop_id'])

        # Validation
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


# Get all route stops
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

# Get a route stop by ID
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

# Update a route stop
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

# Delete a route stop
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



from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError,IntegrityError
from app.main.models.user import User
from app import db    #update based on ypur db file
from werkzeug.security import generate_password_hash,check_password_hash
import re

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

def is_valid_phone(phone):
    return re.match(r"^[6-9]\d{9}$", phone)


import base64

def add_user(data):
    try:
        name = data.get('user_name')
        email = data.get('email')
        # profile_picture = data.get('profile_picture')
        phone_number = data.get('phone_number')
        gender = data.get('gender')
        password = data.get('password')
        role_id = data.get('role_id')

        # Validate required fields
        # add profile picture later
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

        # Convert profile_picture from base64 string to binary
        # try:
        #     profile_picture_binary = base64.b64decode(profile_picture)
        # except Exception:
        #     return jsonify({"message": "Invalid base64 for profile picture"}), 400

        hashed_password = generate_password_hash(password)

        new_user = User(
            user_name=name,
            email=email,
            # profile_picture=profile_picture_binary,
            phone_number=phone_number,
            gender=gender,
            password=hashed_password,
            role_id=role_id
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


def get_user_by_id(user_id):
    try:
        user=User.query.get(user_id)
        if not user:
            return jsonify({"message":"User not found"}),404
        user_data={
                    "user_id":user.user_id,
                    "user_name":user.user_name,
                    "email":user.email,
                    "phone_number":user.phone_number,
                    "is_verified":user.is_verified,
                    "gender":user.gender,
                    "role_id":user.role_id,
                    "create_datetime":user.create_datetime
                }
        return jsonify(user_data),200
    except Exception as e:
        print(e)
        return jsonify({"messgae":"Internal Server Error"}),500
    
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
   


    

from flask import jsonify
from app import db
from app.main.models.wallet import  Wallet
from sqlalchemy.exc import SQLAlchemyError

# Create a wallet for a user
def create_wallet(data):
    try:
        user_id = data['user_id']
        existing_wallet = Wallet.query.filter_by(user_id=user_id).first()
        if existing_wallet:
            return jsonify({"message": "Wallet already exists for this user."}), 400

        wallet = Wallet(user_id=user_id, balance=data.get('balance', 0))
        db.session.add(wallet)
        db.session.commit()
        return jsonify({"message": "Wallet created", "wallet_id": wallet.wallet_id}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Get wallet by wallet_id
def get_wallet_by_id(wallet_id):
    wallet = Wallet.query.get(wallet_id)
    if not wallet:
        return jsonify({"message": "Wallet not found"}), 404

    return jsonify({
        "wallet_id": wallet.wallet_id,
        "user_id": wallet.user_id,
        "balance": wallet.balance,
        "created_at": wallet.created_at.isoformat(),
        "updated_at": wallet.updated_at.isoformat()
    }), 200

# Get wallet by user_id
def get_wallet_by_user_id(user_id):
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        return jsonify({"message": "Wallet not found for user"}), 404

    return jsonify({
        "wallet_id": wallet.wallet_id,
        "user_id": wallet.user_id,
        "balance": wallet.balance,
        "created_at": wallet.created_at.isoformat(),
        "updated_at": wallet.updated_at.isoformat()
    }), 200

# Update wallet balance
def update_wallet_balance(wallet_id, data):
    wallet = Wallet.query.get(wallet_id)
    if not wallet:
        return jsonify({"message": "Wallet not found"}), 404

    try:
        wallet.balance = data.get('balance', wallet.balance)
        db.session.commit()
        return jsonify({"message": "Wallet updated", "balance": wallet.balance}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Delete wallet
def delete_wallet(wallet_id):
    wallet = Wallet.query.get(wallet_id)
    if not wallet:
        return jsonify({"message": "Wallet not found"}), 404

    try:
        db.session.delete(wallet)
        db.session.commit()
        return jsonify({"message": "Wallet deleted"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

controllers:
from flask import Blueprint, request
from app.main.services.drivers import (
    add_driver,
    get_driver_by_id,
    get_all_drivers,
    update_driver,
    delete_driver
)

driver_bp = Blueprint('driver_bp', __name__)

# ------------------------
# POST /drivers - Add driver
# ------------------------
@driver_bp.route('/drivers', methods=['POST'])
def create_driver():
    data = request.get_json()
    return add_driver(data)

# -----------------------------
# GET /drivers/<int:driver_id> - Get driver by ID
# -----------------------------
@driver_bp.route('/drivers/<int:driver_id>', methods=['GET'])
def get_driver(driver_id):
    return get_driver_by_id(driver_id)

# ------------------------
# GET /drivers - Get all drivers
# ------------------------
@driver_bp.route('/drivers', methods=['GET'])
def get_drivers():
    return get_all_drivers()

# -----------------------------
# PUT /drivers/<int:driver_id> - Update driver
# -----------------------------
@driver_bp.route('/drivers/<int:driver_id>', methods=['PUT'])
def update_driver_by_id(driver_id):
    data = request.get_json()
    return update_driver(driver_id, data)

# -----------------------------
# DELETE /drivers/<int:driver_id> - Delete driver
# -----------------------------
@driver_bp.route('/drivers/<int:driver_id>', methods=['DELETE'])
def delete_driver_by_id(driver_id):
    return delete_driver(driver_id)

from flask import Blueprint, request
from app.main.services.messages import (
    add_message,
    get_message_by_id,
    get_all_messages,
    get_messages_between_users,
    delete_message
)

message_bp = Blueprint('message_bp', __name__)

# ---------------------------------
# POST /messages - Send a message
# ---------------------------------
@message_bp.route('/messages', methods=['POST'])
def create_message():
    data = request.get_json()
    return add_message(data)

# -------------------------------------------------
# GET /messages/<int:message_id> - Get message by ID
# -------------------------------------------------
@message_bp.route('/messages/<int:message_id>', methods=['GET'])
def get_message(message_id):
    return get_message_by_id(message_id)

# ----------------------------------------
# GET /messages - Get all messages
# ----------------------------------------
@message_bp.route('/messages', methods=['GET'])
def get_messages():
    return get_all_messages()

# ------------------------------------------------------------------------
# GET /messages/conversation/<int:sender_id>/<int:receiver_id>
# Get all messages between two users
# ------------------------------------------------------------------------
@message_bp.route('/messages/conversation/<int:sender_id>/<int:receiver_id>', methods=['GET'])
def get_conversation(sender_id, receiver_id):
    return get_messages_between_users(sender_id, receiver_id)

# --------------------------------------------------
# DELETE /messages/<int:message_id> - Delete message
# --------------------------------------------------
@message_bp.route('/messages/<int:message_id>', methods=['DELETE'])
def remove_message(message_id):
    return delete_message(message_id)

from flask import Blueprint, request
from app.main.services.payments import (
    add_payment,
    get_payment_by_id,
    get_all_payments,
    update_payment,
    delete_payment
)

payment_bp = Blueprint('payment_bp', __name__)

# ----------------------------
# POST /payments - Add payment
# ----------------------------
@payment_bp.route('/payments', methods=['POST'])
def create_payment():
    data = request.get_json()
    return add_payment(data)

# --------------------------------------
# GET /payments/<int:payment_id> - Get payment by ID
# --------------------------------------
@payment_bp.route('/payments/<int:payment_id>', methods=['GET'])
def get_payment(payment_id):
    return get_payment_by_id(payment_id)

# -----------------------------
# GET /payments - Get all payments
# -----------------------------
@payment_bp.route('/payments', methods=['GET'])
def get_payments():
    return get_all_payments()

# --------------------------------------
# PUT /payments/<int:payment_id> - Update payment
# --------------------------------------
@payment_bp.route('/payments/<int:payment_id>', methods=['PUT'])
def update_payment_by_id(payment_id):
    data = request.get_json()
    return update_payment(payment_id, data)

# -----------------------------------------
# DELETE /payments/<int:payment_id> - Delete payment
# -----------------------------------------
@payment_bp.route('/payments/<int:payment_id>', methods=['DELETE'])
def delete_payment_by_id(payment_id):
    return delete_payment(payment_id)



from flask import Blueprint, request
from app.main.services.reviews import (
    add_review,
    get_review_by_id,
    get_all_reviews,
    update_review,
    delete_review
)

review_bp = Blueprint('review_bp', __name__)

# Add a new review
@review_bp.route('/reviews', methods=['POST'])
def create_review():
    data = request.get_json()
    return add_review(data)

# Get a review by ID
@review_bp.route('/reviews/<int:review_id>', methods=['GET'])
def fetch_review(review_id):
    return get_review_by_id(review_id)

# Get all reviews
@review_bp.route('/reviews', methods=['GET'])
def fetch_all_reviews():
    return get_all_reviews()

# Update a review by ID
@review_bp.route('/reviews/<int:review_id>', methods=['PUT'])
def modify_review(review_id):
    data = request.get_json()
    return update_review(review_id, data)

# Delete a review by ID
@review_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
def remove_review(review_id):
    return delete_review(review_id)



from flask import Blueprint, request
from app.main.services.riderDetails import (
    add_rider_details,
    get_all_rider_details,
    get_rider_details_by_id,
    update_rider_details,
    delete_rider_details,
    get_rider_details_by_rider
)

rider_details_bp = Blueprint('rider_details_bp', __name__)

# Create new rider details
@rider_details_bp.route('/rider-details', methods=['POST'])
def create_rider_details():
    data = request.get_json()
    return add_rider_details(data)

# Get all rider details
@rider_details_bp.route('/rider-details', methods=['GET'])
def fetch_all_rider_details():
    return get_all_rider_details()

# Get rider details by ID
@rider_details_bp.route('/rider-details/<int:details_id>', methods=['GET'])
def fetch_rider_details_by_id(details_id):
    return get_rider_details_by_id(details_id)

# Update rider details by ID
@rider_details_bp.route('/rider-details/<int:details_id>', methods=['PUT'])
def modify_rider_details(details_id):
    data = request.get_json()
    return update_rider_details(details_id, data)

# Delete rider details by ID
@rider_details_bp.route('/rider-details/<int:details_id>', methods=['DELETE'])
def remove_rider_details(details_id):
    return delete_rider_details(details_id)

# Get rider details by rider_id (filter)
@rider_details_bp.route('/rider-details/rider/<int:rider_id>', methods=['GET'])
def fetch_rider_details_by_rider(rider_id):
    return get_rider_details_by_rider(rider_id)



from flask import Blueprint, request
from app.main.services.rideRequests import (
    create_ride_request,
    get_all_ride_requests,
    get_ride_request_by_id,
    update_ride_request,
    delete_ride_request,
    get_ride_requests_by_ride,
    get_ride_requests_by_rider
)

ride_requests_bp = Blueprint('ride_requests_bp', __name__)

# Create a new ride request
@ride_requests_bp.route('/ride-requests', methods=['POST'])
def create_request():
    data = request.get_json()
    return create_ride_request(data)

# Get all ride requests
@ride_requests_bp.route('/ride-requests', methods=['GET'])
def fetch_all_requests():
    return get_all_ride_requests()

# Get a ride request by request_id
@ride_requests_bp.route('/ride-requests/<int:request_id>', methods=['GET'])
def fetch_request_by_id(request_id):
    return get_ride_request_by_id(request_id)

# Update a ride request (e.g., status)
@ride_requests_bp.route('/ride-requests/<int:request_id>', methods=['PUT'])
def update_request(request_id):
    data = request.get_json()
    return update_ride_request(request_id, data)

# Delete a ride request
@ride_requests_bp.route('/ride-requests/<int:request_id>', methods=['DELETE'])
def delete_request(request_id):
    return delete_ride_request(request_id)

# Get all ride requests for a specific ride
@ride_requests_bp.route('/ride-requests/ride/<int:ride_id>', methods=['GET'])
def get_requests_by_ride(ride_id):
    return get_ride_requests_by_ride(ride_id)

# Get all ride requests by a specific rider
@ride_requests_bp.route('/ride-requests/rider/<int:rider_id>', methods=['GET'])
def get_requests_by_rider(rider_id):
    return get_ride_requests_by_rider(rider_id)


from flask import Blueprint, request
from app.main.services.rides import (
    create_ride,
    get_ride_by_id,
    get_all_rides,
    update_ride,
    delete_ride
)

rides_bp = Blueprint('rides_bp', __name__)

# -----------------------
# POST /rides - Create a new ride
# -----------------------
@rides_bp.route('/rides', methods=['POST'])
def create_new_ride():
    data = request.get_json()
    return create_ride(data)

# -----------------------------
# GET /rides/<int:ride_id> - Get ride by ID
# -----------------------------
@rides_bp.route('/rides/<int:ride_id>', methods=['GET'])
def get_ride(ride_id):
    return get_ride_by_id(ride_id)

# -----------------------
# GET /rides - Get all rides (optionally with filters)
# -----------------------
@rides_bp.route('/rides', methods=['GET'])
def get_rides():
    filters = request.args.to_dict()
    return get_all_rides(filters)

# -----------------------------
# PUT /rides/<int:ride_id> - Update ride
# -----------------------------
@rides_bp.route('/rides/<int:ride_id>', methods=['PUT'])
def update_ride_by_id(ride_id):
    data = request.get_json()
    return update_ride(ride_id, data)

# -----------------------------
# DELETE /rides/<int:ride_id> - Delete ride
# -----------------------------
@rides_bp.route('/rides/<int:ride_id>', methods=['DELETE'])
def delete_ride_by_id(ride_id):
    return delete_ride(ride_id)

from flask import Blueprint, request, jsonify
from app.main.services.roles import (
    create_role,
    get_all_roles,
    get_role_by_id,
    update_role,
    delete_role
)

roles_bp = Blueprint('roles_bp', __name__)

# Create a new role
@roles_bp.route('/roles', methods=['POST'])
def create():
    data = request.get_json()
    role_name = data.get('role_name')
    if not role_name:
        return jsonify({"error": "role_name is required"}), 400
    role = create_role(role_name)
    return jsonify({
        "message": "Role created",
        "role_id": role.role_id,
        "role_name": role.role_name
    }), 201

# Get all roles
@roles_bp.route('/roles', methods=['GET'])
def get_all():
    roles = get_all_roles()
    result = [{
        "role_id": role.role_id,
        "role_name": role.role_name
    } for role in roles]
    return jsonify(result), 200

# Get a role by ID
@roles_bp.route('/roles/<int:role_id>', methods=['GET'])
def get_by_id(role_id):
    role = get_role_by_id(role_id)
    if not role:
        return jsonify({"message": "Role not found"}), 404
    return jsonify({
        "role_id": role.role_id,
        "role_name": role.role_name
    }), 200

# Update a role
@roles_bp.route('/roles/<int:role_id>', methods=['PUT'])
def update(role_id):
    data = request.get_json()
    new_role_name = data.get('role_name')
    if not new_role_name:
        return jsonify({"error": "role_name is required"}), 400
    role = update_role(role_id, new_role_name)
    if not role:
        return jsonify({"message": "Role not found"}), 404
    return jsonify({
        "message": "Role updated",
        "role_id": role.role_id,
        "role_name": role.role_name
    }), 200

# Delete a role
@roles_bp.route('/roles/<int:role_id>', methods=['DELETE'])
def delete(role_id):
    success = delete_role(role_id)
    if not success:
        return jsonify({"message": "Role not found"}), 404
    return jsonify({"message": "Role deleted"}), 200


from flask import Blueprint, request
from app.main.services.routeStops import (
    create_route_stop,
    get_all_route_stops,
    get_route_stop_by_id,
    update_route_stop,
    delete_route_stop
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




from flask import Blueprint, request
from app.main.services.stops import (
    create_stop,
    get_all_stops,
    get_stop_by_id,
    update_stop,
    delete_stop
)

stops_bp = Blueprint('stops_bp', __name__)

# Create a new stop
@stops_bp.route('/stops', methods=['POST'])
def create():
    data = request.get_json()
    return create_stop(data)

# Get all stops
@stops_bp.route('/stops', methods=['GET'])
def fetch_all():
    return get_all_stops()

# Get a stop by ID
@stops_bp.route('/stops/<int:stop_id>', methods=['GET'])
def fetch_by_id(stop_id):
    return get_stop_by_id(stop_id)

# Update a stop
@stops_bp.route('/stops/<int:stop_id>', methods=['PUT'])
def update(stop_id):
    data = request.get_json()
    return update_stop(stop_id, data)

# Delete a stop
@stops_bp.route('/stops/<int:stop_id>', methods=['DELETE'])
def delete(stop_id):
    return delete_stop(stop_id)



from flask import Blueprint, request
from app.main.services.user import (
    add_user,
    get_user_by_id,
    get_all_users,
    update_user,
    delete_user
)

user_bp = Blueprint('user_bp', __name__)

# -----------------------
# POST /users - Add user
# -----------------------
@user_bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    return add_user(data)

# -----------------------------
# GET /users/<int:user_id> - Get user by ID
# -----------------------------
@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    return get_user_by_id(user_id)

# -----------------------
# GET /users - Get all users
# -----------------------
@user_bp.route('/users', methods=['GET'])
def get_users():
    return get_all_users()

# -----------------------------
# PUT /users/<int:user_id> - Update user
# -----------------------------
@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user_by_id(user_id):
    data = request.get_json()
    return update_user(user_id, data)

# -----------------------------
# DELETE /users/<int:user_id> - Delete user
# -----------------------------
@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user_by_id(user_id):
    return delete_user(user_id)




from flask import Blueprint, request
from app.main.services.wallet import (
    create_wallet,
    get_wallet_by_id,
    get_wallet_by_user_id,
    update_wallet_balance,
    delete_wallet
)

wallets_bp = Blueprint('wallets_bp', __name__)

# Create a wallet
@wallets_bp.route('/wallets', methods=['POST'])
def create():
    data = request.get_json()
    return create_wallet(data)

# Get wallet by wallet_id
@wallets_bp.route('/wallets/<int:wallet_id>', methods=['GET'])
def get_by_id(wallet_id):
    return get_wallet_by_id(wallet_id)

# Get wallet by user_id
@wallets_bp.route('/wallets/user/<int:user_id>', methods=['GET'])
def get_by_user_id(user_id):
    return get_wallet_by_user_id(user_id)

# Update wallet balance
@wallets_bp.route('/wallets/<int:wallet_id>', methods=['PUT'])
def update(wallet_id):
    data = request.get_json()
    return update_wallet_balance(wallet_id, data)

# Delete a wallet
@wallets_bp.route('/wallets/<int:wallet_id>', methods=['DELETE'])
def delete(wallet_id):
    return delete_wallet(wallet_id)


config.py:
import os
from dotenv import load_dotenv
 
load_dotenv()
 
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
dbname = os.getenv("DB_NAME")
# secret_key=os.getenv("JWT_SECRET_KEY")
 
class DevConfig:
    SQLALCHEMY_DATABASE_URI = f"postgresql://{user}:{password}@{host}:{port}/{dbname}"
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {
            "options": "-c search_path=carconnect"
        }
    }
 
    # JWT_SECRET_KEY = "secret_key"
    # JWT_ACCESS_TOKEN_EXPIRES = 86400


init.py:

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
# from flask_bcrypt import Bcrypt
# from flask_jwt_extended import JWTManager

from app.main.config.dev_config import DevConfig  # <-- import the config class

app = Flask(__name__)
app.config.from_object(DevConfig)  # <-- apply the config

db = SQLAlchemy(app)
# bcrypt = Bcrypt(app)
# jwt = JWTManager(app)
from app.main.controllers.user import user_bp
app.register_blueprint(user_bp)

from app.main.controllers.driver import driver_bp
app.register_blueprint(driver_bp)

# from app.main.controllers.riders import rider_bp
# app.register_blueprint(rider_bp)

from app.main.controllers.rides import rides_bp
app.register_blueprint(rides_bp)

from app.main.controllers.messages import message_bp
app.register_blueprint(message_bp)

from app.main.controllers.payments import payment_bp
app.register_blueprint(payment_bp)

from app.main.controllers.reviews import review_bp
app.register_blueprint(review_bp)

from app.main.controllers.rideRequest import ride_requests_bp
app.register_blueprint(ride_requests_bp)

from app.main.controllers.riderDetails import rider_details_bp
app.register_blueprint(rider_details_bp)

from app.main.controllers.routeStops import route_stops_bp
app.register_blueprint(route_stops_bp)


from app.main.controllers.stops import stops_bp
app.register_blueprint(stops_bp)

from app.main.controllers.wallet import wallets_bp
app.register_blueprint(wallets_bp)

from app.main.controllers.roles import roles_bp
app.register_blueprint(roles_bp)

# from app.main.utils.auth import auth_bp
# app.register_blueprint(auth_bp, url_prefix='/auth')




manage.py:
from flask import Flask, jsonify, request

from app import db,app

from app.main.models import drivers,messages,payments,reviews,riderDetails,riders,rideRequests,routeStops,roles,stops,user,wallet,rides,riders
from app.main.services.user import  User
from app.main.services.drivers import Drivers


        

def run():

    with app.app_context():
        # db.drop_all()
        db.create_all()

    app.run(debug=True,port=42099)

if __name__ == "__main__":
    # app.run(debug=True,host='0.0.0.0', port=5000)
    run()


