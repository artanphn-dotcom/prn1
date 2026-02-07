# Vit Apartment Management App

## Description
The Vit Apartment Management App is a client-side-only, local-first application designed to help users manage their apartments, tenants, and financial transactions efficiently. Built with React, Vite, and TypeScript, this application provides a robust and intuitive interface for tracking rental income, expenses, tenant details, and apartment information. All data is securely stored within the browser's `localStorage`, ensuring privacy and quick access without the need for a backend server.

## Features
- **Dashboard:** A comprehensive financial overview with interactive charts (powered by Recharts) to visualize income, expenses, and profit over time.
- **Apartment Management:** Easily add, edit, and view details for all managed apartment units.
- **Tenant Management:** Keep track of tenant information, including contact details and assigned apartments.
- **Financial Transactions:** Log all income and expenses related to apartments and tenants, with filtering options by year.
- **Document Tracking:** Manage important documents associated with apartments or tenants.
- **Internationalization (i18n):** Supports multiple languages (English and Albanian) for a broader user base.
- **Theme Switching:** Toggle between light and dark modes for a personalized viewing experience.
- **Data Export:** Export all your application data to a CSV file for backup or further analysis.

## Tech Stack
- **Frontend:**
    - [React](https://react.dev/): A declarative, efficient, and flexible JavaScript library for building user interfaces.
    - [Vite](https://vitejs.dev/): A fast frontend build tool that provides a lightning-fast development experience.
    - [TypeScript](https://www.typescriptlang.org/): A superset of JavaScript that adds static types for improved code quality and maintainability.
- **Charting:**
    - [Recharts](https://recharts.org/en-US/): A Redefined Charting Library built with React and D3.
- **State Management:**
    - React Context API: For global UI state management (theme, language, selected year).
- **Styling:**
    - Custom CSS (or inferred from project structure)

## Data Persistence
This application utilizes the browser's `localStorage` for all data storage. This means:
- **Local-First:** All data resides directly in your browser.
- **No Backend Required:** The app functions entirely offline once loaded.
- **Privacy:** Your data never leaves your computer unless you explicitly export it.
- **Data Export:** The application includes a feature to export your data to a CSV file, allowing you to back up your information or transfer it.

## Installation
To get a local copy up and running, follow these simple steps.

### Prerequisites
- Node.js (v14 or higher recommended)
- npm or yarn

### Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/vit-apartment.git
    cd vit-apartment
    ```
    (Note: Replace `https://github.com/your-username/vit-apartment.git` with the actual repository URL if this project is hosted.)

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

    The application will typically be available at `http://localhost:5173/` (or another port if 5173 is in use).

4.  **Build for production (optional):**
    ```bash
    npm run build
    # or
    yarn build
    ```

    This will create a `dist` folder with the production-ready static files.

## Usage
Once the application is running, you can:
- Navigate through the dashboard, apartments, tenants, finance, and documents sections using the sidebar.
- Add new apartments, tenants, and financial transactions.
- Filter financial data by year on the dashboard.
- Toggle between light and dark themes.
- Switch between English and Albanian languages.
- Export your data using the export feature found in the layout.

## Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License
Distributed under the MIT License. See `LICENSE` for more information. (Note: A `LICENSE` file should be created if not already present).# prn1
