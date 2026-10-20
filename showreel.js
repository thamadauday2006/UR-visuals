/* =========================================================================
   UR VISUALS – auto-playing reel strip
   Videos play by themselves (muted) and glide across the page.
   Tap a reel to watch it full screen with sound.

   HOW TO ADD VIDEOS (no coding needed)
   1. Make a folder called  videos  in your GitHub repo.
   2. Upload your videos into it, named  1.mp4, 2.mp4, 3.mp4 ...
   3. That's it. The strip finds them by itself.

   OR, to give each video a name and category, list them below.
   (If this list has anything in it, the numbered files are ignored.)
   ========================================================================= */

(function () {
  "use strict";

  /* ---------- SETTINGS (safe to edit) ---------- */
  var VIDEOS = [
    // {src:"videos/saree.mp4", title:"Saree launch", cat:"Boutique"},
    // {src:"videos/wedding1.mp4", title:"Priya & Raj", cat:"Wedding Shoots"},
  ];
  var AUTO_COUNT = 24;      // how many numbered files to look for: videos/1.mp4 ... videos/24.mp4
  var DIRECTION  = "right"; // "right" = videos move left to right, "left" = right to left
  var SPEED      = 70;      // how fast they move, in pixels per second
  var HEADING_1  = "Our";
  var HEADING_2  = "reels";
  var SUBTEXT    = "Shot on iPhone. Tap any reel to watch it with sound.";
  /* --------------------------------------------- */

  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var CSS = [
    ".sr-sec{background:#0d0d0d;color:#fff;padding:56px 0 60px;overflow:hidden}",
    ".sr-w{max-width:1080px;margin:0 auto;padding:0 18px 22px}",
    ".sr-w h2{margin:0 0 6px;font-size:clamp(1.6rem,4vw,2.2rem);letter-spacing:-.01em;color:#fff}",
    ".sr-w h2 span{color:var(--or,#ff6a00)}",
    ".sr-w p{margin:0;color:#8b8b8b}",
    ".sr-view{--srh:360px;position:relative;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}",
    "@media(max-width:600px){.sr-view{--srh:290px}.sr-sec{padding:44px 0 48px}}",
    ".sr-load{height:var(--srh);display:grid;place-items:center;color:#8b8b8b;font-size:.9rem}",
    ".sr-track{display:flex;width:max-content;will-change:transform}",
    ".sr-track.sr-r{animation:sr-right linear infinite}",
    ".sr-track.sr-l{animation:sr-left linear infinite}",
    "@keyframes sr-right{from{transform:translate3d(-50%,0,0)}to{transform:translate3d(0,0,0)}}",
    "@keyframes sr-left{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}",
    ".sr-view:hover .sr-track,.sr-open .sr-track{animation-play-state:paused}",
    ".sr-group{display:flex;gap:14px;padding-right:14px}",
    ".sr-card{position:relative;flex:none;height:var(--srh);aspect-ratio:var(--r,.5625);border-radius:16px;overflow:hidden;background:#242424;cursor:pointer;outline-offset:3px;transition:box-shadow .2s}",
    ".sr-card:hover,.sr-card:focus-visible{box-shadow:0 14px 30px rgba(255,106,0,.3)}",
    ".sr-card video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}",
    ".sr-cap{position:absolute;left:0;right:0;bottom:0;padding:34px 12px 12px;background:linear-gradient(transparent,rgba(0,0,0,.8))}",
    ".sr-cap small{display:block;color:var(--or,#ff6a00);font-weight:700;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase}",
    ".sr-cap b{font-size:.9rem;line-height:1.25}",
    ".sr-modal{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.92);display:grid;place-items:center;padding:16px}",
    ".sr-modal[hidden]{display:none}",
    ".sr-modal video{max-width:92vw;max-height:86vh;border-radius:14px;background:#000;display:block}",
    ".sr-x{position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:14px;width:44px;height:44px;border-radius:50%;border:0;background:var(--or,#ff6a00);color:#0d0d0d;font-size:1.1rem;font-weight:800;cursor:pointer}",
    "@media(prefers-reduced-motion:reduce){.sr-track{animation:none!important}.sr-view{overflow-x:auto}}"
  ].join("\n");

  function el(tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; return n; }

  /* Is this video file really there and playable in this browser? */
  function probe(item) {
    return new Promise(function (resolve) {
      var v = document.createElement("video"), done = false, timer;
      function finish(ok) {
        if (done) return; done = true; clearTimeout(timer);
        if (ok) { item.w = v.videoWidth; item.h = v.videoHeight; }
        v.removeAttribute("src"); try { v.load(); } catch (e) {}
        resolve(ok ? item : null);
      }
      timer = setTimeout(function () { finish(false); }, 12000);
      v.preload = "metadata"; v.muted = true; v.setAttribute("playsinline", "");
      v.onloadedmetadata = function () { finish(v.videoWidth > 0); };
      v.onerror = function () { finish(false); };
      v.src = item.src;
    });
  }

  function start() {
    var st = el("style"); st.textContent = CSS; document.head.appendChild(st);

    /* section */
    var sec = el("section", "sr-sec"); sec.id = "reels";
    var head = el("div", "sr-w");
    var h2 = el("h2"); h2.appendChild(document.createTextNode(HEADING_1 + " "));
    var sp = el("span"); sp.textContent = HEADING_2; h2.appendChild(sp);
    var sub = el("p"); sub.textContent = SUBTEXT;
    head.appendChild(h2); head.appendChild(sub);
    var view = el("div", "sr-view");
    var load = el("div", "sr-load"); load.textContent = "Loading reels…"; view.appendChild(load);
    sec.appendChild(head); sec.appendChild(view);

    var anchor = document.getElementById("work");
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor);
    else {
      var hero = document.querySelector(".hero");
      if (hero && hero.parentNode) hero.parentNode.insertBefore(sec, hero.nextSibling);
      else document.body.insertBefore(sec, document.body.firstChild);
    }

    /* modal (tap a reel -> full screen with sound) */
    var modal = el("div", "sr-modal"); modal.hidden = true;
    modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true"); modal.setAttribute("aria-label", "Video player");
    var xb = el("button", "sr-x"); xb.type = "button"; xb.textContent = "✕"; xb.setAttribute("aria-label", "Close video");
    var stage = el("div"); modal.appendChild(xb); modal.appendChild(stage); document.body.appendChild(modal);
    var lastFocus = null;
    function openV(it) {
      lastFocus = document.activeElement;
      stage.innerHTML = "";
      var v = document.createElement("video");
      v.src = it.src; v.controls = true; v.autoplay = true; v.setAttribute("playsinline", ""); v.loop = true;
      stage.appendChild(v);
      modal.hidden = false; document.body.classList.add("sr-open"); document.body.style.overflow = "hidden";
      var p = v.play(); if (p && p.catch) p.catch(function () {});
      xb.focus();
    }
    function closeV() {
      stage.innerHTML = ""; modal.hidden = true;
      document.body.classList.remove("sr-open"); document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    xb.onclick = closeV;
    modal.addEventListener("click", function (e) { if (e.target === modal) closeV(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) closeV(); });

    /* play only what's on screen, so phones don't struggle */
    var visible = new Set(), io = null;
    function play(v) { if (REDUCE) return; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    function makeObserver() {
      if (io) io.disconnect();
      visible.clear();
      if (!("IntersectionObserver" in window)) return null;
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { visible.add(en.target); play(en.target); }
          else { visible.delete(en.target); en.target.pause(); }
        });
      }, { threshold: 0, rootMargin: "0px 160px 0px 160px" });
      return io;
    }
    /* some phones (Low Power Mode) only allow autoplay after a first touch */
    function kick() { visible.forEach(play); }
    ["touchstart", "click", "scroll"].forEach(function (ev) {
      window.addEventListener(ev, kick, { once: true, passive: true });
    });

    function card(it, hidden, obs) {
      var c = el("div", "sr-card");
      c.style.setProperty("--r", String(Math.min(1.8, Math.max(0.5, (it.w || 9) / (it.h || 16)))));
      if (hidden) { c.setAttribute("aria-hidden", "true"); c.tabIndex = -1; }
      else { c.tabIndex = 0; c.setAttribute("role", "button"); c.setAttribute("aria-label", "Play " + (it.title || "reel")); }
      var v = document.createElement("video");
      v.muted = true; v.defaultMuted = true; v.loop = true; v.preload = "metadata";
      v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", "");
      v.src = it.src + "#t=0.1";
      c.appendChild(v);
      if (it.title || it.cat) {
        var cap = el("div", "sr-cap");
        if (it.cat) { var s = el("small"); s.textContent = it.cat; cap.appendChild(s); }
        if (it.title) { var b = el("b"); b.textContent = it.title; cap.appendChild(b); }
        c.appendChild(cap);
      }
      c.onclick = function () { openV(it); };
      c.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openV(it); } };
      if (obs) obs.observe(v);
      return c;
    }

    var items = [], lastW = 0, rt = null;
    function build() {
      var obs = makeObserver();
      view.innerHTML = "";
      var vw = view.clientWidth || window.innerWidth; lastW = vw;
      var track = el("div", "sr-track"); view.appendChild(track);
      var g1 = el("div", "sr-group"); track.appendChild(g1);
      items.forEach(function (it) { g1.appendChild(card(it, false, obs)); });
      var setW = g1.getBoundingClientRect().width || 1;
      var reps = Math.max(1, Math.ceil(vw / setW));
      for (var r = 1; r < reps; r++) items.forEach(function (it) { g1.appendChild(card(it, true, obs)); });
      if (REDUCE) return;
      var g2 = el("div", "sr-group"); track.appendChild(g2);
      for (var k = 0; k < reps; k++) items.forEach(function (it) { g2.appendChild(card(it, true, obs)); });
      var gw = g1.getBoundingClientRect().width || setW;
      track.style.animationDuration = Math.max(8, gw / SPEED) + "s";
      track.classList.add(DIRECTION === "left" ? "sr-l" : "sr-r");
    }
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (items.length && view.clientWidth !== lastW) build(); }, 250);
    });

    /* find the videos */
    var list = VIDEOS.slice();
    if (!list.length) for (var i = 1; i <= AUTO_COUNT; i++) list.push({ src: "videos/" + i + ".mp4", title: "", cat: "" });
    Promise.all(list.map(probe)).then(function (res) {
      items = res.filter(Boolean);
      if (!items.length) {
        console.info("UR VISUALS reels: no playable videos found in the videos folder.");
        sec.remove(); return;
      }
      res.forEach(function (r, n) { if (!r && VIDEOS.length) console.warn("UR VISUALS reels: could not load " + list[n].src); });
      build();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
