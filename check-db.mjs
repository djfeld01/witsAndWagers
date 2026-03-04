import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDatabase() {
  try {
    console.log("Testing connection...");
    const client = await pool.connect();
    console.log("✓ Connected to database");

    // Check if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("\nTables in database:");
    if (result.rows.length === 0) {
      console.log("  (no tables found - database is empty)");
    } else {
      result.rows.forEach((row) => {
        console.log(`  - ${row.table_name}`);
      });
    }

    client.release();
    await pool.end();
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
}

checkDatabase();
