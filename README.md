# ronaksarda.github.io

Personal site of **Ronak Sarda**: Founding AI Engineering Intern @ FschoolAI, B.E. IT @ CBIT Hyderabad (class of 2029).

Live: **https://ronaksarda.github.io**

One scrolling page: hero, about, experience, projects, skills, wins and certificates, contact. A floating dock jumps between sections and highlights the one in view. Project cards open a detail sheet; certificates open in a lightbox.

Behind everything is a WebGL paint layer: move the pointer to drag colour around, click to drop a splash. The paint lingers and mixes, then the loop stops once it has faded. It stays off under `prefers-reduced-motion`.

Plain HTML, CSS and JavaScript. No build step, no frameworks.

| File | What it holds |
|---|---|
| `index.html` | page skeleton: hero, section shells, dock, dialogs |
| `data.js` | every fact the site says (edit this to update content) |
| `script.js` | renders every section from `data.js`, dock, dialogs, theme |
| `fluid.js` | the cursor paint background |
| `styles.css` | everything visual, light and dark tokens |

Run locally: `python -m http.server` and open http://localhost:8000.
