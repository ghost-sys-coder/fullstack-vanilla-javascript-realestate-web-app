import { Router } from "express";
import verifyToken, { adminOnly } from "../middleware/authMiddleware.js";

const apartmentRoutes = Router();

/**
 * METHOD POST - Create Product
 * ROUTE - /product/create
 */
apartmentRoutes.post("/add", verifyToken, adminOnly, async (req, res) => { 
    res.status(200).json({success: true, message: "Tested"})
});

/**
 * METHOD PUT - Modify / update product
 * ROUTE - /product/update/:id
 */
apartmentRoutes.put("/update/:id", async (req, res) => { });

/**
 * METHOD DELETE - Delete product
 * ROUTE - /product/delete/:id
 */
apartmentRoutes.delete("/delete/:id", async (req, res) => { });


/**
 * METHOD GET - Get single product by id
 * ROUTE - /product/:id
 */
apartmentRoutes.get("/:id", async (req, res) => { });


/**
 * METHOD GET - Get all products
 * ROUTE - /product
 */
apartmentRoutes.get("/", async (req, res) => { });

export default apartmentRoutes;

