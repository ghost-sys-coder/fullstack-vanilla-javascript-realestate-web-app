import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoute.js";
import apartmentRoutes from "./routes/apartmentsRoute.js";
import verifyToken, { adminOnly } from "./middleware/authMiddleware.js";

const PORT = process.env.PORT || 8000;


const app = express();

// Get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url);

// Get the directory name from the file path
const __dirname = dirname(__filename);

// this custom middleware to log requests is causing my web app to fail - it keeps loading forever
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.originalUrl} - IP:${req.ip}`);
    next();
})

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: true
}));
app.use(express.static(path.join(__dirname, "../public")));


app.get("/", (req, res)=> {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
});

app.get("/contact", (req, res)=> {
    res.sendFile(path.join(__dirname, "../public", "contact.html"));
});

app.get("/about", (req, res)=> {
    res.sendFile(path.join(__dirname, "../public", "about.html"));
});

app.get("/property", (req, res)=> {
    res.sendFile(path.join(__dirname, "../public", "property.html"));
})

//  rendering auth pages to the client
app.get("/auth/sign-in", (req, res)=> {
    res.sendFile(path.join(__dirname, "../public/auth", "sign-in.html"));
});


app.get("/auth/sign-up", (req, res)=> {
    res.sendFile(path.join(__dirname, "../public/auth", "sign-up.html"));
})

// rendering admin pages
app.get("/admin/create-apartment", verifyToken, adminOnly, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/admin", "create-apartment.html"));
});

// rendering apartment pages on the frontend
app.get("/apartments/view", (req, res) => {
    res.sendFile(path.join(process.cwd(), "/public/apartments", "view.html"));
})

/**
 * ! ROUTES
 */
app.use("/api/auth", authRoutes);
app.use("/api/apartments", apartmentRoutes);

app.listen(PORT, ()=> {
    console.log(`Server is running on PORT: ${PORT}`);
})