from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app import db

class RideRequestsTable(db.Model):
    __tablename__ = 'ride_requests'

    request_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ride_id = db.Column(db.Integer, db.ForeignKey('rides.ride_id'), nullable=False)
    rider_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)  
    status = db.Column(db.String(20), nullable=False, default='Pending')  
    requested_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)



    # Relationships
    ride = db.relationship('Rides', backref=db.backref('ride_requests', lazy=True))
    rider = db.relationship('User', backref=db.backref('ride_requests', lazy=True)) 
