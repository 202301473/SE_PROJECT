import mongoengine
from django.conf import settings
import os
import certifi

def ensure_mongo_connection():
    """
    Ensures that the MongoDB connection is active.
    If not, it attempts to reconnect using settings.
    Checks if the connection accidentally points to localhost and forces reconnection if so.
    """
    try:
        # Try to get the default connection
        conn = mongoengine.connection.get_connection('default')
        
        # Check if we are accidentally connected to localhost
        is_localhost = False
        try:
            # Check nodes list if available
            if hasattr(conn, 'nodes'):
                for node in conn.nodes:
                    if 'localhost' in node[0] or '127.0.0.1' in node[0]:
                        is_localhost = True
                        break
            # Fallback check on address
            if not is_localhost and hasattr(conn, 'address'):
                addr = str(conn.address)
                if 'localhost' in addr or '127.0.0.1' in addr:
                    is_localhost = True
        except Exception:
            pass

        if is_localhost:
            print("⚠️ 'default' connection is pointing to localhost! Forcing reconnection...")
            raise Exception("Connection is localhost")

        # Optional: Ping to check if it's alive
        # conn.admin.command('ping')
        print(f"✅ MongoDB connection 'default' is active.")
        
    except Exception as e:
        print(f"⚠️ MongoDB connection issue detected: {e}")
        print("🔄 Attempting to reconnect...")
        
        mongo_uri = os.getenv("MONGO_URI") or settings.MONGO_URI
        mongo_db_name = os.getenv("MONGO_DB_NAME", "legal_document_navigator_db")
        
        if not mongo_uri:
            print("❌ MONGO_URI not found in environment or settings.")
            return

        try:
            mongoengine.disconnect_all()
            mongoengine.connect(
                db=mongo_db_name,
                host=mongo_uri,
                alias='default',
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000,
                socketTimeoutMS=10000,
                uuidRepresentation='standard',
                tlsCAFile=certifi.where()
            )
            print(f"✅ Reconnected to MongoDB: {mongo_db_name}")
        except Exception as e:
            print(f"❌ Failed to reconnect to MongoDB: {e}")