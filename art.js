// Pixel art, drawn in code: the logo and one cover per project.
// Each cover is a 32x18 grid of squares rendered as crisp SVG rects.
(() => {
    const W = 32, H = 18;
    const K = { teal: '#5ee0c4', blue: '#7aa7ff', violet: '#b49cff', pink: '#ff7ab6', amber: '#ffc44d', green: '#7bd88f', red: '#ff6b5e', white: '#f4f3ef', dim: '#6b7280' };

    const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const mk = (w = W, h = H) => ({ w, h, g: Array.from({ length: h }, () => Array(w).fill(null)) });
    const px = (c, x, y, col) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < c.w && y < c.h) c.g[y][x] = col; };
    const rect = (c, x, y, w, h, col) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(c, x + i, y + j, col); };
    const line = (c, x0, y0, x1, y1, col) => {
        let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy;
        for (;;) { px(c, x0, y0, col); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
    };
    const svg = (c, cls, fit = 'slice') => {
        let r = '';
        c.g.forEach((row, y) => {
            let x = 0;
            while (x < c.w) {
                const col = row[x];
                if (!col) { x++; continue; }
                let n = 1; while (x + n < c.w && row[x + n] === col) n++;
                r += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${col}"/>`; x += n;
            }
        });
        return `<svg class="${cls}" viewBox="0 0 ${c.w} ${c.h}" preserveAspectRatio="xMidYMid ${fit}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
    };

    const covers = {
        ranker(c) { // 100,000 candidates narrowing to a few
            const r = rng(3);
            for (let y = 0; y < 12; y++) { const half = 14 - y; for (let x = 16 - half; x <= 16 + half; x += 2) px(c, x, y + 1, r() > .25 ? K.teal : K.dim); }
            rect(c, 15, 13, 2, 2, K.teal); rect(c, 14, 15, 4, 1, K.amber); px(c, 15, 16, K.amber); px(c, 16, 16, K.amber);
        },
        rideradar(c) { // risk cells with a route across them
            const r = rng(11), cols = [K.green, K.green, K.green, K.amber, K.red];
            for (let y = 0; y < 5; y++) for (let x = 0; x < 8; x++) { const col = cols[Math.floor(r() * cols.length)]; rect(c, x * 4, y * 4 - 1 + (y ? 0 : 1), 3, y ? 3 : 2, col); }
            [[1, 15], [6, 12], [11, 11], [15, 7], [21, 7], [26, 3], [30, 2]].reduce((a, b) => { line(c, a[0], a[1], b[0], b[1], K.white); return b; });
            rect(c, 29, 1, 3, 3, K.white);
        },
        ideator(c) { // knowledge graph with one decision node
            const n = [[4, 4], [12, 2], [20, 5], [27, 3], [8, 12], [16, 10], [24, 13], [14, 16]];
            [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 5], [5, 6], [4, 7], [5, 7], [6, 3]].forEach(([a, b]) => line(c, n[a][0] + 1, n[a][1] + 1, n[b][0] + 1, n[b][1] + 1, K.dim));
            n.forEach(([x, y], i) => rect(c, x, y, 3, 3, i === 5 ? K.amber : [K.teal, K.blue, K.violet][i % 3]));
        },
        alreadybuilt(c) { // market quadrant with an empty corner
            rect(c, 16, 1, 1, 16, K.dim); rect(c, 2, 9, 28, 1, K.dim);
            [[5, 4], [8, 6], [11, 3], [6, 13], [10, 14], [20, 13], [24, 11], [13, 12]].forEach(([x, y], i) => rect(c, x, y, 2, 2, [K.blue, K.violet, K.teal][i % 3]));
            [[22, 3], [26, 2], [25, 6]].forEach(([x, y]) => rect(c, x, y, 1, 1, K.dim));
            rect(c, 21, 4, 3, 3, K.amber); px(c, 22, 3, K.amber); px(c, 22, 7, K.amber); px(c, 20, 5, K.amber); px(c, 24, 5, K.amber);
        },
        grantanchor(c) { // spend bars against a limit
            const h = [5, 8, 6, 10, 7, 13], limit = 11;
            h.forEach((v, i) => rect(c, 3 + i * 4, 16 - v, 3, v, v > limit ? K.red : K.teal));
            for (let x = 1; x < 31; x += 2) px(c, x, 16 - limit, K.amber);
            rect(c, 1, 16, 30, 1, K.dim);
        },
        labelsure(c) { // a label being audited
            rect(c, 4, 2, 16, 14, K.white); rect(c, 5, 3, 14, 12, '#1f2937');
            [4, 6, 8, 10].forEach((y, i) => rect(c, 6, y, 12 - i * 2, 1, K.dim));
            rect(c, 6, 12, 5, 2, K.amber);
            [[23, 4], [24, 5], [25, 6], [26, 5], [27, 4], [28, 3]].forEach(([x, y]) => px(c, x, y, K.green));
            [[23, 11], [27, 11], [24, 12], [26, 12], [25, 13], [24, 14], [26, 14], [23, 15], [27, 15]].forEach(([x, y]) => px(c, x, y, K.red));
        },
        reader(c) { // sound wave
            const r = rng(5);
            for (let i = 0; i < 15; i++) { const hgt = 1 + Math.round(Math.abs(Math.sin(i * .55)) * 6 + r() * 3); rect(c, 2 + i * 2, 9 - hgt, 1, hgt * 2, i % 5 === 2 ? K.pink : K.violet); }
        },
        docask(c) { // a document and the answer it gave
            rect(c, 3, 2, 11, 14, K.white); rect(c, 4, 3, 9, 12, '#1f2937');
            [4, 6, 8, 10, 12].forEach((y) => rect(c, 5, y, 7, 1, K.dim));
            rect(c, 16, 3, 13, 5, K.teal); rect(c, 18, 8, 2, 1, K.teal); rect(c, 18, 4, 9, 1, '#0b3d34'); rect(c, 18, 6, 6, 1, '#0b3d34');
            rect(c, 19, 10, 10, 4, K.blue); rect(c, 27, 14, 2, 1, K.blue); rect(c, 21, 11, 6, 1, '#16315f');
        },
        soulflow(c) { // neon hand trail
            for (let i = 0; i < 60; i++) { const t = i / 59, x = 3 + t * 26, y = 9 + Math.sin(t * 9) * (5 - t * 2); px(c, x, y, [K.blue, K.violet, K.pink][Math.floor(t * 3)]); px(c, x, y + 1, [K.blue, K.violet, K.pink][Math.floor(t * 3)]); }
            rect(c, 29, 3, 2, 2, K.white);
        },
        vault(c) { // padlock
            rect(c, 9, 8, 14, 9, K.amber); rect(c, 10, 9, 12, 7, '#b8892f');
            rect(c, 11, 3, 2, 6, K.white); rect(c, 19, 3, 2, 6, K.white); rect(c, 13, 2, 6, 2, K.white);
            rect(c, 15, 11, 2, 3, '#1f2937');
        }
    };

    const cache = {};
    const cover = (id, cls = 'art', fit) => {
        if (!covers[id]) return '';
        if (!cache[id]) { const c = mk(); covers[id](c); cache[id] = c; }
        return svg(cache[id], cls, fit);
    };

    // the logo: a small guy with a pen
    const guy = [
        '................',
        '.....hhhhhh.....',
        '....hhhhhhhh....',
        '....hssssssh....',
        '....sossssos....',
        '....ssssssss....',
        '....sssoosss....',
        '.....ssssss.....',
        '....bbbbbbbbk...',
        '...sbbbbbbbbsk..',
        '...sbbbbbbbb.k..',
        '....bbbbbbbb.k..',
        '....pppppppp.n..',
        '....ppp..ppp....',
        '....ppp..ppp....',
        '...ooo...ooo....'
    ];
    const gp = { h: '#4a2f1d', s: '#f1c27d', o: '#18181b', b: '#2f8cff', p: '#52525b', k: '#ff5a36', n: '#18181b' };
    const logoGrid = () => { const c = mk(16, 16); guy.forEach((row, y) => [...row].forEach((ch, x) => { if (gp[ch]) px(c, x, y, gp[ch]); })); return c; };

    window.ART = { cover, has: (id) => !!covers[id], logo: (cls = 'logo-guy') => svg(logoGrid(), cls), logoGrid };
})();
