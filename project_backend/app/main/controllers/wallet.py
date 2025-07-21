from flask import Blueprint, request
from app.main.services.wallet import (
    create_wallet,
    get_wallet_by_id,
    get_wallet_by_user_id,
    update_wallet_balance,
    delete_wallet
)

wallets_bp = Blueprint('wallets_bp', __name__)



@wallets_bp.route('/wallets', methods=['POST'])
def create():
    data = request.get_json()
    return create_wallet(data)




@wallets_bp.route('/wallets/<int:wallet_id>', methods=['GET'])
def get_by_id(wallet_id):
    return get_wallet_by_id(wallet_id)



@wallets_bp.route('/wallets/user/<int:user_id>', methods=['GET'])
def get_by_user_id(user_id):
    return get_wallet_by_user_id(user_id)



@wallets_bp.route('/wallets/<int:wallet_id>', methods=['PUT'])
def update(wallet_id):
    data = request.get_json()
    return update_wallet_balance(wallet_id, data)




@wallets_bp.route('/wallets/<int:wallet_id>', methods=['DELETE'])
def delete(wallet_id):
    return delete_wallet(wallet_id)
