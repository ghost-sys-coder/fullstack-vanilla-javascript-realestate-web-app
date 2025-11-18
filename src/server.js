import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoute.js";
import apartmentRoutes from "./routes/apartmentsRoute.js";

const PORT = process.env.PORT || 8000;


const app = express();

// Get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url);

// Get the directory name from the file path
const __dirname = dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: process.env.NODE_ENV === "production" ? "" : "http://localhost:5000"
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


/**
 * ! ROUTES
 */
app.use("/api/auth", authRoutes);
app.use("/api/apartments", apartmentRoutes);

app.listen(PORT, ()=> {
    console.log(`Server is running on PORT: ${PORT}`);
})