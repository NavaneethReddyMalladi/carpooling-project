from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy import or_, desc
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


def get_user_transactions(user_id):
    """
    Get all transactions for a specific user (both sent and received payments)
    """
    try:
        # First get the user's wallet
        user_wallet = Wallet.query.filter_by(user_id=user_id).first()
        if not user_wallet:
            return jsonify({"message": "User wallet not found"}), 404

        # Get all payments where user is either payer or receiver
        payments = PaymentsTable.query.filter(
            or_(
                PaymentsTable.driver_wallet_id == user_wallet.wallet_id,
                PaymentsTable.payer_wallet_id == user_wallet.wallet_id
            )
        ).order_by(desc(PaymentsTable.create_datetime)).all()

        transactions = []
        for payment in payments:
            # Determine if this is a credit (money received) or debit (money sent)
            is_credit = payment.driver_wallet_id == user_wallet.wallet_id
            
            # Get the other party's wallet for description
            other_wallet_id = payment.payer_wallet_id if is_credit else payment.driver_wallet_id
            other_wallet = Wallet.query.get(other_wallet_id)
            
            # Create transaction description
            if is_credit:
                description = f"Payment received from User {other_wallet.user_id if other_wallet else 'Unknown'}"
            else:
                description = f"Payment sent to Driver (User {other_wallet.user_id if other_wallet else 'Unknown'})"

            transactions.append({
                "id": f"payment_{payment.payment_id}",
                "description": description,
                "amount": float(payment.amount),
                "type": "credit" if is_credit else "debit",
                "status": payment.payment_status.lower(),
                "date": payment.create_datetime.isoformat(),
                "paymentMethod": payment.payment_method,
                "payment_id": payment.payment_id,
                "transaction_type": "payment"
            })

        return jsonify(transactions), 200
    except Exception as e:
        print(f"Error getting user transactions: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500


def get_wallet_transactions_by_user(user_id, transaction_type=None, limit=None):
    """
    Get wallet transactions for a user with optional filtering
    Args:
        user_id: User ID
        transaction_type: 'credit', 'debit', or None for all
        limit: Number of transactions to return (None for all)
    """
    try:
        # Get user's wallet
        user_wallet = Wallet.query.filter_by(user_id=user_id).first()
        if not user_wallet:
            return jsonify({"message": "User wallet not found"}), 404

        # Base query for payments involving this user's wallet
        query = PaymentsTable.query.filter(
            or_(
                PaymentsTable.driver_wallet_id == user_wallet.wallet_id,
                PaymentsTable.payer_wallet_id == user_wallet.wallet_id
            )
        )

        # Apply transaction type filter if specified
        if transaction_type == 'credit':
            query = query.filter(PaymentsTable.driver_wallet_id == user_wallet.wallet_id)
        elif transaction_type == 'debit':
            query = query.filter(PaymentsTable.payer_wallet_id == user_wallet.wallet_id)

        # Order by date and apply limit
        query = query.order_by(desc(PaymentsTable.create_datetime))
        if limit:
            query = query.limit(limit)

        payments = query.all()

        transactions = []
        for payment in payments:
            is_credit = payment.driver_wallet_id == user_wallet.wallet_id
            
            # Get other party details
            other_wallet_id = payment.payer_wallet_id if is_credit else payment.driver_wallet_id
            other_wallet = Wallet.query.get(other_wallet_id)
            
            # Enhanced description based on context
            if is_credit:
                description = f"Ride payment received"
                if other_wallet:
                    description += f" from User {other_wallet.user_id}"
            else:
                description = f"Ride payment"
                if other_wallet:
                    description += f" to Driver (User {other_wallet.user_id})"

            transaction = {
                "id": f"payment_{payment.payment_id}",
                "description": description,
                "amount": float(payment.amount),
                "type": "credit" if is_credit else "debit",
                "status": payment.payment_status.lower(),
                "date": payment.create_datetime.isoformat(),
                "paymentMethod": payment.payment_method,
                "payment_id": payment.payment_id,
                "transaction_type": "payment",
                "other_user_id": other_wallet.user_id if other_wallet else None
            }
            
            transactions.append(transaction)

        return jsonify({
            "transactions": transactions,
            "total_count": len(transactions),
            "wallet_id": user_wallet.wallet_id,
            "current_balance": float(user_wallet.balance)
        }), 200

    except Exception as e:
        print(f"Error getting wallet transactions: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500


def get_transaction_summary(user_id):
    """
    Get transaction summary for a user including totals and recent activity
    """
    try:
        user_wallet = Wallet.query.filter_by(user_id=user_id).first()
        if not user_wallet:
            return jsonify({"message": "User wallet not found"}), 404

        # Get all payments for calculations
        all_payments = PaymentsTable.query.filter(
            or_(
                PaymentsTable.driver_wallet_id == user_wallet.wallet_id,
                PaymentsTable.payer_wallet_id == user_wallet.wallet_id
            )
        ).all()

        # Calculate totals
        total_received = sum([
            float(p.amount) for p in all_payments 
            if p.driver_wallet_id == user_wallet.wallet_id and p.payment_status == 'Completed'
        ])
        
        total_sent = sum([
            float(p.amount) for p in all_payments 
            if p.payer_wallet_id == user_wallet.wallet_id and p.payment_status == 'Completed'
        ])

        pending_received = sum([
            float(p.amount) for p in all_payments 
            if p.driver_wallet_id == user_wallet.wallet_id and p.payment_status == 'Pending'
        ])
        
        pending_sent = sum([
            float(p.amount) for p in all_payments 
            if p.payer_wallet_id == user_wallet.wallet_id and p.payment_status == 'Pending'
        ])

        return jsonify({
            "user_id": user_id,
            "wallet_id": user_wallet.wallet_id,
            "current_balance": float(user_wallet.balance),
            "total_transactions": len(all_payments),
            "total_received": total_received,
            "total_sent": total_sent,
            "pending_received": pending_received,
            "pending_sent": pending_sent,
            "net_amount": total_received - total_sent,
            "last_updated": user_wallet.updated_at.isoformat()
        }), 200

    except Exception as e:
        print(f"Error getting transaction summary: {str(e)}")
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