const supabase = require("../../config/supabase");
const getAllProducerApplications = async (req, res) => {
  const { data, error } = await supabase
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

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json(data);
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

  const { error } = await supabase
    .from("producer_applications")
    .update({
      status,
      admin_notes,
      reviewed_at: new Date(),
    })
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: `Application ${status}` });
};

module.exports = {
  getAllProducerApplications,
  getProducerApplicationById,
  reviewProducerApplication,
};
