import { pool } from "../db.js";

// check overlapping in bookings
export const hasOverlap = async(apartmentId, checkIn, checkOut, excludeId=null) => {
    const query = `
    SELECT 1 FROM bookings
    WHERE apartment_id = $1
        AND status IN ('confirmed', 'pending')
        AND (
            (check_in <= $2 AND check_out >= $2) OR
            (check_in <= $3 AND check_out >= $3) OR
            (check_in >= $2 AND check_out <= $3)
        )
        ${excludeId ? 'AND id != $4' : ''}
    `;
    const params = excludeId ? [apartmentId, checkIn, checkOut, excludeId] : [apartmentId, checkIn, checkOut];
    const result = await pool.query(query, params);
    return result.rows.length > 0;
}