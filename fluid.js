// Paint that follows the cursor: a small stable-fluids simulation on WebGL.
// Technique after Pavel Dobryakov's WebGL Fluid Simulation (MIT).
// Sits behind the page, reacts only to pointer input, and idles when nothing moves.
(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.getElementById('fluid');
    if (!canvas) return;

    const small = Math.min(innerWidth, innerHeight) < 700;
    const config = {
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: small ? 512 : 1024,
        DENSITY_DISSIPATION: 3.2,
        VELOCITY_DISSIPATION: 2,
        PRESSURE: 0.1,
        PRESSURE_ITERATIONS: 20,
        CURL: 3,
        SPLAT_RADIUS: 0.2,
        SPLAT_FORCE: 6000,
        COLOR_UPDATE_SPEED: 10
    };

    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl = canvas.getContext('webgl2', params);
    const isWebGL2 = !!gl;
    if (!gl) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
    if (!gl) return;

    let halfFloat, linear;
    if (isWebGL2) {
        gl.getExtension('EXT_color_buffer_float');
        linear = gl.getExtension('OES_texture_float_linear');
    } else {
        halfFloat = gl.getExtension('OES_texture_half_float');
        linear = gl.getExtension('OES_texture_half_float_linear');
    }
    const texType = isWebGL2 ? gl.HALF_FLOAT : halfFloat && halfFloat.HALF_FLOAT_OES;
    if (!texType) return;
    gl.clearColor(0, 0, 0, 0);

    function canRender(internalFormat, format) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, texType, null);
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    }
    function pickFormat(internalFormat, format) {
        if (canRender(internalFormat, format)) return { internalFormat, format };
        if (!isWebGL2) return null;
        if (internalFormat === gl.R16F) return pickFormat(gl.RG16F, gl.RG);
        if (internalFormat === gl.RG16F) return pickFormat(gl.RGBA16F, gl.RGBA);
        return null;
    }
    const fRGBA = isWebGL2 ? pickFormat(gl.RGBA16F, gl.RGBA) : pickFormat(gl.RGBA, gl.RGBA);
    const fRG = isWebGL2 ? pickFormat(gl.RG16F, gl.RG) : fRGBA;
    const fR = isWebGL2 ? pickFormat(gl.R16F, gl.RED) : fRGBA;
    if (!fRGBA || !fRG || !fR) return;
    if (!linear) config.DYE_RESOLUTION = 256;

    /* ---------- shaders ---------- */
    const vertexSrc = `
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv, vL, vR, vT, vB;
        uniform vec2 texelSize;
        void main () {
            vUv = aPosition * 0.5 + 0.5;
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }`;
    const head = 'precision highp float; precision highp sampler2D; varying vec2 vUv, vL, vR, vT, vB;\n';

    const src = {
        clear: `uniform sampler2D uTexture; uniform float value;
            void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`,
        splat: `uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
            void main () {
                vec2 p = vUv - point.xy; p.x *= aspectRatio;
                vec3 splat = exp(-dot(p, p) / radius) * color;
                gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
            }`,
        advection: `uniform sampler2D uVelocity, uSource; uniform vec2 texelSize, dyeTexelSize; uniform float dt, dissipation;
            vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
                vec2 st = uv / tsize - 0.5; vec2 iuv = floor(st); vec2 fuv = fract(st);
                vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
                vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
                vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
                vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
                return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
            }
            void main () {
            #ifdef MANUAL_FILTERING
                vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
                vec4 result = bilerp(uSource, coord, dyeTexelSize);
            #else
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                vec4 result = texture2D(uSource, coord);
            #endif
                gl_FragColor = result / (1.0 + dissipation * dt);
            }`,
        divergence: `uniform sampler2D uVelocity;
            void main () {
                float L = texture2D(uVelocity, vL).x; float R = texture2D(uVelocity, vR).x;
                float T = texture2D(uVelocity, vT).y; float B = texture2D(uVelocity, vB).y;
                vec2 C = texture2D(uVelocity, vUv).xy;
                if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x;
                if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
                gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
            }`,
        curl: `uniform sampler2D uVelocity;
            void main () {
                float L = texture2D(uVelocity, vL).y; float R = texture2D(uVelocity, vR).y;
                float T = texture2D(uVelocity, vT).x; float B = texture2D(uVelocity, vB).x;
                gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
            }`,
        vorticity: `uniform sampler2D uVelocity, uCurl; uniform float curl, dt;
            void main () {
                float L = texture2D(uCurl, vL).x; float R = texture2D(uCurl, vR).x;
                float T = texture2D(uCurl, vT).x; float B = texture2D(uCurl, vB).x;
                float C = texture2D(uCurl, vUv).x;
                vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
                force /= length(force) + 0.0001; force *= curl * C; force.y *= -1.0;
                vec2 v = texture2D(uVelocity, vUv).xy + force * dt;
                gl_FragColor = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
            }`,
        pressure: `uniform sampler2D uPressure, uDivergence;
            void main () {
                float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
                float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
                float d = texture2D(uDivergence, vUv).x;
                gl_FragColor = vec4((L + R + B + T - d) * 0.25, 0.0, 0.0, 1.0);
            }`,
        gradient: `uniform sampler2D uPressure, uVelocity;
            void main () {
                float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
                float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
                vec2 v = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
                gl_FragColor = vec4(v, 0.0, 1.0);
            }`,
        display: `uniform sampler2D uTexture;
            void main () {
                vec3 c = texture2D(uTexture, vUv).rgb;
                float a = max(c.r, max(c.g, c.b));
                gl_FragColor = vec4(c, a);
            }`
    };

    function compile(type, source) {
        const s = gl.createShader(type);
        gl.shaderSource(s, source);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
    }
    const vs = compile(gl.VERTEX_SHADER, vertexSrc);
    function program(fragBody, defines = '') {
        const p = gl.createProgram();
        gl.attachShader(p, vs);
        gl.attachShader(p, compile(gl.FRAGMENT_SHADER, defines + head + fragBody));
        gl.bindAttribLocation(p, 0, 'aPosition');
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
        const u = {};
        const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < n; i++) {
            const name = gl.getActiveUniform(p, i).name;
            u[name] = gl.getUniformLocation(p, name);
        }
        return { use: () => gl.useProgram(p), u };
    }

    let progs;
    try {
        progs = {
            clear: program(src.clear),
            splat: program(src.splat),
            advection: program(src.advection, linear ? '' : '#define MANUAL_FILTERING\n'),
            divergence: program(src.divergence),
            curl: program(src.curl),
            vorticity: program(src.vorticity),
            pressure: program(src.pressure),
            gradient: program(src.gradient),
            display: program(src.display)
        };
    } catch (e) { return; }

    /* ---------- full-screen quad ---------- */
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    function blit(target) {
        if (target) {
            gl.viewport(0, 0, target.w, target.h);
            gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        } else {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    /* ---------- framebuffers ---------- */
    function fbo(w, h, fmt, filter) {
        gl.activeTexture(gl.TEXTURE0);
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internalFormat, w, h, 0, fmt.format, texType, null);
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.viewport(0, 0, w, h);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return {
            fbo: fb, w, h, tx: 1 / w, ty: 1 / h,
            attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; }
        };
    }
    function double(w, h, fmt, filter) {
        let a = fbo(w, h, fmt, filter), b = fbo(w, h, fmt, filter);
        return {
            w, h, tx: 1 / w, ty: 1 / h,
            get read() { return a; },
            get write() { return b; },
            swap() { const t = a; a = b; b = t; }
        };
    }
    function res(r) {
        let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
        if (aspect < 1) aspect = 1 / aspect;
        const min = Math.round(r), max = Math.round(r * aspect);
        return gl.drawingBufferWidth > gl.drawingBufferHeight ? { w: max, h: min } : { w: min, h: max };
    }

    let dye, velocity, divergence, curl, pressure;
    function initBuffers() {
        const sim = res(config.SIM_RESOLUTION);
        const dr = res(config.DYE_RESOLUTION);
        const filter = linear ? gl.LINEAR : gl.NEAREST;
        gl.disable(gl.BLEND);
        dye = double(dr.w, dr.h, fRGBA, filter);
        velocity = double(sim.w, sim.h, fRG, filter);
        divergence = fbo(sim.w, sim.h, fR, gl.NEAREST);
        curl = fbo(sim.w, sim.h, fR, gl.NEAREST);
        pressure = double(sim.w, sim.h, fR, gl.NEAREST);
    }

    const scale = Math.min(devicePixelRatio || 1, 1.5);
    function resize() {
        const w = Math.floor(canvas.clientWidth * scale), h = Math.floor(canvas.clientHeight * scale);
        if (canvas.width === w && canvas.height === h) return false;
        canvas.width = w; canvas.height = h;
        return true;
    }
    resize();
    initBuffers();

    /* ---------- simulation step ---------- */
    function step(dt) {
        gl.disable(gl.BLEND);
        let p;

        p = progs.curl; p.use();
        gl.uniform2f(p.u.texelSize, velocity.tx, velocity.ty);
        gl.uniform1i(p.u.uVelocity, velocity.read.attach(0));
        blit(curl);

        p = progs.vorticity; p.use();
        gl.uniform2f(p.u.texelSize, velocity.tx, velocity.ty);
        gl.uniform1i(p.u.uVelocity, velocity.read.attach(0));
        gl.uniform1i(p.u.uCurl, curl.attach(1));
        gl.uniform1f(p.u.curl, config.CURL);
        gl.uniform1f(p.u.dt, dt);
        blit(velocity.write); velocity.swap();

        p = progs.divergence; p.use();
        gl.uniform2f(p.u.texelSize, velocity.tx, velocity.ty);
        gl.uniform1i(p.u.uVelocity, velocity.read.attach(0));
        blit(divergence);

        p = progs.clear; p.use();
        gl.uniform1i(p.u.uTexture, pressure.read.attach(0));
        gl.uniform1f(p.u.value, config.PRESSURE);
        blit(pressure.write); pressure.swap();

        p = progs.pressure; p.use();
        gl.uniform2f(p.u.texelSize, velocity.tx, velocity.ty);
        gl.uniform1i(p.u.uDivergence, divergence.attach(0));
        for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
            gl.uniform1i(p.u.uPressure, pressure.read.attach(1));
            blit(pressure.write); pressure.swap();
        }

        p = progs.gradient; p.use();
        gl.uniform2f(p.u.texelSize, velocity.tx, velocity.ty);
        gl.uniform1i(p.u.uPressure, pressure.read.attach(0));
        gl.uniform1i(p.u.uVelocity, velocity.read.attach(1));
        blit(velocity.write); velocity.swap();

        p = progs.advection; p.use();
        gl.uniform2f(p.u.texelSize, velocity.tx, velocity.ty);
        if (!linear) gl.uniform2f(p.u.dyeTexelSize, velocity.tx, velocity.ty);
        const vid = velocity.read.attach(0);
        gl.uniform1i(p.u.uVelocity, vid);
        gl.uniform1i(p.u.uSource, vid);
        gl.uniform1f(p.u.dt, dt);
        gl.uniform1f(p.u.dissipation, config.VELOCITY_DISSIPATION);
        blit(velocity.write); velocity.swap();

        if (!linear) gl.uniform2f(p.u.dyeTexelSize, dye.tx, dye.ty);
        gl.uniform1i(p.u.uVelocity, velocity.read.attach(0));
        gl.uniform1i(p.u.uSource, dye.read.attach(1));
        gl.uniform1f(p.u.dissipation, config.DENSITY_DISSIPATION);
        blit(dye.write); dye.swap();
    }

    function render() {
        const p = progs.display; p.use();
        gl.uniform1i(p.u.uTexture, dye.read.attach(0));
        blit(null);
    }

    function splat(x, y, dx, dy, c) {
        const p = progs.splat; p.use();
        let radius = config.SPLAT_RADIUS / 100;
        const aspect = canvas.width / canvas.height;
        if (aspect > 1) radius *= aspect;
        gl.uniform1i(p.u.uTarget, velocity.read.attach(0));
        gl.uniform1f(p.u.aspectRatio, aspect);
        gl.uniform2f(p.u.point, x, y);
        gl.uniform3f(p.u.color, dx, dy, 0);
        gl.uniform1f(p.u.radius, radius);
        blit(velocity.write); velocity.swap();
        gl.uniform1i(p.u.uTarget, dye.read.attach(0));
        gl.uniform3f(p.u.color, c.r, c.g, c.b);
        blit(dye.write); dye.swap();
    }

    /* ---------- color ---------- */
    function hsv(h) {
        const i = Math.floor(h * 6), f = h * 6 - i, q = 1 - f;
        const m = [[1, f, 0], [q, 1, 0], [0, 1, f], [0, q, 1], [f, 0, 1], [1, 0, q]][i % 6];
        return { r: m[0], g: m[1], b: m[2] };
    }
    function newColor() {
        const c = hsv(Math.random());
        return { r: c.r * 0.15, g: c.g * 0.15, b: c.b * 0.15 };
    }

    /* ---------- input ---------- */
    const pointer = { x: 0, y: 0, px: 0, py: 0, dx: 0, dy: 0, moved: false, down: false, color: newColor(), seen: false };
    let lastInput = 0;

    function move(cx, cy) {
        const x = (cx * scale) / canvas.width, y = 1 - (cy * scale) / canvas.height;
        if (!pointer.seen) { pointer.x = x; pointer.y = y; pointer.seen = true; }
        pointer.px = pointer.x; pointer.py = pointer.y;
        pointer.x = x; pointer.y = y;
        const aspect = canvas.width / canvas.height;
        pointer.dx = (x - pointer.px) * (aspect < 1 ? aspect : 1);
        pointer.dy = (y - pointer.py) / (aspect > 1 ? aspect : 1);
        pointer.moved = Math.abs(pointer.dx) + Math.abs(pointer.dy) > 0;
        lastInput = performance.now();
        wake();
    }
    addEventListener('pointermove', (e) => move(e.clientX, e.clientY), { passive: true });
    addEventListener('pointerdown', (e) => {
        move(e.clientX, e.clientY);
        const c = newColor();
        c.r *= 10; c.g *= 10; c.b *= 10;
        splat(pointer.x, pointer.y, 10 * (Math.random() - 0.5), 30 * (Math.random() - 0.5), c);
    }, { passive: true });

    /* ---------- loop ---------- */
    let last = performance.now(), colorTimer = 0, running = false;
    function frame(now) {
        const dt = Math.min((now - last) / 1000, 0.016666);
        last = now;
        if (resize()) initBuffers();

        colorTimer += dt * config.COLOR_UPDATE_SPEED;
        if (colorTimer >= 1) { colorTimer %= 1; pointer.color = newColor(); }

        if (pointer.moved) {
            pointer.moved = false;
            splat(pointer.x, pointer.y, pointer.dx * config.SPLAT_FORCE, pointer.dy * config.SPLAT_FORCE, pointer.color);
        }
        step(dt);
        render();

        // dye has fully dissipated a few seconds after the last input, so stop drawing
        if (now - lastInput > 6000) { running = false; return; }
        requestAnimationFrame(frame);
    }
    function wake() {
        if (running) return;
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
    }
})();
