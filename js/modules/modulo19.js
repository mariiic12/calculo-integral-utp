/**
 * Módulo 19: Volumen con Sección Transversal Conocida
 * - Renderizado manual de TODA la matemática (clase .tex).
 * - Sólido 3D construido por rebanadas: base elegible × tipo de sección.
 */

document.addEventListener("DOMContentLoaded", function () {
    renderAllMath();
    initCrossSectionLab();
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

/* ═══════════════ LABORATORIO 3D DE SECCIONES ═══════════════ */
function initCrossSectionLab() {
    const plotDiv    = document.getElementById("plot-area");
    const sliderA    = document.getElementById("slider-a");
    const sliderB    = document.getElementById("slider-b");
    const sliderN    = document.getElementById("slider-n");
    const valA       = document.getElementById("val-a");
    const valB       = document.getElementById("val-b");
    const valN       = document.getElementById("val-n");
    const baseRadios = [document.getElementById("base-0"), document.getElementById("base-1"), document.getElementById("base-2")];
    const baseOpts   = [document.getElementById("base-opt-0"), document.getElementById("base-opt-1"), document.getElementById("base-opt-2")];
    const typeRadios = [document.getElementById("type-0"), document.getElementById("type-1"), document.getElementById("type-2")];
    const typeOpts   = [document.getElementById("type-opt-0"), document.getElementById("type-opt-1"), document.getElementById("type-opt-2")];
    const swSlices   = document.getElementById("switch-slices");
    const swBase     = document.getElementById("switch-base");
    const swGrid     = document.getElementById("switch-grid");
    const btnRotate  = document.getElementById("btn-rotate");
    const btnReset   = document.getElementById("btn-reset");
    const btnExport  = document.getElementById("btn-export");
    const outV       = document.getElementById("out-v");
    const outSum     = document.getElementById("out-sum");
    const outDiff    = document.getElementById("out-diff");
    const outAform   = document.getElementById("out-aform");
    const lblAform   = document.getElementById("lbl-aform");
    const baseHint   = document.getElementById("base-hint");

    if (!plotDiv || !sliderA || !sliderB) return;

    if (typeof Plotly === "undefined") {
        plotDiv.innerHTML =
            '<div class="d-flex h-100 align-items-center justify-content-center text-white-50 small p-4 text-center">' +
            'No se pudo cargar Plotly.js. Revisa tu conexión y recarga la página.</div>';
        return;
    }

    // Bases: s(x) = lado/diámetro de la sección, S2 = primitiva de s², dominio natural
    const BASES = [
        {
            s:   x => 2 * Math.sqrt(Math.max(4 - x * x, 0)),
            S2:  x => 16 * x - (4 / 3) * x * x * x,
            dom: [-2, 2],
            def: { a: -2, b: 2 },
            hint: "Base: círculo x²+y²=4. La cuerda vertical mide s(x) = 2√(4−x²)."
        },
        {
            s:   x => Math.sqrt(Math.max(x, 0)),
            S2:  x => (x * x) / 2,
            dom: [0, 4],
            def: { a: 0, b: 4 },
            hint: "Base: bajo y=√x sobre el eje x. La altura de la región es s(x) = √x."
        },
        {
            s:   x => Math.max(2 * x - x * x, 0),
            S2:  x => (4 / 3) * x * x * x - Math.pow(x, 4) + Math.pow(x, 5) / 5,
            dom: [0, 2],
            def: { a: 0, b: 2 },
            hint: "Base: entre y=x² (abajo) y y=2x (arriba). El espesor es s(x) = 2x−x²."
        }
    ];

    // Tipos de sección: coeficiente k tal que A = k·s²
    const TYPES = [
        { k: 1,               lbl: "A(x) = s²",        name: "cuadrada" },
        { k: Math.PI / 8,     lbl: "A(x) = πs²/8",     name: "semicircular" },
        { k: Math.sqrt(3) / 4, lbl: "A(x) = (√3/4)s²", name: "triangular" }
    ];

    let base = 0, type = 0;
    let rotTimer = null, phi = 0.9;

    function linspace(start, end, count) {
        const arr = [];
        const step = (end - start) / (count - 1);
        for (let i = 0; i < count; i++) arr.push(start + step * i);
        return arr;
    }

    // Polígono de la sección en el plano (y, z) para un s dado
    function sectionPolygon(s, tipo) {
        const h = s / 2;
        if (tipo === 0) { // cuadrado
            return { y: [-h, h, h, -h, -h], z: [0, 0, s, s, 0] };
        }
        if (tipo === 1) { // semicírculo
            const y = [], z = [];
            for (let i = 0; i <= 24; i++) {
                const t = Math.PI * i / 24;
                y.push(h * Math.cos(t));
                z.push(h * Math.sin(t));
            }
            y.push(y[0]); z.push(0);
            return { y, z };
        }
        // triángulo equilátero
        return { y: [-h, h, 0, -h], z: [0, 0, Math.sqrt(3) * h, 0] };
    }

    function applyPresetRanges() {
        const B = BASES[base];
        sliderA.min = B.dom[0]; sliderA.max = B.dom[1];
        sliderB.min = B.dom[0]; sliderB.max = B.dom[1];
        sliderA.value = B.def.a;
        sliderB.value = B.def.b;
    }

    function update() {
        const B = BASES[base];
        const T = TYPES[type];
        let a = parseFloat(sliderA.value);
        let b = parseFloat(sliderB.value);
        const n = parseInt(sliderN.value, 10);

        if (a >= b) {
            b = Math.min(B.dom[1], a + 0.1);
            sliderB.value = b;
        }
        valA.textContent = a.toFixed(1);
        valB.textContent = b.toFixed(1);
        valN.textContent = n;
        baseHint.textContent = B.hint;
        lblAform.textContent = T.lbl;

        // ---- Volúmenes ----
        const exact = T.k * (B.S2(b) - B.S2(a));
        const dx = (b - a) / n;
        let sum = 0;
        for (let i = 0; i < n; i++) {
            const m = a + (i + 0.5) * dx;
            sum += T.k * Math.pow(B.s(m), 2) * dx;
        }
        outV.textContent = exact.toFixed(4);
        outSum.textContent = sum.toFixed(4);
        outDiff.textContent = Math.abs(exact - sum).toFixed(4);
        outAform.textContent = (T.k * Math.pow(B.s((a + b) / 2), 2)).toFixed(3) + " (en x̄)";

        // ---- Trazos 3D ----
        const traces = [];
        const gridOn = swGrid.checked;

        // Rebanadas
        if (swSlices.checked) {
            for (let i = 0; i < n; i++) {
                const m = a + (i + 0.5) * dx;
                const s = B.s(m);
                if (s <= 1e-6) continue;
                const poly = sectionPolygon(s, type);
                const hue = 190 + 130 * (i / Math.max(n - 1, 1));
                traces.push({
                    type: "scatter3d", mode: "lines",
                    x: poly.y.map(() => m),
                    y: poly.y, z: poly.z,
                    line: { color: "hsl(" + hue + ",85%,60%)", width: 4 },
                    hoverinfo: "skip", showlegend: false
                });
            }
        }

        // Región base (superficie plana z=0)
        if (swBase.checked) {
            const gx = linspace(a, b, 30);
            let maxS = 0;
            gx.forEach(x => { maxS = Math.max(maxS, B.s(x)); });
            const gy = linspace(-maxS / 2 - 0.01, maxS / 2 + 0.01, 30);
            const zz = gx.map(x => gy.map(y => (Math.abs(y) <= B.s(x) / 2 + 1e-9 ? 0 : null)));
            traces.push({
                type: "surface", x: gx.map(x => gx.map(() => x)).map((row, i) => row),
                y: gx.map(() => gy), z: zz,
                surfacecolor: zz.map(row => row.map(v => (v === null ? null : 0))),
                colorscale: [[0, "rgba(13,202,240,0.45)"], [1, "rgba(13,202,240,0.45)"]],
                showscale: false, opacity: 0.55, hoverinfo: "skip", showlegend: false,
                connectgaps: false
            });
            // Bordes de la base
            [1, -1].forEach(sign => {
                traces.push({
                    type: "scatter3d", mode: "lines",
                    x: gx, y: gx.map(x => sign * B.s(x) / 2), z: gx.map(() => 0),
                    line: { color: "rgba(255,255,255,0.75)", width: 3 },
                    hoverinfo: "skip", showlegend: false
                });
            });
        }

        const gc = gridOn ? "rgba(148,163,184,0.18)" : "rgba(0,0,0,0)";
        const layout = {
            paper_bgcolor: "rgba(0,0,0,0)",
            margin: { t: 10, r: 10, b: 10, l: 10 },
            showlegend: false,
            scene: {
                bgcolor: "rgba(0,0,0,0)",
                xaxis: { title: "x", color: "#c7d2fe", gridcolor: gc, backgroundcolor: "rgba(0,0,0,0)" },
                yaxis: { title: "y", color: "#c7d2fe", gridcolor: gc, backgroundcolor: "rgba(0,0,0,0)" },
                zaxis: { title: "z", color: "#c7d2fe", gridcolor: gc, backgroundcolor: "rgba(0,0,0,0)" },
                camera: { eye: { x: 2.0 * Math.cos(phi), y: 2.0 * Math.sin(phi), z: 0.75 } },
                aspectmode: "auto"
            }
        };

        Plotly.react(plotDiv, traces, layout, { responsive: true, displayModeBar: false });
    }

    // ---- Eventos ----
    baseRadios.forEach((r, i) => r.addEventListener("change", function () {
        base = i;
        baseOpts.forEach((o, j) => o.classList.toggle("active", j === i));
        applyPresetRanges();
        update();
    }));
    typeRadios.forEach((r, i) => r.addEventListener("change", function () {
        type = i;
        typeOpts.forEach((o, j) => o.classList.toggle("active", j === i));
        update();
    }));

    [sliderA, sliderB, sliderN].forEach(s => s.addEventListener("input", update));
    [swSlices, swBase, swGrid].forEach(s => s.addEventListener("change", update));

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
                "scene.camera.eye": { x: 2.0 * Math.cos(phi), y: 2.0 * Math.sin(phi), z: 0.75 }
            });
        }, 50);
    });

    btnReset.addEventListener("click", function () {
        if (rotTimer) { clearInterval(rotTimer); rotTimer = null; }
        btnRotate.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i>Girar';
        btnRotate.classList.add("btn-outline-success");
        btnRotate.classList.remove("btn-success");
        phi = 0.9;
        baseRadios[0].checked = true; base = 0;
        typeRadios[0].checked = true; type = 0;
        baseOpts.forEach((o, j) => o.classList.toggle("active", j === 0));
        typeOpts.forEach((o, j) => o.classList.toggle("active", j === 0));
        applyPresetRanges();
        sliderN.value = 12;
        swSlices.checked = true;
        swBase.checked = true;
        swGrid.checked = true;
        update();
    });

    btnExport.addEventListener("click", function () {
        Plotly.downloadImage(plotDiv, {
            format: "png",
            filename: "modulo19-seccion-transversal",
            width: 1400, height: 900, scale: 2
        });
    });

    applyPresetRanges();
    update();
}