import { neon } from "@neondatabase/serverless";

const databaseUrl = "postgresql://neondb_owner:npg_r5nLq8Julwac@ep-bold-truth-b23b75qe-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(databaseUrl);

async function runMigration() {
  try {
    console.log("Checking and migrating database...");

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
        assigned_to VARCHAR(64),
        assigned_name VARCHAR(255),
        assigned_at TIMESTAMPTZ,
        estimated_savings_annual NUMERIC,
        closed_value NUMERIC,
        commission_value NUMERIC,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await sql.query(`ALTER TABLE solar_leads ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(64);`);
    await sql.query(`ALTER TABLE solar_leads ADD COLUMN IF NOT EXISTS assigned_name VARCHAR(255);`);
    await sql.query(`ALTER TABLE solar_leads ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;`);
    await sql.query(`ALTER TABLE solar_leads ADD COLUMN IF NOT EXISTS closed_value NUMERIC;`);
    await sql.query(`ALTER TABLE solar_leads ADD COLUMN IF NOT EXISTS commission_value NUMERIC;`);

    await sql.query(`
      CREATE TABLE IF NOT EXISTS solar_crm_users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(30) DEFAULT 'vendedor',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const cols = await sql.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'solar_leads';`);
    console.log("Columns in solar_leads:", cols.map(c => c.column_name));
    
    const users = await sql.query(`SELECT * FROM solar_crm_users;`);
    console.log("Users in solar_crm_users:", users);
  } catch (err) {
    console.error("Migration error:", err);
  }
}

runMigration();

