// Character field behind the page, plus the click effects that sit above it.
// #glyphs  : the static field of random characters, drawn once.
// #fx      : every click sends a ripple through the letters. Now and then (about 1 mouse move in 100)
//            the cursor pours pixel water made of letters that falls and spreads like Minecraft water.
// fx sits above the content (blended, so text stays readable) because the frosted panels would hide it.
(() => {
    const bgCv = document.getElementById('glyphs');
    const fxCv = document.getElementById('fx');
    if (!bgCv || !fxCv) return;
    const bgCtx = bgCv.getContext('2d');
    const ctx = fxCv.getContext('2d');
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const CH = '01{}[]<>/\\|=+-*#$%&?!;:~^';
    const rc = () => CH[(Math.random() * CH.length) | 0];
    const FONT = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

    let W = 0, H = 0, dpr = 1, cw = 18, chh = 24, cols = 0, rows = 0, field = [];
    let ink = '#71717a', accent = '#0171e3', dark = false;
    let atlas = {};            // each character pre-rendered in the accent colour: a ripple is drawImage, not fillText
    const ripples = [];
    let raf = 0;               // pending animation frame id; 0 means the loop is asleep

    /* ---------- pixel water ---------- */
    const WS = 14;             // block size in px
    let wc = 0, wr = 0, active = [], source = null, lastWater = 0, tickAt = 0;
    const water = new Map();   // "x,y" -> { lvl, born, ch, shade }
    const SHADES = ['#1d6fe0', '#2f8cff', '#4aa3ff', '#2bb3c9'];
    const LIFE = 6500;

    function colors() {
        const cs = getComputedStyle(root);
        ink = cs.getPropertyValue('--ink-3').trim() || ink;
        accent = cs.getPropertyValue('--accent').trim() || accent;
        dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function buildAtlas() {
        atlas = {};
        for (const ch of CH) {
            const a = document.createElement('canvas');
            a.width = Math.ceil(cw * dpr); a.height = Math.ceil(chh * dpr);
            const x = a.getContext('2d');
            x.scale(dpr, dpr);
            x.font = `13px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle';
            x.fillStyle = accent; x.fillText(ch, cw / 2, chh / 2);
            atlas[ch] = a;
        }
    }

    function paintField() {
        bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bgCtx.clearRect(0, 0, W, H);
        bgCtx.font = `13px ${FONT}`; bgCtx.textAlign = 'center'; bgCtx.textBaseline = 'middle';
        bgCtx.fillStyle = ink; bgCtx.globalAlpha = dark ? 0.16 : 0.13;
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) bgCtx.fillText(field[y * cols + x], x * cw + cw / 2, y * chh + chh / 2);
        bgCtx.globalAlpha = 1;
    }

    function resize() {
        dpr = Math.min(devicePixelRatio || 1, 2);
        W = innerWidth; H = innerHeight;
        for (const cv of [bgCv, fxCv]) { cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(H * dpr); }
        cols = Math.ceil(W / cw); rows = Math.ceil(H / chh);
        field = Array.from({ length: cols * rows }, rc);
        wc = Math.ceil(W / WS); wr = Math.ceil(H / WS);
        water.clear(); active = []; source = null;
        buildAtlas(); paintField();
    }
    function retheme() { colors(); buildAtlas(); paintField(); }

    /* ---------- water simulation ---------- */
    const key = (x, y) => x + ',' + y;
    function put(x, y, lvl, now) {
        if (x < 0 || x >= wc || y < 0 || y >= wr || water.has(key(x, y))) return;
        water.set(key(x, y), { lvl, born: now, ch: rc(), shade: SHADES[(Math.random() * SHADES.length) | 0] });
        active.push([x, y, lvl]);
    }
    function tickWater(now) {
        const cur = active; active = [];   // new cells wait for the next tick, so the flow advances one step at a time
        if (source && now < source.until) put(source.x, source.y, 7, now);
        for (const [x, y, lvl] of cur) {
            // fall first, then spread sideways one level weaker, like the real thing
            if (y + 1 < wr && !water.has(key(x, y + 1))) { put(x, y + 1, 7, now); continue; }
            if (lvl > 1) { put(x - 1, y, lvl - 1, now); put(x + 1, y, lvl - 1, now); }
        }
    }

    /* ---------- drawing (fx layer only) ---------- */
    const BAND = 46, SIGMA2 = 2 * 22 * 22;
    function draw(now) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = accent; ctx.strokeStyle = accent; ctx.lineWidth = 1.5;

        ripples.forEach((r, n) => {
            // the two newest ripples get a softer echo wave behind the leading ring
            for (const [delay, gain] of n >= ripples.length - 2 ? [[0, 1], [0.22, 0.5]] : [[0, 1]]) {
                const t = (now - r.t) / 1000 - delay, rad = t * 420, life = (1 - t / 1.9) * gain;
                if (t <= 0 || life <= 0.03) continue;
                const y0 = Math.max(0, Math.floor((r.y - rad - BAND) / chh)), y1 = Math.min(rows - 1, Math.ceil((r.y + rad + BAND) / chh));
                for (let y = y0; y <= y1; y++) {
                    const cy = y * chh + chh / 2, dy = cy - r.y;
                    // only the cells inside the ring band: x range from the two circles that bound it
                    const outer = Math.sqrt(Math.max(0, (rad + BAND) ** 2 - dy * dy));
                    const innerR = rad - BAND, inner = innerR > Math.abs(dy) ? Math.sqrt(innerR * innerR - dy * dy) : 0;
                    if (outer <= 0) continue;
                    for (const side of inner > 0 ? [-1, 1] : [0]) {
                        const xa = side > 0 ? r.x + inner : r.x - outer;
                        const xb = side < 0 ? r.x - inner : r.x + outer;
                        const x0 = Math.max(0, Math.floor(xa / cw)), x1 = Math.min(cols - 1, Math.ceil(xb / cw));
                        for (let x = x0; x <= x1; x++) {
                            const cx = x * cw + cw / 2, d = Math.hypot(cx - r.x, cy - r.y) - rad;
                            const k = Math.exp(-(d * d) / SIGMA2) * life;
                            if (k < 0.1) continue;
                            if (gain === 1 && k > 0.45) { ctx.globalAlpha = 0.1; ctx.fillRect(cx - cw / 2 + 1, cy - chh / 2 + 2, cw - 2, chh - 4); }
                            ctx.globalAlpha = Math.min(1, Math.round((0.3 + k) * 6) / 6);
                            const flick = k > 0.35 && ((now / 90 + x * 7 + y * 3) | 0) % 3 === 0;
                            const ch = flick ? CH[(x * 31 + y * 17 + ((now / 120) | 0)) % CH.length] : field[y * cols + x];
                            ctx.drawImage(atlas[ch], cx - cw / 2, cy - chh / 2, cw, chh);
                        }
                    }
                }
                if (gain === 1) { ctx.globalAlpha = 0.5 * life; ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, 6.2832); ctx.stroke(); }
            }
        });

        ctx.font = `10px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (const [k, c] of water) {
            const age = now - c.born;
            if (age > LIFE) { water.delete(k); continue; }
            const [x, y] = k.split(',').map(Number);
            const a = Math.min(1, age / 120) * Math.pow(1 - age / LIFE, 1.3);
            ctx.globalAlpha = 0.85 * a * (0.55 + c.lvl / 16);
            ctx.fillStyle = c.shade; ctx.fillRect(x * WS, y * WS, WS - 1, WS - 1);
            ctx.globalAlpha = a * 0.9; ctx.fillStyle = '#e8f3ff';
            ctx.fillText(c.ch, x * WS + WS / 2, y * WS + WS / 2 + 1);
        }
        ctx.globalAlpha = 1;
    }

    /* ---------- loop: the frame id is the only state, so a click can always restart it ---------- */
    function frame() {
        raf = 0;
        const now = performance.now();
        for (let i = ripples.length - 1; i >= 0; i--) if (now - ripples[i].t > 2400) ripples.splice(i, 1);
        if (now - tickAt > 70) { tickAt = now; tickWater(now); }
        try { draw(now); } catch (e) { ripples.length = 0; water.clear(); active = []; source = null; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, fxCv.width, fxCv.height); return; }
        if (ripples.length || water.size || active.length || (source && now < source.until)) raf = requestAnimationFrame(frame);
    }
    function wake() { if (!raf) raf = requestAnimationFrame(frame); }

    /* ---------- input ---------- */
    // capture phase on window: runs before anything on the page can stop the event
    addEventListener('pointerdown', (e) => {
        if (reduced) return;
        ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
        if (ripples.length > 3) ripples.shift();
        wake();
    }, { passive: true, capture: true });
    addEventListener('pointermove', (e) => {
        if (reduced || e.pointerType === 'touch') return;
        const now = performance.now();
        if (Math.random() < 0.01 && now - lastWater > 4000) {
            lastWater = now;
            source = { x: Math.floor(e.clientX / WS), y: Math.floor(e.clientY / WS), until: now + 1500 };
            wake();
        }
    }, { passive: true });
    addEventListener('resize', () => { resize(); wake(); });
    new MutationObserver(retheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', () => setTimeout(retheme, 0)); else if (mq.addListener) mq.addListener(() => setTimeout(retheme, 0));

    colors(); resize();
})();
