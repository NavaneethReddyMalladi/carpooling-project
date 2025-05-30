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
    