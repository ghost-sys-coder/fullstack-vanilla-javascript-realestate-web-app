import { Router } from "express";
import verifyToken, { adminOnly } from "../middleware/authMiddleware.js";
import { pool } from "../db.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { uploadAgentProfileProfile } from "../utils/awss3.js";


const agentsRoutes = Router();

/**
 * METHOD GET
 * ROUTE - /agents/
 */
agentsRoutes.get("/", async (req, res) => {
    try {
        const results = await pool.query(`
            SELECT * FROM agents
        `);
        return res.status(200).json({
            success: true,
            message: "Agents fetched!!",
            agents: results.rows
        })
    } catch (error) {
        console.error("Failed to fetch agents:", error.stack);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch agents"
        })
    }
})

/**
 * METHOD POST - create agent
 * ROUTE - /agents/add
 */
agentsRoutes.post("/add", verifyToken, adminOnly, upload.single("profile_image"), async (req, res) => {
    const { name, mobile, email, role, facebook, twitter, linkedin, instagram } = await req.body;

    const socials = [facebook, twitter, linkedin, instagram];

    const image = req.file;


    if (!mobile || !name || !email || !role || !image) {
        return res.status(404).json({
            success: false,
            message: "All fields are required!"
        });
    }


    // upload image to aws
    const imageUrl = await uploadAgentProfileProfile(image);

    try {
        // save the data and image to neon DB
        const result = await pool.query(`
            INSERT INTO agents (name, email, mobile, role, socials, profile_image)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [
            name, email, mobile, role, socials, imageUrl
        ]);

        return res.status(201).json({
            success: true,
            message: "Agent has been added!",
            agent: result.rows[0]
        })
    } catch (error) {
        console.error("internal Server Error", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create agent",
        })
    }
});

export default agentsRoutes;