# NutriNepal Postman Collection

Import `NutriNepal.postman_collection.json` and `NutriNepal.postman_environment.json` into Postman, then select the `NutriNepal Local` environment.

The collection assumes the backend is running at `{{baseUrl}}`, defaulting to `http://localhost:8089`. Run the seed script before testing catalog and recommendation flows:

```bash
npm run seed
```

Suggested smoke-test order:

1. `Auth / Register`
2. `Auth / Login` to populate `{{token}}`
3. `Health Profile / Create or Update`
4. `Recommendations / Diet`, `Workouts`, and `Weekly Plan`
5. `Logs / Create Food Log` and `Create Workout Log`
6. `Admin / Login Admin` to populate `{{adminToken}}`
7. `Admin / Stats`, `Foods / Create Food`, and `Workouts / Create Workout`

Password reset endpoints are included, but the OTP is delivered by the configured mail transport. For local stream transport, copy the generated OTP from the backend console into `{{otp}}` before running verify/reset requests.
