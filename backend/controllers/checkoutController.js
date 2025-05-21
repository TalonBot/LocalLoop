const stripe = require("../config/stripe");
const supabase = require("../config/supabase");

const createCheckoutSession = async (req, res) => {
  const { items, pickup_or_delivery } = req.body;
  const { consumerId } = req;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "No items provided" });
  }

  try {
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

      total_price += product.price * item.quantity;

      line_items.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout/success`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`,
      metadata: {
        consumerId,
        pickup_or_delivery,
        items: JSON.stringify(items),
        total_price: total_price.toFixed(2),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ message: "Failed to create Stripe session" });
  }
};

module.exports = { createCheckoutSession };
