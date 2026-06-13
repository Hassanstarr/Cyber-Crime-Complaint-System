# Cyber Crime Complaint Management System

A comprehensive, full-stack web application designed for citizens to securely report and track cybercrimes, and for administrators to manage and triage those reports efficiently. 

The project separates the client UI and the server-side logic into two distinct layers for better maintainability and scalability.

## Folder Structure

The repository is structured into two main directories:

- `/backend` → handles server-side logic, RESTful APIs, database connections, and authentication.
- `/frontend` → handles the user interface, client-side functionality, routing, and global state management.

## Tech Stack

This project is built using the **MERN** stack architecture (using SQL instead of NoSQL):

**Frontend:**
- React.js (Vite)
- React Router DOM v6
- Context API (State Management)
- Tailwind CSS
- Framer Motion (Animations)
- Axios

**Backend:**
- Node.js
- Express.js
- Microsoft SQL Server (Relational Database via Sequelize/Knex)
- JSON Web Tokens (JWT) for Authentication
- bcryptjs for password hashing

## Features

- **Secure Authentication:** Role-based access control (RBAC) with secure JWT handling for Citizens and Admins.
- **Citizen Portal:**
  - File detailed cybercrime complaints securely.
  - Track the real-time status of submitted complaints.
  - View a history of previously filed reports.
- **Admin Dashboard:**
  - View overarching system statistics and complaint ratios.
  - Triage, review, and update the status of active complaints.
  - Search and filter complaints through the database seamlessly.
- **Responsive Design:** Beautiful, dynamic, and mobile-friendly UI crafted with Tailwind CSS and Framer Motion.
- **Dark Mode Support:** Full system-preference aware light and dark mode toggling.

## Installation Instructions

Follow these steps to get the project running on your local machine.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A running SQL Database instance

### 1. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm install
```

Configure your environment variables (see the Environment Variables section below), then start the server:

```bash
# For development (with nodemon)
npm run dev

# For production
npm start
```

### 2. Frontend Setup

Open a separate terminal window and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

## Environment Variables

To run this project, you will need to add a `.env` file to the root of your `/backend` and `/frontend` directories.

**Backend (`/backend/.env`):**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=cyber_crime_db
JWT_SECRET=your_super_secret_jwt_key
```

**Frontend (`/frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000
```

## Screenshots

### 🖥️ Frontend UI (Application Screenshots)
Here are the user interface screens for the Cyber Crime Complaint Management System:

| Home - Light Mode | Home - Dark Mode |
| :---: | :---: |
| ![Home Light](./website_UI/home_light.png) | ![Home Dark](./website_UI/home_dark.png) |

| User Registration | User Login |
| :---: | :---: |
| ![Register User](./website_UI/register_user.png) | ![Login User](./website_UI/login_user.png) |

| User Dashboard | Admin Dashboard |
| :---: | :---: |
| ![User Dashboard](./website_UI/dashboard_user.png) | ![Admin Dashboard](./website_UI/dashboard_admin.png) |

| View Complaints | Search Complaints |
| :---: | :---: |
| ![User Complaints](./website_UI/user_complaint.png) | ![Search All Complaints](./website_UI/search_all_complaint.png) |

| All Complaints (Admin view) |
| :---: |
| ![All Complaints](./website_UI/all_complaint.png) |

---

### 🚀 Backend API Testing (Postman Results)
The backend REST APIs were thoroughly tested using Postman. Below are the successful API endpoint results:

* **Authentication & Authorization**
  * ![User Registration Test](./postman_result/registerUser.png)
  * ![User Login Test](./postman_result/login_user.png)
  * ![Admin Login Test](./postman_result/login_admin.png)

* **Complaint Management & Lifecycle**
  * ![File a Complaint](./postman_result/complaintPost.png)
  * ![View My Complaints](./postman_result/complaintMy.png)
  * ![Fetch Single Complaint (Admin)](./postman_result/SingleCompaint-admin.png)
  * ![Update Complaint Status (Admin)](./postman_result/updateStatus-admin.png)
## Usage

1. Start the **backend** server (`npm run dev` in the `/backend` folder). It will typically run on `http://localhost:5000`.
2. Start the **frontend** development server (`npm run dev` in the `/frontend` folder). It will typically run on `http://localhost:5173`.
3. Open your browser and navigate to the frontend URL.
4. Register a new citizen account or log in with admin credentials to explore the system.

## Future Improvements

- Implementing Two-Factor Authentication (2FA) for admin accounts.
- Adding real-time email or SMS notifications for complaint status updates.
- Exporting reports and statistics to PDF/CSV formats.
- Integrating an AI chatbot to assist citizens in categorizing their complaints.

## Contributing

Contributions are always welcome! 

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
