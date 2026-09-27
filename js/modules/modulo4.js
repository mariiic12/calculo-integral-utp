/**
 * Módulo 4: Regla de Simpson 1/3
 */

const functions = {
    x2:   { fn: x => x * x,                exact: (a, b) => (b**3 - a**3) / 3,            label: 'f(x) = x²' },
    sqrt: { fn: x => Math.sqrt(x),         exact: (a, b) => (2/3) * (b**1.5 - a**1.5),    label: 'f(x) = √x' },
    sin:  { fn: x => Math.sin(x),          exact: (a, b) => -Math.cos(b) + Math.cos(a),   label: 'f(x) = sin(x)' },
    exp:  { fn: x => Math.exp(x),          exact: (a, b) => Math.exp(b) - Math.exp(a),    label: 'f(x) = eˣ' },
    invx: { fn: x => 1 / x,                exact: (a, b) => Math.log(b) - Math.log(a),    label: 'f(x) = 1/x' }
};

let state = { function: 'x2', a: 0, b: 2, n: 4 };

function simpsonRule(fn, a, b, n) {
    if (n % 2 !== 0) n++; // Forzar par
    const dx = (b - a) / n;
    let sum = fn(a) + fn(b);
    const points = [];

    for (let i = 1; i < n; i++) {
        const x = a + i * dx;
        const weight = (i % 2 === 0) ? 2 : 4;
        sum += weight * fn(x);
        points.push({ x, y: fn(x) });
    }

    // Trazas de las parábolas (aproximación visual)
    const parabolaTraces = [];
    for (let i = 0; i < n; i += 2) {
        const x0 = a + i * dx;
        const x1 = x0 + dx;
        const x2 = x0 + 2 * dx;
        const y0 = fn(x0), y1 = fn(x1), y2 = fn(x2);

        // Interpolación cuadrática
        const xParab = [], yParab = [];
        const steps = 30;
        for (let j = 0; j <= steps; j++) {
            const t = j / steps;
            const x = x0 + t * 2 * dx;
            // Interpolación de Lagrange
            const L0 = ((x - x1) * (x - x2)) / ((x0 - x1) * (x0 - x2));
            const L1 = ((x - x0) * (x - x2)) / ((x1 - x0) * (x1 - x2));
            const L2 = ((x - x0) * (x - x1)) / ((x2 - x0) * (x2 - x1));
            const y = y0 * L0 + y1 * L1 + y2 * L2;
            xParab.push(x);
            yParab.push(y);
        }

        // Área bajo la parábola (fill)
        parabolaTraces.push({
            x: [...xParab, xParab[xParab.length - 1], xParab[0]],
            y: [...yParab, 0, 0],
            fill: 'toself',
            fillcolor: 'rgba(25, 135, 84, 0.2)',
            line: { color: '#198754', width: 2 },
            showlegend: i === 0,
            name: 'Parábolas de Simpson'
        });
    }

    return { value: (dx / 3) * sum, parabolaTraces };
}

function updatePlot() {
    const f = functions[state.function];
    const { value, parabolaTraces } = simpsonRule(f.fn, state.a, state.b, state.n);

    const xCurve = [], yCurve = [];
    const steps = 200;
    const dx = (state.b - state.a) / steps;
    for (let i = 0; i <= steps; i++) {
        const x = state.a + i * dx;
        xCurve.push(x);
        yCurve.push(f.fn(x));
    }

    const curveTrace = {
        x: xCurve, y: yCurve, type: 'scatter', mode: 'lines',
        name: f.label, line: { color: '#d63384', width: 3 }
    };

    // Puntos de evaluación
    const dxN = (state.b - state.a) / state.n;
    const xPts = [], yPts = [];
    for (let i = 0; i <= state.n; i++) {
        const x = state.a + i * dxN;
        xPts.push(x);
        yPts.push(f.fn(x));
    }
    const pointsTrace = {
        x: xPts, y: yPts, type: 'scatter', mode: 'markers',
        name: 'Puntos xᵢ',
        marker: { color: '#ffc107', size: 8, symbol: 'circle' }
    };

    const layout = {
        ...PlotlyConfig.baseLayout,
        title: { text: `Regla de Simpson — n = ${state.n}`, font: { color: '#ffffff' } },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: { ...PlotlyConfig.baseLayout.xaxis, range: [state.a - 0.3, state.b + 0.3], color: '#cbd5e1' },
        yaxis: { ...PlotlyConfig.baseLayout.yaxis, color: '#cbd5e1' },
        font: { color: '#cbd5e1' },
        legend: { font: { color: '#cbd5e1' } }
    };

    Plotly.newPlot('plot-container', [curveTrace, ...parabolaTraces, pointsTrace], layout, { responsive: true });

    const exact = f.exact(state.a, state.b);
    const errorPct = (Math.abs(value - exact) / Math.abs(exact)) * 100;

    document.getElementById('approx-value').textContent = value.toFixed(6);
    document.getElementById('exact-value').textContent = exact.toFixed(6);
    document.getElementById('error-value').textContent = `${errorPct.toFixed(3)}%`;
}

function initControls() {
    document.getElementById('function').addEventListener('change', e => {
        state.function = e.target.value;
        updatePlot();
    });
    document.getElementById('interval-a').addEventListener('change', e => {
        state.a = parseFloat(e.target.value);
        updatePlot();
    });
    document.getElementById('interval-b').addEventListener('change', e => {
        state.b = parseFloat(e.target.value);
        updatePlot();
    });
    const slider = document.getElementById('n-value');
    slider.addEventListener('input', e => {
        state.n = parseInt(e.target.value);
        document.getElementById('n-display').textContent = state.n;
        updatePlot();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initControls();
    updatePlot();
    document.querySelectorAll('.katex-formula').forEach(el => {
        const formula = el.getAttribute('data-formula');
        if (formula) katex.render(formula, el, { throwOnError: false, displayMode: true });
    });
});