const supabase = require("../../config/supabase");

const getMyStory = async (req, res) => {
  try {
    const { providerId } = req;

    const { data, error } = await supabase
      .from("producer_stories")
      .select("*")
      .eq("user_id", providerId)
      .single();

    if (error && error.code !== "PGRST116") {
      return res.status(500).json({ message: "Fetch error", error });
    }

    if (!data) {
      return res.status(404).json({ message: "No story found" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Get story failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  getMyStory,
};
