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

  // Update application status and notes
  const { error: updateError } = await supabase
    .from("producer_applications")
    .update({
      status,
      admin_notes: admin_notes || null,
      reviewed_at: new Date(),
    })
    .eq("id", id);

  if (updateError) return res.status(500).json({ error: updateError.message });

  // If approved, update user role to 'provider'
  if (status === "approved") {
    const { error: roleUpdateError } = await supabase
      .from("users")
      .update({ role: "provider" })
      .eq("id", application.user_id);

    if (roleUpdateError) {
      console.error("Failed to update user role:", roleUpdateError);
      return res.status(500).json({ error: "Failed to update user role" });
    }
  }

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
      .from("users")
      .select(
        `
        id,
        full_name,
        email,
        role,
        created_at
      `
      )
      .eq("role", "provider")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching providers:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMonthlyProviderProfits = async (req, res) => {
  try {
    const providerId = req.params.providerId;
    const { timeframe, month, year } = req.query;

    const now = new Date();

    let startDate = null;
    let endDate = null;

    if (month && year) {
      const paddedMonth = month.toString().padStart(2, "0");
      const paddedYear = year.toString();
      startDate = new Date(`${paddedYear}-${paddedMonth}-01T00:00:00Z`);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      switch (timeframe) {
        case "day":
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "year":
          startDate = new Date(now);
          startDate.setFullYear(startDate.getFullYear() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        default:
          startDate = null;
      }
    }

    const pStartDate = startDate ? startDate.toISOString() : null;
    const pEndDate = endDate ? endDate.toISOString() : null;

    const { data: providerData, error: providerError } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("id", providerId)
      .single();

    const providerName = providerData?.full_name || "N/A";
    const providerEmail = providerData?.email || "N/A";

    const { data: regularOrdersData, error: regularError } = await supabase.rpc(
      "get_regular_provider_orders",
      {
        p_provider_id: providerId,
        p_start_date: pStartDate,
        p_end_date: pEndDate,
      }
    );

    if (regularError) {
      return res.status(500).json({
        message: "Failed to fetch regular provider orders",
        error: regularError,
      });
    }

    const regularOrdersMap = {};
    regularOrdersData.forEach((item) => {
      const orderId = item.order_id;
      if (!regularOrdersMap[orderId]) {
        regularOrdersMap[orderId] = {
          order_id: orderId,
          created_at: item.created_at,
          total_price: parseFloat(item.total_price) || 0,
          products: [],
        };
      }
      regularOrdersMap[orderId].products.push({
        product_id: item.product_id,
        name: item.product_name,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        total_revenue: (item.quantity * item.unit_price).toFixed(2),
      });
    });
    const regularOrders = Object.values(regularOrdersMap);

    const totalRegularRevenue = regularOrders.reduce(
      (acc, order) => acc + order.total_price,
      0
    );

    const { data: groupItemsData, error: groupError } = await supabase.rpc(
      "get_group_provider_participant_items12",
      {
        p_provider_id: providerId,
        p_start_date: pStartDate,
        p_end_date: pEndDate,
      }
    );

    if (groupError) {
      return res.status(500).json({
        message: "Failed to fetch group order participant items",
        error: groupError,
      });
    }

    const filteredGroupItems = groupItemsData.map((item) => ({
      participant_id: item.participant_id,
      group_order_id: item.group_order_id,
      joined_at: item.joined_at,
      pickup_or_delivery: item.pickup_or_delivery,
      quantity: item.quantity,
      unit_price: parseFloat(item.unit_price),
      total_revenue: item.quantity * parseFloat(item.unit_price),
      product_id: item.product_id,
      product_name: item.product_name,
      total_price: parseFloat(item.total_price),
    }));

    const totalGroupRevenue = filteredGroupItems.reduce(
      (acc, item) => acc + item.total_price,
      0
    );

    const combinedRevenue = totalRegularRevenue + totalGroupRevenue;

    return res.status(200).json({
      revenue: {
        regular_orders: parseFloat(totalRegularRevenue.toFixed(2)),
        group_orders: parseFloat(totalGroupRevenue.toFixed(2)),
        total: parseFloat(combinedRevenue.toFixed(2)),
      },
      timeframe: month && year ? `${month}-${year}` : timeframe || "all",
      regular_orders: regularOrders,
      group_order_items: filteredGroupItems,
      orderCount: regularOrders.length + filteredGroupItems.length,
      invoice_recipient: providerName,
      invoice_email: providerEmail,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Revenue calculation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllProducerApplications,
  getProducerApplicationById,
  reviewProducerApplication,
  fetchApprovedProviders,
  getMonthlyProviderProfits,
};
