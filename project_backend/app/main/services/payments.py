from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app import db
from app.main.models.payments import PaymentsTable
from app.main.models.wallet import Wallet
from datetime import datetime

VALID_STATUSES = {'Pending', 'Completed'}
VALID_METHODS = {'Cash', 'Card', 'UPI'}

def add_payment(data):
    try:
        driver_wallet_id = data.get('driver_wallet_id')
        payer_wallet_id = data.get('payer_wallet_id')
        amount = data.get('amount')
        payment_status = data.get('payment_status')
        payment_method = data.get('payment_method')


        if not all([driver_wallet_id, payer_wallet_id, amount, payment_status, payment_method]):
            return jsonify({"message": "All fields are required"}), 400


        if not isinstance(amount, (int, float)) or amount <= 0:
            return jsonify({"message": "Amount must be a positive number"}), 400



        if payment_status not in VALID_STATUSES:
            return jsonify({"message": f"Invalid payment status. Must be one of {VALID_STATUSES}"}), 400
        if payment_method not in VALID_METHODS:
            return jsonify({"message": f"Invalid payment method. Must be one of {VALID_METHODS}"}), 400
        


        # Validate wallets
        driver_wallet = Wallet.query.get(driver_wallet_id)
        if not driver_wallet:
            return jsonify({"message": "Driver wallet not found"}), 404

        payer_wallet = Wallet.query.get(payer_wallet_id)
        if not payer_wallet:
            return jsonify({"message": "Payer wallet not found"}), 404

        new_payment = PaymentsTable(
            driver_wallet_id=driver_wallet_id,
            payer_wallet_id=payer_wallet_id,
            amount=amount,
            payment_status=payment_status,
            payment_method=payment_method,
            create_datetime=datetime.utcnow()
        )

        db.session.add(new_payment)
        db.session.commit()

        return jsonify({"message": "Payment added successfully"}), 201

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Integrity error occurred"}), 409
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"message": "Database error occurred"}), 500
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def get_payment_by_id(payment_id):
    try:
        payment = PaymentsTable.query.get(payment_id)
        if not payment:
            return jsonify({"message": "Payment not found"}), 404

        payment_data = {
            "payment_id": payment.payment_id,
            "driver_wallet_id": payment.driver_wallet_id,
            "payer_wallet_id": payment.payer_wallet_id,
            "amount": payment.amount,
            "payment_status": payment.payment_status,
            "payment_method": payment.payment_method,
            "created_at": payment.create_datetime
        }

        return jsonify(payment_data), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def get_all_payments():
    try:
        payments = PaymentsTable.query.all()
        output = []
        for payment in payments:
            output.append({
                "payment_id": payment.payment_id,
                "driver_wallet_id": payment.driver_wallet_id,
                "payer_wallet_id": payment.payer_wallet_id,
                "amount": payment.amount,
                "payment_status": payment.payment_status,
                "payment_method": payment.payment_method,
                "created_at": payment.create_datetime
            })
        return jsonify(output), 200
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def update_payment(payment_id, data):
    try:
        payment = PaymentsTable.query.get(payment_id)
        if not payment:
            return jsonify({"message": "Payment not found"}), 404


        if 'driver_wallet_id' in data:
            wallet = Wallet.query.get(data['driver_wallet_id'])
            if not wallet:
                return jsonify({"message": "Driver wallet not found"}), 404
            payment.driver_wallet_id = data['driver_wallet_id']

        if 'payer_wallet_id' in data:
            wallet = Wallet.query.get(data['payer_wallet_id'])
            if not wallet:
                return jsonify({"message": "Payer wallet not found"}), 404
            payment.payer_wallet_id = data['payer_wallet_id']

        if 'amount' in data:
            amount = data['amount']
            if not isinstance(amount, (int, float)) or amount <= 0:
                return jsonify({"message": "Amount must be a positive number"}), 400
            payment.amount = amount

        if 'payment_status' in data:
            if data['payment_status'] not in VALID_STATUSES:
                return jsonify({"message": f"Invalid payment status. Must be one of {VALID_STATUSES}"}), 400
            payment.payment_status = data['payment_status']

        if 'payment_method' in data:
            if data['payment_method'] not in VALID_METHODS:
                return jsonify({"message": f"Invalid payment method. Must be one of {VALID_METHODS}"}), 400
            payment.payment_method = data['payment_method']

        db.session.commit()
        return jsonify({"message": "Payment updated successfully"}), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Integrity error occurred"}), 409
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"message": "Database error occurred"}), 500
    except Exception:
        return jsonify({"message": "Internal server error"}), 500


def delete_payment(payment_id):
    try:
        payment = PaymentsTable.query.get(payment_id)
        if not payment:
            return jsonify({"message": "Payment not found"}), 404

        db.session.delete(payment)
        db.session.commit()
        return jsonify({"message": "Payment deleted successfully"}), 200

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"message": "Database error occurred"}), 500
    except Exception:
        return jsonify({"message": "Internal server error"}), 500
