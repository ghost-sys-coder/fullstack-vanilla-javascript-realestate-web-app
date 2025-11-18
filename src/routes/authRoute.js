import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";
import { pool } from "../db.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  ipv6Subnet: 64,
});

const authRoutes = Router();

/**
 * METHOD - POST
 * ROUTE - sign-up route
 */
authRoutes.post("/sign-up", authLimiter, async (req, res) => {
  const { fullname, email, password } = req.body;

  // server side validation
  if (!fullname || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Fullname, email and password are required!",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password should be at least 8 characters",
    });
  }

  // save the user to the database
  try {
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered!" });
    }

    // hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users(fullname, email, password)
            VALUES($1, $2, $3)
            RETURNING id, fullname, email, role
            `,
      [fullname, email, hashedPassword]
    );
    return res.status(201).json({
      success: true,
      message: "User created successfully!",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Internal Server Error", error);
    return res.status(503).json({
      success: false,
      message: "Something went wrong, try again!",
    });
  }
});

/**
 * METHOD - POST
 * ROUTE - sign-in route
 */
authRoutes.post("/sign-in", authLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required!",
      });
    }

    // check if the user exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (existingUser.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    const user = existingUser.rows[0];

    // validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate jwt token
    const token = jwt.sign(
      {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("dreamhomes_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
    });
  } catch (error) {
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        message:
          "Unable to reach the server. Please check your internet connection.",
      });
    }

    console.error("Something went wrong, please try again!", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

/**
 * METHOD - POST
 * ROUTE - sign-out
 */
authRoutes.post("/sign-out", async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("dreamhomes_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: isProd ? "none" : "lax",
    maxAge: 0,
  });
  return res.status(200).json({ success: true, message: "Logged Out" });
});

/**
 * METHOD - GET
 * ROUTE - /me
 */
authRoutes.get("/me", authLimiter, async (req, res) => {
  try {
    const token = await req.cookies?.dreamhomes_token;

    if (!token)
      return res.status(404).json({
        success: false,
        message: "Unauthorized access",
      });

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      decodedToken.id,
    ]);

    if (!result.rows.length)
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });

    return res.status(200).json({
      success: true,
      message: "User found!",
      user: {
        id: result.rows[0].id,
        fullname: result.rows[0].fullname,
        email: result.rows[0].email,
        role: result.rows[0].role,
      },
      tokenExpired: false
    });
  } catch (error) {
    console.error("Failed to find user", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      user: null,
      tokenExpired: error.name === "TokenExpiredError"
    });
  }
});

export default authRoutes;
