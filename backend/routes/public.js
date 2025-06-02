// routes/public.js (or add to existing router)
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

router.get("/group-orders", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("group_orders")
      .select("id, description, created_at, status")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({ groupOrders: data });
  } catch (err) {
    console.error("Error loading group orders:", err);
    res.status(500).json({ message: "Failed to fetch group orders" });
  }
});

module.exports = router;
