const supabase = require("../../config/supabase");
const { sendEmail } = require("../../helpers/mailer");

const getAllProducerApplications = async (req, res) => {
  // Fetch all applications with user info
  const { data: applications, error } = await supabase
    .from("producer_applications")
    .select(
      `
      *,
      users (
        full_name
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({ error: error.message });
  }

  // Bucket name where documents are stored
  const bucketName = "applications";

  // Map through applications to generate signed URLs for each document
  const applicationsWithUrls = await Promise.all(
    applications.map(async (app) => {
      if (app.documents && app.documents.length > 0) {
        // Generate signed URLs for each document (expires in 1 hour)
        const documentsWithUrls = await Promise.all(
          app.documents.map(async (docPath) => {
            const { data, error } = await supabase.storage
              .from(bucketName)
              .createSignedUrl(docPath, 60 * 60); // 1 hour expiration

            if (error) {
              console.error("Error creating signed URL for", docPath, error);
              return { path: docPath, url: null, error: error.message };
            }
            return { path: docPath, url: data.signedUrl };
          })
        );
        return { ...app, documents: documentsWithUrls };
      }
      return { ...app, documents: [] };
    })
  );

  res.status(200).json(applicationsWithUrls);
};

const getProducerApplicationById = async (req, res) => {
  const { id } = req.params;

  const { data: app, error } = await supabase
    .from("producer_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !app) {
    return res.status(404).json({ error: "Application not found" });
  }

  let signedUrls = [];
  if (Array.isArray(app.documents) && app.documents.length > 0) {
    const { data: urls, error: urlError } = await supabase.storage
      .from("applications")
      .createSignedUrls(app.documents, 60 * 60); // 1 hour

    if (urlError) return res.status(500).json({ error: urlError.message });

    signedUrls = urls.map(({ path, signedUrl }) => ({ path, signedUrl }));
  }

  res.status(200).json({ ...app, signedUrls });
};

const reviewProducerApplication = async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res
      .status(400)
      .json({ error: "Status must be 'approved' or 'rejected'" });
  }

  // Fetch application + user email and full name via relationship
  const { data: application, error: fetchError } = await supabase
    .from("producer_applications")
    .select(
      `
      id,
      user_id,
      business_name,
      reason,
      status,
      admin_notes,
      created_at,
      reviewed_at,
      users (
        email,
        full_name
      )
    `
    )
    .eq("id", id)
    .single();

  if (fetchError || !application) {
    return res.status(404).json({ error: "Application not found" });
  }

  // Optional: Require admin_notes if rejected
  if (status === "rejected" && (!admin_notes || admin_notes.trim() === "")) {
    return res
      .status(400)
      .json({ error: "Admin notes required when rejecting an application" });
  }

  // Update status and admin notes
  const { error } = await supabase
    .from("producer_applications")
    .update({
      status,
      admin_notes: admin_notes || null,
      reviewed_at: new Date(),
    })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });

  const userEmail = application.users?.email;
  const userFullName = application.users?.full_name || "Applicant";

  if (!userEmail) {
    console.warn(`No user email found for application id=${id}`);
  } else {
    const approvedTemplateId = process.env.SENDGRID_APPROVED_TEMPLATE_ID;
    const rejectedTemplateId = process.env.SENDGRID_REJECTED_TEMPLATE_ID;

    try {
      if (status === "approved") {
        await sendEmail(
          userEmail,
          approvedTemplateId,
          { full_name: userFullName, admin_notes: admin_notes || "" },
          "Your application has been approved"
        );
      } else if (status === "rejected") {
        await sendEmail(
          userEmail,
          rejectedTemplateId,
          { full_name: userFullName, admin_notes: admin_notes || "" },
          "Your application has been rejected"
        );
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }
  }

  res.status(200).json({ message: `Application ${status}` });
};

const fetchApprovedProviders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("producer_applications")
      .select(
        `
        id,
        user_id,
        business_name,
        reason,
        status,
        admin_notes,
        created_at,
        reviewed_at,
        users (
          full_name,
          email
        )
      `
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching approved providers:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMonthlyProviderProfits = async (req, res) => {
  const { providerId } = req.params;
  const { month, year } = req.query;

  if (!providerId || !month || !year) {
    return res
      .status(400)
      .json({ error: "Missing providerId, month, or year" });
  }

  const startDate = new Date(`${year}-${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1); // next month

  try {
    // Step 1: Get product IDs of this provider
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("producer_id", providerId);

    if (productError) {
      console.error("Error fetching products:", productError);
      return res.status(500).json({ error: productError.message });
    }

    const productIds = products.map((p) => p.id);
    if (productIds.length === 0) {
      return res.status(200).json({
        providerId,
        month,
        year,
        totalProfit: 0,
        ordersCount: 0,
        message: "No products found for this provider",
      });
    }

    // Step 2: Get order_items joined with orders where product_id is in list
    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select(
        `
        quantity,
        unit_price,
        orders (
          id,
          created_at,
          finished
        )
      `
      )
      .in("product_id", productIds);

    if (orderItemsError) {
      console.error("Error fetching order items:", orderItemsError);
      return res.status(500).json({ error: orderItemsError.message });
    }

    // Step 3: Filter by date range and finished=true
    const filteredItems = orderItems.filter((item) => {
      const order = item.orders;
      if (!order || !order.finished) return false;
      const createdAt = new Date(order.created_at);
      return createdAt >= startDate && createdAt < endDate;
    });

    const totalProfit = filteredItems.reduce(
      (sum, item) => sum + item.quantity * parseFloat(item.unit_price),
      0
    );

    const uniqueOrderIds = new Set(filteredItems.map((i) => i.orders.id));

    return res.status(200).json({
      providerId,
      month,
      year,
      totalProfit,
      ordersCount: uniqueOrderIds.size,
      currency: "EUR",
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllProducerApplications,
  getProducerApplicationById,
  reviewProducerApplication,
  fetchApprovedProviders,
  getMonthlyProviderProfits,
};
