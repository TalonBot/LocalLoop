const supabase = require("../../config/supabase");

const getCoupons = async (req, res) => {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};

const createCoupon = async (req, res) => {
  const { code, discount_percent, expires_at, usage_limit } = req.body;
  if (!code || !discount_percent) {
    return res
      .status(400)
      .json({ message: "Code and discount_percent required" });
  }
  const { data, error } = await supabase
    .from("coupons")
    .insert([
      {
        code,
        discount_percent,
        expires_at: expires_at || null,
        usage_limit: usage_limit || null,
      },
    ])
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json(data);
};

const updateCoupon = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from("coupons")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
};

const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return res.status(500).json({ message: error.message });
  res.status(204).end();
};

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
