from flask import Blueprint, request
from app.main.services.payments import (
    add_payment,
    get_payment_by_id,
    get_all_payments,
    update_payment,
    delete_payment
)

payment_bp = Blueprint('payment_bp', __name__)




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
