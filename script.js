// UI: loader, world switch, cursor, sections, terminal, projects, stats.
(() => {
    const S = window.SITE;
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const root = document.documentElement;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = matchMedia('(hover: none)').matches;
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    /* ---------------- world (night / day) ---------------- */
    const saved = (() => { try { return localStorage.getItem('world'); } catch { return null; } })();
    if (saved === 'day' || saved === 'night') root.dataset.world = saved;
    const label = $('#wt-label');
    const syncLabel = () => { label.textContent = root.dataset.world === 'day' ? 'morning' : 'night'; };
    syncLabel();

    function setWorld(next) {
        root.dataset.world = next;
        syncLabel();
        try { localStorage.setItem('world', next); } catch { }
        Scene.redraw();
        $('meta[name="theme-color"]').content = next === 'day' ? '#bfe3f7' : '#05060f';
    }
    $('#world-toggle').addEventListener('click', e => {
        const next = root.dataset.world === 'day' ? 'night' : 'day';
        const x = e.clientX || innerWidth - 120, y = e.clientY || 40;
        if (!document.startViewTransition || reduce) { setWorld(next); return; }
        const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        const t = document.startViewTransition(() => setWorld(next));
        t.ready.then(() => root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
            { duration: 1100, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' }
        ));
        toast(next === 'day' ? '☀ good morning, valley' : '☾ back to the stars');
    });

    /* ---------------- loader ---------------- */
    const ldWords = ['initialising universe', 'placing planets', 'growing grass', 'compiling ronak.cpp', 'ready'];
    let pct = 0;
    const ldTimer = setInterval(() => {
        pct = Math.min(100, pct + Math.random() * 14 + 4);
        $('#ld-num').textContent = String(Math.floor(pct)).padStart(2, '0');
        $('#ld-bar').style.width = pct + '%';
        $('#ld-text').textContent = ldWords[Math.min(ldWords.length - 1, Math.floor(pct / 25))];
        if (pct >= 100) { clearInterval(ldTimer); setTimeout(start, 250); }
    }, reduce ? 10 : 70);

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    function start() {
        $('#loader').classList.add('done');
        document.body.classList.remove('loading');
        setTimeout(() => { $('#loader').style.display = 'none'; }, 1100);
        splitName();
        typeLoop();
        observe();
    }

    /* ---------------- toast ---------------- */
    function toast(msg) {
        const t = $('#toast');
        t.textContent = msg; t.classList.add('show');
        clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200);
    }

    /* ---------------- cursor ---------------- */
    const cur = $('#cursor'), curLabel = $('#cursor-label');
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    if (!touch) {
        addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
        (function c() { cx += (tx - cx) * .22; cy += (ty - cy) * .22; cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`; requestAnimationFrame(c); })();
        document.addEventListener('pointerover', e => {
            const t = e.target.closest('a, button, [data-cursor], input, .cert, .proj');
            if (!t) { cur.classList.remove('big'); return; }
            const text = t.dataset.cursor || (t.classList.contains('proj') ? 'open' : t.classList.contains('cert') ? 'zoom' : '');
            curLabel.textContent = text;
            cur.classList.toggle('big', !!text);
        });
    } else document.body.classList.add('no-cursor-fx');

    // click bursts anywhere
    addEventListener('pointerdown', e => { if (!e.target.closest('input')) Scene.burst(e.clientX, e.clientY, 22); });

    /* ---------------- magnetic + tilt ---------------- */
    if (!touch && !reduce) {
        $$('.magnetic').forEach(m => {
            m.addEventListener('pointermove', e => {
                const r = m.getBoundingClientRect();
                m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .3}px, ${(e.clientY - r.top - r.height / 2) * .4}px)`;
            });
            m.addEventListener('pointerleave', () => { m.style.transform = ''; });
        });
        document.addEventListener('pointermove', e => {
            const t = e.target.closest('[data-tilt], .proj');
            if (tilt.el && tilt.el !== t) { tilt.el.style.transform = ''; tilt.el = null; }
            if (!t) return;
            tilt.el = t;
            const r = t.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
            const amt = t.classList.contains('proj') ? 6 : 10;
            t.style.transform = `perspective(900px) rotateX(${(.5 - py) * amt}deg) rotateY(${(px - .5) * amt}deg) translateZ(0)`;
            t.style.setProperty('--mx', px * 100 + '%'); t.style.setProperty('--my', py * 100 + '%');
        }, { passive: true });
    }
    const tilt = { el: null };

    /* ---------------- hero name ---------------- */
    function splitName() {
        $$('#hero-name .hn-row').forEach((row, ri) => {
            const text = row.dataset.text;
            row.innerHTML = [...text].map((ch, i) => `<span class="ch drop" style="--i:${i + ri * 5}">${ch}</span>`).join('');
        });
        $$('#hero-name .ch').forEach(ch => {
            ch.addEventListener('animationend', () => ch.classList.remove('drop', 'jelly'));
            ch.addEventListener('pointerenter', () => { ch.classList.remove('jelly'); void ch.offsetWidth; ch.classList.add('jelly'); });
        });
    }
    // avatar follows mouse a little
    const av = $('.avatar-core');
    if (!touch) addEventListener('pointermove', e => {
        const r = av.getBoundingClientRect();
        av.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .025}px, ${(e.clientY - r.top - r.height / 2) * .025}px)`;
    }, { passive: true });

    /* ---------------- typed roles ---------------- */
    function typeLoop() {
        const el = $('#typed');
        let ri = 0, ci = S.roles[0].length, del = true;
        if (reduce) return;
        (function tick() {
            const word = S.roles[ri];
            ci += del ? -1 : 1;
            el.textContent = word.slice(0, ci);
            let wait = del ? 40 : 75;
            if (!del && ci === word.length) { del = true; wait = 1800; }
            else if (del && ci === 0) { del = false; ri = (ri + 1) % S.roles.length; wait = 300; }
            setTimeout(tick, wait);
        })();
    }

    /* ---------------- scramble text ---------------- */
    const GLYPHS = '!<>-_\\/[]{}=+*^?#ABCDEF0123456789';
    function scramble(el) {
        const final = el.dataset.final || (el.dataset.final = el.textContent);
        let frame = 0;
        const total = 22;
        (function step() {
            el.textContent = [...final].map((c, i) => (c === ' ' || frame / total > i / final.length) ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('');
            if (++frame <= total) requestAnimationFrame(step); else el.textContent = final;
        })();
    }
    $$('[data-scramble]').forEach(el => el.addEventListener('pointerenter', () => scramble(el)));

    /* ---------------- counters ---------------- */
    function count(el) {
        const target = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0), suf = el.dataset.suffix || '';
        const t0 = performance.now(), dur = 1600;
        (function f(now) {
            const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
            el.textContent = (target * e).toFixed(dec) + (p === 1 ? suf : '');
            if (p < 1) requestAnimationFrame(f);
        })(t0);
    }

    /* ---------------- reveal on scroll ---------------- */
    function observe() {
        const io = new IntersectionObserver(entries => entries.forEach(en => {
            if (!en.isIntersecting) return;
            const t = en.target;
            t.classList.add('in');
            $$('[data-count]', t).forEach(c => { if (!c.dataset.done) { c.dataset.done = 1; count(c); } });
            const title = $('[data-scramble]', t) || (t.matches('[data-scramble]') ? t : null);
            if (title && !title.dataset.seen) { title.dataset.seen = 1; scramble(title); }
            io.unobserve(t);
        }), { threshold: .14, rootMargin: '0px 0px -40px 0px' });
        $$('.reveal').forEach(el => {
            const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
            el.style.setProperty('--d', Math.min(sibs.indexOf(el), 6) * .08 + 's');
            io.observe(el);
        });
        const statIO = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { animateStats(); statIO.disconnect(); } }), { threshold: .3 });
        statIO.observe($('#stats'));
    }

    /* ---------------- scroll: progress, nav, journey ---------------- */
    const nav = $('#nav'), prog = $('#progress'), jFill = $('#journey-fill'), jList = $('#journey-list');
    let lastY = 0;
    const sections = $$('main section[id]');
    addEventListener('scroll', () => {
        const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
        prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        nav.classList.toggle('hide', y > lastY && y > 400 && !$('#nav-links').classList.contains('open'));
        lastY = y;
        const r = jList.getBoundingClientRect();
        jFill.style.transform = `scaleY(${Math.min(1, Math.max(0, (innerHeight * .7 - r.top) / r.height))})`;
        let cur = '';
        for (const s of sections) if (s.getBoundingClientRect().top < innerHeight * .4) cur = s.id;
        $$('.nav-links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
    }, { passive: true });

    const burger = $('#burger'), links = $('#nav-links');
    burger.addEventListener('click', () => { const o = links.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
    links.addEventListener('click', e => { if (e.target.closest('a')) { links.classList.remove('open'); burger.setAttribute('aria-expanded', false); } });

    /* ---------------- projects ---------------- */
    const VIZ = {
        gif: () => `<div class="viz viz-gif"><img src="https://raw.githubusercontent.com/ronaksarda/GitSpace/main/readme_demo.gif" alt="GitSpace demo: flying a ship between developer islands" loading="lazy"><span class="viz-label">live at gitspace.me</span></div>`,
        funnel: () => `<div class="viz"><span class="viz-timer">⏱ &lt; 5 min · CPU</span><div class="funnel"><div><span>100,000 candidates</span></div><div><span>3,000 shortlisted</span></div><div><span>top 100 ✓</span></div></div></div>`,
        budget: () => `<div class="viz"><div class="budget"><div class="budget-row"><span>travel budget</span><span>$2,500</span></div><div class="budget-bar"><span></span></div><div class="memo">🧠 memory: Maya's invoices run ~50% high → this is really $902. 84% used. careful.</div></div></div>`,
        label: () => `<div class="viz"><div class="label-card"><b>NET QTY 500 g</b><div>MRP ₹ 120.00 (incl. taxes) <span class="ok">✓</span></div><div>Batch: B2026-114 <span class="ok">✓</span></div><div>Mfd: 08/2026 <span class="ok">✓</span></div><div>Customer care: 1800-… <span class="ok">✓</span></div></div></div>`,
        wave: () => `<div class="viz"><span class="keycap">F8</span><div class="wave">${Array.from({ length: 22 }, (_, i) => `<i style="animation-delay:${(i * 0.07 % 1).toFixed(2)}s;animation-duration:${(.5 + (i * 37 % 10) / 14).toFixed(2)}s"></i>`).join('')}</div></div>`,
        chat: () => `<div class="viz"><span class="doc-ico">📄 thesis.pdf · local</span><div class="chat"><div class="q">what's the main finding?</div><div class="a">Section 4: latency drops 38% with batching.</div><div class="q q2">cite it?</div><div class="a a2">p. 12, table 3 ✓</div></div></div>`,
        trail: () => `<div class="viz trail"><span class="fps">60 FPS</span><span class="emo" id="emo">😄</span><svg viewBox="0 0 400 200"><path d="M20,150 C80,20 140,180 200,90 S320,10 380,120"/></svg></div>`,
        vault: () => `<div class="viz"><div class="bits"><div>${'10110100 ⊕ 01101001 = 11011101 · '.repeat(40)}</div></div><div class="vault-lock"><span>🔒</span></div></div>`
    };
    const projWrap = $('#projects');
    projWrap.innerHTML = S.projects.map(p => `
        <button class="proj glass reveal${p.wide ? ' wide' : ''}" data-id="${p.id}" data-cat="${p.cat.join(' ')}">
            <div class="proj-viz">${VIZ[p.viz]()}</div>
            <div class="proj-body">
                <div class="proj-top">
                    <div><div class="proj-kicker">${esc(p.kicker)}</div><h3>${esc(p.name)}</h3></div>
                    <div class="proj-badges">
                        ${p.live ? '<span class="badge live">live</span>' : ''}
                        ${p.wip ? '<span class="badge wip">wip</span>' : ''}
                        ${p.team ? '<span class="badge team">team · I built it</span>' : ''}
                        ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}
                        <span class="badge star" data-stars="${p.repo.split('/').pop()}" hidden></span>
                    </div>
                </div>
                <p class="proj-hook">${esc(p.hook)}</p>
                <p>${esc(p.desc)}</p>
                <div class="tags">${p.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>
                <span class="proj-open">read the full story <b>→</b></span>
            </div>
        </button>`).join('');

    // cycle emoji on SoulFlow
    const emos = ['😄', '😮', '😠', '😌', '🤩'];
    let ei = 0;
    setInterval(() => { const e = $('#emo'); if (e) e.textContent = emos[ei = (ei + 1) % emos.length]; }, 1000);

    $$('.filter').forEach(f => f.addEventListener('click', () => {
        $$('.filter').forEach(x => x.classList.toggle('active', x === f));
        const cat = f.dataset.filter;
        $$('.proj').forEach(p => {
            const show = cat === 'all' || p.dataset.cat.split(' ').includes(cat);
            if (show) { p.classList.remove('hidden'); requestAnimationFrame(() => p.classList.remove('leaving')); }
            else { p.classList.add('leaving'); setTimeout(() => p.classList.contains('leaving') && p.classList.add('hidden'), 450); }
        });
    }));

    projWrap.addEventListener('click', e => {
        const card = e.target.closest('.proj');
        if (!card) return;
        const p = S.projects.find(x => x.id === card.dataset.id);
        openModal(`
            <div class="m-kicker">${esc(p.kicker)}</div>
            <h3 class="m-title" id="modal-title">${esc(p.name)}</h3>
            <p class="m-hook">${esc(p.hook)}</p>
            <p class="muted">${esc(p.desc)}</p>
            <ul class="m-list">${p.points.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
            <div class="tags">${p.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>
            ${p.team ? '<p class="m-team">Team project. My teammates pitched it, I built the entire thing end to end.</p>' : ''}
            <div class="m-links">
                <a class="btn btn-primary" href="${p.repo}" target="_blank" rel="noopener"><span>source code</span><b>↗</b></a>
                ${p.live ? `<a class="btn btn-ghost" href="${p.live}" target="_blank" rel="noopener"><span>open live</span><b>↗</b></a>` : ''}
            </div>`);
    });

    /* ---------------- hangar + lab ---------------- */
    $('#hangar').innerHTML = S.hangar.map(h => `
        <${h.repo ? `a href="${h.repo}" target="_blank" rel="noopener"` : 'div'} class="hangar-card glass" data-tilt>
            <h4><span>${h.icon}</span>${esc(h.name)} <span class="badge wip">wip</span></h4>
            <p>${esc(h.desc)}</p>
            <p class="muted" style="font-family:var(--font-mono);font-size:.75rem;margin-top:6px">${esc(h.tags)}</p>
            <div class="progress"><span style="width:${h.progress}%"></span></div>
        </${h.repo ? 'a' : 'div'}>`).join('');
    $('#lab').innerHTML = S.lab.map(l => `<a class="lab-chip" href="${l.repo}" target="_blank" rel="noopener"><b>${esc(l.name)}</b><span>${esc(l.note)}</span></a>`).join('');

    /* ---------------- trophies + certs ---------------- */
    const certById = Object.fromEntries(S.certs.map(c => [c.id, c]));
    certById['abtalks'] = certById['abtalks'] || { id: 'abtalks', title: 'ViCoDathon 2026', by: 'AB Talks' };
    $('#trophies').innerHTML = S.trophies.map(t => `
        <${t.cert ? `button data-cert="${t.cert}"` : 'div'} class="trophy glass reveal${t.cert ? ' has-cert' : ''}" data-tilt>
            ${t.cert ? '<span class="t-cert">⧉</span>' : ''}
            <span class="t-ico">${t.ico}</span>
            <span class="t-big">${esc(t.big)}</span>
            <h4>${esc(t.title)}</h4>
            <p>${esc(t.text)}</p>
        </${t.cert ? 'button' : 'div'}>`).join('');

    const rail = $('#cert-rail');
    rail.innerHTML = S.certs.map(c => `
        <button class="cert glass" data-cert="${c.id}">
            <img src="assets/certs/${c.id}.jpg" alt="${esc(c.title)} certificate" loading="lazy" draggable="false">
            <b>${esc(c.title)}</b><span>${esc(c.by)}</span>
        </button>`).join('');

    let dragMoved = false;
    document.addEventListener('click', e => {
        const b = e.target.closest('[data-cert]');
        if (!b || dragMoved) return;
        const c = certById[b.dataset.cert];
        openModal(`<img src="assets/certs/${c.id}.jpg" alt="${esc(c.title)} certificate"><div class="m-cap"><b id="modal-title">${esc(c.title)}</b><span>${esc(c.by)}</span></div>`, true);
    });
    // drag-to-scroll the certificate rail
    let down = false, sx = 0, sl = 0;
    rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; dragMoved = false; sx = e.clientX; sl = rail.scrollLeft; });
    addEventListener('pointermove', e => {
        if (!down) return;
        const dx = e.clientX - sx;
        if (Math.abs(dx) > 5) { dragMoved = true; rail.classList.add('dragging'); }
        rail.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => { down = false; rail.classList.remove('dragging'); setTimeout(() => { dragMoved = false; }, 0); });

    /* ---------------- modal ---------------- */
    const modal = $('#modal'), mBody = $('#modal-body'), mCard = $('.modal-card');
    let lastFocus = null;
    function openModal(html, img) {
        lastFocus = document.activeElement;
        mBody.innerHTML = html;
        mCard.classList.toggle('img-mode', !!img);
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        $('.modal-x').focus();
    }
    function closeModal() {
        modal.hidden = true; document.body.style.overflow = '';
        lastFocus && lastFocus.focus();
    }
    modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

    /* ---------------- stack rows ---------------- */
    const notes = { 'C++': 'gold', 'C': 'gold', 'Python': 'daily', 'RAG pipelines': 'prod', 'Node.js': 'gitspace', 'PostgreSQL': 'gitspace', 'FastAPI': 'labelsure', 'OpenCV': 'soulflow', 'MCP': 'certified' };
    $('#stack-rows').innerHTML = S.stack.map((row, i) => {
        const pills = row.map(t => `<span class="pill">${esc(t)}${notes[t] ? `<i>${notes[t]}</i>` : ''}</span>`).join('');
        return `<div class="stack-row"><div class="stack-track" style="--dur:${34 + i * 6}s;--dir:${i % 2 ? 'reverse' : 'normal'}">${pills}${pills}</div></div>`;
    }).join('');

    /* ---------------- live stats ---------------- */
    const LANG_COLORS = { Python: '#3572A5', JavaScript: '#f1e05a', 'C++': '#f34b7d', C: '#8a8f99', HTML: '#e34c26', CSS: '#663399', TypeScript: '#3178c6' };
    let ghData = null, lcData = null;
    fetch('https://api.github.com/users/ronaksarda/repos?per_page=100').then(r => r.ok ? r.json() : null).then(repos => {
        if (!Array.isArray(repos)) return;
        const own = repos.filter(r => !r.fork);
        const stars = own.reduce((a, r) => a + r.stargazers_count, 0);
        const langs = {};
        own.forEach(r => { if (r.language) langs[r.language] = (langs[r.language] || 0) + 1; });
        ghData = { repos: own.length, stars, langs };
        own.forEach(r => {
            const b = $(`[data-stars="${r.name}"]`);
            if (b && r.stargazers_count > 0) { b.hidden = false; b.textContent = `★ ${r.stargazers_count}`; }
        });
        if (statsShown) paintGh();
    }).catch(() => { });
    fetch('https://api.github.com/users/ronaksarda').then(r => r.ok ? r.json() : null).then(u => { if (u) $('#gh-followers').textContent = u.followers; }).catch(() => { });
    fetch('https://leetcode-api-faisalshohag.vercel.app/ronnie0524').then(r => r.ok ? r.json() : null).then(d => {
        if (d && d.totalSolved) { lcData = d; $('#stat-lc').dataset.count = d.totalSolved; if (statsShown) paintLc(); }
    }).catch(() => { });

    let statsShown = false;
    function animateStats() { statsShown = true; paintGh(); paintLc(); }
    function tween(el, to) {
        const t0 = performance.now();
        (function f(n) { const p = Math.min(1, (n - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
    }
    function paintGh() {
        const d = ghData || { repos: 55, stars: 15, langs: { JavaScript: 18, HTML: 9, Python: 12, CSS: 3, 'C++': 3, C: 2 } };
        tween($('#gh-repos'), d.repos); tween($('#gh-stars'), d.stars);
        const total = Object.values(d.langs).reduce((a, b) => a + b, 0);
        const sorted = Object.entries(d.langs).sort((a, b) => b[1] - a[1]).slice(0, 6);
        $('#lang-bar').innerHTML = sorted.map(([l]) => `<span style="background:${LANG_COLORS[l] || '#9aa0c3'}"></span>`).join('');
        $('#lang-legend').innerHTML = sorted.map(([l, n]) => `<span><i style="background:${LANG_COLORS[l] || '#9aa0c3'}"></i>${l} ${Math.round(n / total * 100)}%</span>`).join('');
        requestAnimationFrame(() => $$('#lang-bar span').forEach((s, i) => { s.style.width = (sorted[i][1] / total * 100) + '%'; }));
    }
    function paintLc() {
        const d = lcData || { totalSolved: 334, easySolved: 167, mediumSolved: 138, hardSolved: 29 };
        const C = 2 * Math.PI * 50, tot = d.totalSolved || 1;
        const segs = [[ '#lc-easy', d.easySolved ], [ '#lc-med', d.mediumSolved ], [ '#lc-hard', d.hardSolved ]];
        let off = 0;
        segs.forEach(([id, v]) => {
            const len = v / tot * C * .96;
            const el = $(id);
            el.style.strokeDashoffset = -off;
            requestAnimationFrame(() => { el.style.strokeDasharray = `${len} ${C}`; });
            off += v / tot * C;
        });
        tween($('#lc-total'), d.totalSolved);
        $('#lc-e').textContent = d.easySolved; $('#lc-m').textContent = d.mediumSolved; $('#lc-h').textContent = d.hardSolved;
    }
    // swap contribution chart color with the world
    const contrib = $('#contrib-img');
    new MutationObserver(() => { contrib.src = `https://ghchart.rshah.org/${root.dataset.world === 'day' ? '2f8f5b' : '6ef3ff'}/ronaksarda`; }).observe(root, { attributes: true, attributeFilter: ['data-world'] });
    if (root.dataset.world === 'day') contrib.src = 'https://ghchart.rshah.org/2f8f5b/ronaksarda';

    /* ---------------- contact ---------------- */
    async function copy(text, msg) {
        try { await navigator.clipboard.writeText(text); toast(msg); }
        catch { toast(text); }
    }
    $('#mega-mail').addEventListener('click', e => {
        copy('rockysarda18@gmail.com', '✓ email copied, talk soon');
        const r = e.currentTarget.getBoundingClientRect();
        for (let i = 0; i < 5; i++) setTimeout(() => Scene.burst(r.left + Math.random() * r.width, r.top + r.height / 2, 30), i * 90);
    });
    $('#discord-handle').textContent = S.discord;
    $('#discord-tile').addEventListener('click', () => copy(S.discord, `✓ discord "${S.discord}" copied`));

    /* ---------------- terminal ---------------- */
    const out = $('#term-out'), input = $('#term-input'), body = $('#term-body');
    const print = (html, cls = '') => { const d = document.createElement('div'); d.className = 'ln ' + cls; d.innerHTML = html; out.appendChild(d); body.scrollTop = body.scrollHeight; };
    const cmds = {
        help: () => print(`<span class="c1">available commands</span>
  whoami     about me          projects   what I built
  skills     the arsenal       wins       receipts
  journey    experience        resume     download it
  contact    reach me          socials    all the links
  day/night  switch worlds     warp       engage hyperdrive
  sudo hire ronak              clear      wipe the screen`),
        whoami: () => print(`<span class="c2">Ronak Sarda</span>
Founding AI Engineering Intern @ FschoolAI
B.E. IT @ CBIT Hyderabad · class of 2029 · CGPA 8.68
building cool things from scratch.`),
        projects: () => { print(S.projects.map(p => `<span class="c1">${p.name.padEnd(20)}</span>${p.hook}`).join('\n')); },
        skills: () => print(S.stack.map(r => '› ' + r.join(' · ')).join('\n')),
        wins: () => print(S.trophies.map(t => `${t.ico} <span class="c5">${t.big.padEnd(7)}</span>${t.title}`).join('\n')),
        journey: () => print(`<span class="c3">2026 →</span> Founding AI Engineering Intern, FschoolAI
<span class="c3">2026  </span> Technical member, HICON &amp; AWS Club CBIT
<span class="c3">2025 →</span> B.E. IT, CBIT Hyderabad`),
        resume: () => { print('<span class="c3">↓ downloading Ronak_Sarda_Resume.pdf…</span>'); const a = document.createElement('a'); a.href = 'assets/resume/Ronak_Sarda_Resume.pdf'; a.download = ''; a.click(); },
        contact: () => print(`email   <a href="mailto:rockysarda18@gmail.com">rockysarda18@gmail.com</a>
phone   <a href="tel:+919390417137">+91 93904 17137</a>
discord ${esc(S.discord)}`),
        socials: () => print(`<a href="https://github.com/ronaksarda" target="_blank">github/ronaksarda</a>
<a href="https://www.linkedin.com/in/ronak-sarda05/" target="_blank">linkedin/ronak-sarda05</a>
<a href="https://leetcode.com/u/ronnie0524/" target="_blank">leetcode/ronnie0524</a>
<a href="https://www.hackerrank.com/profile/ronnie0524" target="_blank">hackerrank/ronnie0524</a>`),
        day: () => { if (root.dataset.world !== 'day') $('#world-toggle').click(); print('☀ good morning.', 'c5'); },
        night: () => { if (root.dataset.world !== 'night') $('#world-toggle').click(); print('☾ hello, stars.', 'c1'); },
        morning: () => cmds.day(),
        warp: () => { engageWarp(); print('🚀 hyperdrive engaged. hold on.', 'c2'); },
        'sudo hire ronak': () => { print('<span class="c3">[sudo] access granted.</span> opening mail client… 🎉'); setTimeout(() => location.href = 'mailto:rockysarda18@gmail.com?subject=Internship%20opportunity', 600); },
        sudo: () => print('nice try. try <span class="c2">sudo hire ronak</span>', 'c4'),
        ls: () => print('projects/  certificates/  resume.pdf  secrets.txt  coffee.sh'),
        'cat secrets.txt': () => print('i debug with console.log and i am not sorry.', 'c4'),
        'cat resume.pdf': () => cmds.resume(),
        './coffee.sh': () => print('☕ brewing… ████████████ 100%. productivity +40%.', 'c5'),
        cgpa: () => print('8.68 / 10 (1st year). 2nd year loading…', 'c5'),
        date: () => print(new Date().toString(), 'c4'),
        clear: () => { out.innerHTML = ''; },
        exit: () => print('you can check out any time you like, but you can never leave.', 'c4'),
        hello: () => print('hey! 👋 type <span class="c1">help</span>.'), hi: () => cmds.hello()
    };
    function run(raw) {
        const c = raw.trim().toLowerCase();
        print(`<span class="c3">➜ ~</span> ${esc(raw)}`);
        if (!c) return;
        (cmds[c] || (() => print(`command not found: ${esc(c)}. try <span class="c1">help</span>`, 'c4')))();
    }
    const hist = []; let hi = 0;
    $('#term-form').addEventListener('submit', e => { e.preventDefault(); hist.push(input.value); hi = hist.length; run(input.value); input.value = ''; });
    input.addEventListener('keydown', e => {
        if (e.key === 'ArrowUp' && hi > 0) { input.value = hist[--hi]; e.preventDefault(); }
        if (e.key === 'ArrowDown') { input.value = hist[++hi] || ''; hi = Math.min(hi, hist.length); }
        if (e.key === 'Tab') { e.preventDefault(); const m = Object.keys(cmds).find(k => k.startsWith(input.value.toLowerCase())); if (m) input.value = m; }
    });
    $('#terminal').addEventListener('click', () => input.focus({ preventScroll: true }));
    // intro lines type themselves when the terminal scrolls into view
    const intro = [
        ['<span class="c3">➜ ~</span> whoami', ''],
        ['Ronak Sarda', 'c2'],
        ['Founding AI Engineering Intern @ FschoolAI · IT @ CBIT \'29', ''],
        ['<span class="c3">➜ ~</span> cat status.txt', ''],
        ['open to internships from Jan 2027 ✓', 'c5'],
        ['type <span class="c1">help</span> to explore, or <span class="c2">sudo hire ronak</span>', 'c4']
    ];
    new IntersectionObserver((es, o) => {
        if (!es[0].isIntersecting) return; o.disconnect();
        intro.forEach(([h, c], i) => setTimeout(() => print(h, c), reduce ? 0 : 350 * i));
    }, { threshold: .4 }).observe($('#terminal'));

    /* ---------------- warp + konami ---------------- */
    function engageWarp() {
        root.classList.add('warp'); Scene.warp(true);
        setTimeout(() => { Scene.warp(false); root.classList.remove('warp'); }, 2600);
    }
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let kp = 0;
    addEventListener('keydown', e => {
        if (e.target === input) return;
        kp = (e.key.toLowerCase() === KONAMI[kp].toLowerCase()) ? kp + 1 : (e.key === KONAMI[0] ? 1 : 0);
        if (kp === KONAMI.length) {
            kp = 0; engageWarp(); toast('🚀 konami unlocked: hyperdrive!');
            for (let i = 0; i < 12; i++) setTimeout(() => Scene.burst(Math.random() * innerWidth, Math.random() * innerHeight, 30), i * 120);
        }
    });

    /* ---------------- footer clock ---------------- */
    $('#year').textContent = new Date().getFullYear();
    const clock = () => { $('#clock').textContent = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }); };
    clock(); setInterval(clock, 20000);
})();
