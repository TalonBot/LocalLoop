const stripe = require("../config/stripe");
const supabase = require("../config/supabase");

const createCheckoutSession = async (req, res) => {
  const { items, pickup_or_delivery, coupon_code, notes, delivery_details } =
    req.body;
  const { consumerId } = req;

  // Add a check for group orders
let isGroupOrder = false;
const { data: groupOrder, error: groupError } = await supabase
  .from("group_orders")
  .select("*")
  .eq("user_id", consumerId)
  .eq("status", "active")
  .single();

if (groupOrder) {
  isGroupOrder = true;
}

if (isGroupOrder && coupon_code) {
  return res.status(400).json({ message: "Coupons are not allowed for group orders." });
}


  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No items provided" });
  }

  try {
    let discountPercent = 0;

    if (coupon_code) {
      // Fetch coupon and check if active & valid
      const { data: coupon, error: couponError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", coupon_code)
        .eq("active", true)
        .single();

      if (!coupon || couponError) {
        return res
          .status(400)
          .json({ message: "Invalid or inactive coupon code" });
      }

      const now = new Date();
      if (
        new Date(coupon.created_at) > now ||
        new Date(coupon.expires_at) < now ||
        coupon.times_used >= coupon.usage_limit
      ) {
        return res.status(400).json({ message: "Coupon not valid currently" });
      }

      // --- NEW: Check if user already used this coupon ---
      const { data: usageRecord, error: usageError } = await supabase
        .from("coupon_usage")
        .select("*")
        .eq("coupon_id", coupon.id)
        .eq("user_id", consumerId)
        .single();

      if (usageError && usageError.code !== "PGRST116") {
        // PGRST116 means no rows found, which is fine here
        console.error("Error checking coupon usage:", usageError);
        return res
          .status(500)
          .json({ message: "Error validating coupon usage" });
      }
      if (usageRecord) {
        return res
          .status(400)
          .json({ message: "Coupon already used by this user" });
      }
      // ---------------------------------------------------

      discountPercent = coupon.discount_percent;
    }

    const line_items = [];
    let total_price = 0;

    for (const item of items) {
      const { data: product, error } = await supabase
        .from("products")
        .select("name, price, quantity_available")
        .eq("id", item.product_id)
        .single();

      if (error || !product) {
        return res
          .status(400)
          .json({ message: `Invalid product ${item.product_id}` });
      }

      if (item.quantity > product.quantity_available) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }

      const discountedPrice =
        discountPercent > 0
          ? product.price * (1 - discountPercent / 100)
          : product.price;

      total_price += discountedPrice * item.quantity;

      line_items.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(discountedPrice * 100),
        },
        quantity: item.quantity,
      });
    }

    if (pickup_or_delivery === "delivery") {
      const deliveryFee = 15.0;
      total_price += deliveryFee;

      line_items.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "Delivery Fee",
          },
          unit_amount: deliveryFee * 100,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/checkout/success`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
      metadata: {
        consumerId,
        pickup_or_delivery,
        items: JSON.stringify(items),
        total_price: total_price.toFixed(2),
        coupon_code: coupon_code || "",
        discount_percent: discountPercent.toFixed(2),
        notes: notes || "",
        delivery_details: delivery_details
          ? JSON.stringify(delivery_details)
          : "",
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ message: "Failed to create Stripe session" });
  }
};

module.exports = { createCheckoutSession };
