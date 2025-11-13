import express from "express";
import cors from "cors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const PORT = process.env.PORT || 5000;


const app = express();

// Get the file path from the URL of the current module
const __filename = fileURLToPath(import.meta.url);

// Get the directory name from the file path
const __dirname = dirname(__filename);

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../public")));


app.get("/", (req, res)=> {
    res.sendFile(path.join(__dirname, "public", "index.html"));
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

app.listen(PORT, ()=> {
    console.log(`Server is running on PORT: ${PORT}`);
})