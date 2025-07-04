from datetime import datetime
from app import db
from app.main.models.drivers import Drivers

class User(db.Model):
    __tablename__ = "user"

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
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

    # One-to-one relationship with Wallet
    wallet = db.relationship('Wallet', backref='user', uselist=False)

    # Messages sent and received
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender_user', lazy=True)
    received_messages = db.relationship('Message', foreign_keys='Message.receiver_id', backref='receiver_user', lazy=True)

    # RiderDetails entries associated with this user (if RiderDetails still exists)
    rider_details = db.relationship('RiderDetails', backref='user', lazy=True)

    # role=db.relationship('Role',backref='user',lazy=True)
