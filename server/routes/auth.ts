import { RequestHandler } from "express";
import {
  LoginResponse,
  User,
  LoginRequest,
  RegisterRequest,
} from "@shared/types";

// Mock user database
const mockUsers: User[] = [
  {
    id: "user-1",
    email: "user@example.com",
    name: "John Doe",
    role: "user",
    phone: "+91-9876543210",
    isVerified: true,
    createdAt: new Date("2024-01-15"),
    lastLogin: new Date(),
  },
];

// User registration endpoint
export const userRegister: RequestHandler = (req, res) => {
  const { email, password, name, phone }: RegisterRequest = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      error: "Email, password, and name are required",
    });
  }

  // Check if user already exists
  const existingUser = mockUsers.find((user) => user.email === email);
  if (existingUser) {
    return res.status(409).json({
      error: "User already exists",
      message: "An account with this email already exists",
    });
  }

  // Create new user
  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    name,
    role: "user",
    phone,
    isVerified: false, // In real app, would send verification email
    createdAt: new Date(),
  };

  mockUsers.push(newUser);

  // Generate tokens
  const token = `user-jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const refreshToken = `refresh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const response: LoginResponse = {
    user: newUser,
    token,
    refreshToken,
  };

  res.status(201).json(response);
};

// User login endpoint
export const userLogin: RequestHandler = (req, res) => {
  const { email, password }: LoginRequest = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  // Find user
  const user = mockUsers.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({
      error: "Invalid credentials",
      message: "No account found with this email",
    });
  }

  // In real app, verify password hash
  // For demo, accept any password for existing users
  const token = `user-jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const refreshToken = `refresh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Update last login
  user.lastLogin = new Date();

  const response: LoginResponse = {
    user,
    token,
    refreshToken,
  };

  res.json(response);
};

// Verify user token
export const verifyUserToken: RequestHandler = (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Access token required",
    });
  }

  // Mock token validation
  if (token.startsWith("user-jwt-")) {
    // In real app, decode JWT and get user ID
    const mockUser = mockUsers[0]; // For demo
    res.json({
      valid: true,
      user: mockUser,
    });
  } else {
    res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};

// User logout
export const userLogout: RequestHandler = (req, res) => {
  res.json({
    message: "Logged out successfully",
  });
};

// Get user profile
export const getUserProfile: RequestHandler = (req, res) => {
  // In real app, get user from verified token
  const user = mockUsers[0]; // For demo
  res.json(user);
};

// Update user profile
export const updateUserProfile: RequestHandler = (req, res) => {
  const { name, phone } = req.body;

  // In real app, get user from verified token
  const user = mockUsers[0]; // For demo

  if (name) user.name = name;
  if (phone) user.phone = phone;

  res.json(user);
};

// Middleware for protecting user routes
export const requireUser: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  if (token.startsWith("user-jwt-")) {
    (req as any).user = mockUsers[0]; // For demo
    next();
  } else {
    res.status(403).json({
      error: "Invalid authentication",
    });
  }
};

// Send password reset email (mock)
export const forgotPassword: RequestHandler = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: "Email is required",
    });
  }

  const user = mockUsers.find((u) => u.email === email);
  if (!user) {
    // Don't reveal if email exists for security
    res.json({
      message:
        "If an account with this email exists, you will receive password reset instructions",
    });
    return;
  }

  // In real app, send email with reset token
  res.json({
    message: "Password reset instructions sent to your email",
  });
};
