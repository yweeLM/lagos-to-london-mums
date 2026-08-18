const topicGroups = [
  ["MAIN", "LLMUK Main Group", "https://chat.whatsapp.com/HCtOwOmYKhk5raloKMY3GX"],
  ["BUS", "Business", "https://chat.whatsapp.com/JkSoyg6IrAL8gLwbHKEngW"],
  ["SCH", "Schools / Education", "https://chat.whatsapp.com/GtC4nDNIjcW0s2sDJWD57v"],
  ["JOB", "Jobs / Career", "https://chat.whatsapp.com/LZRaTxXh90o7kO9S7Sfwbt"],
  ["HOU", "Housing", "https://chat.whatsapp.com/Gm0n2XVQ1fM3Alj2fmFahc"],
  ["EVT", "Events", "https://chat.whatsapp.com/IypKHV0uxMKJ5cULQYd7aR"],
  ["BIB", "Bible Study &amp; Prayer", "https://chat.whatsapp.com/FCGpNTM3swH3Ry5IRaz40r"],
  ["MEN", "Menopause", "https://chat.whatsapp.com/HyvXQB8ojI32xu4cWYiXR"],
  ["LKD", "LinkedIn", "https://chat.whatsapp.com/JV4IVdNIBBy1hp1hDp1bdn"],
  ["FOD", "Foodie", "https://chat.whatsapp.com/Biv9yW1zS2C8BM1y48YHoM"],
  ["BDY", "Celebrating Birthdays", "https://chat.whatsapp.com/ENmqU4EwXpCAYtB4Kj3eb3"],
  ["MUM", "New Mums", "https://chat.whatsapp.com/LtdcEjcxodE9pBlPTDnHgB"],
  ["A.I", "AI", "https://chat.whatsapp.com/HCkz0iMeK66LcaMPlLjnpy?mode=gi_t"],
  ["UNI", "Parents w/ Uni Children", "https://chat.whatsapp.com/Gs8N6t0WWSVA0BWH0jzC2r?mode=gi_t"],
  ["SEN", "SEND Group", "https://chat.whatsapp.com/BcD26x0UdclEWxnp7SsOmn?mode=gi_t"]
];

const areaGroups = [
  ["SCT", "Scotland", "https://chat.whatsapp.com/J5PASphOO7jBd6dYeNcdoZ"],
  ["WAL", "Wales", "https://chat.whatsapp.com/LgvZkOY0jnbDLOdRxaVwLl"],
  ["DEV", "Devon", "https://chat.whatsapp.com/DY1VFvqFXkR8VqCbIt0ZFk"],
  ["YRK", "Yorkshire &amp; the Humber", "https://chat.whatsapp.com/K43DTgogMSL068SkVRUa7b"],
  ["KEN", "Kent", "https://chat.whatsapp.com/GXEbAOIRZaV18DHSN4dHvc"],
  ["SUR", "Surrey / Environs", "https://chat.whatsapp.com/B8XxKLAFrS9Gt1wLQ4sJF6"],
  ["BHM", "Birmingham", "https://chat.whatsapp.com/EatReGLcqLdLNAisVLYMjz"],
  ["LDN", "London", "https://chat.whatsapp.com/BlCjvttnlfFKIafiiGT3s7"],
  ["MID", "Midlands", "https://chat.whatsapp.com/IsW5iDad9efBv5QuLDhL1Z"],
  ["OXF", "Oxford", "https://chat.whatsapp.com/FYG4wjyDCBX2QvhtpnLY2k"],
  ["CAM", "Cambridge", "https://chat.whatsapp.com/EW1RH2oz32BEysq7AObdl0"],
  ["ESX", "Essex", "https://chat.whatsapp.com/I52LMzDS56d8vtuvSiNQUv"],
  ["LIV", "Liverpool", "https://chat.whatsapp.com/Edb8fJdAZE14yVVAmVFx7a"]
];

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  });
  return out;
}

function renderBoard(rows) {
  const head = `<div class="board-head"><span>Gate</span><span>Destination</span><span>Status</span><span></span></div>`;
  const body = rows
    .map(
      ([code, name, link]) => `
      <div class="board-row">
        <span class="gate-code">${code}</span>
        <span class="dest-name">${name}</span>
        <span class="status">● Boarding</span>
        <a class="board-link" href="${link}" target="_blank" rel="noopener">Join →</a>
      </div>`
    )
    .join("");
  return head + body;
}

