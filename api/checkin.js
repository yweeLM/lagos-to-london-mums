const REQUIRED_FIELDS = ["name", "location", "moved_from", "moved_when", "hangout"];
const ALL_FIELDS = [
  "name", "location", "moved_from", "moved_when", "children",
  "hobby", "work", "surprise", "hangout", "schooling", "referral", "more"
];

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mgawpzpb";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};

  for (const field of REQUIRED_FIELDS) {
    if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
      res.status(400).json({ error: `Missing required field: ${field}` });
      return;
    }
  }

  const accessToken = crypto.randomUUID();
  const row = { access_token: accessToken };
  for (const field of ALL_FIELDS) {
    row[field] = typeof body[field] === "string" ? body[field].trim() : null;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    res.status(500).json({ error: "Server not configured" });
    return;
  }

  try {
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/checkins`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(row)
    });

    if (!insertRes.ok) {
      const detail = await insertRes.text();
      console.error("Supabase insert failed:", insertRes.status, detail);
      res.status(502).json({ error: "Could not save check-in" });
      return;
    }
  } catch (err) {
    console.error("Supabase insert error:", err);
    res.status(502).json({ error: "Could not save check-in" });
    return;
  }

  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(row)
    });
  } catch (err) {
    console.error("Formspree notify failed (non-fatal):", err);
  }

  res.setHeader(
    "Set-Cookie",
    `llm_access=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`
  );
  res.status(200).json({ ok: true });
};
