// Test database and Supabase connection
require("dotenv").config({ path: ".env.local" });

console.log("🔍 Checking configuration...\n");

// Check DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || dbUrl.includes("user:password@localhost")) {
  console.log("❌ DATABASE_URL not configured");
  console.log("   Current value:", dbUrl);
  console.log("\n📝 To fix:");
  console.log("   1. Go to your Supabase project");
  console.log("   2. Settings → Database");
  console.log('   3. Copy the "Connection string" (URI format)');
  console.log("   4. Update DATABASE_URL in .env.local");
  console.log(
    "   Example: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres\n",
  );
} else {
  console.log("✅ DATABASE_URL configured");
  console.log("   Host:", dbUrl.match(/@([^:]+)/)?.[1] || "unknown");
}

// Check Supabase URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl || supabaseUrl.includes("your-supabase-url")) {
  console.log("❌ NEXT_PUBLIC_SUPABASE_URL not configured");
} else {
  console.log("✅ NEXT_PUBLIC_SUPABASE_URL configured");
  console.log("   URL:", supabaseUrl);
}

// Check Supabase anon key
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseKey || supabaseKey.includes("your-supabase-anon-key")) {
  console.log("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not configured");
} else {
  console.log("✅ NEXT_PUBLIC_SUPABASE_ANON_KEY configured");
  console.log("   Key:", supabaseKey.substring(0, 20) + "...");
}

console.log("\n" + "=".repeat(50));

if (
  dbUrl &&
  !dbUrl.includes("user:password@localhost") &&
  supabaseUrl &&
  supabaseKey
) {
  console.log("✅ All configuration looks good!");
  console.log("\n🚀 Next steps:");
  console.log("   1. Run: npm run db:push");
  console.log("   2. Run: npm run db:seed");
  console.log("   3. Run: npm run dev");
} else {
  console.log("⚠️  Configuration incomplete");
  console.log("\nPlease update .env.local with your Supabase credentials");
}
