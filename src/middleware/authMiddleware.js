import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
    try {
        const token = req.cookies?.dreamhomes_token || req.headers["authorization"]?.split(" ")[1];
        if (!token) return res.status(401).json({
            success: false,
            message: "Not Authorized"
        });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        })
    }
}

// Admin-only middleware 
export const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admins only"
        })
    }

    next();
} 