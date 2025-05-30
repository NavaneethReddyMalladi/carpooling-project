# from sqlalchemy.dialects.postgresql import UUID
# from datetime import datetime
# from app import db

# class Riders(db.Model):
#     __tablename__ = 'riders'

#     rider_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False, unique=True)
#     rider_name = db.Column(db.String(50), nullable=False)
#     rider_gender = db.Column(db.String(10), nullable=False) 
#     phone_number = db.Column(db.String(20), nullable=False)
#     email = db.Column(db.String(100), nullable=False)
#     create_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
#     update_datetime = db.Column(db.DateTime, onupdate=datetime.utcnow)

#     # 🔗 Relationships
#     # user = db.relationship('User', backref=db.backref('rider', uselist=False, lazy=True))
#     # rides = db.relationship('Rides', backref='rider', lazy=True)

    