module.exports = async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies["llm_access"];

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!token || !supabaseUrl || !serviceRoleKey) {
    res.writeHead(302, { Location: "/" });
    res.end();
    return;
  }

  let verified = false;
  try {
    const lookupRes = await fetch(
      `${supabaseUrl}/rest/v1/checkins?access_token=eq.${encodeURIComponent(token)}&select=id&limit=1`,
      {
        headers: {
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`
        }
      }
    );
    if (lookupRes.ok) {
      const rows = await lookupRes.json();
      verified = Array.isArray(rows) && rows.length > 0;
    }
  } catch (err) {
    console.error("Supabase lookup error:", err);
  }

  if (!verified) {
    res.writeHead(302, { Location: "/" });
    res.end();
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lagos to London Mums — Arrivals</title>
<meta name="robots" content="noindex, nofollow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,900;1,9..144,600&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root{
    --navy-deep:#17324A; --navy:#1F425E; --navy-light:#2F5A7C; --navy-hair:#41708F;
    --cream:#F8EEDA; --cream-dim:#EDDDBA; --gold:#E0A94C; --gold-dark:#B9832A;
    --olive:#A9BC1E; --olive-dark:#7E8E16; --rust:#C1613F; --ink:#3A312E;
    --text:#F6EFDE; --text-muted:rgba(246,239,222,0.64); --text-faint:rgba(246,239,222,0.42);
    --serif:'Fraunces',Georgia,serif; --sans:'Inter',system-ui,-apple-system,sans-serif;
    --mono:'Space Mono',monospace; --radius:14px;
  }
  *{box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{margin:0; background:var(--navy-deep); color:var(--text); font-family:var(--sans); line-height:1.5; -webkit-font-smoothing:antialiased;}
  a{color:inherit;}
  :focus-visible{outline:2px solid var(--gold); outline-offset:3px;}
  .sky{position:fixed; inset:0; z-index:-1; background:
      radial-gradient(ellipse at 15% -10%, rgba(224,169,76,0.14), transparent 45%),
      radial-gradient(ellipse at 90% 10%, rgba(169,188,30,0.12), transparent 40%),
      var(--navy-deep);}
  .wrap{max-width:1040px; margin:0 auto; padding:0 24px;}
  .brandbar{display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; padding:26px 0 0;}
  .brand-lockup{display:flex; align-items:center; gap:14px;}
  .brand-lockup img{height:44px; width:auto; display:block;}
  .flag-chip{display:inline-flex; align-items:center; gap:7px; background:var(--navy); border:1px solid var(--navy-hair); border-radius:100px; padding:6px 12px 6px 8px; font-family:var(--mono); font-size:12px; font-weight:700; letter-spacing:0.06em; color:var(--text);}
  .flag-chip .flag{font-size:16px; line-height:1;}
  .brand-by{font-family:var(--mono); font-size:11.5px; color:var(--text-faint); letter-spacing:0.04em;}
  .brand-by a{color:var(--gold); text-decoration:none;}
  .brand-by a:hover{text-decoration:underline;}
  section{padding:64px 0;}
  .section-head{margin-bottom:32px;}
  .kicker{font-family:var(--mono); font-size:12px; letter-spacing:0.14em; text-transform:uppercase; color:var(--gold); margin-bottom:10px; display:flex; align-items:center; gap:10px;}
  .kicker::before{content:""; width:22px; height:1px; background:var(--gold);}
  h2{font-family:var(--serif); font-weight:600; font-size:clamp(24px,3.4vw,34px); margin:0 0 8px;}
  .section-desc{color:var(--text-muted); font-size:15.5px; max-width:60ch; margin:0;}
  .btn{font-family:var(--sans); font-weight:600; font-size:15px; padding:14px 26px; border-radius:100px; border:none; cursor:pointer; display:inline-flex; align-items:center; gap:10px; text-decoration:none; transition:transform .15s ease, box-shadow .15s ease;}
  .btn:hover{transform:translateY(-1px);}
  .btn-dark{background:var(--navy); color:var(--text);}
  .btn-dark:hover{background:var(--navy-light);}
  .stamp-banner{display:flex; align-items:center; gap:16px; padding:18px 22px; background:rgba(169,188,30,0.14); border:1px solid var(--olive); border-radius:var(--radius); margin-bottom:36px;}
  .stamp-badge{font-family:var(--mono); font-weight:700; font-size:12px; letter-spacing:0.08em; color:var(--olive); border:2px solid var(--olive); border-radius:8px; padding:6px 10px; transform:rotate(-6deg); white-space:nowrap;}
  .stamp-banner p{margin:0; font-size:14.5px; color:var(--text);}
  .stamp-banner p b{color:#D8E37C;}
  .doc-card{display:flex; justify-content:space-between; align-items:center; gap:20px; flex-wrap:wrap; background:var(--cream); color:var(--ink); border-radius:var(--radius); padding:26px 30px; margin-bottom:44px;}
  .doc-card h3{font-family:var(--serif); font-weight:600; font-size:20px; margin:0 0 6px;}
  .doc-card p{margin:0; font-size:14px; color:rgba(27,42,74,0.7); max-width:48ch;}
  .board{background:var(--navy-deep); border:1px solid var(--navy-hair); border-radius:var(--radius); overflow:hidden; margin-bottom:40px;}
  .board-head{display:grid; grid-template-columns:70px 1fr 130px 120px; padding:14px 24px; font-family:var(--mono); font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-faint); border-bottom:1px solid var(--navy-hair);}
  .board-row{display:grid; grid-template-columns:70px 1fr 130px 120px; align-items:center; padding:15px 24px; border-bottom:1px solid rgba(51,69,111,0.5); font-family:var(--mono); font-size:14px;}
  .board-row:last-child{border-bottom:none;}
  .board-row:hover{background:rgba(232,163,61,0.06);}
  .gate-code{color:var(--gold); font-weight:700; letter-spacing:0.04em;}
  .dest-name{font-family:var(--sans); font-size:14.5px; font-weight:500; color:var(--text);}
  .status{color:#D8E37C; font-size:12px; letter-spacing:0.06em;}
  .board-link{color:var(--text); text-decoration:none; font-size:12.5px; font-weight:700; border:1px solid var(--navy-hair); border-radius:100px; padding:7px 14px; display:inline-flex; align-items:center; gap:6px; justify-self:end; white-space:nowrap;}
  .board-link:hover{border-color:var(--gold); color:var(--gold);}
  @media (max-width:700px){ .board-head{display:none;} .board-row{grid-template-columns:1fr; gap:6px; padding:16px 20px;} .board-link{justify-self:start;} }
  .board-label{font-family:var(--mono); font-size:12px; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-faint); margin:0 0 12px 2px;}
  .desk{background:var(--navy); border:1px solid var(--navy-hair); border-radius:var(--radius); padding:clamp(24px,4vw,44px);}
  .resource-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:20px;}
  .resource-card{background:var(--cream); color:var(--ink); border-radius:var(--radius); padding:26px 24px; text-decoration:none; display:flex; flex-direction:column; transition:transform .15s ease, box-shadow .15s ease;}
  .resource-card:hover{transform:translateY(-3px); box-shadow:0 18px 34px -18px rgba(0,0,0,0.5);}
  .resource-icon{font-size:26px; margin-bottom:14px;}
  .resource-card h3{font-family:var(--serif); font-weight:600; font-size:17.5px; margin:0 0 8px;}
  .resource-card p{font-size:13.5px; color:rgba(58,49,46,0.72); margin:0 0 18px; flex:1;}
  .resource-cta{font-family:var(--mono); font-size:12px; font-weight:700; letter-spacing:0.04em; color:var(--gold-dark);}
  @media (max-width:760px){ .resource-grid{grid-template-columns:1fr;} }
  footer{padding:44px 0 60px; border-top:1px solid var(--navy-hair); margin-top:20px;}
  .footer-top{display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px; margin-bottom:18px;}
  .footer-brand{display:flex; align-items:center; gap:14px;}
  .footer-brand img{height:30px; width:auto; opacity:0.9;}
  .footer-brand p{margin:0; font-size:13px; color:var(--text-faint); font-family:var(--mono);}
  .footer-social{display:flex; gap:14px; flex-wrap:wrap;}
  .ig-link{display:inline-flex; align-items:center; gap:8px; text-decoration:none; color:var(--text); font-family:var(--mono); font-size:13px; font-weight:700; border:1px solid var(--navy-hair); border-radius:100px; padding:8px 16px;}
  .ig-link:hover{border-color:var(--gold); color:var(--gold);}
  .footer-fine{font-size:12px; color:var(--text-faint); font-family:var(--mono); margin:0;}
</style>
</head>
<body>
<div class="sky"></div>
<div class="wrap">

  <div class="brandbar">
    <div class="brand-lockup">
      <img src="/assets/logo.png" alt="LagosMums logo">
      <span class="flag-chip"><span class="flag">🇬🇧</span> UK</span>
    </div>
    <p class="brand-by">Created by <a href="https://www.instagram.com/lagosmums" target="_blank" rel="noopener">LagosMums</a></p>
  </div>

  <section id="arrivals" style="padding-top:48px;">
    <div class="section-head">
      <div class="kicker">Arrivals</div>
      <h2>You're cleared for boarding</h2>
      <p class="section-desc">Here's the community guidance and every gate — join whichever fit your world. Bookmark this page, it stays unlocked on this browser.</p>
    </div>

    <div class="stamp-banner">
      <div class="stamp-badge">✓ VERIFIED</div>
      <p><b>Check-in received.</b> Thanks for introducing yourself — an admin may follow up, but you're free to join every group below right away.</p>
    </div>

    <div class="doc-card">
      <div>
        <h3>Community guidelines</h3>
        <p>The house rules that keep this community safe, useful, and drama-free. Worth two minutes before you start posting.</p>
      </div>
      <a class="btn btn-dark" href="#guidelines">Read guidelines ↓</a>
    </div>

    <p class="board-label">Main &amp; topic gates</p>
    <div class="board">${renderBoard(topicGroups)}</div>

    <p class="board-label">Area-specific gates</p>
    <div class="board">${renderBoard(areaGroups)}</div>
  </section>

  <section id="guidelines">
    <div class="section-head">
      <div class="kicker">Terms of travel</div>
      <h2>Community guidelines</h2>
    </div>
    <div class="desk" style="font-size:15px; color:var(--text-muted);">
      <p style="color:var(--text); margin-top:0;">Thank you for continuing to keep this community safe and well managed 🙏🏾</p>
      <ul style="padding-left:20px; display:grid; gap:12px; margin:0;">
        <li>Share healthy and respectful conversation relating to life and settling in the UK.</li>
        <li>Feel free to introduce yourself when you join the group.</li>
        <li>Share information relevant to the specific group — events, religious, jobs, housing, etc. all have <em>subgroups</em>, see the directory above. You can <em>highlight</em> in the main group if you've shared something important in a subgroup.</li>
        <li>For the business group: when sharing your product or service, link to your catalogue, website, or socials. Don't share multiple pictures or videos.</li>
        <li>Complete your own due diligence and verification before engaging any service. LagosMums UK is a platform to foster community — we are <strong>not</strong> responsible for customer experience.</li>
        <li>Any dodgy or inaccurate information will be deleted by group admins.</li>
        <li>If you forward a video or link, share a note about it — don't forward without context. Videos without an intro will be deleted.</li>
        <li>No sale of currency.</li>
        <li>Safety is key. Verifying information and doing due diligence before engaging any service is the responsibility of each individual.</li>
      </ul>
    </div>
  </section>

  <section id="resources">
    <div class="section-head">
      <div class="kicker">Duty free</div>
      <h2>A few things to pick up before you go</h2>
      <p class="section-desc">Extra support from LagosMums for the move itself — a full relocation guide, one-to-one coaching, and a shopping list for everything you'll want once you land.</p>
    </div>

    <div class="resource-grid">
      <a class="resource-card" href="https://selar.com/ukrelocationguide" target="_blank" rel="noopener">
        <span class="resource-icon">📘</span>
        <h3>UK Relocation Guide</h3>
        <p>The full written guide to relocating — everything we wish someone had told us before we moved.</p>
        <span class="resource-cta">Get the guide →</span>
      </a>
      <a class="resource-card" href="https://calendar.app.google/45dr2eGUvpXswv6W6" target="_blank" rel="noopener">
        <span class="resource-icon">🗓️</span>
        <h3>Relocation &amp; School Selection Coaching</h3>
        <p>Book a 1:1 session to talk through your move and choosing the right schools for your children.</p>
        <span class="resource-cta">Book a session →</span>
      </a>
      <a class="resource-card" href="https://www.amazon.com/shop/lagosmums/list/55X2KGX6P7PB/?_encoding=UTF8&ref_=navm_hdr_signin" target="_blank" rel="noopener">
        <span class="resource-icon">🛍️</span>
        <h3>Amazon Shopping List</h3>
        <p>Curated picks worth ordering ahead — the things that make settling in easier from day one.</p>
        <span class="resource-cta">View the list →</span>
      </a>
    </div>
  </section>

  <footer>
    <div class="footer-top">
      <div class="footer-brand">
        <img src="/assets/logo.png" alt="LagosMums logo">
        <p>Lagos to London Mums Community · Made with care for the ones who moved.</p>
      </div>
      <div class="footer-social">
        <a class="ig-link" href="https://www.instagram.com/lagosmums" target="_blank" rel="noopener">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>
          <span>@lagosmums</span>
        </a>
        <a class="ig-link" href="https://www.instagram.com/lagosmumsuk" target="_blank" rel="noopener">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>
          <span>@lagosmumsuk</span>
        </a>
      </div>
    </div>
    <p class="footer-fine">LagosMums UK · created by LagosMums</p>
  </footer>

</div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store");
  res.status(200).send(html);
};
