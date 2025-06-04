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
    rides = db.relationship('Rides', backref='driver', lazy=True)
