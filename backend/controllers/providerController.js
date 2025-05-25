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

const createGroupOrder = async (req, res) => {
  const providerId = req.providerId;
  const { description, products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res
      .status(400)
      .json({ message: "At least one product is required" });
  }

  const timestamp = new Date();

  const validatedProducts = [];
  for (const item of products) {
    const { data: product, error } = await supabase
      .from("products")
      .select("id, price, quantity_available")
      .eq("id", item.product_id)
      .eq("producer_id", providerId)
      .eq("is_available", true)
      .single();

    if (error || !product) {
      return res.status(400).json({
        message: `Invalid or unavailable product: ${item.product_id}`,
        error,
      });
    }

    if (item.max_quantity > product.quantity_available) {
      return res.status(400).json({
        message: `Insufficient stock for product: ${item.product_id}`,
      });
    }

    validatedProducts.push({
      product_id: product.id,
      unit_price: product.price,
      max_quantity: item.max_quantity,
    });
  }

  const { data: groupOrderData, error: groupOrderError } = await supabase
    .from("group_orders")
    .insert([
      {
        id: uuidv4(),
        created_by: providerId,
        description,
        status: "open",
        created_at: timestamp,
        modified_at: timestamp,
      },
    ])
    .select();

  if (groupOrderError || !groupOrderData) {
    return res.status(500).json({
      message: "Failed to create group order",
      error: groupOrderError,
    });
  }

  const groupOrderId = groupOrderData[0].id;

  const productInserts = validatedProducts.map((p) => ({
    group_order_id: groupOrderId,
    product_id: p.product_id,
    max_quantity: p.max_quantity,
    unit_price: p.unit_price,
  }));

  const { error: insertError } = await supabase
    .from("group_order_products")
    .insert(productInserts);

  if (insertError) {
    return res.status(500).json({
      message: "Failed to insert group order products",
      error: insertError,
    });
  }

  for (const item of validatedProducts) {
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("quantity_available")
      .eq("id", item.product_id)
      .single();

    if (fetchError || !product) {
      return res.status(500).json({
        message: `Failed to fetch product quantity for ${item.product_id}`,
        error: fetchError,
      });
    }

    const newQuantity = product.quantity_available - item.max_quantity;

    if (newQuantity < 0) {
      return res.status(400).json({
        message: `Insufficient stock during reservation for product: ${item.product_id}`,
      });
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        quantity_available: newQuantity,
        modified_at: timestamp,
      })
      .eq("id", item.product_id);

    if (updateError) {
      return res.status(500).json({
        message: "Failed to reserve product stock",
        error: updateError,
      });
    }
  }

  return res.status(201).json({
    message: "Group order created and stock reserved",
    groupOrderId,
  });
};
module.exports = {
  updateProfile,
  deleteStory,
  createGroupOrder,
};
