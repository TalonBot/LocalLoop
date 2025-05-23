const supabase = require("../config/supabase");

async function getAllProducts(req, res) {
  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
    res.json(data);
  } catch (err) {
    console.error("Unexpected error in getAllProducts:", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function getProductById(req, res) {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error(`Product with id ${id} not found or error:`, error);
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(data);
  } catch (err) {
    console.error("Unexpected error in getProductById:", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function getProductsByCategory(req, res) {
  const { category } = req.params;
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category);

    if (error) {
      console.error(`Error fetching products by category ${category}:`, error);
      return res
        .status(500)
        .json({ error: "Failed to fetch products by category" });
    }

    res.json(data);
  } catch (err) {
    console.error("Unexpected error in getProductsByCategory:", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
};
