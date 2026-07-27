export const API = {
  AUTH: {
    REGISTER: "/api/v1/auth/register",
    LOGIN: "/api/v1/auth/login",
    WHOAMI: "/api/v1/auth/whoami",
    UPDATE_PROFILE: "/api/v1/auth/update",
    CHANGE_PASSWORD: "/api/v1/auth/change-password",
    FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
    VERIFY_OTP: "/api/v1/auth/verify-otp",
    RESET_PASSWORD: "/api/v1/auth/reset-password",
  },
  RECOMMENDATIONS: {
    DIET: "/api/v1/recommendations/diet",
    WORKOUTS: "/api/v1/recommendations/workouts",
    WEEKLY_PLAN: "/api/v1/recommendations/weekly-plan",
  },
  ADMIN: {
    STATS: "/api/v1/admin/stats",
    USERS: {
      GET_ALL: "/api/v1/admin/users",
      GET_BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
      CREATE: "/api/v1/admin/users",
      UPDATE: (id: string) => `/api/v1/admin/users/${id}`,
      DELETE: (id: string) => `/api/v1/admin/users/${id}`,
    }
  }
}
