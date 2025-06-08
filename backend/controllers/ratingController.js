const supabase = require("../config/supabase");

exports.getAverageRating = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ratings")
      .select("rating");

    if (error) {
      console.error("Supabase error while fetching ratings:", error);
      return res.status(500).json({ message: "Error fetching ratings" });
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ averageRating: 0 });
    }

    const total = data.reduce((sum, r) => sum + r.rating, 0);
    const avg = total / data.length;
    return res.status(200).json({ averageRating: parseFloat(avg.toFixed(1)) });
  } catch (err) {
    console.error("Unexpected error in getAverageRating:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};