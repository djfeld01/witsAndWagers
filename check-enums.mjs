import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkEnums() {
  try {
    const client = await pool.connect();

    // Check if enums exist
    const result = await client.query(`
      SELECT t.typname as enum_name, e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      ORDER BY t.typname, e.enumsortorder;
    `);

    console.log("Enums in database:");
    if (result.rows.length === 0) {
      console.log("  (no enums found)");
    } else {
      let currentEnum = "";
      result.rows.forEach((row) => {
        if (row.enum_name !== currentEnum) {
          console.log(`\n  ${row.enum_name}:`);
          currentEnum = row.enum_name;
        }
        console.log(`    - ${row.enum_value}`);
      });
    }

    client.release();
    await pool.end();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkEnums();
