const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// All group orders
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

// Specific group order's products
router.get("/group-orders/:id/products", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("group_order_products")
      .select("product_id, unit_price, max_quantity")
      .eq("group_order_id", id);

    if (error) throw error;

    res.status(200).json({ products: data });
  } catch (err) {
    console.error("Error loading group order products:", err);
    res.status(500).json({ message: "Failed to fetch products for this group order" });
  }
});

module.exports = router;
