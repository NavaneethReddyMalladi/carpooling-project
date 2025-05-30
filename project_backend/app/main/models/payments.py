from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app import db
class PaymentsTable(db.Model):
    __tablename__='payments_table'

    payment_id = db.Column(db.Integer,primary_key=True,autoincrement=True)
    driver_wallet_id = db.Column(db.Integer, db.ForeignKey('wallet.wallet_id'), nullable=False)
    payer_wallet_id = db.Column(db.Integer, db.ForeignKey('wallet.wallet_id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(20), nullable=False)  # e.g., Pending, Completed
    payment_method = db.Column(db.String(50), nullable=False)  # e.g., Cash, Card, UPI
    create_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    driver_wallet = db.relationship('Wallet', foreign_keys=[driver_wallet_id], backref=db.backref('received_payments', lazy=True))
    payer_wallet = db.relationship('Wallet', foreign_keys=[payer_wallet_id], backref=db.backref('sent_payments', lazy=True))
    