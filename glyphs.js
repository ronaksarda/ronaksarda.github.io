// Character field behind the page. Click anywhere and a blue ripple runs through the letters.
// Now and then (about 1 move in 100) the cursor pours a block of pixel water that falls and
// spreads like Minecraft water, made of letters, and fades out slowly.
(() => {
    const cv = document.getElementById('glyphs');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const CH = '01{}[]<>/\\|=+-*#$%&?!;:~^';
    const rc = () => CH[(Math.random() * CH.length) | 0];

    let W = 0, H = 0, dpr = 1, cw = 18, chh = 24, cols = 0, rows = 0, field = [];
    let ink = '#71717a', accent = '#0171e3', dark = false;
    let bg = null; // the static field, drawn once per resize / theme change
    let atlas = {};  // every character pre-rendered in the accent colour, so a ripple is drawImage, not fillText
    const ripples = [];

    /* ---------- pixel water ---------- */
    const WS = 14; // water block size in px
    let wc = 0, wr = 0;
    const water = new Map();   // "x,y" -> { lvl, born, ch, shade }
    let active = [], source = null, lastWater = 0, tickAt = 0;
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
            x.font = '13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
            x.textAlign = 'center'; x.textBaseline = 'middle';
            x.fillStyle = accent; x.fillText(ch, cw / 2, chh / 2);
            atlas[ch] = a;
        }
    }

    function paintField() {
        buildAtlas();
        bg = document.createElement('canvas');
        bg.width = W * dpr; bg.height = H * dpr;
        const b = bg.getContext('2d');
        b.scale(dpr, dpr);
        b.font = '13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
        b.textAlign = 'center'; b.textBaseline = 'middle';
        b.fillStyle = ink; b.globalAlpha = dark ? 0.16 : 0.13;
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) b.fillText(field[y * cols + x], x * cw + cw / 2, y * chh + chh / 2);
    }

    function resize() {
        dpr = Math.min(devicePixelRatio || 1, 2);
        W = innerWidth; H = innerHeight;
        cv.width = W * dpr; cv.height = H * dpr;
        cols = Math.ceil(W / cw); rows = Math.ceil(H / chh);
        field = Array.from({ length: cols * rows }, rc);
        wc = Math.ceil(W / WS); wr = Math.ceil(H / WS);
        water.clear(); active = []; source = null;
        paintField();
        draw(performance.now());
    }

    /* ---------- water simulation ---------- */
    const key = (x, y) => x + ',' + y;
    function put(x, y, lvl, now) {
        if (x < 0 || x >= wc || y < 0 || y >= wr || water.has(key(x, y))) return false;
        water.set(key(x, y), { lvl, born: now, ch: rc(), shade: SHADES[(Math.random() * SHADES.length) | 0] });
        active.push([x, y, lvl]);
        return true;
    }
    function startWater(px, py, now) {
        lastWater = now;
        source = { x: Math.floor(px / WS), y: Math.floor(py / WS), until: now + 1500 };
        wake();
    }
    function tickWater(now) {
        const cur = active; active = [];   // put() queues new cells for the next tick, so the flow advances one step at a time
        if (source && now < source.until) put(source.x, source.y, 7, now);
        for (const [x, y, lvl] of cur) {
            // fall first, then spread sideways one level weaker, like the real thing
            if (y + 1 < wr && !water.has(key(x, y + 1))) { put(x, y + 1, 7, now); continue; }
            if (lvl > 1) { put(x - 1, y, lvl - 1, now); put(x + 1, y, lvl - 1, now); }
        }
    }

    /* ---------- drawing ---------- */
    let running = false;
    function draw(now) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        if (bg) ctx.drawImage(bg, 0, 0, W, H);

        ctx.font = '13px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

        const BAND = 46, SIGMA2 = 2 * 22 * 22;
        ctx.fillStyle = accent; ctx.strokeStyle = accent; ctx.lineWidth = 1.5;
        ripples.forEach((r, n) => { for (const [delay, gain] of n >= ripples.length - 2 ? [[0, 1], [0.22, 0.5]] : [[0, 1]]) {
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
                    const xa = side === 0 ? r.x - outer : side < 0 ? r.x - outer : r.x + inner;
                    const xb = side === 0 ? r.x + outer : side < 0 ? r.x - inner : r.x + outer;
                    const x0 = Math.max(0, Math.floor(xa / cw)), x1 = Math.min(cols - 1, Math.ceil(xb / cw));
                    for (let x = x0; x <= x1; x++) {
                        const cx = x * cw + cw / 2, d = Math.hypot(cx - r.x, cy - r.y) - rad;
                        const k = Math.exp(-(d * d) / SIGMA2) * life;
                        if (k < 0.1) continue;
                        const al = Math.round((0.25 + k) * 6) / 6;       // few alpha levels, cheap state changes
                        if (gain === 1 && k > 0.45) { ctx.globalAlpha = 0.12; ctx.fillRect(cx - cw / 2 + 1, cy - chh / 2 + 2, cw - 2, chh - 4); }
                        ctx.globalAlpha = Math.min(1, al);
                        const flick = k > 0.35 && ((now / 90 + x * 7 + y * 3) | 0) % 3 === 0;
                        const ch = flick ? CH[(x * 31 + y * 17 + ((now / 120) | 0)) % CH.length] : field[y * cols + x];
                        ctx.drawImage(atlas[ch], cx - cw / 2, cy - chh / 2, cw, chh);
                    }
                }
            }
            if (gain === 1) { ctx.globalAlpha = 0.28 * life; ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, 6.2832); ctx.stroke(); }
        } });

        for (const [k, c] of water) {
            const age = now - c.born;
            if (age > LIFE) { water.delete(k); continue; }
            const [x, y] = k.split(',').map(Number);
            const a = Math.min(1, age / 120) * Math.pow(1 - age / LIFE, 1.3);
            ctx.globalAlpha = 0.85 * a * (0.55 + c.lvl / 16);
            ctx.fillStyle = c.shade; ctx.fillRect(x * WS, y * WS, WS - 1, WS - 1);
            ctx.globalAlpha = a * 0.9; ctx.fillStyle = '#e8f3ff'; ctx.font = '10px ui-monospace, Menlo, monospace';
            ctx.fillText(c.ch, x * WS + WS / 2, y * WS + WS / 2 + 1);
        }
        ctx.globalAlpha = 1;
    }

    function frame(now) {
        for (let i = ripples.length - 1; i >= 0; i--) if (now - ripples[i].t > 2400) ripples.splice(i, 1);
        if (now - tickAt > 70) { tickAt = now; tickWater(now); }
        try { draw(now); } catch (e) { ripples.length = 0; water.clear(); active = []; source = null; running = false; ctx.globalAlpha = 1; return; }
        if (ripples.length || water.size || active.length || (source && now < source.until)) requestAnimationFrame(frame);
        else { running = false; draw(now); }
    }
    function wake() { if (!running) { running = true; requestAnimationFrame(frame); } }

    /* ---------- input ---------- */
    addEventListener('pointerdown', (e) => {
        if (reduced) return;
        ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
        if (ripples.length > 3) ripples.shift();
        wake();
    }, { passive: true, capture: true });
    addEventListener('pointermove', (e) => {
        if (reduced || e.pointerType === 'touch') return;
        const now = performance.now();
        if (Math.random() < 0.01 && now - lastWater > 4000) startWater(e.clientX, e.clientY, now);
    }, { passive: true });
    addEventListener('resize', resize);
    new MutationObserver(() => { colors(); paintField(); draw(performance.now()); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => setTimeout(() => { colors(); paintField(); draw(performance.now()); }, 0));

    colors(); resize();
})();
