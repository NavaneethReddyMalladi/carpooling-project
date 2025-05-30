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