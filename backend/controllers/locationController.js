// backend/controllers/locationController.js
const supabase = require("../config/supabase");

const saveLocation = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    // Check if a location already exists for this user
    const { data: existingLocation, error: fetchError } = await supabase
      .from("locations")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();  // Use maybeSingle() so it doesn't throw an error if not found

    if (fetchError) {
      console.error("Error checking existing location:", fetchError);
      return res.status(500).json({ message: "Error checking location", error: fetchError });
    }

    if (existingLocation) {
      console.log("Location already exists for this user, skipping insert.");
      return res.status(200).json({ message: "Location already exists for this user" });
    }

    // Insert new location if none exists
    const { error: insertError } = await supabase
      .from("locations")
      .insert([{ user_id: userId, latitude, longitude }]);

    if (insertError) {
      return res.status(500).json({ message: "Error saving location", error: insertError });
    }

    return res.status(201).json({ message: "Location saved successfully" });
  } catch (error) {
    console.error("Save location error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { saveLocation };
