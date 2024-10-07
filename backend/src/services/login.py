from pymongo import MongoClient
from flask import jsonify
from src.db.session import getSession




def login_user(name, email):
    db = getSession()
    users_collection = db['users']
    if not name or not email:
        return jsonify({'error': 'Name and email are required.'}), 400

    # Check if user already exists
    user = users_collection.find_one({'email': email})

    if user:
        # User exists, return user id
        return jsonify({'user_id': str(user['_id'])}), 200
    else:
        # Create new user
        new_user = {'name': name, 'email': email}
        result = users_collection.insert_one(new_user)
        return jsonify({'user_id': str(result.inserted_id)}), 201


