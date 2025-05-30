from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app import db

class Review(db.Model):
    __tablename__ = 'reviews'

    review_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ride_id = db.Column(db.Integer, db.ForeignKey('rides.ride_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)  # updated FK to user table
    rating = db.Column(db.Integer, nullable=False) 
    comment = db.Column(db.Text)
    create_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    ride = db.relationship('Rides', backref=db.backref('reviews', lazy=True))
    user = db.relationship('User', backref=db.backref('reviews', lazy=True))  # updated relationship
