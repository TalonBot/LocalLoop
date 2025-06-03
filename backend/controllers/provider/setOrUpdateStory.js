const supabase = require("../../config/supabase");

const setOrUpdateStory = async (req, res) => {
  try {
    const { providerId } = req;
    const { story, certifications } = req.body;

    const { data: existing, error: fetchError } = await supabase
      .from("producer_stories")
      .select("id")
      .eq("user_id", providerId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      return res
        .status(500)
        .json({ message: "Fetch error", error: fetchError });
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("producer_stories")
        .update({ story, certifications })
        .eq("user_id", providerId);

      if (updateError) {
        return res
          .status(500)
          .json({ message: "Update failed", error: updateError });
      }

      return res.status(200).json({ message: "Story updated successfully" });
    } else {
      const { error: insertError } = await supabase
        .from("producer_stories")
        .insert([
          {
            user_id: providerId,
            story,
            certifications,
          },
        ]);

      if (insertError) {
        return res
          .status(500)
          .json({ message: "Insert failed", error: insertError });
      }

      return res.status(201).json({ message: "Story created successfully" });
    }
  } catch (err) {
    console.error("Set or update story error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = setOrUpdateStory;
