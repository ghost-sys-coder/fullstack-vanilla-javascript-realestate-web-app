import { Router } from "express";
import verifyToken, { adminOnly } from "../middleware/authMiddleware.js";
import { pool } from "../db.js";
import { hasOverlap } from "../utils/booking.js";

const bookingRoutes = Router();

/**
 * @route GET /api/bookings/create
 * @description create a booking
 * @access Private
 */

bookingRoutes.post("/create", verifyToken, async (req, res) => {
    const { apartmentId, checkIn, checkOut, guestsAdult = 1, guestsChildren = 0 } = req.body;
    
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized Access!"
        });
    }

    if (!apartmentId || !checkIn || !checkOut) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields!"
        })
    }

    try {
        // Fetch rental (must be rental)
        const aptRes = await pool.query(`
            SELECT price, details->>'rentalPrice' as rental_price
            FROM apartments
            WHERE id = $1 AND details->>'role'='false'
        `,[apartmentId]);

        if (aptRes.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Apartment not found!!"
            })
        }

        const apartment = aptRes.rows[0];
        const nightlyPrice = Number(apartment.rental_price || apartment.price);

        const ms = new Date(checkOut) - new Date(checkIn);
        const days = Math.ceil(ms / (1000 * 60 * 60 * 24));


        if (days <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid date range"
            })
        }

        const totalAmount = nightlyPrice * days;

        // check availability
        const overlap = await hasOverlap(apartmentId, checkIn, checkOut);

        if (overlap) {
            return res.status(409).json({
                success: false,
                message: "Apartment is not available for the selected dates"
            })
        }

        const result = await pool.query(`
            INSERT INTO bookings (
            user_id, apartment_id, check_in, check_out, guests_adults, guests_children, nightly_rate, total_amount
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            userId, apartmentId, checkIn, checkOut,
            guestsAdult, guestsChildren, nightlyPrice, totalAmount
        ]);

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking: result.rows[0]
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error! Failed to create booking"
        });
    }
})



/**
 * @route GET /apartment/:id
 * @description get bookings for apartment
 * @access admin only
 */
bookingRoutes.get("/apartment/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT * FROM bookings
            WHERE apartment_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No bookings found for this apartment"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Bookings fetched",
            bookings: result.rows
        })
    } catch (error) {
        console.error("Failed to fetch bookings", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch bookings"
        })
    }
})


/**
 * @route GET /user
 * @description get bookings for user
 * @access user only
 */
bookingRoutes.get("/user", verifyToken, async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    try {
        const result = await pool.query(`
            SELECT b.*, a.title, a.location, a.images 
            FROM bookings AS b
            JOIN apartments AS a ON b.apartment_id = a.id
            WHERE b.user_id = $1
        `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No bookings found!"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            bookings: result.rows
        })
    } catch (error) {
        console.error("Failed to fetch user bookings");
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user bookings!"
        })
    }
})

/**
 * @route PUT /:id/cancel
 * @description cancel booking
 * @access user or admin
 */
bookingRoutes.put("/:id/cancel", verifyToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            user: userId
        })
    }

    try {
        const result = await pool.query(`
            UPDATE bookings
            SET status = 'cancelled', updated_at = NOW()
            WHERE id = $1 AND user_id = $2 AND status = 'pending'
            RETURNING *
        `, [id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found or already cancelled!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            booking: result.rows[0]
        });
    } catch (error) {
        console.error("Failed to cancel booking");
        return res.status(500).json({
            success: false,
            message: "Failed to cancel booking!"
        })
    }
})

/**
 * @route GET /admin
 * @description get all bookings
 * @access admin
 */
bookingRoutes.get("/admin", verifyToken, adminOnly, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, u.fullname AS username, a.title AS apartment_title, a.location, a.price
            FROM bookings AS b
            JOIN users AS u ON b.user_id = u.id
            JOIN apartments AS a ON b.apartment_id = a.id
            ORDER BY b.created_at DESC
        `);
        return res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            bookings: result.rows
        })
    } catch (error) {
        console.error("Failed to fetch bookings for the admin", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch bookings for the admin!"
        })
    }
})



export default bookingRoutes;