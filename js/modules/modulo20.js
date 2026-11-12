/**
 * Módulo 20: Volumen de Sólidos de Revolución
 * - Renderizado manual de TODA la matemática (clase .tex).
 * - Sólido 3D paramétrico con rebanadas: discos, arandelas y capas cilíndricas.
 */

document.addEventListener("DOMContentLoaded", function () {
    renderAllMath();
    initRevolutionLab();
    if (typeof AOS !== "undefined") {
        AOS.init({ duration: 700, once: true, offset: 50 });
    }
});

/* ═══════════════ RENDERIZADO DE FÓRMULAS ═══════════════ */
function renderAllMath() {
    if (typeof katex === "undefined") {
        window.addEventListener("load", renderAllMath);
        setTimeout(renderAllMath, 1200);
        setTimeout(renderAllMath, 3000);
        return;
    }
    document.querySelectorAll(".tex:not([data-katex-done])").forEach(function (el) {
        try {
            katex.render(el.textContent.trim(), el, {
                displayMode: el.classList.contains("tex-block"),
                throwOnError: false
            });
            el.setAttribute("data-katex-done", "1");
        } catch (e) {
            console.warn("KaTeX no pudo renderizar:", el.textContent, e);
        }
    });
}

/* ═══════════════ LABORATORIO 3D DE REVOLUCIÓN ═══════════════ */
function initRevolutionLab() {
    const plotDiv    = document.getElementById("plot-area");
    const sliderA    = document.getElementById("slider-a");
    const sliderB    = document.getElementById("slider-b");
    const sliderN    = document.getElementById("slider-n");
    const valA       = document.getElementById("val-a");
    const valB       = document.getElementById("val-b");
    const valN       = document.getElementById("val-n");
    const regRadios  = [document.getElementById("reg-0"), document.getElementById("reg-1"), document.getElementById("reg-2")];
    const regOpts    = [document.getElementById("reg-opt-0"), document.getElementById("reg-opt-1"), document.getElementById("reg-opt-2")];
    const swSlices   = document.getElementById("switch-slices");
    const swSurface  = document.getElementById("switch-surface");
    const swGrid     = document.getElementById("switch-grid");
    const btnRotate  = document.getElementById("btn-rotate");
    const btnReset   = document.getElementById("btn-reset");
    const btnExport  = document.getElementById("btn-export");
    const outV       = document.getElementById("out-v");
    const outSum     = document.getElementById("out-sum");
    const outDiff    = document.getElementById("out-diff");
    const outMethod  = document.getElementById("out-method");
    const methodHint = document.getElementById("method-hint");

    if (!plotDiv || !sliderA || !sliderB) return;

    if (typeof Plotly === "undefined") {
        plotDiv.innerHTML =
            '<div class="d-flex h-100 align-items-center justify-content-center text-white-50 small p-4 text-center">' +
            'No se pudo cargar Plotly.js. Revisa tu conexión y recarga la página.</div>';
        return;
    }

    // top/bot definen la región; axis indica el eje de giro.
    const PRESETS = [
        {
            method: "Discos",
            top: x => Math.sqrt(Math.max(x, 0)),
            bot: x => 0,
            axis: "x",
            dom: [0, 4], def: { a: 0, b: 4 },
            V: (a, b) => Math.PI * (b * b - a * a) / 2,
            slice: (m, dx) => Math.PI * m * dx, // π·(√m)²·dx
            hint: "Disco: radio R = √x, espesor dx. V = π∫ R² dx sobre el eje x."
        },
        {
            method: "Arandelas",
            top: x => x,
            bot: x => x * x,
            axis: "x",
            dom: [0, 1], def: { a: 0, b: 1 },
            V: (a, b) => Math.PI * ((b ** 3 - a ** 3) / 3 - (b ** 5 - a ** 5) / 5),
            slice: (m, dx) => Math.PI * (m * m - m ** 4) * dx,
            hint: "Arandela: R = x (recta), r = x² (parábola). V = π∫ (R²−r²) dx."
        },
        {
            method: "Capas",
            top: x => 4,
            bot: x => x * x,
            axis: "y",
            dom: [0, 2], def: { a: 0, b: 2 },
            V: (a, b) => 2 * Math.PI * ((2 * b * b - b ** 4 / 4) - (2 * a * a - a ** 4 / 4)),
            slice: (m, dx) => 2 * Math.PI * m * (4 - m * m) * dx,
            hint: "Capas: radio = x, altura = 4−x², giro alrededor del eje y. V = 2π∫ x·h dx."
        }
    ];

    let reg = 0;
    let rotTimer = null, phi = 0.9;

    function linspace(start, end, count) {
        const arr = [];
        const step = (end - start) / (count - 1);
        for (let i = 0; i < count; i++) arr.push(start + step * i);
        return arr;
    }

    // Círculo en plano perpendicular al eje x (centro en (xc,0,0), radio R)
    function circleX(xc, R, color, width) {
        const t = linspace(0, 2 * Math.PI, 40);
        return {
            type: "scatter3d", mode: "lines",
            x: t.map(() => xc),
            y: t.map(x => R * Math.cos(x)),
            z: t.map(x => R * Math.sin(x)),
            line: { color: color, width: width },
            hoverinfo: "skip", showlegend: false
        };
    }

    // Círculo horizontal (perpendicular al eje z) a altura zc, radio R
    function circleZ(zc, R, color, width) {
        const t = linspace(0, 2 * Math.PI, 40);
        return {
            type: "scatter3d", mode: "lines",
            x: t.map(x => R * Math.cos(x)),
            y: t.map(x => R * Math.sin(x)),
            z: t.map(() => zc),
            line: { color: color, width: width },
            hoverinfo: "skip", showlegend: false
        };
    }

    // Superficie paramétrica: fn(u, v) -> [x, y, z]
    function paramSurface(fn, uArr, vArr, colorscale, opacity) {
        const X = [], Y = [], Z = [];
        for (let i = 0; i < vArr.length; i++) {
            const xr = [], yr = [], zr = [];
            for (let j = 0; j < uArr.length; j++) {
                const p = fn(uArr[j], vArr[i]);
                xr.push(p[0]); yr.push(p[1]); zr.push(p[2]);
            }
            X.push(xr); Y.push(yr); Z.push(zr);
        }
        return {
            type: "surface", x: X, y: Y, z: Z,
            colorscale: colorscale, showscale: false,
            opacity: opacity, hoverinfo: "skip", showlegend: false
        };
    }

    const SCALE_OUT = [[0, "#0dcaf0"], [1, "#6f42c1"]];
    const SCALE_IN  = [[0, "#f472b6"], [1, "#fbbf24"]];

    function applyPresetRanges() {
        const P = PRESETS[reg];
        sliderA.min = P.dom[0]; sliderA.max = P.dom[1];
        sliderB.min = P.dom[0]; sliderB.max = P.dom[1];
        sliderA.value = P.def.a;
        sliderB.value = P.def.b;
    }

    function update() {
        const P = PRESETS[reg];
        let a = parseFloat(sliderA.value);
        let b = parseFloat(sliderB.value);
        const n = parseInt(sliderN.value, 10);

        if (a >= b) {
            b = Math.min(P.dom[1], a + 0.1);
            sliderB.value = b;
        }
        valA.textContent = a.toFixed(1);
        valB.textContent = b.toFixed(1);
        valN.textContent = n;
        methodHint.textContent = P.hint;
        outMethod.textContent = P.method;

        // ---- Volúmenes ----
        const exact = P.V(a, b);
        const dx = (b - a) / n;
        let sum = 0;
        for (let i = 0; i < n; i++) sum += P.slice(a + (i + 0.5) * dx, dx);
        outV.textContent = exact.toFixed(4);
        outSum.textContent = sum.toFixed(4);
        outDiff.textContent = Math.abs(exact - sum).toFixed(4);

        // ---- Trazos ----
        const traces = [];
        const theta = linspace(0, 2 * Math.PI, 36);
        const uArr = linspace(a, b, 40);

        // Superficie del sólido
        if (swSurface.checked) {
            if (P.axis === "x") {
                traces.push(paramSurface(
                    (x, t) => [x, P.top(x) * Math.cos(t), P.top(x) * Math.sin(t)],
                    uArr, theta, SCALE_OUT, 0.9
                ));
                if (reg === 1) {
                    traces.push(paramSurface(
                        (x, t) => [x, P.bot(x) * Math.cos(t), P.bot(x) * Math.sin(t)],
                        uArr, theta, SCALE_IN, 0.65
                    ));
                }
            } else {
                // Giro alrededor del eje y: techo paraboloide z = r² y tapa superior z = 4
                traces.push(paramSurface(
                    (r, t) => [r * Math.cos(t), r * Math.sin(t), r * r],
                    uArr, theta, SCALE_OUT, 0.9
                ));
                traces.push(paramSurface(
                    (r, t) => [r * Math.cos(t), r * Math.sin(t), 4],
                    uArr, theta, SCALE_IN, 0.55
                ));
            }
        }

        // Rebanadas representativas
        if (swSlices.checked) {
            for (let i = 0; i < n; i++) {
                const m = a + (i + 0.5) * dx;
                const hue = 190 + 130 * (i / Math.max(n - 1, 1));
                const col = "hsl(" + hue + ",85%,60%)";
                if (P.axis === "x") {
                    const R = P.top(m);
                    traces.push(circleX(m, R, col, 5));
                    if (reg === 1 && P.bot(m) > 1e-6) {
                        traces.push(circleX(m, P.bot(m), col, 3));
                    }
                } else {
                    // Cascarón cilíndrico: círculo inferior, superior y generatrices
                    const zBot = P.bot(m), zTop = P.top(m);
                    traces.push(circleZ(zBot, m, col, 3));
                    traces.push(circleZ(zTop, m, col, 5));
                    for (let k = 0; k < 8; k++) {
                        const t = k * Math.PI / 4;
                        traces.push({
                            type: "scatter3d", mode: "lines",
                            x: [m * Math.cos(t), m * Math.cos(t)],
                            y: [m * Math.sin(t), m * Math.sin(t)],
                            z: [zBot, zTop],
                            line: { color: col, width: 2 },
                            hoverinfo: "skip", showlegend: false
                        });
                    }
                }
            }
        }

        // Curva generatriz y eje
        if (P.axis === "x") {
            traces.push({
                type: "scatter3d", mode: "lines",
                x: uArr, y: uArr.map(P.top), z: uArr.map(() => 0),
                line: { color: "#ffffff", width: 4 },
                hoverinfo: "skip", showlegend: false
            });
            traces.push({
                type: "scatter3d", mode: "lines",
                x: [P.dom[0] - 0.3, P.dom[1] + 0.3], y: [0, 0], z: [0, 0],
                line: { color: "rgba(255,255,255,0.5)", width: 2, dash: "dash" },
                hoverinfo: "skip", showlegend: false
            });
        } else {
            traces.push({
                type: "scatter3d", mode: "lines",
                x: uArr, y: uArr.map(() => 0), z: uArr.map(P.bot),
                line: { color: "#ffffff", width: 4 },
                hoverinfo: "skip", showlegend: false
            });
            traces.push({
                type: "scatter3d", mode: "lines",
                x: [0, 0], y: [0, 0], z: [-0.3, 4.4],
                line: { color: "rgba(255,255,255,0.5)", width: 2, dash: "dash" },
                hoverinfo: "skip", showlegend: false
            });
        }

        const gc = swGrid.checked ? "rgba(148,163,184,0.18)" : "rgba(0,0,0,0)";
        const layout = {
            paper_bgcolor: "rgba(0,0,0,0)",
            margin: { t: 10, r: 10, b: 10, l: 10 },
            showlegend: false,
            scene: {
                bgcolor: "rgba(0,0,0,0)",
                xaxis: { title: "x", color: "#c7d2fe", gridcolor: gc, backgroundcolor: "rgba(0,0,0,0)" },
                yaxis: { title: "y", color: "#c7d2fe", gridcolor: gc, backgroundcolor: "rgba(0,0,0,0)" },
                zaxis: { title: "z", color: "#c7d2fe", gridcolor: gc, backgroundcolor: "rgba(0,0,0,0)" },
                camera: { eye: { x: 2.0 * Math.cos(phi), y: 2.0 * Math.sin(phi), z: 0.7 } },
                aspectmode: "auto"
            }
        };

        Plotly.react(plotDiv, traces, layout, { responsive: true, displayModeBar: false });
    }

    // ---- Eventos ----
    regRadios.forEach((r, i) => r.addEventListener("change", function () {
        reg = i;
        regOpts.forEach((o, j) => o.classList.toggle("active", j === i));
        applyPresetRanges();
        update();
    }));

    [sliderA, sliderB, sliderN].forEach(s => s.addEventListener("input", update));
    [swSlices, swSurface, swGrid].forEach(s => s.addEventListener("change", update));

    btnRotate.addEventListener("click", function () {
        if (rotTimer) {
            clearInterval(rotTimer);
            rotTimer = null;
            btnRotate.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i>Girar';
            btnRotate.classList.add("btn-outline-success");
            btnRotate.classList.remove("btn-success");
            return;
        }
        btnRotate.innerHTML = '<i class="bi bi-pause-fill me-1"></i>Quieto';
        btnRotate.classList.remove("btn-outline-success");
        btnRotate.classList.add("btn-success");
        rotTimer = setInterval(function () {
            phi += 0.03;
            Plotly.relayout(plotDiv, {
                "scene.camera.eye": { x: 2.0 * Math.cos(phi), y: 2.0 * Math.sin(phi), z: 0.7 }
            });
        }, 50);
    });

    btnReset.addEventListener("click", function () {
        if (rotTimer) { clearInterval(rotTimer); rotTimer = null; }
        btnRotate.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i>Girar';
        btnRotate.classList.add("btn-outline-success");
        btnRotate.classList.remove("btn-success");
        phi = 0.9;
        regRadios[0].checked = true; reg = 0;
        regOpts.forEach((o, j) => o.classList.toggle("active", j === 0));
        applyPresetRanges();
        sliderN.value = 8;
        swSlices.checked = true;
        swSurface.checked = true;
        swGrid.checked = true;
        update();
    });

    btnExport.addEventListener("click", function () {
        Plotly.downloadImage(plotDiv, {
            format: "png",
            filename: "modulo20-solidos-revolucion",
            width: 1400, height: 900, scale: 2
        });
    });

    applyPresetRanges();
    update();
}