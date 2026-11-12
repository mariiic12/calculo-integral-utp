/**
 * Módulo 13: Trinomio ax² + bx + c (Completar el Cuadrado)
 * - Renderizado manual de TODA la matemática (clase .tex).
 * - Visualizador interactivo de f(x) = 1 / (x² + bx + c) con detección de caso por discriminante.
 */

document.addEventListener("DOMContentLoaded", function () {
    renderAllMath();
    initTrinomialPlot();
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

/* ═══════════════ VISUALIZADOR INTERACTIVO ═══════════════ */
function initTrinomialPlot() {
    const plotDiv   = document.getElementById("plot-area");
    const sliderA   = document.getElementById("slider-a");
    const sliderB   = document.getElementById("slider-b");
    const sliderBB  = document.getElementById("slider-B");
    const sliderC   = document.getElementById("slider-C");
    const valA      = document.getElementById("val-a");
    const valB      = document.getElementById("val-b");
    const valBB     = document.getElementById("val-B");
    const valC      = document.getElementById("val-C");
    const swArea    = document.getElementById("switch-area");
    const swF       = document.getElementById("switch-f");
    const swMarks   = document.getElementById("switch-marks");
    const swGrid    = document.getElementById("switch-grid");
    const btnReset  = document.getElementById("btn-reset");
    const btnExport = document.getElementById("btn-export");
    const outExact  = document.getElementById("integral-result");
    const outDelta  = document.getElementById("delta-result");
    const outCase   = document.getElementById("case-result");

    if (!plotDiv || !sliderA || !sliderB) return;

    if (typeof Plotly === "undefined") {
        plotDiv.innerHTML =
            '<div class="d-flex h-100 align-items-center justify-content-center text-white-50 small p-4 text-center">' +
            'No se pudo cargar Plotly.js. Revisa tu conexión y recarga la página.</div>';
        return;
    }

    const DEFAULTS = { a: -1, b: 3, B: 2, C: 3, area: true, f: false, marks: true, grid: true };
    const X_MIN = -8, X_MAX = 8;
    const EPS = 1e-9;

    function linspace(start, end, count) {
        const arr = [];
        const step = (end - start) / (count - 1);
        for (let i = 0; i < count; i++) arr.push(start + step * i);
        return arr;
    }

    function update() {
        let a  = parseFloat(sliderA.value);
        let b  = parseFloat(sliderB.value);
        const B = parseFloat(sliderBB.value);
        const C = parseFloat(sliderC.value);

        if (a >= b) {
            b = Math.min(parseFloat(sliderB.max), a + 0.1);
            sliderB.value = b;
        }

        valA.textContent  = a.toFixed(1);
        valB.textContent  = b.toFixed(1);
        valBB.textContent = B.toFixed(1);
        valC.textContent  = C.toFixed(1);

        // Trinomio: x² + Bx + C  (a_coef = 1)
        const delta = B * B - 4 * C;
        const m = B / 2;                 // desplazamiento: (x + m)²
        const kConst = C - (B * B) / 4;  // constante tras completar: (x+m)² + kConst

        const f = x => 1 / (x * x + B * x + C);

        // Antiderivada según el caso
        let F = null, caseName = "", caseColor = "#0dcaf0";
        if (delta < -EPS) {
            const p = Math.sqrt(-kConst); // kConst > 0
            F = x => (1 / p) * Math.atan((x + m) / p);
            caseName = "Δ < 0 → arctan";
            caseColor = "#0dcaf0";
        } else if (delta > EPS) {
            const p = Math.sqrt(kConst * -1 * -1); // kConst < 0 aquí; p² = -kConst
            const pp = Math.sqrt(-kConst);
            F = x => (1 / (2 * pp)) * Math.log(Math.abs((x + m - pp) / (x + m + pp)));
            caseName = "Δ > 0 → ln / arctanh";
            caseColor = "#fbbf24";
        } else {
            F = x => -1 / (x + m);
            caseName = "Δ = 0 → potencia";
            caseColor = "#a78bfa";
        }

        // Raíces reales (si existen)
        let roots = [];
        if (delta >= -EPS) {
            const r = Math.sqrt(Math.max(delta, 0)) / 2;
            roots = (Math.abs(delta) < EPS) ? [-m] : [-m - r, -m + r];
        }

        // ¿Hay singularidad dentro de [a, b]?
        const diverges = roots.some(rt => rt > a - 1e-6 && rt < b + 1e-6) ||
                         (Math.abs(delta) < EPS && (-m) > a - 1e-6 && (-m) < b + 1e-6);

        // Rango vertical seguro
        const yCap = (delta < -EPS) ? (1 / Math.max(kConst, 0.05)) * 1.25 : 3;
        const gridColor = swGrid.checked ? "rgba(148,163,184,0.15)" : "rgba(0,0,0,0)";

        // Curva principal (con cortes en singularidades)
        const xs = linspace(X_MIN, X_MAX, 480);
        const ys = xs.map(x => {
            const y = f(x);
            return (isFinite(y) && Math.abs(y) <= yCap * 3) ? y : null;
        });

        const traces = [];

        // Área sombreada
        if (swArea.checked && !diverges) {
            const xf = linspace(a, b, 160);
            traces.push({
                x: xf, y: xf.map(x => f(x)),
                mode: "lines", fill: "tozeroy", name: "Área",
                fillcolor: "rgba(13,202,240,0.22)", line: { color: "transparent" },
                hoverinfo: "skip"
            });
        }

        // Curva f(x)
        traces.push({
            x: xs, y: ys, mode: "lines", name: "f(x) = 1/(x²+bx+c)",
            line: { color: "#0dcaf0", width: 3 },
            connectgaps: false,
            hovertemplate: "x=%{x:.2f}<br>f(x)=%{y:.4f}<extra>f(x)</extra>"
        });

        // Antiderivada F(x) en eje secundario
        if (swF.checked) {
            const fxs = [], fys = [];
            xs.forEach(x => {
                const v = F(x);
                if (isFinite(v) && Math.abs(v) <= 8) { fxs.push(x); fys.push(v); }
                else { fxs.push(x); fys.push(null); }
            });
            traces.push({
                x: fxs, y: fys, mode: "lines", name: "F(x)", yaxis: "y2",
                line: { color: "#fbbf24", width: 2.5, dash: "dash" },
                connectgaps: false,
                hovertemplate: "x=%{x:.2f}<br>F(x)=%{y:.4f}<extra>F(x)</extra>"
            });
        }

        // Marcadores: raíces y vértice
        if (swMarks.checked) {
            if (roots.length) {
                traces.push({
                    x: roots, y: roots.map(() => 0), mode: "markers", name: "Raíces reales",
                    marker: { symbol: "x", size: 13, color: "#f87171", line: { width: 2, color: "#7f1d1d" } },
                    hovertemplate: "raíz en x=%{x:.2f}<extra></extra>"
                });
            }
            if (Math.abs(delta) > EPS) {
                const vx = -m, vy = f(vx);
                if (isFinite(vy) && Math.abs(vy) <= yCap * 3) {
                    traces.push({
                        x: [vx], y: [vy], mode: "markers", name: "Vértice",
                        marker: { symbol: "circle", size: 11, color: "#34d399", line: { width: 2, color: "#064e3b" } },
                        hovertemplate: "vértice (%{x:.2f}, %{y:.2f})<extra></extra>"
                    });
                }
            }
        }

        const layout = {
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: { color: "#c7d2fe", size: 12 },
            margin: { t: 40, r: swF.checked ? 58 : 24, b: 46, l: 56 },
            xaxis: { title: "x", range: [X_MIN, X_MAX], gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            yaxis: { title: "f(x)", range: [-yCap * 0.25, yCap], gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            yaxis2: {
                title: "F(x)", overlaying: "y", side: "right", visible: swF.checked,
                showgrid: false, range: [-3, 3],
                titlefont: { color: "#fbbf24" }, tickfont: { color: "#fbbf24" }
            },
            showlegend: swF.checked || swMarks.checked,
            legend: { orientation: "h", y: 1.16, x: 0, font: { size: 11 } },
            shapes: [
                { type: "line", x0: a, x1: a, y0: -yCap * 0.25, y1: yCap, line: { color: "#0dcaf0", width: 1.5, dash: "dot" } },
                { type: "line", x0: b, x1: b, y0: -yCap * 0.25, y1: yCap, line: { color: "#f472b6", width: 1.5, dash: "dot" } }
            ],
            annotations: [
                { x: a, y: yCap, text: "a", showarrow: false, font: { color: "#0dcaf0", size: 13 }, yanchor: "bottom" },
                { x: b, y: yCap, text: "b", showarrow: false, font: { color: "#f472b6", size: 13 }, yanchor: "bottom" }
            ].concat(diverges ? [{
                x: (a + b) / 2, y: yCap * 0.6, showarrow: false,
                text: "⚠ raíz dentro de [a, b]: la integral diverge",
                font: { color: "#f87171", size: 13 }
            }] : [])
        };

        Plotly.react(plotDiv, traces, layout, { responsive: true, displayModeBar: false });

        // Lecturas numéricas
        outDelta.textContent = delta.toFixed(2);
        outCase.textContent = caseName;
        outCase.style.color = caseColor;

        if (diverges) {
            outExact.textContent = "∞ diverge";
            outExact.style.color = "#f87171";
        } else {
            const exact = F(b) - F(a);
            outExact.textContent = exact.toFixed(4);
            outExact.style.color = "#0dcaf0";
        }
    }

    [sliderA, sliderB, sliderBB, sliderC].forEach(s => s.addEventListener("input", update));
    [swArea, swF, swMarks, swGrid].forEach(s => s.addEventListener("change", update));

    btnReset.addEventListener("click", function () {
        sliderA.value = DEFAULTS.a;
        sliderB.value = DEFAULTS.b;
        sliderBB.value = DEFAULTS.B;
        sliderC.value = DEFAULTS.C;
        swArea.checked = DEFAULTS.area;
        swF.checked = DEFAULTS.f;
        swMarks.checked = DEFAULTS.marks;
        swGrid.checked = DEFAULTS.grid;
        update();
    });

    btnExport.addEventListener("click", function () {
        Plotly.downloadImage(plotDiv, {
            format: "png",
            filename: "modulo13-trinomio-completar-cuadrado",
            width: 1200, height: 700, scale: 2
        });
    });

    update();
}