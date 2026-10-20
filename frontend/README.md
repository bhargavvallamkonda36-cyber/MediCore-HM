# MediCore Frontend

Next.js 15 + React + TypeScript frontend for the MediCore Hospital Management System.

## Backend
The frontend expects the NestJS API at:

`http://localhost:4000`

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Run

```powershell
npm install
npm run dev
```

Open:

`http://localhost:3000`

## Main routes

- `/login`
- `/register`
- `/dashboard`
- `/patients`
- `/doctors`
- `/departments`
- `/appointments`
- `/medical-records`
- `/medications`
- `/prescriptions`
- `/invoices`
- `/payments`
- `/profile`

The frontend sends the JWT access token as:

`Authorization: Bearer <token>`

## Important
Keep the NestJS backend running on port 4000 before testing the data pages.
