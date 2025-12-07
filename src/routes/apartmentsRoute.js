import { Router } from "express";
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
  "/",
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
 * ROUTE - /apartment/:id
 */
apartmentRoutes.put("/:id", async (req, res) => {});

/**
 * METHOD DELETE - Delete apartment
 * ROUTE - /apartment/:id
 */
apartmentRoutes.delete("/:id", async (req, res) => {});

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
 * METHOD GET - Get apartments based whether role is true or false
 * role = true => apartment is for sale
 * role = false => apartment is for rent
 * ROUTES /apartments?role=true OR /apartments
 */
apartmentRoutes.get("/", async (req, res) => {
  try {
    const { role } = req.query;
    console.log({ role });

    let query = `SELECT * FROM apartments`;
    let params = [];

    if (role !== undefined) {
      const isForSale = role === "true";
      query += ` WHERE details->>'role' = $1`;
      params.push(isForSale.toString())
    }

    const results = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      message: `${results.rowCount} apartment(s) fetched`,
      apartments: results.rows
    });

  } catch (error) {
    console.log("something went wrong!", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong! Try again"
    });
  }
});


/**
 * METHOD GET - Get apartment locations
 * ROUTE - /apartments/location
 */
apartmentRoutes.get("/locations/list", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        location AS name,
        MIN(images[1]) AS image,
        COUNT(*)::int AS location_count
      FROM apartments
      GROUP BY name
      ORDER BY location_count DESC
      LIMIT 4
    `);
    return res.status(200).json({
      success: true,
      message: "Apartments fetched",
      locations: result.rows
    });
  } catch (error) {
    console.error("Failed to fetch locations", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch locations"
    })
  }
})


export default apartmentRoutes;
