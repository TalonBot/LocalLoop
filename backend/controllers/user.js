// controllers/productsController.js
const supabase = require("../config/supabase");
const { fetchRecommendations } = require("../helpers/fetchRecommendations"); // Assuming you have a utility function for recommendations

const getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const price_from = parseFloat(req.query.price_from) || 0;
  const price_to = parseFloat(req.query.price_to) || Number.MAX_SAFE_INTEGER;

  let query = supabase
    .from("products")
    .select("*, product_images(*)", { count: "exact" })
    .range(from, to);

  // Apply price filter
  query = query.gte("price", price_from).lte("price", price_to);

  const { data: products, error, count } = await query;

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    total: count,
    page,
    limit,
    products,
  });
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  const { data: product, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("id", id)
    .single();

  if (error) return res.status(404).json({ error: "Product not found" });

  res.json(product);
};

const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const price_from = parseFloat(req.query.price_from) || 0;
  const price_to = parseFloat(req.query.price_to) || Number.MAX_SAFE_INTEGER;

  let query = supabase
    .from("products")
    .select("*, product_images(*)", { count: "exact" })
    .eq("category", category)
    .range(from, to);

  // Apply price filter
  query = query.gte("price", price_from).lte("price", price_to);

  const { data: products, error, count } = await query;

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    total: count,
    page,
    limit,
    products,
  });
};

const getAllProducers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  // Fetch producers
  const {
    data: producers,
    error,
    count,
  } = await supabase
    .from("users")
    .select("id, full_name, profile_image_url", { count: "exact" })
    .eq("role", "provider")
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });

  // Fetch certifications for all producers in this page
  const producerIds = producers.map((p) => p.id);
  const { data: stories, error: storiesError } = await supabase
    .from("producer_stories")
    .select("user_id, certifications")
    .in("user_id", producerIds);

  if (storiesError)
    return res.status(500).json({ error: storiesError.message });

  // Map certifications to each producer
  const certMap = {};
  stories.forEach((story) => {
    certMap[story.user_id] = story.certifications || [];
  });

  const producersWithCerts = producers.map((producer) => ({
    ...producer,
    certifications: certMap[producer.id] || [],
  }));

  res.json({
    total: count,
    page: Number(page),
    limit: Number(limit),
    producers: producersWithCerts,
  });
};

const getProducerById = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, full_name, profile_image_url")
    .eq("id", id)
    .single();

  if (userError || !user)
    return res.status(404).json({ error: "Producer not found" });

  const {
    data: products,
    error: productsError,
    count: productsCount,
  } = await supabase
    .from("products")
    .select("*, product_images(*)", { count: "exact" })
    .eq("producer_id", id)
    .range(offset, offset + limit - 1);

  if (productsError)
    return res.status(500).json({ error: productsError.message });

  const { data: storyData, error: storyError } = await supabase
    .from("producer_stories")
    .select("story, certifications")
    .eq("user_id", id)
    .single();

  // If there's an error, but it's just "no story found", continue gracefully
  const story = storyError && storyError.code === "PGRST116" ? null : storyData;
  if (storyError && storyError.code !== "PGRST116") {
    return res.status(500).json({ error: storyError.message });
  }

  res.json({
    producer: user,
    story: story || "No user story",
    certifications: storyData?.certifications || [],
    products: {
      total: productsCount,
      page: Number(page),
      limit: Number(limit),
      items: products,
    },
  });
};

// Example: backend/controllers/user.js
const getCategoriesWithCounts = async (req, res) => {
  const { data, error } = await supabase.from("products").select("category");

  if (error) return res.status(500).json({ error: error.message });

  // Aggregate counts in JS
  const counts = {};
  data.forEach((item) => {
    if (!item.category) return;
    counts[item.category] = (counts[item.category] || 0) + 1;
  });

  const categories = Object.entries(counts).map(([category, count]) => ({
    category,
    count,
  }));

  res.json(categories);
};

const getPriceRange = async (req, res) => {
  const { data, error } = await supabase.from("products").select("price");

  if (error) return res.status(500).json({ error: error.message });

  const prices = data
    .map((item) => item.price)
    .filter((p) => typeof p === "number");
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  res.json({ min, max });
};

const validateCoupon = async (req, res) => {
  const { code } = req.params;
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code)
    .single();

  if (error || !data) {
    return res.status(404).json({ message: "Coupon not found or invalid." });
  }

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return res.status(400).json({ message: "Coupon expired." });
  }

  // Optionally check usage_limit here

  res.json(data);
};

const getAverageRatingForProducer = async (req, res) => {
  const producerId = req.params.id;

  if (!producerId) {
    return res.status(400).json({ error: "Producer ID is required" });
  }

  try {
    const { data, error } = await supabase
      .from("ratings")
      .select("rating")
      .eq("user_rated_id", producerId);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to fetch ratings" });
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ average_rating: 0, count: 0 });
    }

    const total = data.reduce((sum, row) => sum + row.rating, 0);
    const average = total / data.length;

    return res.status(200).json({
      average_rating: Number(average.toFixed(2)),
      count: data.length,
    });
  } catch (err) {
    console.error("Error in rating calculation:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const recommendations = await fetchRecommendations();
    res.json(recommendations);
  } catch (err) {
    console.error("Error generating recommendations:", err);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductsByCategory,
  getAllProducers,
  getProducerById,
  getCategoriesWithCounts,
  getPriceRange,
  validateCoupon,
  getAverageRatingForProducer,
  getRecommendations,
};
