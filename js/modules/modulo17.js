/**
 * Módulo 17: Sustitución Universal (Weierstrass)
 * - Renderizado manual de TODA la matemática (clase .tex).
 * - Visualizador de dos paneles: espacio x y espacio t, con verificación numérica.
 */

document.addEventListener("DOMContentLoaded", function () {
    renderAllMath();
    initWeierstrassPlot();
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

/* ═══════════════ VISUALIZADOR: ESPACIO x ↔ ESPACIO t ═══════════════ */
function initWeierstrassPlot() {
    const plotDiv   = document.getElementById("plot-area");
    const sliderA   = document.getElementById("slider-a");
    const sliderB   = document.getElementById("slider-b");
    const valA      = document.getElementById("val-a");
    const valB      = document.getElementById("val-b");
    const fnRadios  = [document.getElementById("fn-0"), document.getElementById("fn-1"), document.getElementById("fn-2")];
    const fnOpts    = [document.getElementById("fn-opt-0"), document.getElementById("fn-opt-1"), document.getElementById("fn-opt-2")];
    const swArea    = document.getElementById("switch-area");
    const swMarks   = document.getElementById("switch-marks");
    const swGrid    = document.getElementById("switch-grid");
    const btnReset  = document.getElementById("btn-reset");
    const btnExport = document.getElementById("btn-export");
    const outX      = document.getElementById("out-x");
    const outT      = document.getElementById("out-t");
    const outDiff   = document.getElementById("out-diff");
    const outTlim   = document.getElementById("out-tlim");

    if (!plotDiv || !sliderA || !sliderB) return;

    if (typeof Plotly === "undefined") {
        plotDiv.innerHTML =
            '<div class="d-flex h-100 align-items-center justify-content-center text-white-50 small p-4 text-center">' +
            'No se pudo cargar Plotly.js. Revisa tu conexión y recarga la página.</div>';
        return;
    }

    const DEFAULTS = { fn: 0, a: 0, b: 2, area: true, marks: true, grid: true };
    let fn = 0;
    const SING = -Math.PI / 2; // singularidad de 1/(1+sin x)

    // Integrandos en x y sus transformados G(t) = f(x(t)) * 2/(1+t²)
    const PRESETS = [
        {
            f: x => 1 / (2 + Math.cos(x)),
            G: t => 2 / (3 + t * t),
            F: x => (2 / Math.sqrt(3)) * Math.atan(Math.tan(x / 2) / Math.sqrt(3))
        },
        {
            f: x => 1 / (1 + Math.sin(x)),
            G: t => 2 / ((1 + t) * (1 + t)),
            F: x => -2 / (1 + Math.tan(x / 2))
        },
        {
            f: x => 1 / (5 + 4 * Math.cos(x)),
            G: t => 2 / (9 + t * t),
            F: x => (2 / 3) * Math.atan(Math.tan(x / 2) / 3)
        }
    ];

    function linspace(start, end, count) {
        const arr = [];
        const step = (end - start) / (count - 1);
        for (let i = 0; i < count; i++) arr.push(start + step * i);
        return arr;
    }

    // Simpson compuesto para verificar numéricamente el lado t
    function simpson(g, lo, hi, n) {
        n = n || 200;
        if (n % 2) n++;
        const h = (hi - lo) / n;
        let s = g(lo) + g(hi);
        for (let i = 1; i < n; i++) s += g(lo + i * h) * (i % 2 ? 4 : 2);
        return s * h / 3;
    }

    const clip = (y, cap) => (isFinite(y) && Math.abs(y) <= cap) ? y : null;

    function update() {
        let a = parseFloat(sliderA.value);
        let b = parseFloat(sliderB.value);
        if (a >= b) {
            b = Math.min(parseFloat(sliderB.max), a + 0.05);
            sliderB.value = b;
        }
        valA.textContent = a.toFixed(2);
        valB.textContent = b.toFixed(2);

        const P = PRESETS[fn];
        const ta = Math.tan(a / 2);
        const tb = Math.tan(b / 2);

        // ¿Cruza la singularidad (solo preset 2)?
        const diverges = (fn === 1) && (a < SING && b > SING);

        const gridColor = swGrid.checked ? "rgba(148,163,184,0.15)" : "rgba(0,0,0,0)";
        const traces = [];

        // ---- Panel 1: espacio x ----
        const xs = linspace(-3.4, 3.4, 400);
        const ys = xs.map(x => clip(P.f(x), 8));
        traces.push({
            x: xs, y: ys, mode: "lines", name: "f(x)",
            line: { color: "#0dcaf0", width: 3 }, connectgaps: false,
            xaxis: "x", yaxis: "y",
            hovertemplate: "x=%{x:.2f}<br>f=%{y:.4f}<extra>f(x)</extra>"
        });
        if (swArea.checked && !diverges) {
            const xf = linspace(a, b, 160);
            traces.push({
                x: xf, y: xf.map(P.f), mode: "lines", fill: "tozeroy",
                fillcolor: "rgba(13,202,240,0.25)", line: { color: "transparent" },
                xaxis: "x", yaxis: "y", hoverinfo: "skip", showlegend: false
            });
        }

        // ---- Panel 2: espacio t ----
        const tlo = Math.min(ta, tb) - 0.6;
        const thi = Math.max(ta, tb) + 0.6;
        const ts = linspace(tlo, thi, 300);
        const gys = ts.map(t => clip(P.G(t), 8));
        traces.push({
            x: ts, y: gys, mode: "lines", name: "G(t)",
            line: { color: "#f472b6", width: 3 }, connectgaps: false,
            xaxis: "x2", yaxis: "y2",
            hovertemplate: "t=%{x:.2f}<br>G=%{y:.4f}<extra>G(t)</extra>"
        });
        if (swArea.checked && !diverges) {
            const lo = Math.min(ta, tb), hi = Math.max(ta, tb);
            const tf = linspace(lo, hi, 160);
            traces.push({
                x: tf, y: tf.map(P.G), mode: "lines", fill: "tozeroy",
                fillcolor: "rgba(244,114,182,0.22)", line: { color: "transparent" },
                xaxis: "x2", yaxis: "y2", hoverinfo: "skip", showlegend: false
            });
        }

        const shapes = [
            { type: "line", x0: a, x1: a, y0: 0, y1: 1, yref: "paper", xref: "x", line: { color: "#0dcaf0", width: 1.5, dash: "dot" } },
            { type: "line", x0: b, x1: b, y0: 0, y1: 1, yref: "paper", xref: "x", line: { color: "#0dcaf0", width: 1.5, dash: "dot" } }
        ];
        if (swMarks.checked) {
            shapes.push(
                { type: "line", x0: ta, x1: ta, y0: 0, y1: 1, yref: "paper", xref: "x2", line: { color: "#f472b6", width: 1.5, dash: "dot" } },
                { type: "line", x0: tb, x1: tb, y0: 0, y1: 1, yref: "paper", xref: "x2", line: { color: "#f472b6", width: 1.5, dash: "dot" } }
            );
        }

        const layout = {
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: { color: "#c7d2fe", size: 12 },
            margin: { t: 46, r: 20, b: 40, l: 50 },
            grid: { rows: 1, columns: 2, pattern: "independent", xgap: 0.08 },
            xaxis:  { title: "espacio x", range: [-3.4, 3.4], gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            yaxis:  { title: "f(x)", range: [0, 2.2], gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            xaxis2: { title: "espacio t", range: [tlo, thi], gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            yaxis2: { title: "G(t)", range: [0, 2.2], gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            showlegend: false,
            shapes: shapes,
            annotations: [
                { x: 0.22, y: 1.08, xref: "paper", yref: "paper", text: "∫ f(x) dx", showarrow: false, font: { color: "#0dcaf0", size: 14 } },
                { x: 0.78, y: 1.08, xref: "paper", yref: "paper", text: "∫ G(t) dt", showarrow: false, font: { color: "#f472b6", size: 14 } }
            ].concat(diverges ? [{
                x: 0.5, y: 0.5, xref: "paper", yref: "paper", showarrow: false,
                text: "⚠ el intervalo cruza x = −π/2: la integral diverge",
                font: { color: "#f87171", size: 14 }
            }] : [])
        };

        Plotly.react(plotDiv, traces, layout, { responsive: true, displayModeBar: false });

        // ---- Lecturas ----
        if (diverges) {
            outX.textContent = "∞ diverge";
            outX.style.color = "#f87171";
            outT.textContent = "—";
            outDiff.textContent = "—";
        } else {
            const exact = P.F(b) - P.F(a);
            const lo = Math.min(ta, tb), hi = Math.max(ta, tb);
            const num = simpson(P.G, lo, hi, 200);
            outX.textContent = exact.toFixed(4);
            outX.style.color = "#0dcaf0";
            outT.textContent = num.toFixed(4);
            outDiff.textContent = Math.abs(exact - num).toExponential(1);
        }
        outTlim.textContent = ta.toFixed(2) + " → " + tb.toFixed(2);
    }

    fnRadios.forEach((r, i) => {
        r.addEventListener("change", function () {
            fn = i;
            fnOpts.forEach((o, j) => o.classList.toggle("active", j === i));
            update();
        });
    });

    [sliderA, sliderB].forEach(s => s.addEventListener("input", update));
    [swArea, swMarks, swGrid].forEach(s => s.addEventListener("change", update));

    btnReset.addEventListener("click", function () {
        fnRadios[DEFAULTS.fn].checked = true;
        fn = DEFAULTS.fn;
        fnOpts.forEach((o, j) => o.classList.toggle("active", j === DEFAULTS.fn));
        sliderA.value = DEFAULTS.a;
        sliderB.value = DEFAULTS.b;
        swArea.checked = DEFAULTS.area;
        swMarks.checked = DEFAULTS.marks;
        swGrid.checked = DEFAULTS.grid;
        update();
    });

    btnExport.addEventListener("click", function () {
        Plotly.downloadImage(plotDiv, {
            format: "png",
            filename: "modulo17-sustitucion-universal",
            width: 1400, height: 700, scale: 2
        });
    });

    update();
}