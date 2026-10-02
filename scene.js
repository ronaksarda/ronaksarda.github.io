// Background worlds (night space + morning valley) and the shared FX layer.
(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = matchMedia('(hover: none)').matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    const root = document.documentElement;
    let W = innerWidth, H = innerHeight;
    let mouse = { x: W / 2, y: H / 2, tx: W / 2, ty: H / 2 };
    let scrollY = 0;
    let warp = 0, warpTarget = 0;

    const world = () => root.dataset.world;
    const rand = (a, b) => a + Math.random() * (b - a);

    function fit(c) {
        c.width = W * DPR; c.height = H * DPR;
        const ctx = c.getContext('2d');
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        return ctx;
    }

    /* ---------------- NIGHT: stars ---------------- */
    const starC = document.getElementById('star-canvas');
    let sctx, stars = [], shooters = [];
    function initStars() {
        sctx = fit(starC);
        const n = Math.round((W * H) / (touch ? 5200 : 3200));
        stars = Array.from({ length: n }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            z: Math.random() ** 2 * 0.9 + 0.1,
            tw: Math.random() * Math.PI * 2,
            hue: Math.random() < .15 ? (Math.random() < .5 ? 190 : 320) : 0
        }));
    }
    function drawStars(t) {
        sctx.clearRect(0, 0, W, H);
        const px = (mouse.x - W / 2) * 0.03, py = (mouse.y - H / 2) * 0.03;
        warp += (warpTarget - warp) * 0.05;
        for (const s of stars) {
            const depth = s.z;
            let x = (s.x - px * depth * 3) % W, y = (s.y - scrollY * depth * 0.25 - py * depth * 3) % H;
            if (x < 0) x += W; if (y < 0) y += H;
            const a = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.0015 + s.tw));
            const r = depth * 1.7;
            sctx.globalAlpha = a * (0.4 + depth * 0.6);
            sctx.fillStyle = s.hue ? `hsl(${s.hue} 100% 80%)` : '#fff';
            if (warp > 0.02) {
                const dx = x - W / 2, dy = y - H / 2, len = warp * depth * 0.4;
                sctx.strokeStyle = sctx.fillStyle; sctx.lineWidth = r;
                sctx.beginPath(); sctx.moveTo(x, y); sctx.lineTo(x + dx * len, y + dy * len); sctx.stroke();
                s.x += dx * 0.02 * warp * depth; s.y += dy * 0.02 * warp * depth;
                if (Math.abs(dx) > W / 2 + 40 || Math.abs(dy) > H / 2 + 40) { s.x = W / 2 + rand(-60, 60); s.y = H / 2 + rand(-60, 60); }
            } else {
                sctx.beginPath(); sctx.arc(x, y, r, 0, 7); sctx.fill();
            }
        }
        // constellation lines near the cursor
        if (!touch) {
            sctx.globalAlpha = 1;
            const near = [];
            for (const s of stars) {
                if (s.z < .5) continue;
                const x = ((s.x - px * s.z * 3) % W + W) % W, y = ((s.y - scrollY * s.z * .25 - py * s.z * 3) % H + H) % H;
                const d = Math.hypot(x - mouse.x, y - mouse.y);
                if (d < 160) near.push([x, y, d]);
            }
            for (let i = 0; i < near.length; i++) for (let j = i + 1; j < near.length; j++) {
                const [x1, y1, d1] = near[i], [x2, y2] = near[j];
                const dd = Math.hypot(x1 - x2, y1 - y2);
                if (dd < 90) {
                    sctx.strokeStyle = `rgba(110,243,255,${(1 - d1 / 160) * (1 - dd / 90) * .7})`;
                    sctx.lineWidth = .8; sctx.beginPath(); sctx.moveTo(x1, y1); sctx.lineTo(x2, y2); sctx.stroke();
                }
            }
        }
        // shooting stars
        if (Math.random() < 0.012) shooters.push({ x: rand(0, W), y: rand(0, H * .5), vx: rand(6, 11) * (Math.random() < .5 ? -1 : 1), vy: rand(3, 6), life: 1 });
        shooters = shooters.filter(s => s.life > 0);
        for (const s of shooters) {
            const g = sctx.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
            g.addColorStop(0, `rgba(255,255,255,${s.life})`); g.addColorStop(1, 'rgba(255,255,255,0)');
            sctx.strokeStyle = g; sctx.lineWidth = 2; sctx.globalAlpha = 1;
            sctx.beginPath(); sctx.moveTo(s.x, s.y); sctx.lineTo(s.x - s.vx * 12, s.y - s.vy * 12); sctx.stroke();
            s.x += s.vx; s.y += s.vy; s.life -= 0.015;
        }
        sctx.globalAlpha = 1;
    }

    /* ---------------- DAY: valley SVG ---------------- */
    const svg = document.getElementById('valley');
    const NS = 'http://www.w3.org/2000/svg';
    let seed = 7;
    const srand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    function ridge(base, amp, rough, steps = 9) {
        let pts = [[-100, base], [1700, base]];
        let a = amp;
        for (let i = 0; i < steps; i++) {
            const next = [];
            for (let k = 0; k < pts.length - 1; k++) {
                const [x1, y1] = pts[k], [x2, y2] = pts[k + 1];
                next.push([x1, y1], [(x1 + x2) / 2, (y1 + y2) / 2 + (srand() - .5) * a]);
            }
            next.push(pts[pts.length - 1]); pts = next; a *= rough;
        }
        return pts;
    }
    function path(pts) {
        let d = `M-100,900 L${pts[0][0]},${pts[0][1].toFixed(1)}`;
        for (const [x, y] of pts) d += ` L${x.toFixed(1)},${y.toFixed(1)}`;
        return d + ' L1700,900 Z';
    }
    const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
    let layers = [];
    function buildValley() {
        svg.innerHTML = '';
        const defs = el('defs', {}, svg);
        const grads = [
            ['g0', '#b7c6ea', '#dfe6f7'], ['g1', '#8ea6d8', '#c2cdec'], ['g2', '#6f8fc9', '#a7b9e2'],
            ['g3', '#7fbf6a', '#a7d98a'], ['g4', '#5aa552', '#83c46b'], ['g5', '#3f8a44', '#5fae55'], ['g6', '#2d6e37', '#3f8a44']
        ];
        for (const [id, top, bot] of grads) {
            const g = el('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
            el('stop', { offset: '0', 'stop-color': top }, g); el('stop', { offset: '1', 'stop-color': bot }, g);
        }
        const mg = el('linearGradient', { id: 'mistg', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
        el('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': 0 }, mg);
        el('stop', { offset: '.5', 'stop-color': '#fff', 'stop-opacity': .75 }, mg);
        el('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': 0 }, mg);
        const snow = el('linearGradient', { id: 'snow', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
        el('stop', { offset: '0', 'stop-color': '#ffffff' }, snow); el('stop', { offset: '1', 'stop-color': '#ffffff', 'stop-opacity': 0 }, snow);

        const spec = [
            { g: 'g0', base: 470, amp: 300, rough: .55, par: .04, snow: true },
            { g: 'g1', base: 540, amp: 240, rough: .55, par: .07, snow: true },
            { g: 'g2', base: 610, amp: 170, rough: .5, par: .1, mist: true },
            { g: 'g3', base: 680, amp: 110, rough: .45, par: .14 },
            { g: 'g4', base: 735, amp: 80, rough: .45, par: .18, river: true },
            { g: 'g5', base: 790, amp: 60, rough: .4, par: .22, trees: 14 },
            { g: 'g6', base: 860, amp: 40, rough: .4, par: .28, trees: 9 }
        ];
        layers = [];
        seed = 11;
        for (const s of spec) {
            const grp = el('g', { class: 'layer' }, svg);
            const pts = ridge(s.base, s.amp, s.rough);
            el('path', { d: path(pts), fill: `url(#${s.g})` }, grp);
            if (s.snow) {
                // snowcaps: clip the top of the ridge
                const cid = 'c' + s.g;
                const cp = el('clipPath', { id: cid }, defs);
                el('path', { d: path(pts) }, cp);
                const minY = Math.min(...pts.map(p => p[1]));
                el('rect', { x: -100, y: minY, width: 1800, height: 70, fill: 'url(#snow)', 'clip-path': `url(#${cid})`, opacity: .85 }, grp);
            }
            if (s.mist) {
                el('rect', { class: 'mist', x: -200, y: s.base - 110, width: 2000, height: 130, fill: 'url(#mistg)', opacity: .8 }, grp);
            }
            if (s.river) {
                el('path', { d: 'M820,745 C780,780 900,800 760,830 S600,880 700,920', fill: 'none', stroke: '#9fe3ff', 'stroke-width': 26, 'stroke-linecap': 'round', opacity: .9 }, grp);
                el('path', { class: 'river', d: 'M820,745 C780,780 900,800 760,830 S600,880 700,920', fill: 'none', stroke: '#ffffff', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .9 }, grp);
            }
            if (s.trees) {
                for (let i = 0; i < s.trees; i++) {
                    const x = srand() * 1600;
                    const idx = Math.min(pts.length - 1, Math.max(0, Math.round((x + 100) / 1800 * (pts.length - 1))));
                    const y = pts[idx][1] + 6;
                    const h = (s.g === 'g6' ? 90 : 55) * (0.7 + srand() * .6);
                    const t = el('g', { class: 'tree', style: `animation-delay:${-srand() * 5}s` }, grp);
                    el('rect', { x: x - 2.5, y: y - h * .3, width: 5, height: h * .32, fill: '#4a3424' }, t);
                    el('ellipse', { cx: x, cy: y - h * .55, rx: h * .28, ry: h * .4, fill: s.g === 'g6' ? '#24592c' : '#2f7a3a' }, t);
                    el('ellipse', { cx: x - h * .08, cy: y - h * .65, rx: h * .14, ry: h * .2, fill: '#5fae55', opacity: .55 }, t);
                }
            }
            layers.push({ grp, par: s.par });
        }
        // little flowers on the front hill
        const front = layers[layers.length - 1].grp;
        const cols = ['#ffd1e8', '#fff3a8', '#ffffff', '#ffb3c1'];
        for (let i = 0; i < 70; i++) el('circle', { cx: srand() * 1600, cy: 880 + srand() * 20, r: 2 + srand() * 2.5, fill: cols[i % 4] }, front);
    }
    function moveValley() {
        const mx = (mouse.x / W - .5);
        for (const l of layers) l.grp.setAttribute('transform', `translate(${(-mx * l.par * 260).toFixed(1)} ${(scrollY * l.par * 0.35).toFixed(1)})`);
    }

    /* ---------------- DAY: clouds ---------------- */
    const cloudC = document.getElementById('cloud-canvas');
    let cctx, clouds = [];
    function makeCloudSprite(w) {
        const c = document.createElement('canvas');
        const h = w * .55; c.width = w; c.height = h;
        const x = c.getContext('2d');
        const puffs = 7 + Math.floor(Math.random() * 5);
        for (let i = 0; i < puffs; i++) {
            const px = w * (.15 + .7 * (i / (puffs - 1))) + rand(-w * .05, w * .05);
            const r = w * rand(.1, .2) * (1 - Math.abs(i / (puffs - 1) - .5));
            const py = h * .62 - r * rand(.4, 1);
            const g = x.createRadialGradient(px - r * .3, py - r * .4, r * .1, px, py, r * 1.6);
            g.addColorStop(0, '#ffffff'); g.addColorStop(.55, '#fdfdff'); g.addColorStop(1, 'rgba(225,232,250,0)');
            x.fillStyle = g; x.beginPath(); x.arc(px, py, r * 1.6, 0, 7); x.fill();
        }
        // shaded underside
        const sh = x.createLinearGradient(0, h * .5, 0, h);
        sh.addColorStop(0, 'rgba(160,180,220,0)'); sh.addColorStop(1, 'rgba(160,180,220,.35)');
        x.globalCompositeOperation = 'source-atop'; x.fillStyle = sh; x.fillRect(0, 0, w, h);
        return c;
    }
    function initClouds() {
        cctx = fit(cloudC);
        const n = touch ? 7 : 12;
        clouds = Array.from({ length: n }, (_, i) => {
            const w = rand(220, 520) * (W < 700 ? .6 : 1);
            return { img: makeCloudSprite(w), x: rand(-w, W), y: rand(H * .02, H * .5), v: rand(.08, .35), z: rand(.3, 1) };
        });
    }
    function drawClouds() {
        cctx.clearRect(0, 0, W, H);
        for (const c of clouds) {
            c.x += c.v * (1 + warp * 6);
            if (c.x > W + 40) c.x = -c.img.width - 40;
            cctx.globalAlpha = .65 + c.z * .35;
            cctx.drawImage(c.img, c.x - (mouse.x - W / 2) * c.z * .02, c.y - scrollY * c.z * .06);
        }
        cctx.globalAlpha = 1;
    }

    /* ---------------- DAY: meadow (grass + petals) ---------------- */
    const meadowC = document.getElementById('meadow-canvas');
    let mctx, blades = [], petals = [];
    function initMeadow() {
        mctx = fit(meadowC);
        const n = Math.round(W / (touch ? 7 : 4));
        blades = Array.from({ length: n }, (_, i) => ({ x: (i / n) * W + rand(-3, 3), h: rand(20, 55), w: rand(2, 4), ph: Math.random() * 6, c: `hsl(${rand(95, 125)} ${rand(45, 65)}% ${rand(26, 42)}%)` }));
        petals = Array.from({ length: touch ? 16 : 34 }, () => newPetal(true));
    }
    function newPetal(anywhere) {
        return { x: anywhere ? rand(0, W) : rand(-50, W), y: anywhere ? rand(-H, H) : -20, s: rand(4, 8), vy: rand(.4, 1.1), vx: rand(.3, 1.2), r: rand(0, 6), vr: rand(-.04, .04), hue: rand(330, 360) };
    }
    function drawMeadow(t) {
        mctx.clearRect(0, 0, W, H);
        const wind = Math.sin(t * .0008) * 6 + (mouse.x / W - .5) * 10;
        for (const b of blades) {
            const dx = b.x - mouse.x, near = Math.max(0, 1 - Math.abs(dx) / 120) * (mouse.y > H - 120 ? 1 : 0);
            const bend = wind + Math.sin(t * .002 + b.ph) * 4 + near * 25 * Math.sign(dx || 1);
            mctx.strokeStyle = b.c; mctx.lineWidth = b.w; mctx.lineCap = 'round';
            mctx.beginPath(); mctx.moveTo(b.x, H + 4);
            mctx.quadraticCurveTo(b.x + bend * .4, H - b.h * .5, b.x + bend, H - b.h); mctx.stroke();
        }
        for (const p of petals) {
            p.y += p.vy; p.x += p.vx + Math.sin(t * .001 + p.r) * .4 + warp * 4; p.r += p.vr;
            if (p.y > H + 20 || p.x > W + 40) Object.assign(p, newPetal(false));
            mctx.save(); mctx.translate(p.x, p.y); mctx.rotate(p.r);
            mctx.fillStyle = `hsla(${p.hue} 90% 88% / .9)`;
            mctx.beginPath(); mctx.ellipse(0, 0, p.s, p.s * .55, 0, 0, 7); mctx.fill();
            mctx.restore();
        }
    }

    /* ---------------- FX layer: cursor trail + bursts ---------------- */
    const fxC = document.getElementById('fx-canvas');
    let fctx, parts = [];
    function spawn(x, y, n, kind) {
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2, sp = kind === 'trail' ? rand(.2, 1.2) : rand(2, 9);
            parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (kind === 'trail' ? .3 : 0), life: 1, decay: kind === 'trail' ? rand(.02, .04) : rand(.012, .025), s: kind === 'trail' ? rand(1, 2.6) : rand(2, 6), kind, hue: rand(0, 1), rot: rand(0, 6) });
        }
    }
    function drawFx() {
        fctx.clearRect(0, 0, W, H);
        const day = world() === 'day';
        parts = parts.filter(p => p.life > 0);
        for (const p of parts) {
            p.x += p.vx; p.y += p.vy; p.vy += p.kind === 'burst' ? .12 : 0; p.vx *= .98; p.life -= p.decay; p.rot += .1;
            fctx.globalAlpha = Math.max(0, p.life);
            if (day) {
                fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.rot);
                fctx.fillStyle = p.hue < .4 ? '#ffb3c8' : p.hue < .7 ? '#fff1a6' : '#9be08a';
                fctx.beginPath(); fctx.ellipse(0, 0, p.s * 1.4, p.s * .7, 0, 0, 7); fctx.fill(); fctx.restore();
            } else {
                fctx.fillStyle = p.hue < .33 ? '#6ef3ff' : p.hue < .66 ? '#ff6ad5' : '#ffffff';
                fctx.shadowBlur = 12; fctx.shadowColor = fctx.fillStyle;
                if (p.kind === 'burst' && p.hue > .8) {
                    fctx.save(); fctx.translate(p.x, p.y); fctx.rotate(p.rot); star(fctx, p.s * 1.6); fctx.restore();
                } else { fctx.beginPath(); fctx.arc(p.x, p.y, p.s, 0, 7); fctx.fill(); }
                fctx.shadowBlur = 0;
            }
        }
        fctx.globalAlpha = 1;
    }
    function star(c, r) {
        c.beginPath();
        for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, rr = i % 2 ? r * .45 : r; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
        c.closePath(); c.fill();
    }

    /* ---------------- loop ---------------- */
    function resize() {
        W = innerWidth; H = innerHeight;
        initStars(); initClouds(); initMeadow(); fctx = fit(fxC);
    }
    let lastTrail = 0;
    function loop(t) {
        mouse.x += (mouse.tx - mouse.x) * .08; mouse.y += (mouse.ty - mouse.y) * .08;
        if (world() === 'night') drawStars(t);
        else { drawClouds(); drawMeadow(t); moveValley(); }
        if (!touch && t - lastTrail > 16) { spawn(mouse.tx, mouse.ty, 1, 'trail'); lastTrail = t; }
        drawFx();
        // night planets parallax
        if (world() === 'night') {
            pBig.style.transform = `translate3d(${(mouse.x - W / 2) * -.03}px, ${scrollY * -.15 + (mouse.y - H / 2) * -.03}px, 0)`;
            pSmall.style.transform = `translate3d(${(mouse.x - W / 2) * .05}px, ${scrollY * -.3}px, 0)`;
        } else {
            sun.style.transform = `translate3d(${(mouse.x - W / 2) * -.015}px, ${scrollY * .12}px, 0)`;
        }
        requestAnimationFrame(loop);
    }
    const pBig = document.querySelector('.planet-big'), pSmall = document.querySelector('.planet-small'), sun = document.querySelector('.sun');

    addEventListener('resize', () => { clearTimeout(resize.t); resize.t = setTimeout(resize, 150); });
    addEventListener('pointermove', e => { mouse.tx = e.clientX; mouse.ty = e.clientY; }, { passive: true });
    addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

    buildValley();
    resize();
    if (reduce) {
        // one static frame of each world
        drawStars(0); drawClouds(); drawMeadow(0); moveValley();
    } else requestAnimationFrame(loop);

    window.Scene = {
        burst: (x, y, n = 36) => { if (!reduce) spawn(x, y, n, 'burst'); },
        warp: (on) => { warpTarget = on ? 1 : 0; },
        redraw: () => { if (reduce) { drawStars(0); drawClouds(); drawMeadow(0); moveValley(); } }
    };
})();
