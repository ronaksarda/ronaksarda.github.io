// Builds every section of the page from data.js. Edit data.js to change what the site says.
(() => {
    const S = window.SITE;
    const $ = (q) => document.querySelector(q);
    const root = document.documentElement;
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
    const ext = (href, label, cls = 'btn-glass') => `<a class="btn ${cls}" href="${href}" target="_blank" rel="noopener">${label}${arrow}</a>`;

    /* ---------- icons ---------- */
    const ico = {
        me: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
        projects: '<path d="M3 7h7l2 2h9v10H3z"/><path d="M3 7V5h6"/>',
        experience: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3M3 13h18"/>',
        skills: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
        wins: '<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H3c0 3 2 5 4 5M17 6h4c0 3-2 5-4 5M12 14v4M8 21h8"/>',
        contact: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
        play: '<rect x="2" y="7" width="20" height="10" rx="4"/><path d="M7 10v4M5 12h4M16 11v.01M18 13v.01"/>',
        home: '<path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/>',
        github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
        linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 11v5M8 8v.01M12 16v-5M16 16v-3a2 2 0 0 0-4 0"/>',
        leetcode: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3M13 15h4"/>',
        hackerrank: '<path d="M12 2 3 7v10l9 5 9-5V7z"/><path d="M9 8v8M15 8v8M9 12h6"/>'
    };
    const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ico[k]}</svg>`;
    document.querySelectorAll('[data-ico]').forEach((el) => (el.innerHTML = svg(el.dataset.ico)));

    $('#logo').innerHTML = window.ART.logo();

    /* ---------- hero socials ---------- */
    $('#socials').innerHTML = S.links.map((l) => `<li><a href="${l.href}" target="_blank" rel="noopener" aria-label="${esc(l.k)}" title="${esc(l.k)}">${svg(l.k.toLowerCase())}</a></li>`).join('');

    /* ---------- about ---------- */
    $('#about-body').innerHTML = `
        <div class="about-text">
            <p class="lead">I'm Ronak, a second-year IT student at CBIT Hyderabad and the founding AI engineering intern at <b>FschoolAI</b>.</p>
            <p>Most of my work is AI agents and RAG pipelines, plus C++ when something has to be fast: ranking 100,000 candidates on one CPU, holding 60 FPS without WebGL, keeping a vision LLM honest.</p>
            <p>Technical member of the HICON and AWS clubs at CBIT and a member of GDG Hyderabad. CS50x graduate, HackerRank Gold in C and C++.</p>
        </div>
        <dl class="facts">${S.facts.map((f) => `<div><dt>${esc(f.big)}</dt><dd>${esc(f.label)}</dd></div>`).join('')}</dl>`;

    /* ---------- experience ---------- */
    $('#journey').innerHTML = S.journey.map((j) => `
        <li class="glass${j.current ? ' now' : ''}">
            <div class="j-top"><span class="j-when">${esc(j.when)}</span>${j.current ? '<span class="pill-now">Now</span>' : ''}</div>
            <h3>${esc(j.title)}</h3>
            <p class="j-where"><b>${esc(j.org)}</b>${j.where ? ` · ${esc(j.where)}` : ''}</p>
            <ul>${j.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        </li>`).join('');

    /* ---------- projects ---------- */
    const P = S.projects;
    const gif = 'https://raw.githubusercontent.com/ronaksarda/GitSpace/main/readme_demo.gif';
    const flags = (p) => [p.wip && 'Building', p.live && 'Live', p.badge || (p.team && 'Team')].filter(Boolean);

    // real image when the repo has one, otherwise a pixel cover drawn in art.js
    const cardArt = (p) => p.viz === 'gif' ? `<img class="pc-media" src="${gif}" alt="" loading="lazy">`
        : p.img ? `<img class="pc-media pc-still" src="${p.img}" alt="" loading="lazy">`
        : window.ART.has(p.id) ? window.ART.cover(p.id, 'pc-art') : '';
    const sheetArt = (p) => p.viz === 'gif' ? `<img class="sheet-media" src="${gif}" alt="GitSpace demo">`
        : p.img ? `<img class="sheet-media sheet-still" src="${p.img}" alt="${esc(p.name)}">`
        : window.ART.has(p.id) ? `<div class="sheet-band tone-${p.tone || 'ink'}">${window.ART.cover(p.id, 'sheet-art', 'meet')}</div>`
        : `<div class="sheet-band tone-${p.tone || 'ink'}" aria-hidden="true"><span>${esc(p.name.split(' ').map((w) => w[0]).join('').slice(0, 3))}</span></div>`;

    $('#pgrid').innerHTML = P.map((p) => `
        <button class="pcard tone-${p.tone || 'ink'}" type="button" data-project="${p.id}">
            ${cardArt(p)}
            <span class="pc-kicker">${esc(p.kicker)}</span>
            <span class="pc-name">${esc(p.name)}</span>
            <span class="pc-hook">${esc(p.hook)}</span>
            <span class="pc-foot">${flags(p).map((f) => `<span class="flag">${esc(f)}</span>`).join('')}${p.tags.slice(0, 2).map((t) => `<span>${esc(t)}</span>`).join('')}</span>
        </button>`).join('');

    $('#hangar').innerHTML = S.hangar.map((h) => `<li>
        ${h.repo ? `<a class="ml-name" href="${h.repo}" target="_blank" rel="noopener">${esc(h.name)}</a>` : `<span class="ml-name">${esc(h.name)}</span>`}
        <span class="ml-note">${esc(h.desc)}</span>
        <span class="bar" role="img" aria-label="${h.progress}% done"><i style="width:${h.progress}%"></i></span>
    </li>`).join('');
    $('#lab').innerHTML = S.lab.map((l) => `<li><a class="ml-name" href="${l.repo}" target="_blank" rel="noopener">${esc(l.name)}</a><span class="ml-note">${esc(l.note)}</span></li>`).join('');

    const sheet = $('#sheet');
    function demoHTML(p) {
        if (!p.demo && !p.video) return '';
        const video = p.video ? `<div class="demo-video"><button type="button" data-video="${p.video}" aria-label="Play ${esc(p.name)} demo video" style="background-image:url(https://i.ytimg.com/vi/${p.video}/hqdefault.jpg)"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span></button></div>` : '';
        const steps = p.demo ? `<div class="demo-head"><span>How it runs</span><button type="button" data-replay>Replay</button></div>
            <ol class="demo-log">${p.demo.map((x) => `<li${x[0] === '=' ? ' class="res"' : ''}>${esc(x.replace(/^=/, ''))}</li>`).join('')}</ol>` : '';
        return `<div class="demo">${video}${steps}</div>`;
    }
    let demoTimer;
    function playDemo() {
        clearTimeout(demoTimer);
        const items = [...document.querySelectorAll('#sheet .demo-log li')];
        const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
        items.forEach((li) => li.classList.toggle('on', calm));
        if (calm) return;
        let i = 0;
        const next = () => { if (i < items.length) { items[i++].classList.add('on'); demoTimer = setTimeout(next, 650); } };
        demoTimer = setTimeout(next, 250);
    }
    sheet.addEventListener('close', () => { clearTimeout(demoTimer); $('#sheet-body').innerHTML = ''; });
    function openProject(id) {
        const p = P.find((x) => x.id === id);
        if (!p) return;
        $('#sheet-body').innerHTML = `
            ${sheetArt(p)}
            <div class="sheet-inner">
                <p class="sheet-kicker">${esc(p.kicker)}${flags(p).length ? ` · ${flags(p).map(esc).join(' · ')}` : ''}</p>
                <h3 id="sheet-title">${esc(p.name)}</h3>
                <p class="sheet-hook">${esc(p.hook)}</p>
                <p class="sheet-desc">${esc(p.desc)}</p>
                <ul>${p.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
                ${demoHTML(p)}
                <div class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
                <div class="links">${p.live ? ext(p.live, 'Open live', 'btn-blue') : ''}${p.repo ? ext(p.repo, 'Source on GitHub') : ''}</div>
            </div>`;
        sheet.showModal();
        sheet.scrollTop = 0;
        playDemo();
    }

    /* ---------- skills ---------- */
    const skillColors = ['--c-experience', '--c-skills', '--c-projects', '--c-wins'];
    $('#skills-body').innerHTML = S.stack.map(([k, ...v], i) => `
        <div class="glass skill" style="--c:var(${skillColors[i % skillColors.length]})">
            <h3>${esc(k)}</h3>
            <div class="tags">${v.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
        </div>`).join('');

    /* ---------- wins ---------- */
    $('#wins-body').innerHTML = S.trophies.map((t, i) => `
        <div class="glass win${i < 4 ? ' hot' : ''}">
            <span class="big">${esc(t.big)}</span>
            <h3>${esc(t.title)}</h3>
            <p>${esc(t.text)}</p>
            ${t.cert ? `<button class="linkish" type="button" data-cert="${t.cert}">View certificate</button>` : ''}
        </div>`).join('');
    $('#certs').innerHTML = S.certs.map((c) => `
        <button class="cert" type="button" data-cert="${c.id}">
            <img src="assets/certs/${c.id}.jpg" alt="" loading="lazy">
            <b>${esc(c.title)}</b><span>${esc(c.by)}</span>
        </button>`).join('');

    const lb = $('#lightbox');
    function openCert(id) {
        const c = S.certs.find((x) => x.id === id);
        if (!c) return;
        $('#lb-img').src = `assets/certs/${c.id}.jpg`;
        $('#lb-img').alt = `${c.title} certificate`;
        $('#lb-cap').textContent = `${c.title} · ${c.by}`;
        lb.showModal();
    }

    // click on the dimmed backdrop closes a dialog
    [sheet, lb].forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));

    /* ---------- contact ---------- */
    $('#contact-body').innerHTML = `
        <p class="lead">Internships from January 2027, collaborations, or just to talk agents and C++. I reply within a day.</p>
        <button class="mail" type="button" data-copy="${S.email}"><b>${esc(S.email)}</b><span>Copy</span></button>
        <ul class="rows">
            <li><a href="mailto:${S.email}"><span class="k">Email</span><span class="v">Write to me</span><span class="go">${arrow}</span></a></li>
            <li><a href="tel:${S.phone.replace(/\s/g, '')}"><span class="k">Phone</span><span class="v">${esc(S.phone)}</span><span class="go">${arrow}</span></a></li>
            ${S.links.map((l) => `<li><a href="${l.href}" target="_blank" rel="noopener"><span class="k">${esc(l.k)}</span><span class="v">${esc(l.v)}</span><span class="go">${arrow}</span></a></li>`).join('')}
            <li><button type="button" data-copy="${S.discord}"><span class="k">Discord</span><span class="v">${esc(S.discord)}</span><span class="go">Copy</span></button></li>
            <li><a href="${S.resume}" download><span class="k">Resume</span><span class="v">Ronak_Sarda_Resume.pdf</span><span class="go">PDF</span></a></li>
        </ul>`;

    const toast = $('#toast');
    let toastTimer;
    function say(msg) {
        toast.textContent = msg;
        toast.classList.add('on');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('on'), 1800);
    }
    async function copy(v) {
        try { await navigator.clipboard.writeText(v); say(`Copied ${v}`); }
        catch { say('Copy failed, select it instead'); }
    }

    /* ---------- clicks ---------- */
    document.addEventListener('click', (e) => {
        const t = e.target.closest('[data-project],[data-cert],[data-copy],[data-video],[data-replay]');
        if (!t) return;
        if (t.dataset.video) {
            const f = document.createElement('iframe');
            f.src = `https://www.youtube-nocookie.com/embed/${t.dataset.video}?autoplay=1&rel=0`;
            f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
            f.allowFullscreen = true; f.title = 'Project demo video';
            t.replaceWith(f);
            return;
        }
        if ('replay' in t.dataset) return playDemo();
        if (t.dataset.project) openProject(t.dataset.project);
        else if (t.dataset.cert) openCert(t.dataset.cert);
        else if (t.dataset.copy) copy(t.dataset.copy);
    });

    /* ---------- dock: section nav, highlights the section in view ---------- */
    const NAV = [['top', 'home', 'Home'], ['about', 'me', 'Me'], ['work', 'experience', 'Work'], ['projects', 'projects', 'Projects'], ['skills', 'skills', 'Skills'], ['play', 'play', 'Play'], ['wins', 'wins', 'Wins'], ['contact', 'contact', 'Contact']];
    $('#dock').innerHTML = NAV.map(([id, k, label]) => `<a href="#${id}" data-nav="${id}" style="--c:var(--c-${k})" aria-label="${label}">${svg(k)}<span>${label}</span></a>`).join('');
    const links = [...document.querySelectorAll('[data-nav]')];
    const secs = NAV.map(([id]) => document.getElementById(id));
    // the active section is the last one whose top has passed the upper third of the screen
    function syncNav() {
        const line = innerHeight / 3;
        let cur = secs[0];
        for (const el of secs) if (el.getBoundingClientRect().top <= line) cur = el;
        links.forEach((a) => a.classList.toggle('on', a.dataset.nav === cur.id));
    }
    addEventListener('scroll', syncNav, { passive: true });
    addEventListener('resize', syncNav);
    syncNav();

    /* ---------- reveal on scroll ---------- */
    if (matchMedia('(prefers-reduced-motion: no-preference)').matches && 'IntersectionObserver' in window) {
        const items = document.querySelectorAll('.sec-h, .glass, .pcard, .journey > li');
        items.forEach((el) => el.classList.add('reveal'));
        const rv = new IntersectionObserver((entries) => entries.forEach((en) => {
            if (en.isIntersecting) { en.target.classList.add('in'); rv.unobserve(en.target); }
        }), { rootMargin: '0px 0px -8% 0px' });
        items.forEach((el) => rv.observe(el));
    }

    /* ---------- theme ---------- */
    const themeBtn = $('#theme');
    const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const syncThemeLabel = () => themeBtn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
    themeBtn.addEventListener('click', () => {
        root.dataset.theme = isDark() ? 'light' : 'dark';
        try { localStorage.setItem('theme', root.dataset.theme); } catch (e) { }
        syncThemeLabel();
    });
    syncThemeLabel();
})();
