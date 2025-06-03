const supabase = require("../config/supabase");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../helpers/mailer");

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

    // 1. Fetch individual orders (same as before)
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(
        `
        id,
        consumer_id,
        total_price,
        status,
        pickup_or_delivery,
        finished,
        created_at,
        order_details (
          address,
          country,
          city,
          additional_info,
          created_at
        ),
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

    if (ordersError) throw ordersError;

    // Flatten individual orders by each order item belonging to the provider
    const individualOrdersFlat = [];
    (orders || []).forEach((order) => {
      (order.order_items || [])
        .filter((item) => item.product?.producer_id === providerId)
        .forEach((item) => {
          individualOrdersFlat.push({
            type: "individual",
            order_id: order.id,
            consumer_id: order.consumer_id,
            status: order.status,
            pickup_or_delivery: order.pickup_or_delivery,
            finished: order.finished,
            created_at: order.created_at,
            delivery_details: order.order_details || null,
            item: {
              id: item.id,
              product: item.product,
              quantity: item.quantity,
              unit_price: item.unit_price,
            },
            total_price: Number(item.unit_price) * item.quantity,
          });
        });
    });

    // 2. Fetch group order participants
    const { data: participants, error: participantsError } =
      await supabase.from("group_orders_participants").select(`
        id,
        user_id,
        group_order_id,
        joined_at,
        finished,
        paid,
        delivery:group_order_delivery_details (
          address,
          city,
          country,
          additional_info
        ),
        group_order:group_order_id (
          id,
          created_at
        )
      `);

    if (participantsError) throw participantsError;

    // 3. Fetch group order items from this provider
    const { data: groupItems, error: groupItemsError } = await supabase
      .from("group_order_items")
      .select(
        `
        id,
        group_order_id,
        user_id,
        product_id,
        quantity,
        unit_price,
        created_at,
        product:product_id (
          id,
          name,
          unit,
          producer_id
        )
      `
      )
      .eq("product.producer_id", providerId);

    if (groupItemsError) throw groupItemsError;

    // 4. Flatten group orders by participant and their items
    const participantsMap = new Map();
    participants.forEach((p) => {
      participantsMap.set(`${p.group_order_id}-${p.user_id}`, p);
    });

    const groupOrdersFlat = [];
    (groupItems || []).forEach((item) => {
      const key = `${item.group_order_id}-${item.user_id}`;
      const participant = participantsMap.get(key);

      if (!participant) return; // skip if participant not found

      groupOrdersFlat.push({
        type: "group",
        group_order_id: item.group_order_id,
        group_order_participant_id: participant.id, // Fixed: using participant.id instead of participants.id
        participant_user_id: item.user_id,
        paid: participant.paid,
        joined_at: participant.joined_at,
        finished: participant.finished,
        delivery_details: participant.delivery || null,
        created_at: participant.group_order?.created_at || null,
        item: {
          id: item.id,
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price,
        },
        total_price: Number(item.unit_price) * item.quantity,
      });
    });

    // 5. Combine all and send response
    const combined = [...individualOrdersFlat, ...groupOrdersFlat];

    return res.status(200).json(combined);
  } catch (err) {
    console.error("Get provider orders error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getGroupOrders = async (req, res) => {
  const providerId = req.providerId;

  const { data: groupOrders, error: groupOrdersError } = await supabase
    .from("group_orders")
    .select("id, description, status, created_at")
    .eq("created_by", providerId)
    .order("created_at", { ascending: false });

  if (groupOrdersError) {
    return res.status(500).json({
      message: "Failed to fetch group orders",
      error: groupOrdersError,
    });
  }

  const formattedOrders = [];

  for (const order of groupOrders) {
    const { count: participantCount, error: participantError } = await supabase
      .from("group_orders_participants")
      .select("id", { count: "exact", head: true })
      .eq("group_order_id", order.id);

    if (participantError) {
      return res.status(500).json({
        message: `Failed to count participants for order ${order.id}`,
        error: participantError,
      });
    }

    const { data: products, error: productError } = await supabase
      .from("group_order_products")
      .select("max_quantity")
      .eq("group_order_id", order.id);

    if (productError) {
      return res.status(500).json({
        message: `Failed to fetch product data for order ${order.id}`,
        error: productError,
      });
    }

    const totalMaxQuantity = products.reduce(
      (sum, p) => sum + (p.max_quantity || 0),
      0
    );

    formattedOrders.push({
      id: order.id,
      title: order.description || "Untitled Group Order",
      status: order.status,
      createdAt: order.created_at,
      currentOrders: participantCount,
      maxQuantity: totalMaxQuantity,
    });
  }

  return res.status(200).json({ groupOrders: formattedOrders });
};

const confirmPickup = async (req, res) => {
  const { orderId, consumerId, pickupNote } = req.body;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("email")
      .eq("id", consumerId)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    await sendEmail(user.email, process.env.SENDGRID_PICKUP_TEMPLATE_ID, {
      pickupNote,
      orderId,
    });

    res.status(200).json({ message: "Email sent to consumer" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const markOrderFinished = async (req, res) => {
  const { orderId } = req.params;
  const { isGroupOrder } = req.query; // Add this parameter to distinguish between order types

  try {
    if (isGroupOrder === "true") {
      // Handle group order participant
      const { data: groupData, error: groupError } = await supabase
        .from("group_orders_participants")
        .update({ finished: true })
        .eq("id", orderId)
        .select();

      if (groupError) {
        return res.status(400).json({ error: groupError.message });
      }

      if (!groupData || groupData.length === 0) {
        return res
          .status(404)
          .json({ error: "Group order participant not found" });
      }

      return res.status(200).json({
        message: "Group order participant marked as finished",
        order: groupData[0],
      });
    } else {
      // Handle individual order
      const { data: individualData, error: individualError } = await supabase
        .from("orders")
        .update({ finished: true })
        .eq("id", orderId)
        .select();

      if (individualError) {
        return res.status(400).json({ error: individualError.message });
      }

      if (!individualData || individualData.length === 0) {
        return res.status(404).json({ error: "Individual order not found" });
      }

      return res.status(200).json({
        message: "Individual order marked as finished",
        order: individualData[0],
      });
    }
  } catch (err) {
    console.error("Error finishing order:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  updateProfile,
  deleteStory,
  createGroupOrder,
  getProviderRevenue,
  confirmPickup,
  markOrderFinished,
  getProviderInfo,
  getProviderOrders,
  getGroupOrders,
};
