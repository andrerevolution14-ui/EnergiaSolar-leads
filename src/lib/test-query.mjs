import { neon } from "@neondatabase/serverless";

const databaseUrl = "postgresql://neondb_owner:npg_r5nLq8Julwac@ep-bold-truth-b23b75qe-pooler.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(databaseUrl);

async function testQuery() {
  const leads = await sql.query("SELECT id, name, status, assigned_to, assigned_name FROM solar_leads LIMIT 5;");
  console.log("Found leads in DB:", leads);
}

testQuery();

