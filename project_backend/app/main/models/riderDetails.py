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
