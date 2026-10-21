// Tower of Hanoi in a pixel box. Click a peg to pick up its top disk, click another to drop it.
(() => {
    const host = document.getElementById('hanoi');
    if (!host) return;
    const COLORS = ['#ff6b5e', '#ffc44d', '#7bd88f', '#5ee0c4', '#7aa7ff', '#b49cff'];
    let n = 4, pegs, sel, moves, solved, auto, timer;
    const best = (k) => { try { return Number(localStorage.getItem('hanoi-best-' + k)) || 0; } catch (e) { return 0; } };
    const saveBest = (k, v) => { try { localStorage.setItem('hanoi-best-' + k, v); } catch (e) { } };

    host.innerHTML = `
        <div class="hn-bar">
            <div class="hn-seg" role="group" aria-label="Number of disks">${[3, 4, 5, 6].map((d) => `<button type="button" data-n="${d}">${d}</button>`).join('')}</div>
            <div class="hn-stats"><span>Moves <b id="hn-moves">0</b></span><span>Best <b id="hn-best">-</b></span><span>Perfect <b id="hn-opt">7</b></span></div>
        </div>
        <div class="hn-board" id="hn-board"></div>
        <p class="hn-msg" id="hn-msg" role="status" aria-live="polite"></p>
        <div class="hn-actions">
            <button type="button" class="btn btn-glass" id="hn-reset">Reset</button>
            <button type="button" class="btn btn-glass" id="hn-auto">Watch it solve</button>
        </div>`;
    const board = host.querySelector('#hn-board'), msg = host.querySelector('#hn-msg');
    const $m = host.querySelector('#hn-moves'), $b = host.querySelector('#hn-best'), $o = host.querySelector('#hn-opt');

    function reset(keep) {
        clearTimeout(timer); auto = false;
        pegs = [Array.from({ length: n }, (_, i) => n - i), [], []];
        sel = null; moves = 0; solved = false;
        host.querySelector('#hn-auto').textContent = 'Watch it solve';
        if (!keep) say('Pick a peg to lift its top disk.');
        render();
    }
    function say(t) { msg.textContent = t; }

    function render() {
        board.innerHTML = pegs.map((p, i) => `
            <button type="button" class="hn-peg${sel === i ? ' sel' : ''}" data-peg="${i}" aria-label="Peg ${i + 1}, ${p.length ? 'top disk ' + p[p.length - 1] : 'empty'}">
                <span class="hn-rod"></span>
                <span class="hn-stack">${p.map((d, j) => `<i class="hn-disk${sel === i && j === p.length - 1 ? ' up' : ''}" style="--w:${24 + d * (66 / n)}%;--c:${COLORS[d - 1]}"></i>`).join('')}</span>
            </button>`).join('');
        $m.textContent = moves; $o.textContent = 2 ** n - 1;
        const b = best(n); $b.textContent = b || '-';
        host.querySelectorAll('[data-n]').forEach((x) => x.setAttribute('aria-pressed', Number(x.dataset.n) === n));
    }

    function move(from, to) {
        const a = pegs[from], b = pegs[to], d = a[a.length - 1];
        if (!d || (b.length && b[b.length - 1] < d)) return false;
        a.pop(); b.push(d); moves++;
        if (pegs[2].length === n) {
            solved = true;
            const opt = 2 ** n - 1, prev = best(n);
            if (!auto && (!prev || moves < prev)) saveBest(n, moves);
            say(auto ? 'Solved. That is the shortest possible run.' : moves === opt ? `Solved in ${moves}. That is perfect.` : `Solved in ${moves} moves. The shortest is ${opt}.`);
        }
        return true;
    }

    board.addEventListener('click', (e) => {
        const peg = e.target.closest('[data-peg]');
        if (!peg || auto) return;
        if (solved) { reset(); return; }   // any click after a win starts a fresh game
        const i = Number(peg.dataset.peg);
        if (sel === null) { if (!pegs[i].length) say('That peg is empty. Pick one with disks on it.'); else { sel = i; say(`Holding disk ${pegs[i][pegs[i].length - 1]}. Pick where it goes.`); } }
        else if (sel === i) { sel = null; say('Put it back.'); }
        else {
            const from = sel; sel = null;
            if (!move(from, i)) { say('A big disk cannot sit on a smaller one.'); render(); const t = board.children[i]; t.classList.add('bad'); setTimeout(() => t.classList.remove('bad'), 350); return; }
            if (!solved) say('');
        }
        render();
    });

    host.querySelector('.hn-seg').addEventListener('click', (e) => {
        const b = e.target.closest('[data-n]'); if (!b) return;
        n = Number(b.dataset.n); reset();
    });
    host.querySelector('#hn-reset').addEventListener('click', () => reset());
    host.querySelector('#hn-auto').addEventListener('click', (e) => {
        if (auto) { reset(); return; }
        reset(true); auto = true; e.currentTarget.textContent = 'Stop';
        say('Moving the stack the shortest way.');
        const list = [];
        (function go(k, a, b, c) { if (!k) return; go(k - 1, a, c, b); list.push([a, b]); go(k - 1, c, b, a); })(n, 0, 2, 1);
        let i = 0;
        const step = () => { if (!auto || i >= list.length) return; move(...list[i++]); render(); if (solved) { auto = false; host.querySelector('#hn-auto').textContent = 'Watch it solve'; return; } timer = setTimeout(step, 380); };
        timer = setTimeout(step, 300);
    });

    reset();
})();
