import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";

import { authMiddleware } from "../../middlewares/auth.middleware"; // <-- Change if yours is named differently (e.g., authorized.middleware)
import { adminMiddleware } from "../../middlewares/admin.middleware";
import { upload } from "../../middlewares/upload.middleware"; // <-- Change if your upload middleware is named differently

const router = Router();
const adminUserController = new AdminUserController();

// Apply authentication and admin role check to ALL routes in this file
router.use(authMiddleware, adminMiddleware);

// 1. GET /api/v1/admin/users -> Get all users (paginated + search)
router.get("/", adminUserController.getAllUserPaginated);

// 2. GET /api/v1/admin/users/:id -> Get single user by ID
router.get("/:id", adminUserController.getUserById);

// 3. POST /api/v1/admin/users -> Create a new user
router.post("/", adminUserController.createUser);

// 4. PUT /api/v1/admin/users/:id -> Update an existing user (supports image upload)
router.put("/:id", upload.single("profileImage"), adminUserController.updateUser);

// 5. DELETE /api/v1/admin/users/:id -> Delete a user
router.delete("/:id", adminUserController.deleteUser);

export default router;