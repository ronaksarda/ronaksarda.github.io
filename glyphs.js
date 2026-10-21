// Character field behind the page, plus the click effects that sit above it.
// #glyphs  : the static field of random characters, drawn once.
// #fx      : every click sends a ripple of colour through the letters.
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
    // pink -> violet -> cyan -> mint -> amber -> coral, blended into 12 steps. A ripple runs through all of them.
    const BASE = [[255, 95, 162], [160, 107, 255], [56, 200, 240], [52, 214, 176], [255, 179, 71], [255, 122, 89]];
    const AURORA = BASE.flatMap((c, i) => { const n = BASE[(i + 1) % BASE.length]; return [c, c.map((v, k) => Math.round((v + n[k]) / 2))]; }).map((c) => `rgb(${c})`);
    let atlas = [];            // atlas[colour][char]: every character pre-rendered, so a ripple is drawImage, not fillText
    const ripples = [];
    let raf = 0;               // pending animation frame id; 0 means the loop is asleep

    function colors() {
        const cs = getComputedStyle(root);
        ink = cs.getPropertyValue('--ink-3').trim() || ink;
        accent = cs.getPropertyValue('--accent').trim() || accent;
        dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    }

    function buildAtlas() {
        atlas = AURORA.map((col) => {
            const set = {};
            for (const ch of CH) {
                const a = document.createElement('canvas');
                a.width = Math.ceil(cw * dpr); a.height = Math.ceil(chh * dpr);
                const x = a.getContext('2d');
                x.scale(dpr, dpr);
                x.font = `600 13px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle';
                x.fillStyle = col; x.fillText(ch, cw / 2, chh / 2);
                set[ch] = a;
            }
            return set;
        });
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
        buildAtlas(); paintField();
    }
    function retheme() { colors(); buildAtlas(); paintField(); }

    /* ---------- drawing (fx layer only) ---------- */
    const BAND = 46, SIGMA2 = 2 * 22 * 22;
    function draw(now) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

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
                            // colour runs around the ring and drifts outward as it grows
                            const ci = ((Math.floor(Math.atan2(cy - r.y, cx - r.x) / 6.2832 * 12 + rad / 150 + r.h) % 12) + 12) % 12;
                            ctx.globalAlpha = Math.min(1, Math.round((0.3 + k) * 6) / 6);
                            const flick = k > 0.35 && ((now / 90 + x * 7 + y * 3) | 0) % 3 === 0;
                            const ch = flick ? CH[(x * 31 + y * 17 + ((now / 120) | 0)) % CH.length] : field[y * cols + x];
                            ctx.drawImage(atlas[ci][ch], cx - cw / 2, cy - chh / 2, cw, chh);
                        }
                    }
                }
            }
        });

        ctx.globalAlpha = 1;
    }

    /* ---------- loop: the frame id is the only state, so a click can always restart it ---------- */
    function frame() {
        raf = 0;
        const now = performance.now();
        for (let i = ripples.length - 1; i >= 0; i--) if (now - ripples[i].t > 2400) ripples.splice(i, 1);
        try { draw(now); } catch (e) { ripples.length = 0; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, fxCv.width, fxCv.height); return; }
        if (ripples.length) raf = requestAnimationFrame(frame);
    }
    function wake() { if (!raf) raf = requestAnimationFrame(frame); }

    /* ---------- input ---------- */
    // capture phase on window: runs before anything on the page can stop the event
    addEventListener('pointerdown', (e) => {
        if (reduced) return;
        ripples.push({ x: e.clientX, y: e.clientY, t: performance.now(), h: (Math.random() * 12) | 0 });
        if (ripples.length > 3) ripples.shift();
        wake();
    }, { passive: true, capture: true });
    addEventListener('resize', () => { resize(); wake(); });
    new MutationObserver(retheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', () => setTimeout(retheme, 0)); else if (mq.addListener) mq.addListener(() => setTimeout(retheme, 0));

    colors(); resize();
})();
