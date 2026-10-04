import { neon } from "@neondatabase/serverless";

const databaseUrl = "postgresql://neondb_owner:npg_r5nLq8Julwac@ep-bold-truth-b23b75qe-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(databaseUrl);

async function init() {
  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS solar_leads (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        property_type VARCHAR(50) DEFAULT 'residencial',
        monthly_bill VARCHAR(50),
        planned_budget VARCHAR(80),
        timeline VARCHAR(80),
        location VARCHAR(100),
        status VARCHAR(30) DEFAULT 'nova',
        notes TEXT DEFAULT '',
        estimated_savings_annual NUMERIC,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await sql.query(`
      ALTER TABLE solar_leads ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'nova';
    `);
    await sql.query(`
      ALTER TABLE solar_leads ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
    `);
    await sql.query(`
      ALTER TABLE solar_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    `);

    const count = await sql.query("SELECT COUNT(*) as total FROM solar_leads");
    console.log("Database initialized successfully! Total leads in DB:", count);
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}

init();
