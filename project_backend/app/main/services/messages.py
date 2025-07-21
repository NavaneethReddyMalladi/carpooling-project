from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from app.main.models.messages import Message
from app.main.models.user import User
from app.main.models.rides import Rides 
from app import db 
from datetime import datetime 



def add_message(data):
    try:
        sender_id = data.get('sender_id')
        receiver_id = data.get('receiver_id')
        ride_id = data.get('ride_id') 
        message_text = data.get('message_text')

        

        if not all([sender_id, receiver_id, message_text]):
            return jsonify({"message": "sender_id, receiver_id, and message_text are required"}), 400

   
   

        sender = User.query.get(sender_id)
        if not sender:
            return jsonify({"message": "Sender not found"}), 404



        receiver = User.query.get(receiver_id)
        if not receiver:
            return jsonify({"message": "Receiver not found"}), 404


        if ride_id:
            ride = Rides.query.get(ride_id)
            if not ride:
                return jsonify({"message": "Ride not found"}), 404

        new_message = Message(
            sender_id=sender_id,
            receiver_id=receiver_id,
            ride_id=ride_id,
            message_text=message_text,
            sent_at=datetime.utcnow()
        )

        db.session.add(new_message)
        db.session.commit()

        return jsonify({"message": "Message sent successfully", "message_id": new_message.message_id}), 201

    except IntegrityError as e:
        db.session.rollback()
        print(e)
        return jsonify({"message": "Integrity error occurred"}), 409
    except SQLAlchemyError as e:
        db.session.rollback()
        print(e)
        return jsonify({"message": "Database error occurred"}), 500
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error"}), 500


def get_message_by_id(message_id):
    try:
        message = Message.query.get(message_id)
        if not message:
            return jsonify({"message": "Message not found"}), 404

        data = {
            "message_id": message.message_id,
            "sender_id": message.sender_id,
            "receiver_id": message.receiver_id,
            "ride_id": message.ride_id,
            "message_text": message.message_text,
            "sent_at": message.sent_at
        }
        return jsonify(data), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error"}), 500


def get_all_messages():
    try:
        messages = Message.query.all()
        output = []
        for msg in messages:
            output.append({
                "message_id": msg.message_id,
                "sender_id": msg.sender_id,
                "receiver_id": msg.receiver_id,
                "ride_id": msg.ride_id,
                "message_text": msg.message_text,
                "sent_at": msg.sent_at
            })
        return jsonify(output), 200
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error"}), 500


def get_messages_between_users(sender_id, receiver_id):
    try:
        messages = Message.query.filter(
            ((Message.sender_id == sender_id) & (Message.receiver_id == receiver_id)) |
            ((Message.sender_id == receiver_id) & (Message.receiver_id == sender_id))
        ).order_by(Message.sent_at.asc()).all()

        if not messages:
            return jsonify({"message": "No messages found between these users"}), 404

        output = [{
            "message_id": msg.message_id,
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "ride_id": msg.ride_id,
            "message_text": msg.message_text,
            "sent_at": msg.sent_at
        } for msg in messages]

        return jsonify(output), 200

    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error"}), 500


def delete_message(message_id):
    try:
        message = Message.query.get(message_id)
        if not message:
            return jsonify({"message": "Message not found"}), 404

        db.session.delete(message)
        db.session.commit()
        return jsonify({"message": "Message deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        print(e)
        return jsonify({"message": "Database error occurred"}), 500
    except Exception as e:
        print(e)
        return jsonify({"message": "Internal server error"}), 500
