from flask import jsonify
from app import db
from app.main.models.wallet import  Wallet
from sqlalchemy.exc import SQLAlchemyError



def create_wallet(data):
    try:
        user_id = data['user_id']
        existing_wallet = Wallet.query.filter_by(user_id=user_id).first()
        if existing_wallet:
            return jsonify({"message": "Wallet already exists for this user."}), 400

        wallet = Wallet(user_id=user_id, balance=data.get('balance', 0))
        db.session.add(wallet)
        db.session.commit()
        return jsonify({"message": "Wallet created", "wallet_id": wallet.wallet_id}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



def get_wallet_by_id(wallet_id):
    wallet = Wallet.query.get(wallet_id)
    if not wallet:
        return jsonify({"message": "Wallet not found"}), 404

    return jsonify({
        "wallet_id": wallet.wallet_id,
        "user_id": wallet.user_id,
        "balance": wallet.balance,
        "created_at": wallet.created_at.isoformat(),
        "updated_at": wallet.updated_at.isoformat()
    }), 200




def get_wallet_by_user_id(user_id):
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    if not wallet:
        return jsonify({"message": "Wallet not found for user"}), 404

    return jsonify({
        "wallet_id": wallet.wallet_id,
        "user_id": wallet.user_id,
        "balance": wallet.balance,
        "created_at": wallet.created_at.isoformat(),
        "updated_at": wallet.updated_at.isoformat()
    }), 200




def update_wallet_balance(wallet_id, data):
    wallet = Wallet.query.get(wallet_id)
    if not wallet:
        return jsonify({"message": "Wallet not found"}), 404

    try:
        wallet.balance = data.get('balance', wallet.balance)
        db.session.commit()
        return jsonify({"message": "Wallet updated", "balance": wallet.balance}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500




def delete_wallet(wallet_id):
    wallet = Wallet.query.get(wallet_id)
    if not wallet:
        return jsonify({"message": "Wallet not found"}), 404

    try:
        db.session.delete(wallet)
        db.session.commit()
        return jsonify({"message": "Wallet deleted"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
