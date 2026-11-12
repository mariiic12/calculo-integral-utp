/**
 * Módulo 12: Hiperbólicas Inversas
 * - Renderizado manual de TODA la matemática (clase .tex), en línea y en bloque.
 * - Visualizador interactivo de f(x) = 1 / sqrt(x² + k²) con Plotly.
 */

document.addEventListener("DOMContentLoaded", function () {
    renderAllMath();
    initHyperbolicPlot();
    if (typeof AOS !== "undefined") {
        AOS.init({ duration: 700, once: true, offset: 50 });
    }
});

/* ═══════════════ RENDERIZADO DE FÓRMULAS ═══════════════ */
function renderAllMath() {
    if (typeof katex === "undefined") {
        // Reintentos por si el CDN tarda (degradación elegante: el texto queda visible)
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
function initHyperbolicPlot() {
    const plotDiv   = document.getElementById("plot-area");
    const sliderA   = document.getElementById("slider-a");
    const sliderB   = document.getElementById("slider-b");
    const sliderK   = document.getElementById("slider-k");
    const sliderN   = document.getElementById("slider-n");
    const valA      = document.getElementById("val-a");
    const valB      = document.getElementById("val-b");
    const valK      = document.getElementById("val-k");
    const valN      = document.getElementById("val-n");
    const swArea    = document.getElementById("switch-area");
    const swF       = document.getElementById("switch-f");
    const swRiemann = document.getElementById("switch-riemann");
    const swGrid    = document.getElementById("switch-grid");
    const btnReset  = document.getElementById("btn-reset");
    const btnExport = document.getElementById("btn-export");
    const outExact  = document.getElementById("integral-result");
    const outRiem   = document.getElementById("riemann-result");
    const outError  = document.getElementById("error-result");

    if (!plotDiv || !sliderA || !sliderB) return;

    if (typeof Plotly === "undefined") {
        plotDiv.innerHTML =
            '<div class="d-flex h-100 align-items-center justify-content-center text-white-50 small p-4 text-center">' +
            'No se pudo cargar Plotly.js. Revisa tu conexión y recarga la página.</div>';
        return;
    }

    const DEFAULTS = { a: 0, b: 3, k: 1, n: 12, area: true, f: false, riemann: false, grid: true };
    const X_MIN = -5, X_MAX = 5;

    const f = (x, k) => 1 / Math.sqrt(x * x + k * k);
    const F = (x, k) => Math.asinh(x / k); // antiderivada exacta

    function linspace(start, end, count) {
        const arr = [];
        const step = (end - start) / (count - 1);
        for (let i = 0; i < count; i++) arr.push(start + step * i);
        return arr;
    }

    function update() {
        let a = parseFloat(sliderA.value);
        let b = parseFloat(sliderB.value);
        const k = parseFloat(sliderK.value);
        const n = parseInt(sliderN.value, 10);

        // Mantener siempre a < b
        if (a >= b) {
            b = Math.min(parseFloat(sliderB.max), a + 0.1);
            sliderB.value = b;
        }

        valA.textContent = a.toFixed(1);
        valB.textContent = b.toFixed(1);
        valK.textContent = k.toFixed(1);
        valN.textContent = n;

        const yMax = (1 / k) * 1.25;
        const gridColor = swGrid.checked ? "rgba(148,163,184,0.15)" : "rgba(0,0,0,0)";

        // Curva principal
        const xs = linspace(X_MIN, X_MAX, 260);
        const ys = xs.map(x => f(x, k));

        const traces = [];

        // Rectángulos de Riemann (punto medio)
        let riemannSum = 0;
        if (swRiemann.checked) {
            const dx = (b - a) / n;
            const mids = [], heights = [];
            for (let i = 0; i < n; i++) {
                const m = a + (i + 0.5) * dx;
                mids.push(m);
                heights.push(f(m, k));
                riemannSum += f(m, k) * dx;
            }
            traces.push({
                type: "bar", x: mids, y: heights, width: dx * 0.94,
                name: "Riemann (n=" + n + ")",
                marker: { color: "rgba(167,139,250,0.40)", line: { color: "#a78bfa", width: 1 } },
                hovertemplate: "x=%{x:.2f}<br>f(x)=%{y:.4f}<extra>Riemann</extra>"
            });
        }

        // Área sombreada
        if (swArea.checked) {
            const xf = linspace(a, b, 160);
            traces.push({
                x: xf, y: xf.map(x => f(x, k)),
                mode: "lines", fill: "tozeroy", name: "Área",
                fillcolor: "rgba(13,202,240,0.22)", line: { color: "transparent" },
                hoverinfo: "skip"
            });
        }

        // Curva f(x)
        traces.push({
            x: xs, y: ys, mode: "lines", name: "f(x) = 1/√(x²+k²)",
            line: { color: "#0dcaf0", width: 3 },
            hovertemplate: "x=%{x:.2f}<br>f(x)=%{y:.4f}<extra>f(x)</extra>"
        });

        // Antiderivada F(x) en eje secundario
        if (swF.checked) {
            traces.push({
                x: xs, y: xs.map(x => F(x, k)),
                mode: "lines", name: "F(x) = arcsinh(x/k)", yaxis: "y2",
                line: { color: "#fbbf24", width: 2.5, dash: "dash" },
                hovertemplate: "x=%{x:.2f}<br>F(x)=%{y:.4f}<extra>F(x)</extra>"
            });
        }

        const layout = {
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: { color: "#c7d2fe", size: 12 },
            margin: { t: 34, r: swF.checked ? 58 : 24, b: 46, l: 56 },
            xaxis: {
                title: "x", range: [X_MIN, X_MAX],
                gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)"
            },
            yaxis: {
                title: "f(x)", range: [-0.06, yMax],
                gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)"
            },
            yaxis2: {
                title: "F(x)", overlaying: "y", side: "right",
                visible: swF.checked, showgrid: false,
                range: [F(X_MIN, k) - 0.4, F(X_MAX, k) + 0.4],
                titlefont: { color: "#fbbf24" }, tickfont: { color: "#fbbf24" }
            },
            showlegend: swF.checked || swRiemann.checked,
            legend: { orientation: "h", y: 1.14, x: 0, font: { size: 11 } },
            shapes: [
                { type: "line", x0: a, x1: a, y0: 0, y1: yMax, line: { color: "#0dcaf0", width: 1.5, dash: "dot" } },
                { type: "line", x0: b, x1: b, y0: 0, y1: yMax, line: { color: "#f472b6", width: 1.5, dash: "dot" } }
            ],
            annotations: [
                { x: a, y: yMax, text: "a", showarrow: false, font: { color: "#0dcaf0", size: 13 }, yanchor: "bottom" },
                { x: b, y: yMax, text: "b", showarrow: false, font: { color: "#f472b6", size: 13 }, yanchor: "bottom" }
            ]
        };

        Plotly.react(plotDiv, traces, layout, { responsive: true, displayModeBar: false });

        // Lecturas numéricas
        const exact = F(b, k) - F(a, k);
        outExact.textContent = exact.toFixed(4);
        if (swRiemann.checked) {
            outRiem.textContent = riemannSum.toFixed(4);
            outError.textContent = Math.abs(exact - riemannSum).toFixed(6);
        } else {
            outRiem.textContent = "—";
            outError.textContent = "—";
        }
    }

    // Eventos en vivo
    [sliderA, sliderB, sliderK, sliderN].forEach(s => s.addEventListener("input", update));
    [swArea, swF, swRiemann, swGrid].forEach(s => s.addEventListener("change", update));

    btnReset.addEventListener("click", function () {
        sliderA.value = DEFAULTS.a;
        sliderB.value = DEFAULTS.b;
        sliderK.value = DEFAULTS.k;
        sliderN.value = DEFAULTS.n;
        swArea.checked = DEFAULTS.area;
        swF.checked = DEFAULTS.f;
        swRiemann.checked = DEFAULTS.riemann;
        swGrid.checked = DEFAULTS.grid;
        update();
    });

    btnExport.addEventListener("click", function () {
        Plotly.downloadImage(plotDiv, {
            format: "png",
            filename: "modulo12-hiperbolicas-inversas",
            width: 1200, height: 700, scale: 2
        });
    });

    update();
}