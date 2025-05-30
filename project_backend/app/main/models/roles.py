
from datetime import datetime
from app import db

class Role(db.Model):
    __tablename__ = 'roles'
    
    role_id = db.Column(db.Integer, primary_key=True,autoincrement=True)

    role_name = db.Column(db.String(50), nullable=False, unique=True)

    # Optional: Relationship to User table
    users = db.relationship('User', backref='role', lazy=True)