# NutriNepal Frontend

Next.js frontend for NutriNepal, a personalized diet and fitness recommendation system.

## Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Default frontend URL: `http://localhost:3000`

## Environment

- `NEXT_PUBLIC_API_URL=http://localhost:8089`

## Implemented Pages

- Login and registration
- Forgot password, OTP verification and reset password
- Dashboard
- Diet recommendations
- Workout recommendations
- Weekly plan
- Food logs
- Progress
- Profile and health profile
- Admin dashboard, users, foods and workouts

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

The build uses system fonts and does not download Google Fonts during compilation.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
