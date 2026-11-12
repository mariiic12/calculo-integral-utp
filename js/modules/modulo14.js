/**
 * Módulo 14: Integración por Partes
 * - Renderizado manual de TODA la matemática (clase .tex).
 * - Visualizador de la identidad ∫u dv = [uv] − ∫v du con u = x, dv = e^{kx} dx.
 */

document.addEventListener("DOMContentLoaded", function () {
    renderAllMath();
    initPartsPlot();
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

/* ═══════════════ VISUALIZADOR: IDENTIDAD DE PARTES ═══════════════ */
function initPartsPlot() {
    const plotDiv   = document.getElementById("plot-area");
    const sliderA   = document.getElementById("slider-a");
    const sliderB   = document.getElementById("slider-b");
    const sliderK   = document.getElementById("slider-k");
    const valA      = document.getElementById("val-a");
    const valB      = document.getElementById("val-b");
    const valK      = document.getElementById("val-k");
    const swUdv     = document.getElementById("switch-udv");
    const swVdu     = document.getElementById("switch-vdu");
    const swUv      = document.getElementById("switch-uv");
    const swGrid    = document.getElementById("switch-grid");
    const btnReset  = document.getElementById("btn-reset");
    const btnExport = document.getElementById("btn-export");
    const outLhs    = document.getElementById("out-lhs");
    const outBound  = document.getElementById("out-bound");
    const outVdu    = document.getElementById("out-vdu");
    const outCheck  = document.getElementById("out-check");

    if (!plotDiv || !sliderA || !sliderB) return;

    if (typeof Plotly === "undefined") {
        plotDiv.innerHTML =
            '<div class="d-flex h-100 align-items-center justify-content-center text-white-50 small p-4 text-center">' +
            'No se pudo cargar Plotly.js. Revisa tu conexión y recarga la página.</div>';
        return;
    }

    const DEFAULTS = { a: 0, b: 2, k: 1, udv: true, vdu: true, uv: false, grid: true };
    const X_MIN = -2.5, X_MAX = 2.5;

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

        if (a >= b) {
            b = Math.min(parseFloat(sliderB.max), a + 0.1);
            sliderB.value = b;
        }

        valA.textContent = a.toFixed(1);
        valB.textContent = b.toFixed(1);
        valK.textContent = k.toFixed(2);

        // u = x, dv = e^{kx} dx  →  du = dx, v = e^{kx}/k
        const f  = x => x * Math.exp(k * x);        // integrando u·dv/dx
        const v  = x => Math.exp(k * x) / k;         // v(x)  (integrando de ∫v du, pues du = dx)
        const u  = x => x;                           // u(x)
        const F  = x => Math.exp(k * x) * (k * x - 1) / (k * k); // antiderivada exacta de f

        // Términos de la identidad
        const lhs   = F(b) - F(a);
        const bound = b * Math.exp(k * b) / k - a * Math.exp(k * a) / k;
        const vdu   = (Math.exp(k * b) - Math.exp(k * a)) / (k * k);
        const check = lhs - (bound - vdu);

        outLhs.textContent   = lhs.toFixed(4);
        outBound.textContent = bound.toFixed(4);
        outVdu.textContent   = vdu.toFixed(4);
        outCheck.textContent = (Math.abs(check) < 1e-9 ? "0 ✓" : check.toExponential(1));

        const gridColor = swGrid.checked ? "rgba(148,163,184,0.15)" : "rgba(0,0,0,0)";
        const xs = linspace(X_MIN, X_MAX, 300);
        const traces = [];

        // Área ∫u dv (bajo f)
        if (swUdv.checked) {
            const xf = linspace(a, b, 160);
            traces.push({
                x: xf, y: xf.map(f), mode: "lines", fill: "tozeroy", name: "Área ∫u dv",
                fillcolor: "rgba(13,202,240,0.25)", line: { color: "transparent" },
                showlegend: false, hoverinfo: "skip"
            });
        }

        // Área ∫v du (bajo v, pues du = dx)
        if (swVdu.checked) {
            const xf = linspace(a, b, 160);
            traces.push({
                x: xf, y: xf.map(v), mode: "lines", fill: "tozeroy", name: "Área ∫v du",
                fillcolor: "rgba(244,114,182,0.20)", line: { color: "transparent" },
                showlegend: false, hoverinfo: "skip"
            });
        }

        // Curva principal f(x) = x e^{kx}
        traces.push({
            x: xs, y: xs.map(f), mode: "lines", name: "u·dv/dx = x·e^(kx)",
            line: { color: "#0dcaf0", width: 3 },
            hovertemplate: "x=%{x:.2f}<br>%{y:.4f}<extra>u dv/dx</extra>"
        });

        // Curva v(x)
        traces.push({
            x: xs, y: xs.map(v), mode: "lines", name: "v = e^(kx)/k",
            line: { color: "#f472b6", width: 2.5 },
            hovertemplate: "x=%{x:.2f}<br>%{y:.4f}<extra>v(x)</extra>"
        });

        // Curvas u(x) y v(x) resaltadas
        if (swUv.checked) {
            traces.push({
                x: xs, y: xs.map(u), mode: "lines", name: "u = x",
                line: { color: "#34d399", width: 2, dash: "dot" },
                hovertemplate: "x=%{x:.2f}<br>%{y:.2f}<extra>u(x)</extra>"
            });
        }

        const layout = {
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: { color: "#c7d2fe", size: 12 },
            margin: { t: 40, r: 24, b: 46, l: 56 },
            xaxis: { title: "x", range: [X_MIN, X_MAX], gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            yaxis: { title: "y", autorange: true, gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            showlegend: true,
            legend: { orientation: "h", y: 1.16, x: 0, font: { size: 11 } },
            shapes: [
                { type: "line", x0: a, x1: a, y0: 0, y1: 1, yref: "paper", line: { color: "#0dcaf0", width: 1.5, dash: "dot" } },
                { type: "line", x0: b, x1: b, y0: 0, y1: 1, yref: "paper", line: { color: "#f472b6", width: 1.5, dash: "dot" } }
            ],
            annotations: [
                { x: a, y: 1, yref: "paper", text: "a", showarrow: false, font: { color: "#0dcaf0", size: 13 }, yanchor: "bottom" },
                { x: b, y: 1, yref: "paper", text: "b", showarrow: false, font: { color: "#f472b6", size: 13 }, yanchor: "bottom" }
            ]
        };

        Plotly.react(plotDiv, traces, layout, { responsive: true, displayModeBar: false });
    }

    [sliderA, sliderB, sliderK].forEach(s => s.addEventListener("input", update));
    [swUdv, swVdu, swUv, swGrid].forEach(s => s.addEventListener("change", update));

    btnReset.addEventListener("click", function () {
        sliderA.value = DEFAULTS.a;
        sliderB.value = DEFAULTS.b;
        sliderK.value = DEFAULTS.k;
        swUdv.checked = DEFAULTS.udv;
        swVdu.checked = DEFAULTS.vdu;
        swUv.checked = DEFAULTS.uv;
        swGrid.checked = DEFAULTS.grid;
        update();
    });

    btnExport.addEventListener("click", function () {
        Plotly.downloadImage(plotDiv, {
            format: "png",
            filename: "modulo14-integracion-por-partes",
            width: 1200, height: 700, scale: 2
        });
    });

    update();
}