const cron = require("node-cron");
const { fetchRecommendations } = require("../helpers/fetchRecommendations");
const { sendEmail } = require("../helpers/mailer");
const supabase = require("../config/supabase");

const getAllConsumers = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("email, full_name")
    .eq("role", "consumer");

  if (error) {
    throw new Error("Failed to fetch consumers: " + error.message);
  }

  return data.map((user) => ({
    email: user.email,
    name: user.full_name || "there",
  }));
};

cron.schedule("0 10 * * 0", async () => {
  console.log("Weekly email job started");

  try {
    const { best_selling_products, top_providers } =
      await fetchRecommendations();

    const formattedProducts = best_selling_products.map((product) => {
      const image =
        Array.isArray(product.product_images) &&
        product.product_images.length > 0
          ? product.product_images[0].image_url
          : "https://via.placeholder.com/150";

      return {
        name: product.name,
        image,
        price: product.price,
        unit: product.unit,
        url: product.url || "#",
      };
    });

    const topProvider = top_providers?.[0]
      ? {
          name: top_providers[0].full_name,
          description: "Recognized for exceptional service this week!",
        }
      : null;

    const consumers = await getAllConsumers();

    for (const consumer of consumers) {
      const dynamicData = {
        username: consumer.name,
        products: formattedProducts,
        top_provider: topProvider,
      };

      await sendEmail(
        consumer.email,
        process.env.SENDGRID_WEEKLY_TEMPLATE_ID,
        dynamicData
      );
    }

    console.log("Weekly email job completed");
  } catch (err) {
    console.error("Failed to send weekly emails:", err);
  }
});
