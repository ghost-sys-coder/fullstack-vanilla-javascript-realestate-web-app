import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const authRoutes = Router();


/**
 * METHOD - POST
 * ROUTE - sign-up route
 */
authRoutes.post("/sign-up", async (req, res) => {
    const { fullname, email, password } = req.body;

    // incrypt password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // save the user to the database
    try {
        
    } catch (error) {
        console.error("Internal Server Error", error);
        return res.status(503).json({
            success: false,
            message: "Something went wrong, try again!"
        });
    }
});

/**
 * METHOD - POST
 * ROUTE - sign-in route
 */
authRoutes.post("/sign-in", async (req, res) => {
    
});


export default authRoutes;