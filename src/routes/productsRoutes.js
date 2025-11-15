import { Router } from "express";

const productRoutes = Router();

/**
 * METHOD POST - Create Product
 * ROUTE - /product/create
 */
productRoutes.post("/add", async (req, res) => { });

/**
 * METHOD PUT - Modify / update product
 * ROUTE - /product/update/:id
 */
productRoutes.put("/update/:id", async (req, res) => { });

/**
 * METHOD DELETE - Delete product
 * ROUTE - /product/delete/:id
 */
productRoutes.delete("/delete/:id", async (req, res) => { });


/**
 * METHOD GET - Get single product by id
 * ROUTE - /product/:id
 */
productRoutes.get("/:id", async (req, res) => { });


/**
 * METHOD GET - Get all products
 * ROUTE - /product
 */
productRoutes.get("/", async (req, res) => { });

export default productRoutes;

