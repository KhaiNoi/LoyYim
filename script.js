(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const steps = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];
  const colorNames = { pink: "ชมพูหวาน", purple: "ม่วงละมุน", gold: "ทองอบอุ่น" };
  const palettes = {
    pink: ["#f17eaa", "#ffd0df"],
    purple: ["#9e83e9", "#dfd0ff"],
    gold: ["#d99b48", "#ffe4a5"],
  };
  const picks = { who: "", wish: "" };
  let chosen = "pink";
  let incenseLit = false;
  let floatTimer;

  // Lotus krathong (petals, cup, 3 candles) built into every .lotus
  const petal = (r, h, c) => `<i class="lt-p ${c}" style="--r:${r}deg;--h:${h}em"></i>`;
  const lotusParts = (lit) =>
    [-80, -55, -28, 0, 28, 55, 80].map((r) => petal(r, 7, "b")).join("") +
    '<i class="lt-base"></i>' +
    [[38, 3.4], [50, 4.4], [62, 3.4]]
      .map(([l, h]) => `<b class="lt-c${lit ? " lit" : ""}" style="left:${l}%;--ch:${h}em"><span class="flame"></span></b>`)
      .join("") +
    '<i class="lt-cup"></i>' +
    [-72, -36, 36, 72].map((r) => petal(r, 5.4, "f")).join("");
  $$(".lotus").forEach((el) => el.insertAdjacentHTML("afterbegin", lotusParts(el.hasAttribute("data-lit"))));

  // Moving stars: drifting + twinkling, shooting stars, pointer parallax
  const stars = $("#stars");
  for (let i = 0; i < 95; i++) {
    const star = document.createElement("i");
    const big = i % 8 === 0;
    star.className = big ? "star big" : "star";
    if (big) {
      star.textContent = "✦";
      star.style.fontSize = `${9 + Math.random() * 7}px`;
    }
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 78}%`;
    star.style.animationDelay = `${Math.random() * 4}s`;
    star.style.opacity = `${0.35 + Math.random() * 0.65}`;
    star.style.setProperty("--dx", `${(Math.random() - 0.5) * 50}px`);
    star.style.setProperty("--dy", `${(Math.random() - 0.5) * 36}px`);
    star.style.setProperty("--dd", `${18 + Math.random() * 24}s`);
    stars.appendChild(star);
  }
  const shoot = () => {
    const s = document.createElement("i");
    s.className = "shoot";
    s.style.left = `${40 + Math.random() * 55}%`;
    s.style.top = `${Math.random() * 35}%`;
    stars.appendChild(s);
    setTimeout(() => s.remove(), 1400);
  };
  setTimeout(shoot, 800);
  setInterval(shoot, 3200);
  addEventListener("pointermove", (e) => {
    stars.style.transform = `translate(${(0.5 - e.clientX / innerWidth) * 18}px,${(0.5 - e.clientY / innerHeight) * 18}px)`;
  });

  setInterval(() => {
    const heart = document.createElement("span");
    heart.className = "fh";
    heart.textContent = ["♡", "♥", "✦", "🌸"][Math.floor(Math.random() * 4)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${12 + Math.random() * 15}px`;
    heart.style.animationDuration = `${7 + Math.random() * 5}s`;
    $("#hearts").appendChild(heart);
    setTimeout(() => heart.remove(), 12500);
  }, 850);

  function go(id) {
    $$(".step").forEach((step) => step.classList.remove("active"));
    $("#" + id).classList.add("active");
    $("#progressFill").style.width = `${((steps.indexOf(id) + 1) / steps.length) * 100}%`;
    if (id === "s8") startFx();
    else stopFx();
  }
  $$("[data-next]").forEach((b) => b.addEventListener("click", () => go(b.dataset.next)));
  $$("[data-back]").forEach((b) => b.addEventListener("click", () => go(b.dataset.back)));

  // Pick pages (who to float with / what to wish for)
  $$(".picks-list").forEach((list) => {
    const next = list.parentElement.querySelector(".btn");
    list.querySelectorAll(".pick").forEach((b) =>
      b.addEventListener("click", () => {
        list.querySelectorAll(".pick").forEach((x) => {
          x.classList.toggle("selected", x === b);
          x.setAttribute("aria-pressed", String(x === b));
        });
        picks[list.dataset.pick] = b.textContent;
        next.disabled = false;
      })
    );
  });

  // Choose krathong colour
  const applyColor = (el, color) => {
    el.classList.remove("pink", "purple", "gold");
    el.classList.add(color);
  };
  $$(".choice").forEach((button) =>
    button.addEventListener("click", () => {
      chosen = button.dataset.color;
      $$(".choice").forEach((c) => {
        c.classList.toggle("selected", c === button);
        c.setAttribute("aria-pressed", String(c === button));
      });
      $("#selectedNote").textContent = `เลือกกระทงสี${colorNames[chosen]}แล้ว ♡`;
    })
  );
  $("#chooseBtn").addEventListener("click", () => {
    applyColor($("#myKt"), chosen);
    applyColor($("#floatKt"), chosen);
    $("#floatKt").style.setProperty("--c1", palettes[chosen][0]);
    $("#floatKt").style.setProperty("--c2", palettes[chosen][1]);
    go("s6");
  });

  // Light 3 candles + incense
  const candles = $$("#myKt .lt-c");
  const countLit = () => candles.filter((c) => c.classList.contains("lit")).length;
  function refresh() {
    const n = countLit();
    const ready = n === 3 && incenseLit;
    $("#candleStatus").textContent = n === 3 ? "จุดครบแล้ว ✨" : `จุดแล้ว ${n}/3`;
    $("#lightCandle").classList.toggle("lit", n === 3);
    $("#lightCandle").setAttribute("aria-pressed", String(n === 3));
    $("#toWish").disabled = !ready;
    $("#lightHint").textContent = ready
      ? "กระทงพร้อมแล้ว ไปตั้งจิตอธิษฐานกันเลย ♡"
      : "จุดเทียนให้ครบ 3 เล่ม และจุดธูปก่อนนะ ✨";
  }
  function lightCandle(c) {
    c = c || candles.find((x) => !x.classList.contains("lit"));
    if (!c || c.classList.contains("lit")) return;
    c.classList.add("lit");
    refresh();
  }
  $("#lightCandle").addEventListener("click", () => lightCandle());
  candles.forEach((c) => c.addEventListener("click", () => lightCandle(c)));
  $("#lightIncense").addEventListener("click", () => {
    if (incenseLit) return;
    incenseLit = true;
    $("#incense").classList.add("lit");
    $("#lightIncense").classList.add("lit");
    $("#lightIncense").setAttribute("aria-pressed", "true");
    $("#incenseStatus").textContent = "จุดแล้ว ✨";
    refresh();
  });
  $("#toWish").addEventListener("click", () => {
    if (countLit() === 3 && incenseLit) go("s7");
  });

  // Wish + float
  $("#wish").addEventListener("input", (e) => {
    $("#charCount").textContent = e.target.value.length;
  });
  $("#floatBtn").addEventListener("click", () => {
    const wish = $("#wish").value.trim();
    $("#wishShow").textContent = wish ? `“${wish}”` : "";
    const floatKt = $("#floatKt");
    floatKt.style.animation = "none";
    void floatKt.offsetWidth;
    floatKt.style.animation = "";
    $("#final").classList.remove("show");
    go("s8");
    clearTimeout(floatTimer);
    floatTimer = setTimeout(() => $("#final").classList.add("show"), 4200);
  });

  $("#again").addEventListener("click", () => {
    candles.forEach((c) => c.classList.remove("lit"));
    incenseLit = false;
    $("#incense").classList.remove("lit");
    $("#lightIncense").classList.remove("lit");
    $("#lightIncense").setAttribute("aria-pressed", "false");
    $("#incenseStatus").textContent = "ยังไม่ได้จุด";
    $("#wish").value = "";
    $("#charCount").textContent = "0";
    $("#final").classList.remove("show");
    $$(".pick").forEach((b) => {
      b.classList.remove("selected");
      b.setAttribute("aria-pressed", "false");
    });
    $$(".picks-list").forEach((l) => (l.parentElement.querySelector(".btn").disabled = true));
    picks.who = picks.wish = "";
    refresh();
    go("s2");
  });

  // ===== Music: assets/music.mp3 if present, otherwise a soft music-box melody =====
  const bgm = $("#bgm");
  bgm.volume = 0.6;
  let fileOk = true, playing = false, started = false;
  bgm.addEventListener("error", () => (fileOk = false));
  const synth = (() => {
    let ctx, master, timer, n = 0;
    const chords = [[261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66]];
    const arp = [0, 1, 2, 1, 2, 1, 2, 1];
    const note = (f, t, d, v) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + d + 0.05);
    };
    const tick = () => {
      const t = ctx.currentTime + 0.05, ch = chords[Math.floor(n / 8) % 4], i = n % 8;
      note(ch[arp[i]] * 2, t, 1.3, 0.3);
      if (i === 0) note(ch[0] / 2, t, 3.2, 0.35);
      if (i % 4 === 2 && Math.random() < 0.6) note(ch[2] * 4, t, 1, 0.1);
      n++;
    };
    return {
      start() {
        if (!ctx) {
          ctx = new (window.AudioContext || window.webkitAudioContext)();
          master = ctx.createGain();
          master.gain.value = 0.5;
          const delay = ctx.createDelay(), fb = ctx.createGain(), wet = ctx.createGain();
          delay.delayTime.value = 0.38;
          fb.gain.value = 0.4;
          wet.gain.value = 0.45;
          master.connect(ctx.destination);
          master.connect(delay);
          delay.connect(fb);
          fb.connect(delay);
          delay.connect(wet);
          wet.connect(ctx.destination);
        }
        ctx.resume();
        if (!timer) timer = setInterval(tick, 480);
      },
      stop() {
        clearInterval(timer);
        timer = null;
      },
    };
  })();
  // YouTube song (used when assets/music.mp3 is absent); falls back to the music-box melody
  const YT_ID = "SnNbi3i-SPU";
  let yt = null, ytReady = false, ytPlaying = false;
  function initYT() {
    yt = new YT.Player("yt", {
      width: 200,
      height: 113,
      videoId: YT_ID,
      playerVars: { playsinline: 1, loop: 1, playlist: YT_ID, rel: 0 },
      events: {
        onReady: () => {
          ytReady = true;
          if (playing && !fileOk) yt.playVideo();
        },
        onStateChange: (e) => {
          ytPlaying = e.data === 1;
          if (ytPlaying) synth.stop();
        },
        onError: () => { if (playing) synth.start(); },
      },
    });
  }
  function loadYT() {
    window.onYouTubeIframeAPIReady = initYT;
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  }
  async function setMusic(on) {
    started = true;
    playing = on;
    const btn = $("#musicBtn");
    btn.textContent = on ? "🔊" : "🔇";
    btn.setAttribute("aria-pressed", String(on));
    if (on) {
      if (fileOk) {
        try {
          await bgm.play();
          $("#ytCard").hidden = true;
          return;
        } catch (e) {
          fileOk = false;
        }
      }
      if (ytReady) yt.playVideo();
      setTimeout(() => { if (playing && !ytPlaying) synth.start(); }, 5000);
    } else {
      bgm.pause();
      if (ytReady) yt.pauseVideo();
      synth.stop();
    }
  }
  loadYT();
  $("#musicBtn").addEventListener("click", () => setMusic(!playing));
  document.addEventListener("click", () => { if (!started) setMusic(true); }, { once: true });

  // ===== Fireworks (auto on the final page, tap anywhere for more) =====
  const fx = $("#fx"), fctx = fx.getContext("2d");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fxColors = ["#ff9fca", "#ffd27a", "#c9a8ff", "#fff1c9", "#8fe3ff"];
  let rockets = [], sparks = [], fxTimer, fxRaf = 0;
  function sizeFx() {
    const d = devicePixelRatio || 1;
    fx.width = innerWidth * d;
    fx.height = innerHeight * d;
    fctx.setTransform(d, 0, 0, d, 0, 0);
  }
  addEventListener("resize", sizeFx);
  sizeFx();
  function burst(x, y) {
    const col = fxColors[Math.floor(Math.random() * fxColors.length)];
    const heart = Math.random() < 0.3, n = heart ? 48 : 70;
    for (let i = 0; i < n; i++) {
      let vx, vy;
      if (heart) {
        const t = (i / n) * Math.PI * 2;
        vx = 0.2 * 16 * Math.sin(t) ** 3;
        vy = -0.2 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      } else {
        const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3.2;
        vx = Math.cos(a) * s;
        vy = Math.sin(a) * s;
      }
      sparks.push({ x, y, vx, vy, life: 1, col });
    }
  }
  function fxLoop() {
    if (fxRaf) return;
    const frame = () => {
      fctx.clearRect(0, 0, innerWidth, innerHeight);
      fctx.globalCompositeOperation = "lighter";
      rockets = rockets.filter((r) => {
        r.y -= 7;
        fctx.fillStyle = "#ffe9b0";
        fctx.fillRect(r.x - 1, r.y, 2, 8);
        if (r.y <= r.ty) {
          burst(r.x, r.y);
          return false;
        }
        return true;
      });
      sparks = sparks.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.04;
        s.vx *= 0.985;
        s.vy *= 0.985;
        s.life -= 0.012;
        fctx.globalAlpha = Math.max(s.life, 0);
        fctx.fillStyle = s.col;
        fctx.beginPath();
        fctx.arc(s.x, s.y, 2, 0, 6.283);
        fctx.fill();
        return s.life > 0;
      });
      fctx.globalAlpha = 1;
      fxRaf = rockets.length || sparks.length ? requestAnimationFrame(frame) : 0;
    };
    fxRaf = requestAnimationFrame(frame);
  }
  function launch(x, y) {
    rockets.push({
      x: x ?? innerWidth * (0.15 + Math.random() * 0.7),
      y: innerHeight,
      ty: y ?? innerHeight * (0.12 + Math.random() * 0.3),
    });
    fxLoop();
  }
  function startFx() {
    if (reduceMotion || fxTimer) return;
    [800, 1300, 1800].forEach((d) => setTimeout(() => { if (fxTimer) launch(); }, d));
    fxTimer = setInterval(() => launch(), 1300);
  }
  function stopFx() {
    clearInterval(fxTimer);
    fxTimer = null;
    rockets = [];
  }
  document.addEventListener("pointerdown", (e) => {
    if (!reduceMotion && $("#s8").classList.contains("active")) launch(e.clientX, e.clientY);
  });

  refresh();
  go("s1");
})();
