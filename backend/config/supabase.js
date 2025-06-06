const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase environment variables");
} else {
  console.log(
    "✅ Supabase client initialized with provided environment variables"
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
