# Live Stream Overlay Project

This project is designed to stream live content using RTSP URLs. The tech stack includes React for the frontend, Flask for the backend, and MongoDB as the database.

## Features
- Users can add overlays to the stream, edit them, change their size, and delete them.
- The project converts RTSP streams to HLS format using FFmpeg for seamless streaming.

**Important**: If you want to change the RTSP source, you can do so by modifying the `VIDSOURCE` variable in `main.py`.

## Project Setup

To run the project, follow these steps:

1. Navigate to the `/database` folder and install the required libraries from `requirements.txt` using the following command:
   ```bash
   pip install -r requirements.txt
   ```
   Then, run the `init_db.py` file to initialize the database.

2. Next, go to the `/backend` folder, install the required dependencies, and run the application:
   ```bash
   pip install -r requirements.txt
   python main.py
   ```

3. Finally, run the frontend application located in the `/frontend` folder:
   ```bash
   yarn install
   yarn start
   ```

## API Endpoints

- **POST /api/login**: Creates or retrieves a user by email and returns the `user_id` in the response.
- **GET /hls/filename** : Streams the specified `filename.m3u8`.
- **GET /api/overlays** : Retrieves all overlays for a given `user_id`.
- **GET /api/overlays/id** : Retrieves a specific overlay by its `id`.
- **POST /api/overlays**: Creates a new overlay.
- **PUT /api/overlays/id** : Updates an existing overlay.
- **DELETE /api/overlays/id** : Deletes an overlay.


