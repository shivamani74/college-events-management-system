🎓 College Events Management System (GRIEThub)

A full-stack web application designed to manage college-level events digitally — from event creation and registration to QR-based entry scanning, admin verification, and super admin monitoring.

This project is built to simulate a real-world college event management platform with proper role-based access control, payments, and analytics.

###🚀 Features
-----👤 User (Student)

User authentication (login & signup)

View all upcoming events

Register for events

Secure online payment (Razorpay)

Receive QR ticket after successful payment

View My Registrations

-----🧑‍💼 Admin

Admin registration with document upload

Admin verification by Super Admin

Create, edit, and manage events

View event registrations

Download registrations as CSV

QR Code Scanner for event entry

Live check-in count per event

Mobile-friendly scanning UI with visual feedback

-----🛡️ Super Admin

Login like a normal user

Verify / reject admin requests

View uploaded admin documents

Monitor all events across clubs

View total registrations per event

Download registrations CSV

Revoke admin access

Monitor admin activities

-----🔐 Security & Access Control

JWT-based authentication

Role-based authorization:

student

admin

superadmin

Protected API routes

Admin verification workflow

One-time QR ticket validation

------🧾 QR Code System

QR generated after successful payment

Each QR is unique per registration

Admin-only scanning

-----Prevents:

Duplicate entry

Invalid tickets

Cross-event scanning

Entry status updated in real time

📊 Analytics & Reports

Event-wise registrations

Checked-in vs not checked-in count

Revenue calculation per event

CSV export for reports

----🛠️ Tech Stack
Frontend

React (CRA)

React Router

Axios

Tailwind CSS

html5-qrcode

React Toastify

Backend

Node.js

Express.js

MongoDB (Mongoose)

JWT Authentication

Razorpay Payments

Nodemailer (Email notifications)

-----📁 Project Structure
college-events-management/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── scripts/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md

-----⚙️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/<your-username>/college-events-management.git
cd college-events-management

-----2️⃣ Backend Setup
cd backend
npm install


-----Create .env file:

PORT=5002
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
QR_SECRET_KEY=your_qr_secret
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password


----Run backend:

npm run dev

----3️⃣ Frontend Setup
cd ../frontend
npm install
npm start

-----🧪 Testing

Register as student → pay → receive QR

Login as admin → scan QR → allow entry

Login as superadmin → approve admins

Test on mobile using ngrok

----🎯 Academic Relevance

This project demonstrates:

Full-stack development

REST API design

Database modeling

Authentication & authorization

Payment gateway integration

Real-time QR validation

Admin & super admin workflows

College-level system design

-----👨‍💻 Developed By

ShivaMani
B.Tech Student
Full-Stack Developer

-----📌 Future Enhancements

Attendance reports

Event posters upload

Push notifications

Dashboard charts

Multi-college support
