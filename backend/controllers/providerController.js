const supabase = require("../config/supabase");
const { v4: uuidv4 } = require("uuid");

const updateProfile = async (req, res) => {
  try {
    const providerId = req.providerId;
    const { full_name } = req.body;
    let profile_image_url = null;

    if (req.file) {
      const imageExt = req.file.originalname.split(".").pop();
      const imageName = `${uuidv4()}.${imageExt}`;
      const filePath = `profiles/${providerId}/${imageName}`;

      const { error: uploadError } = await supabase.storage
        .from("userimages")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        return res
          .status(500)
          .json({ message: "Image upload failed", error: uploadError });
      }

      const { data: publicUrlData } = supabase.storage
        .from("userimages")
        .getPublicUrl(filePath);

      profile_image_url = publicUrlData.publicUrl;
    }

    const updates = {
      modified_at: new Date(),
    };

    if (full_name) updates.full_name = full_name;
    if (profile_image_url) updates.profile_image_url = profile_image_url;

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", providerId);

    if (error) {
      return res
        .status(500)
        .json({ message: "Failed to update profile", error });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      ...(full_name && { full_name }),
      ...(profile_image_url && { profile_image_url }),
    });
  } catch (err) {
    console.error("Update profile failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteStory = async (req, res) => {
  try {
    const { providerId } = req;

    const { error } = await supabase
      .from("producer_stories")
      .delete()
      .eq("user_id", providerId);

    if (error) {
      return res.status(500).json({ message: "Failed to delete story", error });
    }

    return res.status(200).json({ message: "Story deleted successfully" });
  } catch (err) {
    console.error("Delete story error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  updateProfile,
  deleteStory,
};
