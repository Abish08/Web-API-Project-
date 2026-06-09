// Business logic for user authentication and registration
import { UserRepositoryMongo } from "../repositories/user.repository";
import { RegisterUserDTO, AuthenticateUserDTO } from "../dtos/user.dto";
import { CustomHttpException } from "../exceptions/http-exception";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/constant";

// Initialize user repository for database operations
const userRepoInstance = new UserRepositoryMongo();

/**
 * UserService handles all business logic related to users
 * including registration, login, and authentication
 */
export class UserService {
  
  /**
   * Registers a new user in the system
   * - Checks for duplicate email/username
   * - Hashes password before storing
   * - Creates new user record
   */
  async registerNewUser(userData: RegisterUserDTO) {
    // Check if email is already registered
    const existingEmail = await userRepoInstance.findByEmail(userData.email);
    if (existingEmail) {
      throw new CustomHttpException(400, "Email address already registered");
    }

    // Check if username is already taken
    const existingUsername = await userRepoInstance.findByUsername(userData.username);
    if (existingUsername) {
      throw new CustomHttpException(400, "Username already taken");
    }

    // Hash password with salt rounds
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    userData.password = hashedPassword;

    // Save user to database
    const createdUser = await userRepoInstance.create(userData);
    return createdUser;
  }

  /**
   * Authenticates user and generates JWT token
   * - Validates credentials
   * - Returns user data and token
   */
  async authenticateUser(loginData: AuthenticateUserDTO) {
    // Find user by email
    const user = await userRepoInstance.findByEmail(loginData.email);
    if (!user) {
      throw new CustomHttpException(400, "Invalid email or password");
    }

    // Compare provided password with hashed password
    const isPasswordCorrect = await bcrypt.compare(
      loginData.password,
      user.password
    );
    if (!isPasswordCorrect) {
      throw new CustomHttpException(400, "Invalid email or password");
    }

    // Generate JWT token with user info
    const authToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return { user, token: authToken };
  }
}