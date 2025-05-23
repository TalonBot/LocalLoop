const supabase = require("../config/supabase");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require("uuid");

const joinGroupOrder = async (req, res) => {
  const { consumerId } = req;
  const { group_order_id, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "At least one item is required" });
  }

  try {
    let lineItems = [];
    let totalAmount = 0;

    for (const item of items) {
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/group-orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/group-orders/cancel`,
      metadata: {
        consumerId,
        group_order_id,
        items: JSON.stringify(items),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Join group order failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { joinGroupOrder };
