from flask import Blueprint, request
from app.main.services.messages import (
    add_message,
    get_message_by_id,
    get_all_messages,
    get_messages_between_users,
    delete_message
)

message_bp = Blueprint('message_bp', __name__)

@message_bp.route('/messages', methods=['POST'])
def create_message():
    data = request.get_json()
    return add_message(data)

@message_bp.route('/messages/<int:message_id>', methods=['GET'])
def get_message(message_id):
    return get_message_by_id(message_id)

@message_bp.route('/messages', methods=['GET'])
def get_messages():
    return get_all_messages()

@message_bp.route('/messages/conversation/<int:sender_id>/<int:receiver_id>', methods=['GET'])
def get_conversation(sender_id, receiver_id):
    return get_messages_between_users(sender_id, receiver_id)

@message_bp.route('/messages/<int:message_id>', methods=['DELETE'])
def remove_message(message_id):
    return delete_message(message_id)

@message_bp.route('/create-chat-session', methods=['POST'])
def create_chat_session():
    data = request.get_json()
    # Implement your chat session creation logic here
    return {"message": "Chat session created", "data": data}, 201

# Add a test route to verify the blueprint is working
@message_bp.route('/messages/test', methods=['GET'])
def test_messages():
    return {"message": "Messages blueprint is working!", "status": "success"}, 200