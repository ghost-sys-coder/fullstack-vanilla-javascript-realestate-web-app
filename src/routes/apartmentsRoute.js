import { Router } from "express";
import path from "path";
import verifyToken, { adminOnly } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { uploadToS3 } from "../utils/awss3.js";
import { pool } from "../db.js";

const apartmentRoutes = Router();

/**
 * METHOD POST - Create Apartment
 * ROUTE - /apartment/create
 */
apartmentRoutes.post(
  "/add",
  verifyToken,
  adminOnly,
  upload.array("images", 10),
  async (req, res) => {
    const payload = JSON.parse(req.body?.data);
    const images = req.files;

    // upload images to AWS S3
    const uploadedImages = [];

    for (const image of images) {
      const url = await uploadToS3(image);
      uploadedImages.push(url);
    }

    // save the payload and images to Neon DB
    const result = await pool.query(
      `INSERT INTO apartments (user_id, title, price, location, description, details, amenities, images)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
      [
        req.user.id,
        payload.basicInfo.title,
        payload.basicInfo.price,
        payload.basicInfo.location,
        payload.basicInfo.description,
        payload.propertyDetails,
        payload.amenities,
        uploadedImages,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Apartment successfully created!",
      apartment: result.rows[0],
    });
  }
);

/**
 * METHOD PUT - Modify / update product
 * ROUTE - /apartment/update/:id
 */
apartmentRoutes.put("/update/:id", async (req, res) => {});

/**
 * METHOD DELETE - Delete apartment
 * ROUTE - /apartment/delete/:id
 */
apartmentRoutes.delete("/delete/:id", async (req, res) => {});

/**
 * METHOD GET - Get single apartment by id
 * ROUTE - /apartment/:id
 */
apartmentRoutes.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // fetch the apartment
    const result = await pool.query(
      `SELECT 
        a.*,
        u.id AS user_id,
        u.fullname AS username,
        u.email AS email,
        u.phone_number AS contact
       FROM apartments a
       LEFT JOIN users u
       ON a.user_id = u.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Apartment with id ${id} not found!`
      });
    }

    return res.status(200).json({
      success: true,
      apartment: result.rows[0]
    })
  } catch (error) {
    console.log("Something went wrong!", error.stack);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
});

/**
 * METHOD GET - Get all apartments
 * ROUTE - /apartment
 */
apartmentRoutes.get("/", async (req, res) => {});

export default apartmentRoutes;
