/**
 * Módulo 15: Fracciones Parciales
 * - Renderizado manual de TODA la matemática (clase .tex).
 * - Visualizador de la descomposición 1/((x−r1)(x−r2)) = A/(x−r1) + B/(x−r2).
 */

document.addEventListener("DOMContentLoaded", function () {
    renderAllMath();
    initPartialPlot();
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

/* ═══════════════ VISUALIZADOR: DESCOMPOSICIÓN EN VIVO ═══════════════ */
function initPartialPlot() {
    const plotDiv   = document.getElementById("plot-area");
    const sliderA   = document.getElementById("slider-a");
    const sliderB   = document.getElementById("slider-b");
    const sliderR1  = document.getElementById("slider-r1");
    const sliderR2  = document.getElementById("slider-r2");
    const valA      = document.getElementById("val-a");
    const valB      = document.getElementById("val-b");
    const valR1     = document.getElementById("val-r1");
    const valR2     = document.getElementById("val-r2");
    const swTerms   = document.getElementById("switch-terms");
    const swSum     = document.getElementById("switch-sum");
    const swArea    = document.getElementById("switch-area");
    const swGrid    = document.getElementById("switch-grid");
    const btnReset  = document.getElementById("btn-reset");
    const btnExport = document.getElementById("btn-export");
    const outA      = document.getElementById("out-A");
    const outB      = document.getElementById("out-B");
    const outInt    = document.getElementById("out-int");
    const outStatus = document.getElementById("out-status");

    if (!plotDiv || !sliderA || !sliderB) return;

    if (typeof Plotly === "undefined") {
        plotDiv.innerHTML =
            '<div class="d-flex h-100 align-items-center justify-content-center text-white-50 small p-4 text-center">' +
            'No se pudo cargar Plotly.js. Revisa tu conexión y recarga la página.</div>';
        return;
    }

    const DEFAULTS = { a: -0.8, b: 0.8, r1: -1, r2: 1, terms: true, sum: false, area: true, grid: true };
    const X_MIN = -6, X_MAX = 6;
    const Y_CAP = 4;
    const MIN_SEP = 0.4; // separación mínima entre raíces

    function linspace(start, end, count) {
        const arr = [];
        const step = (end - start) / (count - 1);
        for (let i = 0; i < count; i++) arr.push(start + step * i);
        return arr;
    }

    const clip = y => (isFinite(y) && Math.abs(y) <= Y_CAP) ? y : null;

    function update() {
        let a  = parseFloat(sliderA.value);
        let b  = parseFloat(sliderB.value);
        let r1 = parseFloat(sliderR1.value);
        let r2 = parseFloat(sliderR2.value);

        // Mantener raíces separadas
        if (r2 - r1 < MIN_SEP) {
            r2 = Math.min(parseFloat(sliderR2.max), r1 + MIN_SEP);
            r1 = Math.max(parseFloat(sliderR1.min), r2 - MIN_SEP);
            sliderR1.value = r1;
            sliderR2.value = r2;
        }
        // Mantener a < b
        if (a >= b) {
            b = Math.min(parseFloat(sliderB.max), a + 0.1);
            sliderB.value = b;
        }

        valA.textContent  = a.toFixed(1);
        valB.textContent  = b.toFixed(1);
        valR1.textContent = r1.toFixed(1);
        valR2.textContent = r2.toFixed(1);

        // Coeficientes de la descomposición: 1/((x−r1)(x−r2)) = A/(x−r1) + B/(x−r2)
        const A = 1 / (r1 - r2);
        const B = -A;

        const f  = x => 1 / ((x - r1) * (x - r2));
        const t1 = x => A / (x - r1);
        const t2 = x => B / (x - r2);
        const F  = x => A * Math.log(Math.abs(x - r1)) + B * Math.log(Math.abs(x - r2));

        // ¿Alguna raíz dentro de [a, b]? → diverge
        const diverges = (r1 > a + 1e-6 && r1 < b - 1e-6) || (r2 > a + 1e-6 && r2 < b - 1e-6);

        outA.textContent = A.toFixed(3);
        outB.textContent = B.toFixed(3);

        if (diverges) {
            outInt.textContent = "∞ diverge";
            outInt.style.color = "#f87171";
            outStatus.textContent = "Raíz en [a, b] ⚠";
            outStatus.style.color = "#f87171";
        } else {
            outInt.textContent = (F(b) - F(a)).toFixed(4);
            outInt.style.color = "#0dcaf0";
            outStatus.textContent = "Converge ✓";
            outStatus.style.color = "#34d399";
        }

        const gridColor = swGrid.checked ? "rgba(148,163,184,0.15)" : "rgba(0,0,0,0)";
        const xs = linspace(X_MIN, X_MAX, 480);
        const traces = [];

        // Área sombreada bajo f
        if (swArea.checked && !diverges) {
            const xf = linspace(a, b, 160);
            traces.push({
                x: xf, y: xf.map(f), mode: "lines", fill: "tozeroy", name: "Área",
                fillcolor: "rgba(13,202,240,0.22)", line: { color: "transparent" },
                showlegend: false, hoverinfo: "skip"
            });
        }

        // Curva original f(x)
        traces.push({
            x: xs, y: xs.map(x => clip(f(x))), mode: "lines", name: "f(x) original",
            line: { color: "#0dcaf0", width: 3 }, connectgaps: false,
            hovertemplate: "x=%{x:.2f}<br>f=%{y:.4f}<extra>f(x)</extra>"
        });

        // Términos parciales
        if (swTerms.checked) {
            traces.push({
                x: xs, y: xs.map(x => clip(t1(x))), mode: "lines", name: "A/(x−r1)",
                line: { color: "#f472b6", width: 2, dash: "dash" }, connectgaps: false,
                hovertemplate: "x=%{x:.2f}<br>%{y:.4f}<extra>término 1</extra>"
            });
            traces.push({
                x: xs, y: xs.map(x => clip(t2(x))), mode: "lines", name: "B/(x−r2)",
                line: { color: "#34d399", width: 2, dash: "dash" }, connectgaps: false,
                hovertemplate: "x=%{x:.2f}<br>%{y:.4f}<extra>término 2</extra>"
            });
        }

        // Verificación: suma de términos = f
        if (swSum.checked) {
            traces.push({
                x: xs,
                y: xs.map(x => {
                    const s = t1(x) + t2(x);
                    return clip(s);
                }),
                mode: "lines", name: "suma = f ✓",
                line: { color: "#fbbf24", width: 3.5, dash: "dot" }, connectgaps: false,
                hovertemplate: "x=%{x:.2f}<br>%{y:.4f}<extra>suma</extra>"
            });
        }

        const layout = {
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: { color: "#c7d2fe", size: 12 },
            margin: { t: 40, r: 24, b: 46, l: 56 },
            xaxis: { title: "x", range: [X_MIN, X_MAX], gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            yaxis: { title: "y", range: [-Y_CAP, Y_CAP], gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            showlegend: true,
            legend: { orientation: "h", y: 1.16, x: 0, font: { size: 11 } },
            shapes: [
                { type: "line", x0: r1, x1: r1, y0: -Y_CAP, y1: Y_CAP, line: { color: "rgba(244,114,182,0.35)", width: 1, dash: "dot" } },
                { type: "line", x0: r2, x1: r2, y0: -Y_CAP, y1: Y_CAP, line: { color: "rgba(52,211,153,0.35)", width: 1, dash: "dot" } },
                { type: "line", x0: a, x1: a, y0: -Y_CAP, y1: Y_CAP, line: { color: "#0dcaf0", width: 1.5, dash: "dot" } },
                { type: "line", x0: b, x1: b, y0: -Y_CAP, y1: Y_CAP, line: { color: "#f472b6", width: 1.5, dash: "dot" } }
            ],
            annotations: [
                { x: a, y: Y_CAP, text: "a", showarrow: false, font: { color: "#0dcaf0", size: 13 }, yanchor: "bottom" },
                { x: b, y: Y_CAP, text: "b", showarrow: false, font: { color: "#f472b6", size: 13 }, yanchor: "bottom" }
            ]
        };

        Plotly.react(plotDiv, traces, layout, { responsive: true, displayModeBar: false });
    }

    [sliderA, sliderB, sliderR1, sliderR2].forEach(s => s.addEventListener("input", update));
    [swTerms, swSum, swArea, swGrid].forEach(s => s.addEventListener("change", update));

    btnReset.addEventListener("click", function () {
        sliderA.value = DEFAULTS.a;
        sliderB.value = DEFAULTS.b;
        sliderR1.value = DEFAULTS.r1;
        sliderR2.value = DEFAULTS.r2;
        swTerms.checked = DEFAULTS.terms;
        swSum.checked = DEFAULTS.sum;
        swArea.checked = DEFAULTS.area;
        swGrid.checked = DEFAULTS.grid;
        update();
    });

    btnExport.addEventListener("click", function () {
        Plotly.downloadImage(plotDiv, {
            format: "png",
            filename: "modulo15-fracciones-parciales",
            width: 1200, height: 700, scale: 2
        });
    });

    update();
}