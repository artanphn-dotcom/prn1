import json
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Path to the JSON database file
DB_FILE = 'db.json'

def read_db():
    """Reads the entire database from the JSON file."""
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        # If the file doesn't exist or is empty/corrupt, return a default structure
        return {"apartments": [], "tenants": [], "transactions": [], "documents": []}

def write_db(data):
    """Writes the entire database to the JSON file."""
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/')
def index():
    """Serves the main HTML page."""
    return render_template('index.html')

# --- API Endpoints ---
# These endpoints will be used by the client-side JavaScript to fetch and manipulate data.

@app.route('/api/data', methods=['GET'])
def get_all_data():
    """Returns all data from the database."""
    return jsonify(read_db())

@app.route('/api/apartments', methods=['POST'])
def add_apartment():
    """Adds a new apartment."""
    data = read_db()
    new_apartment = request.json
    # A simple way to generate a new ID
    new_apartment['id'] = len(data.get('apartments', [])) + 1
    data.setdefault('apartments', []).append(new_apartment)
    write_db(data)
    return jsonify(new_apartment), 201

# Add more API endpoints here for tenants, transactions, etc. as we build the frontend.

if __name__ == '__main__':
    app.run(debug=True)
