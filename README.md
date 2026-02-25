# WeCureIT - Medical Clinic Reservation System

## Overview
**WeCureIT** is a **medical clinic reservation system** that allows **patients to book appointments**, **doctors to manage schedules**, and **administrators to oversee operations**. Unlike other systems, **WeCureIT dynamically allocates doctors** to facilities based on demand, ensuring that patients can schedule appointments without disrupting their own schedules.

Developed as part of the **Fall 2024 CSCi 6235 course at The George Washington University**, WeCureIT is a **scalable**, **user-friendly**, and **patient-centric** system designed to streamline appointment booking and healthcare management.

---

## Features
### Patient Features:
✅ Create an account and log in  
✅ Update personal profile and payment details  
✅ Book an appointment by selecting a **specialty, facility, doctor, date, and time**  
✅ Cancel an appointment (with or without a cancellation fee depending on the timeframe)  
✅ View past and upcoming appointments  

### Doctor Features:
✅ Log in and manage assigned facilities  
✅ View and update availability schedule  
✅ Mark an appointment as completed and add notes  
✅ Cancel patient appointments (with notifications)  

### Admin Features:
✅ Manage doctors (add, edit, remove profiles)  
✅ Manage facilities (add, edit, remove locations and specializations)  
✅ View system statistics and oversee operations  

---

## System Architecture
WeCureIT follows a **three-tier architecture**:
- **Frontend:** React (Vite + TailwindCSS)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB

**Port Configuration**:
- **Frontend:** `localhost:3000`
- **Backend API:** `localhost:8080`
- **Database (MongoDB):** `localhost:27017`


---

## Technologies Used
- **Frontend**: React.js, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, Mongoose
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token)
- **Deployment**: Docker, AWS EC2 (optional)
- **Version Control**: Git, GitHub