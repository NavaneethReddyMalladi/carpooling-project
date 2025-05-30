from flask import Blueprint, request
from app.main.services.messages import (
    add_message,
    get_message_by_id,
    get_all_messages,
    get_messages_between_users,
    delete_message
)

message_bp = Blueprint('message_bp', __name__)

# ---------------------------------
# POST /messages - Send a message
# ---------------------------------
@message_bp.route('/messages', methods=['POST'])
def create_message():
    data = request.get_json()
    return add_message(data)

# -------------------------------------------------
# GET /messages/<int:message_id> - Get message by ID
# -------------------------------------------------
@message_bp.route('/messages/<int:message_id>', methods=['GET'])
def get_message(message_id):
    return get_message_by_id(message_id)

# ----------------------------------------
# GET /messages - Get all messages
# ----------------------------------------
@message_bp.route('/messages', methods=['GET'])
def get_messages():
    return get_all_messages()

# ------------------------------------------------------------------------
# GET /messages/conversation/<int:sender_id>/<int:receiver_id>
# Get all messages between two users
# ------------------------------------------------------------------------
@message_bp.route('/messages/conversation/<int:sender_id>/<int:receiver_id>', methods=['GET'])
def get_conversation(sender_id, receiver_id):
    return get_messages_between_users(sender_id, receiver_id)

# --------------------------------------------------
# DELETE /messages/<int:message_id> - Delete message
# --------------------------------------------------
@message_bp.route('/messages/<int:message_id>', methods=['DELETE'])
def remove_message(message_id):
    return delete_message(message_id)
