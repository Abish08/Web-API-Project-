# NutriNepal Backend

NutriNepal is a Node.js, Express, TypeScript and MongoDB API for a personalized diet and fitness recommendation system.

## Features

- JWT authentication with bcrypt password hashing
- OTP password recovery with hashed OTPs and Nodemailer
- Health profile with BMI, BMR, TDEE, calorie and macro targets
- Food, workout, food-log and workout-log APIs
- Rule-based diet recommendations
- Rule-based workout recommendations
- Dynamic weekly meal and workout plan
- Admin user CRUD and database-derived statistics
- Image uploads through Multer

## Setup

```bash
npm install
copy .env.example .env
npm run typecheck
npm test
npm run build
npm start
```

Default API URL: `http://localhost:8089/api/v1`

## Environment

Use placeholder-free local values in `.env`. Never commit real secrets.

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` for optional development admin seeding

## Seed Data

```bash
npm run seed
```

The seed script is idempotent and includes approximate Nepal-relevant nutrition values and sample workouts.

## Main Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/verify-otp`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/recommendations/diet`
- `GET /api/v1/recommendations/workouts`
- `GET /api/v1/recommendations/weekly-plan`
- `GET /api/v1/admin/stats`

## Notes

Food nutrition values in seed data are approximate and intended for university demonstration use.
