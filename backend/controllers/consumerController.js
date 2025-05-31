const supabase = require("../config/supabase");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require("uuid");

const joinGroupOrder = async (req, res) => {
  const { consumerId } = req;
  const { group_order_id, items, delivery_details, notes } = req.body;

  if (!group_order_id) {
    return res.status(400).json({ message: "Group order ID is required" });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "At least one item is required" });
  }

  try {
    let lineItems = [];
    let totalAmount = 0;

    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return res
          .status(400)
          .json({ message: `Invalid quantity for product ${item.product_id}` });
      }

      const { data: product, error } = await supabase
        .from("group_order_products")
        .select("product_id, unit_price, max_quantity")
        .eq("group_order_id", group_order_id)
        .eq("product_id", item.product_id)
        .single();

      if (error || !product) {
        return res.status(400).json({
          message: `Invalid product for group order: ${item.product_id}`,
          error,
        });
      }

      if (item.quantity > product.max_quantity) {
        return res.status(400).json({
          message: `Quantity too high for product: ${item.product_id}`,
        });
      }

      const unitAmount = Math.round(parseFloat(product.unit_price) * 100);
      totalAmount += unitAmount * item.quantity;

      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: `Product ${product.product_id}`,
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      });
    }

    const metadata = {
      consumerId,
      group_order_id,
      items: JSON.stringify(items),
      notes: notes || "",
      delivery_details: delivery_details
        ? JSON.stringify(delivery_details)
        : "",
      total_price: (totalAmount / 100).toFixed(2),
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.FRONTEND_URL}/checkout/success`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
      metadata,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Join group order failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const applyToBeProducer = async (req, res) => {
  const { consumerId } = req;
  const { business_name, reason } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: "No documents uploaded" });
  }

  const uploadedPaths = [];

  for (const file of files) {
    const path = `user-${consumerId}/${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from("applications")
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) return res.status(500).json({ error: error.message });

    uploadedPaths.push(path);
  }

  const { data: existing, error: existingError } = await supabase
    .from("producer_applications")
    .select("id")
    .eq("user_id", consumerId)
    .single();

  if (existing) {
    return res.status(400).json({ error: "Application already submitted" });
  }

  const { error: insertError } = await supabase
    .from("producer_applications")
    .insert([
      {
        user_id: consumerId,
        business_name,
        reason,
        documents: uploadedPaths,
        status: "pending",
        created_at: new Date(),
      },
    ]);

  if (insertError) return res.status(500).json({ error: insertError.message });

  res.status(201).json({ message: "Application submitted successfully" });
};

module.exports = { joinGroupOrder, applyToBeProducer };
