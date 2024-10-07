import os
import subprocess
from pymongo import MongoClient, ASCENDING
from pymongo.errors import CollectionInvalid
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()

# Read MongoDB configuration from environment variables
MONGO_HOST = os.getenv('MONGO_HOST', 'localhost')
MONGO_PORT = os.getenv('MONGO_PORT', '27017')
MONGO_AUTH_SOURCE = os.getenv('MONGO_AUTH_SOURCE', 'admin')
MONGO_URI = f"mongodb://{MONGO_HOST}:{MONGO_PORT}"

def database_exists(client, database_name):
    """Check if a database already exists in MongoDB."""
    return database_name in client.list_database_names()

def create_database_with_migrations(database_name):
    """Create a database and run migrations for MongoDB."""
    client = MongoClient(MONGO_URI)

    if database_exists(client, database_name):
        print(f"Database {database_name} already exists. Skipping creation.")
        return

    # Create the database by accessing it (MongoDB creates databases and collections on first use)
    db = client[database_name]

    # Run migrations
    run_migrations(db)

    print(f"Database created and migrations run for: {database_name}")

def run_migrations(db):
    """Run MongoDB migrations."""
    # This is where you'd implement your migration logic
    # For example:
    
    # Create a 'users' collection
    if 'users' not in db.list_collection_names():
        db.create_collection('users')
    
    # Create an index on the 'email' field
    db.users.create_index([("email", ASCENDING)], unique=True)
    
    # Create Overlays collection
    try:
        db.create_collection("overlays")
        print("Overlays collection created.")
    except CollectionInvalid:
        print("Overlays collection already exists.")

    db.overlays.create_index([("user_id", ASCENDING)])

    print("MongoDB setup completed.")

    # Example documents
    example_user = {
        "email": "user@example.com",
        "password": "hashed_password",
        "name": "John Doe"
    }

    example_overlay = {
        "user_id": "user_object_id",
        "type": "image",
        "content": "path/to/logo.png",
        "position": {"x": 10, "y": 10},
        "size": {"width": 100, "height": 50}
    }


    print("\nExample document structures:")
    print("User:", example_user)
    print("Overlay:", example_overlay)

    

def main():
    try:
        create_database_with_migrations("livesitter")
        print("Database and migrations setup successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise

if __name__ == "__main__":
    main()