/**
 * Módulo 5: Integral Definida y Área
 */

const functions = {
    poly: {
        fn: x => 3 * x * x - 2 * x + 1,
        F: x => x ** 3 - x ** 2 + x,
        label: 'f(x) = 3x² − 2x + 1',
        Flabel: 'F(x) = x³ − x² + x'
    },
    invx: {
        fn: x => 1 / x,
        F: x => Math.log(Math.abs(x)),
        label: 'f(x) = 1/x',
        Flabel: 'F(x) = ln|x|'
    },
    cos: {
        fn: x => Math.cos(x),
        F: x => Math.sin(x),
        label: 'f(x) = cos(x)',
        Flabel: 'F(x) = sin(x)'
    },
    exp: {
        fn: x => Math.exp(x),
        F: x => Math.exp(x),
        label: 'f(x) = eˣ',
        Flabel: 'F(x) = eˣ'
    }
};

let state = { function: 'poly', a: 0, b: 2 };

function updatePlot() {
    const f = functions[state.function];
    const a = state.a, b = state.b;

    // Curva de la función
    const xCurve = [], yCurve = [];
    const steps = 300;
    const dx = (b - a) / steps;
    for (let i = 0; i <= steps; i++) {
        const x = a + i * dx;
        xCurve.push(x);
        yCurve.push(f.fn(x));
    }

    const curveTrace = {
        x: xCurve, y: yCurve, type: 'scatter', mode: 'lines',
        name: f.label, line: { color: '#0d6efd', width: 3 }
    };

    // Área bajo la curva (fill)
    const xArea = [a, ...xCurve, b];
    const yArea = [0, ...yCurve, 0];
    const areaTrace = {
        x: xArea, y: yArea, type: 'scatter', mode: 'lines',
        fill: 'tozeroy', fillcolor: 'rgba(13, 110, 253, 0.25)',
        line: { color: 'rgba(0,0,0,0)', width: 0 },
        name: 'Área', showlegend: true
    };

    // Líneas verticales en a y b
    const vLineA = { type: 'line', x0: a, x1: a, y0: 0, y1: f.fn(a), line: { color: '#ffc107', width: 2, dash: 'dot' } };
    const vLineB = { type: 'line', x0: b, x1: b, y0: 0, y1: f.fn(b), line: { color: '#ffc107', width: 2, dash: 'dot' } };

    const integralValue = f.F(b) - f.F(a);
    const areaValue = Math.abs(integralValue);

    const layout = {
        ...PlotlyConfig.baseLayout,
        title: { text: `Integral Definida: ∫ₐᵇ f(x) dx`, font: { color: '#ffffff' } },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: { ...PlotlyConfig.baseLayout.xaxis, range: [a - 0.5, b + 0.5], color: '#cbd5e1' },
        yaxis: { ...PlotlyConfig.baseLayout.yaxis, color: '#cbd5e1' },
        font: { color: '#cbd5e1' },
        legend: { font: { color: '#cbd5e1' } },
        shapes: [vLineA, vLineB],
        annotations: [
            { x: a, y: -0.3, text: `a = ${a}`, showarrow: false, font: { color: '#ffc107', size: 12 } },
            { x: b, y: -0.3, text: `b = ${b}`, showarrow: false, font: { color: '#ffc107', size: 12 } }
        ]
    };

    Plotly.newPlot('plot-container', [areaTrace, curveTrace], layout, { responsive: true });

    document.getElementById('integral-value').textContent = integralValue.toFixed(6);
    document.getElementById('area-value').textContent = areaValue.toFixed(6);
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
}

document.addEventListener('DOMContentLoaded', () => {
    initControls();
    updatePlot();
    document.querySelectorAll('.katex-formula').forEach(el => {
        const formula = el.getAttribute('data-formula');
        if (formula) katex.render(formula, el, { throwOnError: false, displayMode: true });
    });
});