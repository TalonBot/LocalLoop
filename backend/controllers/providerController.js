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

const getProviderInfo = async (req, res) => {
  try {
    const providerId = req.providerId;

    if (!providerId) {
      return res.status(400).json({ message: "Provider ID is required" });
    }

    const { data: provider, error } = await supabase
      .from("users")
      .select(
        "id, full_name, profile_image_url, email, created_at, modified_at"
      )
      .eq("id", providerId)
      .single();

    if (error) {
      return res
        .status(500)
        .json({ message: "Failed to fetch provider info", error });
    }

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.status(200).json({ provider });
  } catch (err) {
    console.error("Get provider info error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProviderRevenue = async (req, res) => {
  try {
    const providerId = req.providerId;
    const { timeframe } = req.query;

    let startDate = null;
    const now = new Date();

    switch (timeframe) {
      case "day":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    const { data: orderItems, error } = await supabase
      .from("order_items")
      .select(
        `
        id,
        quantity,
        unit_price,
        product_id,
        order_id,
        products:product_id (
          id,
          name,
          price,
          producer_id
        ),
        orders:order_id (
          id,
          status,
          created_at
        )
      `
      );

    if (error) {
      return res.status(500).json({
        message: "Failed to fetch order items",
        error,
      });
    }

    const filteredItems = orderItems.filter((item) => {
      const isOwned = item.products?.producer_id === providerId;
      const isCompleted = item.orders?.status === "paid";
      const isInTimeframe =
        !startDate || new Date(item.orders?.created_at) >= startDate;
      return isOwned && isCompleted && isInTimeframe;
    });

    const totalRevenue = filteredItems.reduce((acc, item) => {
      return acc + (item.quantity || 0) * (item.unit_price || 0);
    }, 0);

    const productSales = filteredItems.reduce((acc, item) => {
      const product = item.products;
      if (!product) return acc;

      if (!acc[product.id]) {
        acc[product.id] = {
          product,
          quantity: 0,
          total_revenue: 0,
        };
      }
      acc[product.id].quantity += item.quantity || 0;
      acc[product.id].total_revenue +=
        (item.quantity || 0) * (item.unit_price || 0);

      return acc;
    }, {});

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(({ product, quantity, total_revenue }) => ({
        product_id: product.id,
        name: product.name,
        quantity,
        total_revenue: parseFloat(total_revenue.toFixed(2)),
        unit_price: product.price || 0,
      }));

    return res.status(200).json({
      revenue: {
        orders: parseFloat(totalRevenue.toFixed(2)),
        total: parseFloat(totalRevenue.toFixed(2)),
      },
      timeframe: timeframe || "all",
      topProducts,
      orderCount: filteredItems.length,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Revenue calculation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProviderOrders = async (req, res) => {
  try {
    const providerId = req.providerId;

    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        consumer_id,
        total_price,
        status,
        pickup_or_delivery,
        created_at,
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          product:product_id (
            name,
            unit,
            producer_id
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        message: "Failed to fetch orders",
        error,
      });
    }

    const filteredOrders = orders
      .map((order) => {
        const itemsForProvider = order.order_items.filter(
          (item) => item.product?.producer_id === providerId
        );
        if (itemsForProvider.length === 0) return null;

        return {
          ...order,
          order_items: itemsForProvider,
        };
      })
      .filter(Boolean);

    return res.status(200).json(filteredOrders);
  } catch (err) {
    console.error("Get provider orders error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  updateProfile,
  deleteStory,
  createGroupOrder,
  getProviderRevenue,
  getProviderInfo,
  getProviderOrders,
};
