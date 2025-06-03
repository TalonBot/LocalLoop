const supabase = require("../config/supabase");

async function fetchRecommendations() {
  try {
    const { data: bestSellingProductsRaw, error: bestSellingError } =
      await supabase
        .from("order_items")
        .select("product_id, quantity")
        .limit(10000);

    if (bestSellingError) throw bestSellingError;

    const productSalesMap = {};
    bestSellingProductsRaw.forEach(({ product_id, quantity }) => {
      if (!productSalesMap[product_id]) {
        productSalesMap[product_id] = 0;
      }
      productSalesMap[product_id] += quantity;
    });

    const topProductIds = Object.entries(productSalesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([productId]) => productId);

    const { data: topProducts, error: topProductError } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .in("id", topProductIds);

    if (topProductError) throw topProductError;

    const { data: productData, error: productsFetchError } = await supabase
      .from("order_items")
      .select("product_id, quantity");

    if (productsFetchError) throw productsFetchError;

    const productQuantities = {};
    productData.forEach(({ product_id, quantity }) => {
      if (!productQuantities[product_id]) {
        productQuantities[product_id] = 0;
      }
      productQuantities[product_id] += quantity;
    });

    const productIds = Object.keys(productQuantities);

    const { data: productDetails, error: productDetailsError } = await supabase
      .from("products")
      .select("id, producer_id")
      .in("id", productIds);

    if (productDetailsError) throw productDetailsError;

    const providerSales = {};
    productDetails.forEach(({ id, producer_id }) => {
      const quantitySold = productQuantities[id] || 0;
      if (!providerSales[producer_id]) {
        providerSales[producer_id] = 0;
      }
      providerSales[producer_id] += quantitySold;
    });

    const topProviderIds = Object.entries(providerSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([providerId]) => providerId);

    const { data: topProviders, error: topProvidersError } = await supabase
      .from("users")
      .select("id, full_name, profile_image_url")
      .in("id", topProviderIds);

    if (topProvidersError) throw topProvidersError;

    return {
      best_selling_products: topProducts,
      top_providers: topProviders,
    };
  } catch (err) {
    console.error("Error generating recommendations:", err);
    throw err;
  }
}

module.exports = {
  fetchRecommendations,
};
