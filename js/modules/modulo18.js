/**
 * Módulo 18: Integrales Irracionales
 * - Renderizado manual de TODA la matemática (clase .tex).
 * - Lab de Racionalización: espacio x (con raíz) ↔ espacio u (sin raíz), áreas iguales.
 */

document.addEventListener("DOMContentLoaded", function () {
    renderAllMath();
    initRationalLab();
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

/* ═══════════════ LAB DE RACIONALIZACIÓN ═══════════════ */
function initRationalLab() {
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
    const outU      = document.getElementById("out-u");
    const outDiff   = document.getElementById("out-diff");
    const outUlim   = document.getElementById("out-ulim");
    const subHint   = document.getElementById("sub-hint");

    if (!plotDiv || !sliderA || !sliderB) return;

    if (typeof Plotly === "undefined") {
        plotDiv.innerHTML =
            '<div class="d-flex h-100 align-items-center justify-content-center text-white-50 small p-4 text-center">' +
            'No se pudo cargar Plotly.js. Revisa tu conexión y recarga la página.</div>';
        return;
    }

    // Cada preset: f(x) con raíz, G(u) sin raíz tras la sustitución, F(x) primitiva cerrada,
    // toU(x) convierte límites, y el texto de la sustitución usada.
    const PRESETS = [
        {
            f:    x => x * Math.sqrt(x + 3),
            G:    u => 2 * Math.pow(u, 4) - 6 * u * u,
            F:    x => (2 / 5) * Math.pow(x + 3, 2.5) - 2 * Math.pow(x + 3, 1.5),
            toU:  x => Math.sqrt(x + 3),
            range: [-2.9, 4],
            def:  { a: 0, b: 2 },
            hint: "u = √(x+3)  →  x = u²−3, dx = 2u du. La raíz desaparece y queda 2u⁴−6u²."
        },
        {
            f:    x => 1 / (Math.sqrt(x) + Math.cbrt(x)),
            G:    u => 6 * Math.pow(u, 3) / (u + 1),
            F:    x => 2 * Math.sqrt(x) - 3 * Math.cbrt(x) + 6 * Math.pow(x, 1 / 6) - 6 * Math.log(Math.pow(x, 1 / 6) + 1),
            toU:  x => Math.pow(x, 1 / 6),
            range: [0.05, 4],
            def:  { a: 1, b: 3 },
            hint: "u = x^(1/6) (mcm de 2 y 3)  →  dx = 6u⁵ du. Queda 6u³/(u+1): pura fracción racional."
        },
        {
            f:    x => Math.sqrt(x) / Math.pow(1 + Math.sqrt(x), 3),
            G:    u => 2 * u * u / Math.pow(1 + u, 3),
            F:    x => 2 * Math.log(1 + Math.sqrt(x)) + 4 / (1 + Math.sqrt(x)) - 1 / Math.pow(1 + Math.sqrt(x), 2),
            toU:  x => Math.sqrt(x),
            range: [0, 4],
            def:  { a: 0.5, b: 3 },
            hint: "u = √x  →  dx = 2u du. Queda 2u²/(1+u)³; con w = 1+u se vuelve suma de potencias."
        }
    ];

    let fn = 0;

    function linspace(start, end, count) {
        const arr = [];
        const step = (end - start) / (count - 1);
        for (let i = 0; i < count; i++) arr.push(start + step * i);
        return arr;
    }

    function simpson(g, lo, hi, n) {
        n = n || 200;
        if (n % 2) n++;
        const h = (hi - lo) / n;
        let s = g(lo) + g(hi);
        for (let i = 1; i < n; i++) {
            const v = g(lo + i * h);
            if (!isFinite(v) || Math.abs(v) > 1e7) return NaN;
            s += v * (i % 2 ? 4 : 2);
        }
        return s * h / 3;
    }

    const clip = (y, cap) => (isFinite(y) && Math.abs(y) <= cap) ? y : null;

    function applyPresetRanges() {
        const P = PRESETS[fn];
        sliderA.min = P.range[0];
        sliderA.max = P.range[1];
        sliderB.min = P.range[0];
        sliderB.max = P.range[1];
        let a = Math.max(P.range[0], Math.min(P.range[1], parseFloat(sliderA.value)));
        let b = Math.max(P.range[0], Math.min(P.range[1], parseFloat(sliderB.value)));
        if (a >= b) { a = P.def.a; b = P.def.b; }
        sliderA.value = a;
        sliderB.value = b;
    }

    function update() {
        const P = PRESETS[fn];
        let a = parseFloat(sliderA.value);
        let b = parseFloat(sliderB.value);
        if (a >= b) {
            b = Math.min(P.range[1], a + 0.1);
            sliderB.value = b;
        }
        valA.textContent = a.toFixed(1);
        valB.textContent = b.toFixed(1);
        subHint.textContent = P.hint;

        const ua = P.toU(a);
        const ub = P.toU(b);
        const lo = Math.min(ua, ub);
        const hi = Math.max(ua, ub);

        const exact = P.F(b) - P.F(a);
        const num   = simpson(P.G, lo, hi, 200);

        outX.textContent = exact.toFixed(4);
        outU.textContent = isFinite(num) ? num.toFixed(4) : "—";
        outDiff.textContent = isFinite(num) ? Math.abs(exact - num).toExponential(1) : "—";
        outUlim.textContent = ua.toFixed(2) + " → " + ub.toFixed(2);

        const gridColor = swGrid.checked ? "rgba(148,163,184,0.15)" : "rgba(0,0,0,0)";
        const traces = [];

        // ---- Panel 1: espacio x (con raíz) ----
        const xs = linspace(P.range[0], P.range[1], 400);
        traces.push({
            x: xs, y: xs.map(x => clip(P.f(x), 40)), mode: "lines", name: "f(x)",
            line: { color: "#0dcaf0", width: 3 }, connectgaps: false,
            xaxis: "x", yaxis: "y",
            hovertemplate: "x=%{x:.2f}<br>f=%{y:.4f}<extra>f(x)</extra>"
        });
        if (swArea.checked) {
            const xf = linspace(a, b, 160);
            const yf = xf.map(P.f);
            if (yf.every(v => isFinite(v))) {
                traces.push({
                    x: xf, y: yf, mode: "lines", fill: "tozeroy",
                    fillcolor: "rgba(13,202,240,0.25)", line: { color: "transparent" },
                    xaxis: "x", yaxis: "y", hoverinfo: "skip", showlegend: false
                });
            }
        }

        // ---- Panel 2: espacio u (sin raíz) ----
        const ulo = Math.max(0, lo - 0.4);
        const uhi = hi + 0.4;
        const us = linspace(ulo, uhi, 300);
        traces.push({
            x: us, y: us.map(u => clip(P.G(u), 60)), mode: "lines", name: "G(u)",
            line: { color: "#f472b6", width: 3 }, connectgaps: false,
            xaxis: "x2", yaxis: "y2",
            hovertemplate: "u=%{x:.2f}<br>G=%{y:.4f}<extra>G(u)</extra>"
        });
        if (swArea.checked) {
            const uf = linspace(lo, hi, 160);
            traces.push({
                x: uf, y: uf.map(P.G), mode: "lines", fill: "tozeroy",
                fillcolor: "rgba(244,114,182,0.22)", line: { color: "transparent" },
                xaxis: "x2", yaxis: "y2", hoverinfo: "skip", showlegend: false
            });
        }

        const shapes = [
            { type: "line", x0: a, x1: a, y0: 0, y1: 1, yref: "paper", xref: "x",  line: { color: "#0dcaf0", width: 1.5, dash: "dot" } },
            { type: "line", x0: b, x1: b, y0: 0, y1: 1, yref: "paper", xref: "x",  line: { color: "#0dcaf0", width: 1.5, dash: "dot" } }
        ];
        if (swMarks.checked) {
            shapes.push(
                { type: "line", x0: ua, x1: ua, y0: 0, y1: 1, yref: "paper", xref: "x2", line: { color: "#f472b6", width: 1.5, dash: "dot" } },
                { type: "line", x0: ub, x1: ub, y0: 0, y1: 1, yref: "paper", xref: "x2", line: { color: "#f472b6", width: 1.5, dash: "dot" } }
            );
        }

        const layout = {
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: { color: "#c7d2fe", size: 12 },
            margin: { t: 46, r: 20, b: 40, l: 55 },
            grid: { rows: 1, columns: 2, pattern: "independent", xgap: 0.08 },
            xaxis:  { title: "espacio x · CON raíz",  range: [P.range[0], P.range[1]], gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            yaxis:  { title: "f(x)", gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            xaxis2: { title: "espacio u · SIN raíz",  range: [ulo, uhi], gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            yaxis2: { title: "G(u)", gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            showlegend: false,
            shapes: shapes,
            annotations: [
                { x: 0.22, y: 1.08, xref: "paper", yref: "paper", text: "∫ f(x) dx", showarrow: false, font: { color: "#0dcaf0", size: 14 } },
                { x: 0.78, y: 1.08, xref: "paper", yref: "paper", text: "∫ G(u) du", showarrow: false, font: { color: "#f472b6", size: 14 } }
            ]
        };

        Plotly.react(plotDiv, traces, layout, { responsive: true, displayModeBar: false });
    }

    fnRadios.forEach((r, i) => {
        r.addEventListener("change", function () {
            fn = i;
            fnOpts.forEach((o, j) => o.classList.toggle("active", j === i));
            applyPresetRanges();
            update();
        });
    });

    [sliderA, sliderB].forEach(s => s.addEventListener("input", update));
    [swArea, swMarks, swGrid].forEach(s => s.addEventListener("change", update));

    btnReset.addEventListener("click", function () {
        const P = PRESETS[fn];
        sliderA.value = P.def.a;
        sliderB.value = P.def.b;
        swArea.checked = true;
        swMarks.checked = true;
        swGrid.checked = true;
        update();
    });

    btnExport.addEventListener("click", function () {
        Plotly.downloadImage(plotDiv, {
            format: "png",
            filename: "modulo18-integrales-irracionales",
            width: 1400, height: 700, scale: 2
        });
    });

    applyPresetRanges();
    update();
}