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

const getNearbyProducers = async (req, res) => {
  try {
    const { lat, lng, category = "all" } = req.query;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude required" });
    }

    const { data: locationsData, error: locError } = await supabase
      .from("locations")
      .select("user_id, latitude, longitude");

    if (locError) throw locError;

    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, full_name, email, profile_image_url")
      .eq("role", "provider");

    if (usersError) throw usersError;

    const { data: storiesData, error: storyError } = await supabase
      .from("producer_stories")
      .select("user_id, category");

    if (storyError) throw storyError;

    const { data: ratingsData, error: ratingsError } = await supabase
      .from("ratings")
      .select("user_rated_id, rating");

    if (ratingsError) throw ratingsError;

    const ratingsMap = {};
    ratingsData.forEach((r) => {
      if (!ratingsMap[r.user_rated_id]) ratingsMap[r.user_rated_id] = [];
      ratingsMap[r.user_rated_id].push(r.rating);
    });

    const userMap = Object.fromEntries(usersData.map((u) => [u.id, u]));
    const categoryMap = Object.fromEntries(storiesData.map((s) => [s.user_id, s.category]));

    const haversine = (lat1, lon1, lat2, lon2) => {
      const toRad = (deg) => (deg * Math.PI) / 180;
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const allProducers = locationsData
      .filter((loc) => userMap[loc.user_id] && categoryMap[loc.user_id]) // Must have a story with category
      .map((loc) => {
        const user = userMap[loc.user_id];
        const category = categoryMap[loc.user_id];
        const ratings = ratingsMap[loc.user_id] || [];
        const averageRating = ratings.length
          ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
          : null;
        const distance_km = haversine(latitude, longitude, loc.latitude, loc.longitude);

        return {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          profile_image_url: user.profile_image_url,
          latitude: loc.latitude,
          longitude: loc.longitude,
          distance_km: +distance_km.toFixed(2),
          rating: averageRating,
          category: category?.toLowerCase() || "unknown",
        };
      });

    let filtered;
    if (category !== "all") {
      filtered = allProducers
        .filter((p) => p.category === category.toLowerCase())
        .sort((a, b) => a.distance_km - b.distance_km)
        .slice(0, 5);
    } else {
      filtered = allProducers.sort((a, b) => a.distance_km - b.distance_km).slice(0, 5);
    }

    res.json(filtered);
  } catch (err) {
    console.error("Error fetching nearby producers:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = { getNearbyProducers, saveLocation, };
