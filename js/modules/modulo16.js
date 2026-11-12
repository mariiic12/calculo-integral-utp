/**
 * Módulo 16: Sustitución Trigonométrica
 * - Renderizado manual de TODA la matemática (clase .tex).
 * - Visualizador del triángulo rectángulo de referencia para los 3 casos.
 */

document.addEventListener("DOMContentLoaded", function () {
    renderAllMath();
    initTrigSubPlot();
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

/* ═══════════════ VISUALIZADOR: TRIÁNGULO DE REFERENCIA ═══════════════ */
function initTrigSubPlot() {
    const plotDiv   = document.getElementById("plot-area");
    const sliderA   = document.getElementById("slider-a");
    const sliderU   = document.getElementById("slider-u");
    const valA      = document.getElementById("val-a");
    const valU      = document.getElementById("val-u");
    const radios    = [document.getElementById("case-1"), document.getElementById("case-2"), document.getElementById("case-3")];
    const caseOpts  = [document.getElementById("case-opt-1"), document.getElementById("case-opt-2"), document.getElementById("case-opt-3")];
    const swArc     = document.getElementById("switch-arc");
    const swLabels  = document.getElementById("switch-labels");
    const swGuide   = document.getElementById("switch-guide");
    const swGrid    = document.getElementById("switch-grid");
    const btnPlay   = document.getElementById("btn-play");
    const btnReset  = document.getElementById("btn-reset");
    const btnExport = document.getElementById("btn-export");
    const outTheta  = document.getElementById("out-theta");
    const outRatio  = document.getElementById("out-ratio");
    const outRad    = document.getElementById("out-rad");
    const outCheck  = document.getElementById("out-check");
    const lblRatio  = document.getElementById("lbl-ratio");
    const lblRad    = document.getElementById("lbl-rad");
    const lblCheck  = document.getElementById("lbl-check");

    if (!plotDiv || !sliderA || !sliderU) return;

    if (typeof Plotly === "undefined") {
        plotDiv.innerHTML =
            '<div class="d-flex h-100 align-items-center justify-content-center text-white-50 small p-4 text-center">' +
            'No se pudo cargar Plotly.js. Revisa tu conexión y recarga la página.</div>';
        return;
    }

    const DEFAULTS = { caso: 0, a: 2, u: 1.2, arc: true, labels: true, guide: true, grid: true };
    let caso = 0; // 0, 1, 2  →  casos 1, 2, 3
    let animTimer = null;
    let animDir = 1;

    function clampU(u, a) {
        if (caso === 0) return Math.max(-(a - 0.05), Math.min(a - 0.05, u));
        if (caso === 2) return Math.max(a + 0.05, Math.min(4, u));
        return Math.max(-4, Math.min(4, u));
    }

    function update() {
        const a = parseFloat(sliderA.value);
        let u = clampU(parseFloat(sliderU.value), a);
        if (parseFloat(sliderU.value) !== u) sliderU.value = u;

        valA.textContent = a.toFixed(1);
        valU.textContent = u.toFixed(2);

        // Geometría del triángulo según el caso
        let adj, opp, hyp, theta, ratioVal, radVal, checkVal;
        let lblR, lblRd, lblC;

        if (caso === 0) {
            // √(a²−u²):  u = a sinθ  →  opuesto u, hipotenusa a, adyacente √(a²−u²)
            adj = Math.sqrt(Math.max(a * a - u * u, 0));
            opp = u;
            hyp = a;
            theta = Math.asin(Math.max(-1, Math.min(1, u / a)));
            ratioVal = u / a;
            radVal = adj;
            checkVal = a * Math.cos(theta);
            lblR = "sin θ = u/a"; lblRd = "√(a²−u²)"; lblC = "a·cos θ (debe coincidir)";
        } else if (caso === 1) {
            // √(a²+u²):  u = a tanθ  →  adyacente a, opuesto u, hipotenusa √(a²+u²)
            adj = a;
            opp = u;
            hyp = Math.sqrt(a * a + u * u);
            theta = Math.atan(u / a);
            ratioVal = u / a;
            radVal = hyp;
            checkVal = a / Math.cos(theta); // a·secθ
            lblR = "tan θ = u/a"; lblRd = "√(a²+u²)"; lblC = "a·sec θ (debe coincidir)";
        } else {
            // √(u²−a²):  u = a secθ  →  adyacente a, hipotenusa u, opuesto √(u²−a²)
            adj = a;
            opp = Math.sqrt(Math.max(u * u - a * a, 0));
            hyp = u;
            theta = Math.acos(Math.max(-1, Math.min(1, a / u)));
            ratioVal = u / a;
            radVal = opp;
            checkVal = a * Math.tan(theta);
            lblR = "sec θ = u/a"; lblRd = "√(u²−a²)"; lblC = "a·tan θ (debe coincidir)";
        }

        lblRatio.textContent = lblR;
        lblRad.textContent = lblRd;
        lblCheck.textContent = lblC;
        outTheta.textContent = (theta * 180 / Math.PI).toFixed(1) + "°";
        outRatio.textContent = ratioVal.toFixed(3);
        outRad.textContent = radVal.toFixed(3);
        outCheck.textContent = checkVal.toFixed(3);

        // ---- Trazos del triángulo ----
        const traces = [];
        const s = 0.10 * Math.max(a, Math.abs(u), Math.abs(opp), 1); // tamaño del marcador de ángulo recto

        // Curva guía (caso 1: circunferencia radio a)
        if (swGuide.checked && caso === 0) {
            const t = [];
            for (let i = 0; i <= 120; i++) t.push(i / 120 * 2 * Math.PI);
            traces.push({
                x: t.map(x => a * Math.cos(x)), y: t.map(x => a * Math.sin(x)),
                mode: "lines", name: "x²+y²=a²",
                line: { color: "rgba(255,255,255,0.15)", width: 1, dash: "dot" },
                hoverinfo: "skip"
            });
        }

        // Triángulo O→P→Q→O
        traces.push({
            x: [0, adj, adj, 0], y: [0, 0, opp, 0],
            mode: "lines", name: "Triángulo",
            line: { color: "#0dcaf0", width: 3 },
            hoverinfo: "skip"
        });

        // Hipotenusa resaltada O→Q
        traces.push({
            x: [0, adj], y: [0, opp],
            mode: "lines", name: "Hipotenusa",
            line: { color: "#f472b6", width: 3.5 },
            hoverinfo: "skip"
        });

        // Marcador de ángulo recto en P
        traces.push({
            x: [adj - s, adj - s, adj], y: [opp >= 0 ? s : -s, opp >= 0 ? 0 : 0, opp >= 0 ? 0 : 0],
            mode: "lines", line: { color: "rgba(255,255,255,0.6)", width: 1.5 },
            hoverinfo: "skip"
        });
        // (segundo tramo del cuadrado)
        traces.push({
            x: [adj - s, adj - s], y: [0, opp >= 0 ? s : -s],
            mode: "lines", line: { color: "rgba(255,255,255,0.6)", width: 1.5 },
            hoverinfo: "skip"
        });

        // Arco del ángulo θ en O
        if (swArc.checked) {
            const r0 = 0.35 * Math.max(a, Math.abs(u), 1) * 0.6;
            const pts = [];
            const steps = 40;
            for (let i = 0; i <= steps; i++) pts.push(theta * i / steps);
            traces.push({
                x: pts.map(t => r0 * Math.cos(t)), y: pts.map(t => r0 * Math.sin(t)),
                mode: "lines", name: "θ",
                line: { color: "#fbbf24", width: 2.5 },
                hoverinfo: "skip"
            });
        }

        // Vértices
        traces.push({
            x: [0, adj, adj], y: [0, 0, opp],
            mode: "markers", name: "Vértices",
            marker: { size: 9, color: ["#0dcaf0", "#34d399", "#f472b6"] },
            hoverinfo: "skip"
        });

        // ---- Anotaciones (etiquetas de lados) ----
        const annotations = [];
        if (swLabels.checked) {
            const adjName  = caso === 0 ? "√(a²−u²) = " + adj.toFixed(2) : "a = " + a.toFixed(1);
            const oppName  = caso === 2 ? "√(u²−a²) = " + opp.toFixed(2) : "u = " + u.toFixed(2);
            const hypName  = caso === 0 ? ("a = " + a.toFixed(1)) : (caso === 1 ? ("√(a²+u²) = " + hyp.toFixed(2)) : ("u = " + u.toFixed(2)));
            annotations.push(
                { x: adj / 2, y: 0, text: adjName, showarrow: false, font: { color: "#34d399", size: 13 }, yshift: opp >= 0 ? -18 : 18 },
                { x: adj, y: opp / 2, text: oppName, showarrow: false, font: { color: "#0dcaf0", size: 13 }, xshift: 62 },
                { x: adj / 2, y: opp / 2, text: hypName, showarrow: false, font: { color: "#f472b6", size: 13 }, xshift: -58, yshift: 14 }
            );
        }
        if (swArc.checked) {
            const r1 = 0.55 * Math.max(a, Math.abs(u), 1) * 0.6;
            annotations.push({
                x: r1 * Math.cos(theta / 2), y: r1 * Math.sin(theta / 2),
                text: "θ", showarrow: false, font: { color: "#fbbf24", size: 16 }
            });
        }

        const gridColor = swGrid.checked ? "rgba(148,163,184,0.15)" : "rgba(0,0,0,0)";
        const span = Math.max(a, Math.abs(u), adj, Math.abs(opp)) + 1;

        const layout = {
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: { color: "#c7d2fe", size: 12 },
            margin: { t: 24, r: 24, b: 40, l: 50 },
            xaxis: { title: "cateto adyacente", range: [-0.6, span], gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            yaxis: { title: "cateto opuesto", scaleanchor: "x", gridcolor: gridColor, zerolinecolor: "rgba(148,163,184,0.35)" },
            showlegend: false,
            annotations: annotations
        };

        Plotly.react(plotDiv, traces, layout, { responsive: true, displayModeBar: false });
    }

    // ---- Cambio de caso ----
    radios.forEach((r, i) => {
        r.addEventListener("change", function () {
            caso = i;
            caseOpts.forEach((o, j) => o.classList.toggle("active", j === i));
            update();
        });
    });

    [sliderA, sliderU].forEach(sl => sl.addEventListener("input", update));
    [swArc, swLabels, swGuide, swGrid].forEach(sw => sw.addEventListener("change", update));

    // ---- Animación de θ ----
    btnPlay.addEventListener("click", function () {
        if (animTimer) {
            clearInterval(animTimer);
            animTimer = null;
            btnPlay.innerHTML = '<i class="bi bi-play-fill me-1"></i>Animar θ';
            btnPlay.classList.remove("btn-success");
            btnPlay.classList.add("btn-outline-success");
            return;
        }
        btnPlay.innerHTML = '<i class="bi bi-pause-fill me-1"></i>Pausar';
        btnPlay.classList.remove("btn-outline-success");
        btnPlay.classList.add("btn-success");
        animTimer = setInterval(function () {
            const a = parseFloat(sliderA.value);
            let u = parseFloat(sliderU.value) + animDir * 0.04;
            const lo = caso === 0 ? -(a - 0.05) : (caso === 2 ? a + 0.05 : -4);
            const hi = caso === 0 ? (a - 0.05) : 4;
            if (u >= hi) { u = hi; animDir = -1; }
            if (u <= lo) { u = lo; animDir = 1; }
            sliderU.value = u;
            update();
        }, 40);
    });

    btnReset.addEventListener("click", function () {
        if (animTimer) { clearInterval(animTimer); animTimer = null; }
        btnPlay.innerHTML = '<i class="bi bi-play-fill me-1"></i>Animar θ';
        btnPlay.classList.remove("btn-success");
        btnPlay.classList.add("btn-outline-success");
        radios[DEFAULTS.caso].checked = true;
        caso = DEFAULTS.caso;
        caseOpts.forEach((o, j) => o.classList.toggle("active", j === DEFAULTS.caso));
        sliderA.value = DEFAULTS.a;
        sliderU.value = DEFAULTS.u;
        swArc.checked = DEFAULTS.arc;
        swLabels.checked = DEFAULTS.labels;
        swGuide.checked = DEFAULTS.guide;
        swGrid.checked = DEFAULTS.grid;
        update();
    });

    btnExport.addEventListener("click", function () {
        Plotly.downloadImage(plotDiv, {
            format: "png",
            filename: "modulo16-sustitucion-trigonometrica",
            width: 1200, height: 700, scale: 2
        });
    });

    update();
}