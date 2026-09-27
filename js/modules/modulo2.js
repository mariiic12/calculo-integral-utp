/**
 * Módulo 2: Regla del Trapecio
 * Visualización interactiva de la aproximación por trapecios
 */

const functions = {
    x2:   { fn: x => x * x,                exact: (a, b) => (b**3 - a**3) / 3,            label: 'f(x) = x²' },
    sqrt: { fn: x => Math.sqrt(x),         exact: (a, b) => (2/3) * (b**1.5 - a**1.5),    label: 'f(x) = √x' },
    sin:  { fn: x => Math.sin(x),          exact: (a, b) => -Math.cos(b) + Math.cos(a),   label: 'f(x) = sin(x)' },
    exp:  { fn: x => Math.exp(x),          exact: (a, b) => Math.exp(b) - Math.exp(a),    label: 'f(x) = eˣ' },
    invx: { fn: x => 1 / x,                exact: (a, b) => Math.log(b) - Math.log(a),    label: 'f(x) = 1/x' }
};

let state = { function: 'x2', a: 0, b: 2, n: 4 };

/**
 * Calcula la aproximación por regla del trapecio
 */
function trapezoidRule(fn, a, b, n) {
    const dx = (b - a) / n;
    let sum = fn(a) + fn(b);
    const trapezoids = [];

    for (let i = 1; i < n; i++) {
        sum += 2 * fn(a + i * dx);
    }

    // Generar trazas de los trapecios
    for (let i = 0; i < n; i++) {
        const x0 = a + i * dx;
        const x1 = x0 + dx;
        const y0 = fn(x0);
        const y1 = fn(x1);
        trapezoids.push({
            x: [x0, x1, x1, x0, x0],
            y: [0, 0, y1, y0, 0],
            fill: 'toself',
            fillcolor: 'rgba(13, 110, 253, 0.25)',
            line: { color: '#0d6efd', width: 2 },
            showlegend: i === 0,
            name: 'Trapecios'
        });
    }

    return { value: (dx / 2) * sum, trapezoids };
}

function updatePlot() {
    const f = functions[state.function];
    const { value, trapezoids } = trapezoidRule(f.fn, state.a, state.b, state.n);

    // Curva de la función
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
        title: { text: `Regla del Trapecio — n = ${state.n}`, font: { color: '#ffffff' } },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: { ...PlotlyConfig.baseLayout.xaxis, title: { text: 'x', font: { color: '#cbd5e1' } }, range: [state.a - 0.3, state.b + 0.3], color: '#cbd5e1' },
        yaxis: { ...PlotlyConfig.baseLayout.yaxis, title: { text: 'f(x)', font: { color: '#cbd5e1' } }, color: '#cbd5e1' },
        font: { color: '#cbd5e1' },
        legend: { font: { color: '#cbd5e1' } }
    };

    Plotly.newPlot('plot-container', [curveTrace, ...trapezoids], layout, { responsive: true });

    const exact = f.exact(state.a, state.b);
    const error = Math.abs(value - exact);
    const errorPct = (error / Math.abs(exact)) * 100;

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
    const display = document.getElementById('n-display');
    slider.addEventListener('input', e => {
        state.n = parseInt(e.target.value);
        display.textContent = state.n;
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