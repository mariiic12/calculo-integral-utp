/**
 * Módulo 3: Regla del Punto Medio
 */

const functions = {
    x2:   { fn: x => x * x,                exact: (a, b) => (b**3 - a**3) / 3,            label: 'f(x) = x²' },
    sqrt: { fn: x => Math.sqrt(x),         exact: (a, b) => (2/3) * (b**1.5 - a**1.5),    label: 'f(x) = √x' },
    sin:  { fn: x => Math.sin(x),          exact: (a, b) => -Math.cos(b) + Math.cos(a),   label: 'f(x) = sin(x)' },
    exp:  { fn: x => Math.exp(x),          exact: (a, b) => Math.exp(b) - Math.exp(a),    label: 'f(x) = eˣ' },
    invx: { fn: x => 1 / x,                exact: (a, b) => Math.log(b) - Math.log(a),    label: 'f(x) = 1/x' }
};

let state = { function: 'x2', a: 0, b: 2, n: 4 };

function midpointRule(fn, a, b, n) {
    const dx = (b - a) / n;
    let sum = 0;
    const rectangles = [];

    for (let i = 0; i < n; i++) {
        const x0 = a + i * dx;
        const x1 = x0 + dx;
        const xMid = (x0 + x1) / 2;
        const h = fn(xMid);
        sum += h * dx;

        rectangles.push({
            x: [x0, x1, x1, x0, x0],
            y: [0, 0, h, h, 0],
            fill: 'toself',
            fillcolor: 'rgba(13, 202, 240, 0.25)',
            line: { color: '#0dcaf0', width: 2 },
            showlegend: i === 0,
            name: 'Rectángulos (punto medio)'
        });
    }

    return { value: sum, rectangles };
}

function updatePlot() {
    const f = functions[state.function];
    const { value, rectangles } = midpointRule(f.fn, state.a, state.b, state.n);

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

    const layout = {
        ...PlotlyConfig.baseLayout,
        title: { text: `Regla del Punto Medio — n = ${state.n}`, font: { color: '#ffffff' } },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: { ...PlotlyConfig.baseLayout.xaxis, range: [state.a - 0.3, state.b + 0.3], color: '#cbd5e1' },
        yaxis: { ...PlotlyConfig.baseLayout.yaxis, color: '#cbd5e1' },
        font: { color: '#cbd5e1' },
        legend: { font: { color: '#cbd5e1' } }
    };

    Plotly.newPlot('plot-container', [curveTrace, ...rectangles], layout, { responsive: true });

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