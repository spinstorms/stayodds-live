/* Insights page: a Share button on every insight. It makes a branded share card (PNG) of that insight
   to post or save, or copies a link straight to it. The image library loads only when someone shares. */
(function () {
  var sections = [].slice.call(document.querySelectorAll("section.panel")).filter(function (s) {
    return s.querySelector("h2") && !/for hotels/i.test(s.getAttribute("aria-label") || "");
  });
  if (!sections.length) return;
  var LIB = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
  var css = document.createElement("style");
  css.textContent = "section.panel{position:relative}" +
    ".so-share{position:absolute;top:16px;right:16px;display:flex;gap:6px;z-index:5}" +
    ".so-share button{display:inline-flex;align-items:center;gap:6px;border:1.5px solid #EDE4D8;background:#fff;color:#1B1A17;border-radius:999px;padding:7px 12px;font:600 13px/1 inherit;cursor:pointer}" +
    ".so-share button:hover{border-color:#E8501A;color:#C2410C}" +
    ".so-share .so-share-main{background:#E8501A;border-color:#E8501A;color:#fff}.so-share .so-share-main:hover{background:#C2410C;color:#fff}" +
    ".so-share svg{width:15px;height:15px}" +
    "section.panel>h2,section.panel>.eyebrow{padding-right:210px}" +
    "@media (max-width:640px){.so-share{position:static;margin:0 0 10px;justify-content:flex-end}section.panel>h2,section.panel>.eyebrow{padding-right:0}}" +
    ".so-share-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#1B1A17;color:#fff;padding:10px 16px;border-radius:999px;font:600 14px/1.2 inherit;z-index:9999}";
  document.head.appendChild(css);

  var ICON_SHARE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/></svg>';
  var ICON_LINK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>';

  function toast(msg) {
    var t = document.createElement("div"); t.className = "so-share-toast"; t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2200);
  }
  function loadLib() {
    if (window.html2canvas) return Promise.resolve(window.html2canvas);
    return new Promise(function (ok, bad) {
      var s = document.createElement("script"); s.src = LIB; s.async = true;
      s.onload = function () { ok(window.html2canvas); }; s.onerror = bad; document.head.appendChild(s);
    });
  }
  function anchorOf(sec, i) {
    var el = sec.querySelector(".eyebrow[id]") || sec.querySelector("h2[id]");
    if (!el) { sec.id = sec.id || "insight-" + (i + 1); return sec.id; }
    return el.id;
  }
  function slug(t) { return (t || "insight").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50); }

  // The card: the insight itself on a white panel, with the StayOdds name above and the link below.
  function buildCard(sec) {
    var card = document.createElement("div");
    card.style.cssText = "position:fixed;left:-10000px;top:0;width:1080px;padding:56px;box-sizing:border-box;background:#F6EFE6;font-family:inherit;color:#1B1A17";
    var head = document.createElement("div");
    head.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:24px";
    head.innerHTML = '<div style="display:flex;align-items:center;gap:12px"><img src="/assets/stayodds-favicon-128.png" alt="" style="width:44px;height:44px"><span style="font-weight:800;font-size:28px">StayOdds<span style="color:#E8501A">.</span></span></div>' +
      '<span style="font-weight:700;font-size:16px;letter-spacing:2px;color:#C2410C">GUEST INSIGHTS</span>';
    var body = sec.cloneNode(true);
    [].forEach.call(body.querySelectorAll(".so-share, script, button"), function (n) { n.remove(); });
    body.style.cssText += ";margin:0;box-shadow:none;max-width:none;background:#FFFFFF;border-radius:24px;padding:36px;border:0";
    var foot = document.createElement("div");
    foot.style.cssText = "display:flex;justify-content:space-between;align-items:center;margin-top:22px;font-size:17px;font-weight:600;color:#4A443C";
    var date = (document.body.textContent.match(/updated\s+(\d{1,2}\s+\w+\s+\d{4})/i) || [])[1] || "";
    foot.innerHTML = "<span>stayodds.com/insights</span><span>" + (date ? "Guest scores from 20+ reviews · " + date : "Guest scores from 20+ reviews") + "</span>";
    card.appendChild(head); card.appendChild(body); card.appendChild(foot);
    document.body.appendChild(card);
    return card;
  }
  function makeImage(sec) {
    return loadLib().then(function (h2c) {
      var card = buildCard(sec);
      return h2c(card, { scale: 1, backgroundColor: "#F6EFE6", useCORS: true, logging: false }).then(function (canvas) {
        card.remove();
        return new Promise(function (ok) { canvas.toBlob(ok, "image/png"); });
      }, function (e) { card.remove(); throw e; });
    });
  }

  sections.forEach(function (sec, i) {
    var title = sec.querySelector("h2").textContent.trim();
    var url = location.origin + "/insights/#" + anchorOf(sec, i);
    var bar = document.createElement("div"); bar.className = "so-share";
    var main = document.createElement("button"); main.type = "button"; main.className = "so-share-main";
    main.innerHTML = ICON_SHARE + "<span>Share</span>"; main.title = "Share this insight as an image";
    var copy = document.createElement("button"); copy.type = "button";
    copy.innerHTML = ICON_LINK + "<span>Copy link</span>"; copy.title = "Copy a link to this insight";
    bar.appendChild(main); bar.appendChild(copy);
    sec.insertBefore(bar, sec.firstChild);

    copy.addEventListener("click", function () {
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(
        function () { toast("Link copied"); },
        function () { window.prompt("Copy this link", url); });
    });
    main.addEventListener("click", function () {
      var label = main.querySelector("span"), was = label.textContent;
      label.textContent = "Making image…"; main.disabled = true;
      makeImage(sec).then(function (blob) {
        var name = "stayodds-" + slug(title) + ".png";
        var file = new File([blob], name, { type: "image/png" });
        var text = title + " — StayOdds guest insights";
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          return navigator.share({ files: [file], title: text, text: text + " " + url }).catch(function () {});
        }
        var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        toast("Image saved");
      }).catch(function () {
        toast("Couldn't make the image, so the link was copied instead");
        if (navigator.clipboard) navigator.clipboard.writeText(url);
      }).then(function () { label.textContent = was; main.disabled = false; });
    });
  });
})();
