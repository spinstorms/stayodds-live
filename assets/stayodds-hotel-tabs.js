/* Hotel pages: below the score, the details sit in four tab cards (Scores open first, Prices last).
   Each card shows its headline number from the page and a line on what's inside; on phones the
   cards stack as rows. The open card is orange. */
(function () {
  var fd = document.getElementById("full-details");
  if (!fd || !fd.parentNode) return;
  var TABS = [
    { key: "scores", label: "Scores", tip: "Our filmed stay, guests and critics side by side, and how it ranks against hotels nearby", pick: ["so2-three", "guest-rank"] },
    { key: "guests", label: "What guests say", tip: "What guests love, what to know, and every review source with how we weigh it", pick: ["so2-two", "more-reviews"] },
    { key: "before", label: "Before you book", tip: "Best months to go, the room to book, tips and similar hotels to compare", pick: ["so2-section"] },
    { key: "prices", label: "Prices", tip: "Live prices for your dates, holiday dates and partner sites", pick: ["so2-dates", "detail-ota-strip"] }
  ];
  function find(name) {
    return document.getElementById(name) || document.querySelector("." + name);
  }
  var panels = [], used = 0;
  TABS.forEach(function (t) {
    var p = document.createElement("div");
    p.className = "so-tab-panel"; p.id = "so-tab-" + t.key; p.setAttribute("role", "tabpanel"); p.hidden = true;
    t.pick.forEach(function (n) { var el = find(n); if (el && !p.contains(el)) { p.appendChild(el); used++; } });
    t.panel = p;
  });
  if (!used) return;
  // anything else that followed "Score explained" goes under Scores, so nothing is lost
  var el = fd.nextElementSibling;
  while (el) { var nx = el.nextElementSibling; if (/^(SECTION|DIV|DETAILS)$/.test(el.tagName) && el.offsetHeight > 30) TABS[0].panel.appendChild(el); el = nx; }
  // Headline number for each tab, read from the page, so every tab shows what it holds.
  var txt = document.body.innerText || "";
  function m(re) { var r = txt.match(re); return r ? r[1] : ""; }
  var ring = document.querySelector(".so2-verdict");
  var scoreB = ring && ring.previousElementSibling && ring.previousElementSibling.querySelector("b");
  var best = "";
  document.querySelectorAll(".detail-trip-tile").forEach(function (t) {
    var k = t.querySelector(".detail-trip-kicker"), v = t.querySelector(".detail-trip-val");
    if (!best && k && v && /best/i.test(k.textContent)) best = v.textContent.trim();
  });
  var price = m(/From\s+(£[\d,]+)\/nt/);
  var NUM = {
    scores: scoreB ? scoreB.textContent.trim() : "",
    guests: m(/([\d,]{2,}) guest reviews/) || m(/from ([\d,]{2,}) reviews/),
    before: best.length <= 12 ? best : "",
    prices: price
  };
  var SUB = {
    scores: "Our stay, guests and critics",
    guests: NUM.guests ? "guest reviews: what they love and warn about" : "What guests love and warn about",
    before: "Best months, room tips and good to know",
    prices: NUM.prices ? "a night, from. Pick dates for live prices" : "Pick dates for live prices"
  };
  var ICON = {
    scores: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    guests: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    before: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    prices: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>'
  };
  var css = document.createElement("style");
  css.textContent = ".so-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:10px 0 16px}" +
    ".so-tab{display:flex;flex-direction:column;align-items:flex-start;gap:5px;text-align:left;border:2px solid #EDE4D8;background:#fff;color:#1B1A17;border-radius:16px;padding:14px 16px;font:inherit;cursor:pointer;transition:border-color .15s,box-shadow .15s,transform .15s}" +
    ".so-tab:hover{border-color:#F2763F;box-shadow:0 8px 20px rgba(232,80,26,.12);transform:translateY(-1px)}" +
    ".so-tab .so-tab-h{display:flex;align-items:center;gap:8px;font-weight:700;font-size:15px}" +
    ".so-tab svg{width:20px;height:20px;flex:none;stroke:#C2410C}" +
    ".so-tab .so-tab-n{font-weight:800;font-size:28px;line-height:1.05}" +
    ".so-tab .so-tab-s{font-size:13px;line-height:1.35;color:#4A443C}" +
    ".so-tab .so-tab-o{font-size:13px;font-weight:700;color:#C2410C;margin-top:auto}" +
    ".so-tab[aria-selected=true]{background:#E8501A;border-color:#E8501A;color:#fff;box-shadow:0 10px 24px rgba(232,80,26,.25)}" +
    ".so-tab[aria-selected=true] svg{stroke:#fff}.so-tab[aria-selected=true] .so-tab-s{color:#fff}.so-tab[aria-selected=true] .so-tab-o{display:none}" +
    "@media (max-width:760px){.so-tabs{grid-template-columns:1fr;gap:6px}" +
    ".so-tab{display:grid;grid-template-columns:auto 1fr auto;grid-template-areas:'h h n' 's s n';align-items:center;column-gap:10px;row-gap:2px;padding:12px 14px;border-radius:12px}" +
    ".so-tab .so-tab-h{grid-area:h}.so-tab .so-tab-s{grid-area:s}.so-tab .so-tab-n{grid-area:n;font-size:22px}.so-tab .so-tab-o{display:none}}" +
    ".so-tab-note{display:none}.so-tab-panel>*{margin-top:0}";
  document.head.appendChild(css);
  var bar = document.createElement("div"); bar.className = "so-tabs"; bar.setAttribute("role", "tablist");
  var note = document.createElement("p"); note.className = "so-tab-note";
  var wrap = document.createElement("div"); wrap.className = "so-tabs-wrap";
  function show(i, scroll) {
    TABS.forEach(function (t, j) {
      t.btn.setAttribute("aria-selected", i === j ? "true" : "false");
      t.panel.hidden = i !== j;
    });
    if (scroll) wrap.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function span(cls, text) { var e = document.createElement("span"); e.className = cls; e.textContent = text; return e; }
  TABS.forEach(function (t, i) {
    var b = document.createElement("button"); b.type = "button"; b.className = "so-tab"; b.setAttribute("role", "tab");
    b.setAttribute("aria-controls", "so-tab-" + t.key); b.title = t.tip;
    var h = document.createElement("span"); h.className = "so-tab-h";
    h.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[t.key] + "</svg>";
    h.appendChild(span("", t.label)); b.appendChild(h);
    if (NUM[t.key]) b.appendChild(span("so-tab-n", NUM[t.key]));
    b.appendChild(span("so-tab-s", SUB[t.key]));
    b.appendChild(span("so-tab-o", "Open →"));
    t.btn = b;
    b.addEventListener("click", function () { show(i, false); });
    bar.appendChild(b);
  });
  wrap.appendChild(bar); wrap.appendChild(note);
  TABS.forEach(function (t) { wrap.appendChild(t.panel); });
  fd.parentNode.insertBefore(wrap, fd.nextSibling);
  show(0, false);
  // "Score explained below" and "Check prices" buttons open the right tab
  document.querySelectorAll('a[href="#full-details"]').forEach(function (a) { a.addEventListener("click", function () { show(0, false); }); });
  document.querySelectorAll("a[href='#so2-dates'], a[href='#dates']").forEach(function (a) {
    if (!a.closest(".so-tab-panel")) a.addEventListener("click", function (e) { e.preventDefault(); show(3, true); });
  });
  if (location.hash) {
    var target = document.querySelector(location.hash);
    var p = target && target.closest && target.closest(".so-tab-panel");
    if (p) TABS.forEach(function (t, i) { if (t.panel === p) show(i, false); });
  }
})();
