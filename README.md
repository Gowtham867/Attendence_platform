##Employee Attendance System

A full-stack attendance tracking system with two user roles: Employee and Manager.
Employees can mark their attendance, and Managers can view and manage team attendance.

##Tech Stack

Frontend: React + Redux Toolkit or Zustand

Backend: Node.js + Express

Database: MongoDB or PostgreSQL

Features
Employee

Register and Login

Check In and Check Out

View attendance history (table and calendar)

Monthly summary (Present, Absent, Late, Half-Day)

Dashboard with daily and monthly stats

Profile management

Manager

Login

View all employee attendance

Filter by date, employee, or status

Daily team attendance overview

Late arrivals list

Absent employees list

Weekly attendance trend chart

Department-wise attendance summary

Export attendance reports as CSV

Pages
Employee Pages

Login / Register

Dashboard

Mark Attendance

Attendance History

Profile

Manager Pages

Login

Dashboard

All Employees Attendance

Team Calendar View

Reports

Database Schema
Users

id

name

email

password

role (employee or manager)

employeeId

department

createdAt

Attendance

id

userId

date

checkInTime

checkOutTime

status (present, absent, late, half-day)

totalHours

createdAt

API Endpoints
Auth

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me

Attendance (Employee)

POST /api/attendance/checkin
POST /api/attendance/checkout
GET /api/attendance/my-history
GET /api/attendance/my-summary
GET /api/attendance/today

Attendance (Manager)

GET /api/attendance/all
GET /api/attendance/employee/:id
GET /api/attendance/summary
GET /api/attendance/export
GET /api/attendance/today-status

Dashboards

GET /api/dashboard/employee
GET /api/dashboard/manager

Setup Instructions
1. Clone the repository

git clone https://github.com/Gowtham867/Attendence_platform.git

cd Attendence_platform

2. Install dependencies

Backend:

cd backend
npm install


Frontend:

cd frontend
npm install

Environment Variables

Create a .env file in the backend folder:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Run the Project

Start backend:

cd backend
npm start


Start frontend:

cd frontend
npm run dev

Deliverables

Complete GitHub repository

README with setup steps

.env.example file

Working app

Seed data for testing
