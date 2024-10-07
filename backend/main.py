import subprocess
import threading
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS  # Add this import
import os
from src.services.login import login_user
from src.services.overlays import get_all_overlays, get_overlay_by_id, create_overlay, update_overlay, delete_overlay
import shutil

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

HLS_OUTPUT_PATH = "src/hls/stream"
VIDSOURCE="rtsp://rtspstream:fc2c92446790e4d0cea985271a67e748@zephyr.rtsp.stream/movie"
AUDIO_OPTS="-c:a aac -b:a 160000 -ac 2"
VIDEO_OPTS="-c:v libx264 -b:v 800000"
OUTPUT_HLS="-hls_time 10 -hls_list_size 10 -start_number 1"

def convert_rtsp_to_hls():
    if os.path.exists(HLS_OUTPUT_PATH):
        shutil.rmtree(HLS_OUTPUT_PATH)
    os.makedirs(HLS_OUTPUT_PATH)
    
    ffmpeg_command = [
        "ffmpeg",
        "-analyzeduration", "10000000",
        "-probesize", "10000000",
        "-rtsp_transport", "tcp",
        "-vcodec", "h264",
        "-i", VIDSOURCE,
        "-y"
    ] + AUDIO_OPTS.split() + VIDEO_OPTS.split() + OUTPUT_HLS.split() + [f"{HLS_OUTPUT_PATH}/stream.m3u8"]
    
    subprocess.run(ffmpeg_command)

@app.route('/hls/<path:filename>', methods=['GET'])
def serve_hls(filename):
    print(filename)
    return send_from_directory(HLS_OUTPUT_PATH, filename)

@app.route('/api/login', methods=['POST'])
def login():
    name = request.json.get('name')
    email = request.json.get('email')
    return login_user(name, email)

@app.route('/api/overlays', methods=['GET'])
def get_overlays():
    user_id = request.args.get('user_id')
    print(user_id)
    return get_all_overlays(user_id)

@app.route('/api/overlays/<id>', methods=['GET'])
def get_overlay(id):
    return get_overlay_by_id(id)

@app.route('/api/overlays', methods=['POST'])
def create_overlay_route():
    user_id = request.json.get('user_id')
    overlay = request.json.get('overlay')
    return create_overlay(user_id, overlay)

@app.route('/api/overlays/<id>', methods=['PUT'])
def update_overlay_route(id):
    overlay = request.json.get('overlay')
    return update_overlay(id, overlay)

@app.route('/api/overlays/<id>', methods=['DELETE'])
def delete_overlay_route(id):
    return delete_overlay(id)


if __name__ == "__main__":
    conversion_thread = threading.Thread(target=convert_rtsp_to_hls)
    conversion_thread.start()
    
    app.run(host='0.0.0.0', port=8000)