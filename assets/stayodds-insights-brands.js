/* Insights page: tabs for each hotel brand and hotel group (Marriott, Hilton, Hyatt, IHG, Accor).
   "All hotels" is the page as it was; a brand tab swaps in that brand's own insights, loaded from
   /insights/brands/<key>.json. The address keeps the tab (#brand=four-seasons) so links and shares open it. */
(function () {
  var wrap = document.querySelector(".gi .wrap");
  var header = wrap && wrap.querySelector("header");
  if (!wrap || !header) return;
  var BASE = "/insights/brands/";
  var general = [].slice.call(wrap.querySelectorAll("section.panel"));
  var css = document.createElement("style");
  css.textContent =
    ".so-btabs{display:flex;flex-direction:column;gap:8px;margin:2px 0 0}" +
    ".so-btabs-row{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;scrollbar-width:thin;-webkit-overflow-scrolling:touch}" +
    ".so-btabs-lbl{font-size:11.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}" +
    ".so-btab{flex:none;display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--line);background:#fff;color:var(--ink);border-radius:999px;padding:8px 13px;font:600 13.5px/1 inherit;cursor:pointer;white-space:nowrap}" +
    ".so-btab small{font-weight:700;color:var(--muted);font-size:11.5px}" +
    ".so-btab:hover{border-color:#E8501A}" +
    ".so-btab[aria-selected=true]{background:#E8501A;border-color:#E8501A;color:#fff}.so-btab[aria-selected=true] small{color:#fff}" +
    ".so-brand{display:grid;gap:22px;grid-template-columns:minmax(0,1fr)}.so-brand>section{min-width:0}.so-row[hidden]{display:none}" +
    ".so-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}" +
    ".so-stat{border:1px solid var(--line);border-radius:14px;padding:14px 16px}" +
    ".so-stat b{display:block;font-weight:800;font-size:28px;line-height:1.05}.so-stat span{font-size:13px;color:var(--ink2)}" +
    ".so-rows{display:grid;gap:6px}" +
    ".so-row{display:grid;grid-template-columns:28px minmax(0,1fr) 120px 44px;align-items:center;gap:10px;font-size:14px}" +
    ".so-row .r{color:var(--muted);font-weight:700;text-align:right}.so-row a{color:var(--ink);font-weight:600;text-decoration:none}.so-row a:hover{color:#C2410C}" +
    ".so-row .w{display:block;font-size:12px;color:var(--ink2);font-weight:400}" +
    ".so-row .bar{height:10px;background:var(--track);border-radius:6px;position:relative}.so-row .bar i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:#E8501A}" +
    ".so-row .s{font-weight:800;text-align:right}" +
    ".so-chip{display:inline-block;font-size:11px;font-weight:600;padding:2px 7px;border-radius:99px;background:var(--accent-soft);margin:3px 4px 0 0}" +
    ".so-chip.k{background:#EEF2F6}" +
    ".so-more{margin-top:10px;border:1.5px solid var(--line);background:#fff;border-radius:999px;padding:8px 14px;font:600 13px inherit;cursor:pointer}" +
    "@media (max-width:560px){.so-row{grid-template-columns:24px minmax(0,1fr) 40px}.so-row .bar{display:none}}";
  document.head.appendChild(css);

  var tabsBox = document.createElement("div"); tabsBox.className = "so-btabs";
  tabsBox.setAttribute("role", "tablist"); tabsBox.setAttribute("aria-label", "Insights by brand");
  header.parentNode.insertBefore(tabsBox, header.nextSibling);
  var view = document.createElement("div"); view.className = "so-brand"; view.hidden = true;
  tabsBox.parentNode.insertBefore(view, tabsBox.nextSibling);

  var idx = null, btns = {};
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function ord(n) { var s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function fmt(x) { return String(Number((+x).toFixed(1))); }
  function n(x) { return (+x).toLocaleString("en-GB"); }
  function link(h) { return '<a href="/stayodds/' + esc(h.id) + '/">' + esc(h.name) + "</a>"; }
  function bar(v, lo) { lo = lo || 70; var p = Math.max(2, Math.min(100, (v - lo) / (100 - lo) * 100)); return '<span class="bar"><i style="width:' + p.toFixed(1) + '%"></i></span>'; }
  function panel(eyebrow, title, sub, body, id) {
    return '<section class="panel" data-brand-panel="1"><div class="eyebrow" id="' + id + '">' + esc(eyebrow) + "</div><h2>" + esc(title) +
      "</h2>" + (sub ? '<p class="sub">' + sub + "</p>" : "") + body + "</section>";
  }

  function render(key, d) {
    var nm = d.name.replace(" (all brands)", ""), out = [];
    var group = d.kind === "group";
    // 1. at a glance
    var stats = '<div class="so-stats">' +
      '<div class="so-stat"><b>' + fmt(d.median) + '</b><span>typical guest score (median of ' + d.n + " hotels)</span></div>" +
      (d.place ? '<div class="so-stat"><b>' + ord(d.place.rank) + '</b><span>of ' + d.place.of + " brands on StayOdds, by typical guest score</span></div>" : "") +
      '<div class="so-stat"><b>' + d.min + "–" + d.max + '</b><span>lowest to highest-rated hotel</span></div>' +
      (d.local && d.local.n ? '<div class="so-stat"><b>' + d.local.topQuarter + " of " + d.local.n + '</b><span>hotels in the top quarter of their own area</span></div>' : "") +
      (d.water ? '<div class="so-stat"><b>' + Math.round(d.water.free / d.water.n * 100) + '%</b><span>give free bottled water (' + d.water.free + " of " + d.water.n + " checked)</span></div>" : "") +
      "</div>";
    var aw = d.awards || {};
    var awNote = aw["with"] && aw.without ? '<p class="note"><b>Awards:</b> ' + aw["with"].n + " award-winning " + esc(nm) + " hotels have a typical guest score of " + fmt(aw["with"].median) +
      ", against " + fmt(aw.without.median) + " for its " + aw.without.n + " hotels without a major award.</p>" : "";
    out.push(panel(group ? "Hotel group" : "Brand", nm + ": how guests rate it", "Every number uses " + esc(nm) + " hotels with a guest score from 20 or more reviews.", stats + awNote, "b-" + key + "-overview"));
    // 2. group members
    if (group && d.members) {
      out.push(panel("Brands in " + nm, "Which " + esc(nm) + " brand do guests rate highest?", "Typical guest score of each brand in the group.",
        '<div class="so-rows">' + d.members.map(function (m, i) {
          return '<div class="so-row"><span class="r">' + (i + 1) + "</span><span>" + esc(m.brand) + '<span class="w">' + m.n + " hotels · " + m.min + "–" + m.max + "</span></span>" + bar(m.median) + '<span class="s">' + fmt(m.median) + "</span></div>";
        }).join("") + "</div>", "b-" + key + "-members"));
    }
    // 3. league table
    var rows = d.hotels.map(function (h, i) {
      var chips = (h.local ? '<span class="so-chip k">' + ord(h.local.rank) + " of " + h.local.of + " in " + esc(h.local["in"]) + "</span>" : "") +
        (h.awards || []).map(function (a) { return '<span class="so-chip">' + esc(a) + "</span>"; }).join("") +
        (h.ours != null ? '<span class="so-chip">Our stay ' + h.ours + "</span>" : "");
      return '<div class="so-row"' + (i >= 15 ? ' data-more hidden' : "") + '><span class="r">' + (i + 1) + "</span><span>" + link(h) + '<span class="w">' + esc(h.where) + " · " + n(h.rc) + " reviews" + (group ? " · " + esc(h.brand) : "") + "</span>" + chips + "</span>" + bar(h.g) + '<span class="s">' + h.g + "</span></div>";
    }).join("");
    var more = d.hotels.length > 15 ? '<button type="button" class="so-more" data-more-btn>Show all ' + d.hotels.length + " hotels</button>" : "";
    out.push(panel("Every hotel", "Every " + esc(nm) + " hotel, ranked by guests", "Guest score out of 100. The grey tag is where it ranks among all StayOdds hotels in its area.", '<div class="so-rows">' + rows + "</div>" + more, "b-" + key + "-ranked"));
    // 4. countries
    if (d.countries && d.countries.length >= 2) {
      out.push(panel("Destinations", "Where " + esc(nm) + " guests are happiest", "Typical guest score by country (countries with 2 or more rated hotels).",
        '<div class="so-rows">' + d.countries.map(function (c, i) {
          return '<div class="so-row"><span class="r">' + (i + 1) + "</span><span>" + esc(c.country) + '<span class="w">' + c.n + " hotels</span></span>" + bar(c.median) + '<span class="s">' + fmt(c.median) + "</span></div>";
        }).join("") + "</div>", "b-" + key + "-countries"));
    }
    // 5. price
    if (d.bands && d.bands.length >= 2) {
      out.push(panel("Price and value", "Does a pricier " + esc(nm) + " mean happier guests?", "Typical guest score at each price level (from our latest nightly price checks).",
        '<div class="so-rows">' + d.bands.map(function (b) {
          return '<div class="so-row"><span class="r"></span><span>' + esc(b.band) + '<span class="w">' + b.n + " hotels</span></span>" + bar(b.median) + '<span class="s">' + fmt(b.median) + "</span></div>";
        }).join("") + "</div>", "b-" + key + "-price"));
    }
    // 6. nearby hotels rated higher
    if (d.beaten && d.beaten.length) {
      var bt = d.beaten.slice().sort(function (a, b) { return (b.beaten.g - b.g) - (a.beaten.g - a.g); }).slice(0, 8);
      out.push(panel("Local rivals", "Where a nearby hotel beats " + esc(nm), d.beaten.length + " of " + d.n + " " + esc(nm) + " hotels have a hotel nearby, at the same price or less, that guests rate at least 2 points higher. The biggest gaps:",
        '<div class="ideas">' + bt.map(function (h) {
          return '<div class="idea"><h3>' + (h.beaten.g - h.g) + ' points</h3><p>' + link(h) + " " + h.g + "<br>" + '<a href="/stayodds/' + esc(h.beaten.id) + '/">' + esc(h.beaten.name) + "</a> " + h.beaten.g + "</p></div>";
        }).join("") + "</div>", "b-" + key + "-rivals"));
    }
    // 7. our stays
    if (d.ours && d.ours.length) {
      out.push(panel("Our stays vs guests", "The " + esc(nm) + " hotels we filmed", "Our own score from the stay next to the guests' score.",
        '<div class="so-rows">' + d.ours.map(function (h, i) {
          var gap = h.ours - h.g;
          return '<div class="so-row"><span class="r">' + (i + 1) + "</span><span>" + link(h) + '<span class="w">Guests ' + h.g + " · us " + h.ours + "</span></span>" + bar(h.ours) + '<span class="s">' + (gap > 0 ? "+" : "") + gap + "</span></div>";
        }).join("") + "</div>", "b-" + key + "-ours"));
    }
    // 8. Telegraph
    if (d.tel && d.tel.length) {
      out.push(panel("The critics", "The Telegraph vs guests on " + esc(nm), "The Telegraph's score (out of 10, shown ×10) next to the guests'.",
        '<div class="so-rows">' + d.tel.map(function (h, i) {
          var gap = h.tel - h.g;
          return '<div class="so-row"><span class="r">' + (i + 1) + "</span><span>" + link(h) + '<span class="w">Guests ' + h.g + " · Telegraph " + h.tel / 10 + "/10</span></span>" + bar(h.tel) + '<span class="s">' + (gap > 0 ? "+" : "") + gap + "</span></div>";
        }).join("") + "</div>", "b-" + key + "-telegraph"));
    }
    view.innerHTML = out.join("");
    var mb = view.querySelector("[data-more-btn]");
    if (mb) mb.addEventListener("click", function () {
      [].forEach.call(view.querySelectorAll("[data-more]"), function (r) { r.hidden = false; }); mb.remove();
    });
    if (window.soAddInsightShare) [].forEach.call(view.querySelectorAll("section.panel"), function (s) {
      window.soAddInsightShare(s, location.origin + "/insights/#brand=" + key);
    });
  }

  function select(key, push) {
    Object.keys(btns).forEach(function (k) { btns[k].setAttribute("aria-selected", k === key ? "true" : "false"); });
    var all = key === "all";
    general.forEach(function (s) { s.hidden = !all; });
    view.hidden = all;
    if (push) history.replaceState(null, "", all ? location.pathname : "#brand=" + key);
    if (all) return;
    view.innerHTML = '<section class="panel"><p class="sub">Loading…</p></section>';
    fetch(BASE + key + ".json").then(function (r) { return r.json(); }).then(function (d) { render(key, d); },
      function () { view.innerHTML = '<section class="panel"><p class="sub">Couldn’t load this brand. Please try again.</p></section>'; });
  }
  function chip(key, label, count) {
    var b = document.createElement("button"); b.type = "button"; b.className = "so-btab"; b.setAttribute("role", "tab");
    b.textContent = label;
    if (count) { var s = document.createElement("small"); s.textContent = count; b.appendChild(s); }
    b.addEventListener("click", function () { select(key, true); });
    btns[key] = b; return b;
  }
  function row(label, items) {
    var l = document.createElement("div"); l.className = "so-btabs-lbl"; l.textContent = label;
    var r = document.createElement("div"); r.className = "so-btabs-row";
    items.forEach(function (x) { r.appendChild(x); });
    tabsBox.appendChild(l); tabsBox.appendChild(r);
  }
  fetch(BASE + "index.json").then(function (r) { return r.json(); }).then(function (d) {
    idx = d;
    row("Hotel groups", [chip("all", "All hotels")].concat(d.groups.map(function (k) { return chip(k, d.tabs[k].name.replace(" (all brands)", ""), d.tabs[k].n); })));
    row("Brands", d.order.map(function (k) { return chip(k, d.tabs[k].name, d.tabs[k].n); }));
    var m = location.hash.match(/brand=([a-z0-9-]+)/);
    select(m && d.tabs[m[1]] ? m[1] : "all", false);
    if (m && d.tabs[m[1]]) btns[m[1]].scrollIntoView({ block: "nearest", inline: "center" });
  }).catch(function () { tabsBox.remove(); view.remove(); });
})();
