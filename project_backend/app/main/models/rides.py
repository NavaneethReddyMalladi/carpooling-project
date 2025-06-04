from datetime import datetime
from app import db

class Rides(db.Model):
    __tablename__ = 'rides'

    ride_id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.driver_id'), nullable=False)

    origin_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)
    destination_stop_id = db.Column(db.Integer, db.ForeignKey('stops.stop_id'), nullable=False)

    # route_id is a simple Integer without foreign key constraint
    route_id = db.Column(db.Integer, nullable=True)  # Optional: can be set manually or via logic

    departure_time = db.Column(db.DateTime, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)

    status = db.Column(db.String(20), nullable=False, default='Active')

    create_datetime = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    update_datetime = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    origin_stop = db.relationship('Stops', foreign_keys=[origin_stop_id])
    destination_stop = db.relationship('Stops', foreign_keys=[destination_stop_id])
