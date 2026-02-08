# Python Apartment Management App

## Description
This is a simple, file-based apartment management application built with Python and Flask. It provides a web interface to manage apartments, tenants, and financial transactions. All data is stored in a local `db.json` file.

This project was converted from a React/Vite SPA to a server-side rendered Python application to remove the requirement for a Node.js build environment.

## Features (Planned)
- **Dashboard:** A comprehensive financial overview.
- **Apartment Management:** Add, edit, and view apartment units.
- **Tenant Management:** Keep track of tenant information.
- **Financial Transactions:** Log income and expenses.
- **Document Tracking:** Manage important documents.

## Tech Stack
- **Backend:**
    - [Python](https://www.python.org/)
    - [Flask](https://flask.palletsprojects.com/): A lightweight WSGI web application framework.
- **Frontend:**
    - HTML5
    - [Tailwind CSS](https://tailwindcss.com/) (via CDN)
    - Vanilla JavaScript

## Installation
To get a local copy up and running, follow these simple steps.

### Prerequisites
- Python 3.6+
- pip

### Steps

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```

2.  **Create and activate a virtual environment (recommended):**
    ```bash
    # For Unix/macOS
    python3 -m venv venv
    source venv/bin/activate

    # For Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install dependencies from `requirements.txt`:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the application:**
    ```bash
    python app.py
    ```

    The application will be available at `http://127.0.0.1:5000/`.

## How It Works
- **`app.py`:** The main Flask application file. It handles routing, serving the HTML page, and providing a simple JSON API for data manipulation.
- **`db.json`:** A simple file-based database that stores all application data.
- **`templates/index.html`:** The main HTML template for the application, rendered by Flask.
- **`static/`:** This folder contains the client-side JavaScript (`script.js`) and CSS (`style.css`). The client-side script fetches data from the Flask API and updates the DOM.