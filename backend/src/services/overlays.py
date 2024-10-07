from flask import jsonify
from src.db.session import getSession
from bson import ObjectId

def convert_objectid_to_str(data):
    if isinstance(data, list):
        return [{**item, '_id': str(item['_id'])} for item in data]
    elif isinstance(data, dict):
        return {**data, '_id': str(data['_id'])}
    return data


db = getSession()


def get_all_overlays(user_id):
    overlays_collection = db['overlays']
    overlays = list(overlays_collection.find({'user_id': user_id}))
    converted_overlays = convert_objectid_to_str(overlays)
    return jsonify(converted_overlays), 200

def get_overlay_by_id(id):
    overlays_collection = db['overlays']
    overlay = overlays_collection.find_one({'_id': id})
    converted_overlay = convert_objectid_to_str(overlay)
    if overlay:
        return jsonify(converted_overlay), 200
    else:
        return jsonify({'error': 'Overlay not found.'}), 404

def create_overlay(user_id, overlay):
    overlays_collection = db['overlays']
    overlay['user_id'] = user_id
    print(overlay)
    # Ensure the overlay has a type and content field
    if 'type' not in overlay or 'content' not in overlay:
        return jsonify({'error': 'Overlay must have a type and content field.'}), 400
    
    # Validate the type of overlay
    if overlay['type'] not in ['image', 'text']:
        return jsonify({'error': 'Overlay type must be either "image" or "text".'}), 400

    # Check for existing overlays with the same width and height
    existing_overlays = list(overlays_collection.find({'user_id': user_id}))
    for existing_overlay in existing_overlays:
        if existing_overlay['position']['x'] == overlay['position']['x'] and existing_overlay['position']['y'] == overlay['position']['y']:
            # Adjust width and height by a small amount
            overlay['position']['x'] += 10  # or any small value
            overlay['position']['y'] -= 20  # or any small value
            break

    result = overlays_collection.insert_one(overlay)
    overlay = overlays_collection.find_one({'_id': result.inserted_id})
    return jsonify({'id': convert_objectid_to_str(overlay)}), 201

def update_overlay(id, overlay):
    overlays_collection = db['overlays']
    overlay.pop('_id', None)
    prev_overlay = overlays_collection.find_one({'_id': ObjectId(id)})
    if not prev_overlay:
        print('Overlay not found')
        return jsonify({'error': 'Overlay not found.'}), 404

    result = overlays_collection.update_one({'_id': ObjectId(id)}, {'$set': overlay})
    if result.matched_count == 1:
        return jsonify({'message': 'Overlay updated.'}), 200
    else:
        return jsonify({'error': 'Overlay not found.'}), 404

    

def delete_overlay(id):
    overlays_collection = db['overlays']
    result = overlays_collection.delete_one({'_id': ObjectId(id)})
    if result.deleted_count == 1:
        return jsonify({'message': 'Overlay deleted.'}), 200
    else:
        return jsonify({'error': 'Overlay not found.'}), 404
