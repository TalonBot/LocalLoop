const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const supabase = require("../config/supabase");

router.post(
  "/",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      try {
        const consumerId = session.metadata.consumerId;
        const pickup_or_delivery = session.metadata.pickup_or_delivery;
        const items = JSON.parse(session.metadata.items);

        let total_price = 0;
        const orderItems = [];

        for (const item of items) {
          const { data: product, error } = await supabase
            .from("products")
            .select("id, price, quantity_available")
            .eq("id", item.product_id)
            .single();

          if (error || !product) {
            console.warn(`Product ${item.product_id} not found or error`);
            continue;
          }

          if (item.quantity > product.quantity_available) {
            console.warn(
              `Insufficient stock for product ${product.id}: requested ${item.quantity}, available ${product.quantity_available}`
            );
            continue;
          }

          const unit_price = product.price;
          total_price += unit_price * item.quantity;

          orderItems.push({
            product_id: product.id,
            quantity: item.quantity,
            unit_price,
          });
        }

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .insert([
            {
              consumer_id: consumerId,
              total_price,
              status: "paid",
              pickup_or_delivery,
              created_at: new Date(),
              modified_at: new Date(),
            },
          ])
          .select();

        if (orderError || !orderData) {
          console.error("Order insert failed:", orderError);
          return res.status(500).end();
        }

        const order = orderData[0];

        for (const item of orderItems) {
          await supabase.from("order_items").insert([
            {
              order_id: order.id,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
            },
          ]);

          const { data: productData, error: fetchError } = await supabase
            .from("products")
            .select("quantity_available")
            .eq("id", item.product_id)
            .single();

          if (fetchError || !productData) {
            console.error(
              `Failed to fetch stock for product ${item.product_id}`,
              fetchError
            );
            continue;
          }

          const newQuantity = productData.quantity_available - item.quantity;

          if (newQuantity < 0) {
            console.warn(
              `Stock for product ${item.product_id} would go negative! Skipping update.`
            );
            continue;
          }

          const { error: updateError } = await supabase
            .from("products")
            .update({ quantity_available: newQuantity })
            .eq("id", item.product_id);

          if (updateError) {
            console.error(
              `Failed to update stock for product ${item.product_id}`,
              updateError
            );
          }
        }

        console.log("✅ Order created from Stripe checkout:", order.id);
        res.status(200).send("Order created");
      } catch (err) {
        console.error("Error handling Stripe webhook:", err);
        res.status(500).end();
      }
    } else {
      res.status(200).end();
    }
  }
);

module.exports = router;
