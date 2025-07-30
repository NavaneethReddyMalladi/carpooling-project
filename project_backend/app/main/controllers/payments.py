from flask import Blueprint, request
from app.main.services.payments import (
    add_payment,
    get_payment_by_id,
    get_all_payments,
    update_payment,
    delete_payment,
    get_user_transactions,
    get_wallet_transactions_by_user,
    get_transaction_summary
)

payment_bp = Blueprint('payment_bp', __name__)

# Existing payment routes
@payment_bp.route('/payments', methods=['POST'])
def create_payment():
    data = request.get_json()
    return add_payment(data)

@payment_bp.route('/payments/<int:payment_id>', methods=['GET'])
def get_payment(payment_id):
    return get_payment_by_id(payment_id)

@payment_bp.route('/payments', methods=['GET'])
def get_payments():
    return get_all_payments()

@payment_bp.route('/payments/<int:payment_id>', methods=['PUT'])
def update_payment_by_id(payment_id):
    data = request.get_json()
    return update_payment(payment_id, data)

@payment_bp.route('/payments/<int:payment_id>', methods=['DELETE'])
def delete_payment_by_id(payment_id):
    return delete_payment(payment_id)

# New transaction history routes
@payment_bp.route('/users/<int:user_id>/transactions', methods=['GET'])
def get_user_transaction_history(user_id):
    """
    Get all transactions for a specific user
    Query parameters:
    - type: 'credit', 'debit', or omit for all
    - limit: number of transactions to return
    """
    transaction_type = request.args.get('type')
    limit = request.args.get('limit', type=int)
    
    return get_wallet_transactions_by_user(user_id, transaction_type, limit)

@payment_bp.route('/users/<int:user_id>/transactions/summary', methods=['GET'])
def get_user_transaction_summary(user_id):
    """
    Get transaction summary for a user including totals and statistics
    """
    return get_transaction_summary(user_id)

@payment_bp.route('/users/<int:user_id>/transactions/simple', methods=['GET'])
def get_simple_user_transactions(user_id):
    """
    Simple endpoint that matches your frontend Transaction interface
    """
    return get_user_transactions(user_id)