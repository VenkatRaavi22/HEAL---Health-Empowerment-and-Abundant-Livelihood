# 🌸 HEAL – Women's Hormonal Health Monitoring Platform

HEAL is a full-stack web application designed to help women monitor their menstrual health, track symptoms, identify potential health risks, and receive personalized wellness recommendations.

The platform combines cycle tracking, symptom logging, lifestyle monitoring, and personalized recommendations into a single dashboard, helping users better understand their hormonal health and make informed decisions about seeking professional medical care.

> **Disclaimer:** HEAL is intended for educational and wellness support purposes only. It is **not** a replacement for professional medical advice, diagnosis, or treatment.

---

# Features

## 🩸 Intelligent Menstrual Cycle Tracking

- Log menstrual cycle history
- Predict upcoming periods
- Estimate fertile window
- Estimate ovulation date
- Detect irregular cycle patterns
- Notify users when consultation with a healthcare professional may be appropriate

---

## 📋 Symptom Logging

Users can record symptoms such as:

- Fatigue
- Mood swings
- Headaches
- Bloating
- Cramps
- Acne
- Stress levels
- Sleep quality

The application stores symptom history to help users identify recurring health patterns.

---

## ⚠️ Risk Assessment

HEAL analyzes:

- Cycle history
- Logged symptoms
- Stress
- Sleep
- Lifestyle factors

Based on predefined health rules, the platform categorizes users into:

- Low Risk
- Moderate Risk
- High Risk

The generated score acts as an early wellness indicator and encourages timely medical consultation when necessary.

---

## 🥗 Personalized Recommendations

Depending on the user's health profile and identified condition, HEAL provides personalized:

- Diet suggestions
- Exercise recommendations
- Yoga plans
- Lifestyle guidance

Recommendations are generated from predefined health guidelines and are intended to promote healthier daily habits.

---

## 💊 Medication Management

Users can:

- Add medications
- Track dosage schedules
- Receive medication reminders
- Monitor remaining tablet counts

---

## 👩‍⚕️ Specialist Recommendation

When the application detects an elevated health risk or when a user selects a known condition, HEAL recommends the appropriate specialist.

Examples include:

- Gynecologist
- Endocrinologist
- Nutritionist

The platform also integrates Google Maps to help users locate nearby clinics.

---

## 📊 Interactive Dashboard

The dashboard provides a quick overview of:

- Logging streak
- Risk level
- Medication reminders
- Cycle information
- Health statistics

---

## 🔐 Secure Authentication

Authentication includes:

- JWT Authentication
- Password hashing using bcrypt
- Protected routes
- Secure REST APIs
- Parameterized SQL queries to mitigate SQL Injection

---

# Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router

---

## Backend

- Node.js
- Express.js

---

## Database

- MySQL

---

## Authentication

- JWT
- bcrypt

---

## Maps

- Google Maps

---

# Project Architecture

```
React Frontend
       │
       ▼
Express REST API
       │
       ▼
Business Logic
       │
       ▼
MySQL Database
```

---

# Database Modules

- Users
- Cycle History
- Symptoms
- Medications
- Health Logs
- Recommendation Data

---

# Security

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- SQL Injection protection using parameterized queries
- Environment variable management using .env

---

# Screenshots

*(Add screenshots of your Login, Dashboard, Cycle Tracking, Chat Assistant (if retained), and Recommendation pages here.)*

---

# Installation

## Clone

```bash
git clone https://github.com/yourusername/heal.git
```

---

## Install Frontend

```bash
npm install
```

---

## Install Backend

```bash
cd backend
npm install
```

---

## Configure Environment Variables

Frontend:

```env
VITE_API_URL=http://localhost:5000
```

Backend:

```env
PORT=5000

DB_HOST=

DB_USER=

DB_PASSWORD=

DB_NAME=

JWT_SECRET=
```

---

## Start Backend

```bash
npm run dev
```

---

## Start Frontend

```bash
npm run dev
```

---

# Future Improvements

Potential future enhancements include:

- AI-powered conversational health assistant using Large Language Models (LLMs)
- Retrieval-Augmented Generation (RAG) for medically referenced responses
- Wearable device integration
- Appointment booking
- Push notifications
- Cloud deployment
- Multi-language support
- Electronic Health Record (EHR) integration

---

# Project Highlights

- Full-stack architecture
- Responsive UI
- RESTful API design
- Secure authentication
- Personalized health tracking
- Specialist recommendation workflow
- Modern React + Node.js implementation

---

# Testing

The application has been tested through:

- Manual functional testing
- API validation using Postman
- Database validation
- Authentication testing
- SQL Injection testing
- JWT validation
- UI responsiveness testing

---

# Limitations

- Risk assessment currently uses predefined business rules rather than trained machine learning models.
- Recommendations are intended for educational purposes and should not replace professional medical advice.
- Background medication reminders require a continuously running backend service.

---

# License

This project was developed as an academic project for learning full-stack software development and healthcare application design.
