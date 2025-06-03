const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const supabase = require("../config/supabase");
const { sendEmail } = require("../helpers/mailer");

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
      const sessionId = session.id;

      // Check if session already processed
      const { data: existingSession, error: sessionFetchError } = await supabase
        .from("processed_stripe_sessions")
        .select("id")
        .eq("id", sessionId)
        .single();

      if (sessionFetchError && sessionFetchError.code !== "PGRST116") {
        console.error("Error checking processed sessions:", sessionFetchError);
        return res.status(500).end();
      }

      if (existingSession) {
        console.log(`Skipping already processed session ${sessionId}`);
        return res.status(200).send("Already processed");
      }

      // Mark session as processed - insert with conflict handling
      const { error: insertSessionError } = await supabase
        .from("processed_stripe_sessions")
        .upsert([{ id: sessionId }], { ignoreDuplicates: true });

      if (insertSessionError) {
        console.error(
          "Error marking session as processed:",
          insertSessionError
        );
        return res.status(500).end();
      }
      // ===== Group Order (no coupons applied here) =====
      if (session.metadata.group_order_id) {
        const userId = session.metadata.consumerId;
        const groupOrderId = session.metadata.group_order_id;
        const items = JSON.parse(session.metadata.items);
        const deliveryDetails = session.metadata.delivery_details
          ? JSON.parse(session.metadata.delivery_details)
          : null;
        const additional_info = session.metadata.notes || null;

        try {
          // Insert participant and get the inserted row to get its ID
          const totalPrice = parseFloat(session.metadata.total_price || "0");
          const pickupOrDelivery =
            session.metadata.pickup_or_delivery || "pickup";

          const { data: participantData, error: participantError } =
            await supabase
              .from("group_orders_participants")
              .insert([
                {
                  user_id: userId,
                  group_order_id: groupOrderId,
                  joined_at: new Date(),
                  paid: true,
                  total_price: totalPrice,
                  pickup_or_delivery: pickupOrDelivery,
                },
              ])
              .select()
              .single();

          if (participantError || !participantData) {
            console.error("Error inserting participant:", participantError);
            return res.status(500).end();
          }

          const participantId = participantData.id;

          if (deliveryDetails) {
            const { address, city, country } = deliveryDetails;

            const { error: deliveryError } = await supabase
              .from("group_order_delivery_details")
              .insert([
                {
                  order_id: participantId,
                  address,
                  city,
                  country,
                  additional_info,
                  created_at: new Date(),
                },
              ]);

            if (deliveryError) {
              console.error(
                "Error inserting group order delivery details:",
                deliveryError
              );
            }
          }

          const groupOrderItems = [];
          for (const item of items) {
            const { data: productData, error: priceError } = await supabase
              .from("group_order_products")
              .select("unit_price")
              .eq("group_order_id", groupOrderId)
              .eq("product_id", item.product_id)
              .single();

            if (priceError || !productData) {
              console.error(
                `Failed to fetch unit_price for product ${item.product_id}`,
                priceError
              );
              continue;
            }

            groupOrderItems.push({
              user_id: userId,
              group_order_id: groupOrderId,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: productData.unit_price,
              created_at: new Date(),
            });
          }

          if (groupOrderItems.length > 0) {
            const { error: itemsInsertError } = await supabase
              .from("group_order_items")
              .insert(groupOrderItems);

            if (itemsInsertError) {
              console.error(
                "Error inserting group_order_items:",
                itemsInsertError
              );
              return res.status(500).end();
            }
          }

          for (const item of items) {
            const { data: groupProduct, error: fetchError } = await supabase
              .from("group_order_products")
              .select("max_quantity")
              .eq("group_order_id", groupOrderId)
              .eq("product_id", item.product_id)
              .single();

            if (fetchError || !groupProduct) {
              console.error(
                `Failed to fetch group product stock for ${item.product_id}`,
                fetchError
              );
              continue;
            }

            const newMaxQty = groupProduct.max_quantity - item.quantity;
            if (newMaxQty < 0) {
              console.warn(
                `max_quantity would go negative for group product ${item.product_id}. Skipping update.`
              );
              continue;
            }

            const { error: updateError } = await supabase
              .from("group_order_products")
              .update({ max_quantity: newMaxQty })
              .eq("group_order_id", groupOrderId)
              .eq("product_id", item.product_id);

            if (updateError) {
              console.error(
                `Failed to update max_quantity for group product ${item.product_id}`,
                updateError
              );
            }
          }

          // Fetch user email
          const { data: userData, error: userFetchError } = await supabase
            .from("users")
            .select("email")
            .eq("id", userId)
            .single();

          // // Fetch one valid coupon (active, not expired, not over usage limit) stara koda smz
          // const { data: couponData, error: couponError } = await supabase
          //   .from("coupons")
          //   .select("code, discount_percent, expires_at")
          //   .eq("active", true)
          //   .lt("expires_at", new Date().toISOString()) // still valid
          //   .or("usage_limit.is.null,usage_limit.gt.times_used") // usage limit not reached or unlimited
          //   .order("created_at", { ascending: true })
          //   .limit(1)
          //   .single();

          if (!userFetchError && userData) {
            const dynamicData = {
              group_order_id: groupOrderId,
              items,
              deliveryDetails,
              additional_info,
            };

            try {
              const couponCode = `LLOOP-${Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase()}`;
              const discountPercent =
                Math.floor(Math.random() * (15 - 5 + 1)) + 5; // 5–15%

              const { data: newCoupon, error: couponInsertError } =
                await supabase
                  .from("coupons")
                  .insert([
                    {
                      code: couponCode,
                      discount_percent: discountPercent,
                      expires_at: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                      ), // 30 days
                      usage_limit: 1,
                    },
                  ])
                  .select()
                  .single();

              if (couponInsertError) {
                console.error("Error creating coupon:", couponInsertError);
              } else {
                dynamicData.coupon_code = couponCode;
                dynamicData.discount_percent = discountPercent;
                dynamicData.expires_at = new Date(
                  newCoupon.expires_at
                ).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });

                console.log(
                  `✅ Coupon ${couponCode} generated for group order user ${userData.email}`
                );
              }
            } catch (err) {
              console.error("Error generating coupon for group order:", err);
            }

            await sendEmail(
              userData.email,
              process.env.SENDGRID_GROUP_ORDER_TEMPLATE_ID,
              dynamicData
            );
          }

          console.log(`Group order processed for user ${userId}`);
          return res.status(200).send("Group order processed");
        } catch (err) {
          console.error("Group order error:", err);
          return res.status(500).end();
        }
      }

      // ===== Regular Product Order (with coupon/discount) =====
      try {
        const consumerId = session.metadata.consumerId;
        const pickup_or_delivery = session.metadata.pickup_or_delivery;
        const items = JSON.parse(session.metadata.items);
        const notes = session.metadata.notes || null;
        const deliveryDetails = session.metadata.delivery_details
          ? JSON.parse(session.metadata.delivery_details)
          : null;
        const coupon_code = session.metadata.coupon_code || "";

        const total_price = parseFloat(session.metadata.total_price) || 0;

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

          orderItems.push({
            product_id: product.id,
            quantity: item.quantity,
            unit_price: product.price,
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
          const { error: itemInsertError } = await supabase
            .from("order_items")
            .insert([
              {
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
              },
            ]);

          if (itemInsertError) {
            console.error(
              `Failed to insert order item for product ${item.product_id}`,
              itemInsertError
            );
          }

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

        if (pickup_or_delivery === "delivery" && deliveryDetails) {
          const { address, city, country } = deliveryDetails;

          const { error: detailError } = await supabase
            .from("order_details")
            .insert([
              {
                order_id: order.id,
                address,
                city,
                country,
                additional_info: notes,
                created_at: new Date(),
              },
            ]);

          if (detailError) {
            console.error("Error inserting delivery details:", detailError);
          }
        }

        if (coupon_code) {
          const { data: coupon, error: couponError } = await supabase
            .from("coupons")
            .select("id, times_used")
            .eq("code", coupon_code)
            .single();

          if (!coupon || couponError) {
            console.warn(
              "Coupon not found or error when updating usage",
              couponError
            );
          } else {
            const { data: usageRecord } = await supabase
              .from("coupon_usage")
              .select("*")
              .eq("coupon_id", coupon.id)
              .eq("user_id", consumerId)
              .single();

            if (!usageRecord) {
              const { error: usageInsertError } = await supabase
                .from("coupon_usage")
                .insert([
                  {
                    coupon_id: coupon.id,
                    user_id: consumerId,
                    used_at: new Date(),
                  },
                ]);
              if (usageInsertError) {
                console.error(
                  "Failed to record coupon usage:",
                  usageInsertError
                );
              } else {
                const { error: updateError } = await supabase
                  .from("coupons")
                  .update({ times_used: coupon.times_used + 1 })
                  .eq("id", coupon.id);

                if (updateError) {
                  console.error(
                    "Failed to increment coupon times_used:",
                    updateError
                  );
                }
              }
            } else {
              console.log(
                `User ${consumerId} already used coupon ${coupon_code}`
              );
            }
          }
        }

        const { data: userData, error: userFetchError } = await supabase
          .from("users")
          .select("email")
          .eq("id", consumerId)
          .single();

        if (!userFetchError && userData) {
          const order_date = new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }); // Format: DD/MM/YYYY

          await sendEmail(
            userData.email,
            process.env.SENDGRID_ORDER_TEMPLATE_ID,
            {
              order_id: order.id,
              items,
              pickup_or_delivery,
              deliveryDetails,
              notes,
              total_price,
              coupon_code,
              order_date,
            }
          );
        }

        console.log("✅ Order created from Stripe checkout:", order.id);
        return res.status(200).send("Order created");
      } catch (err) {
        console.error("Regular order error:", err);
        return res.status(500).end();
      }
    }

    res.status(200).end();
  }
);

module.exports = router;
