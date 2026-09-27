/**
 * Módulo 6: Integración Directa
 */

const functions = {
    poly1: {
        fn: x => x * x + 2 * x + 1,     // (x+1)²
        F: x => (x ** 3) / 3 + x * x + x,
        label: 'f(x) = x² + 2x + 1',
        Flabel: 'F(x) = x³/3 + x² + x + C',
        Fkatex: 'F(x) = \\frac{x^3}{3} + x^2 + x + C'
    },
    poly2: {
        fn: x => (x > 0) ? Math.pow(x, 1.5) - 9 / Math.sqrt(x) : NaN,
        F: x => (x > 0) ? 0.4 * Math.pow(x, 2.5) - 18 * Math.sqrt(x) : NaN,
        label: 'f(x) = x^(3/2) − 9/√x',
        Flabel: 'F(x) = (2/5)x^(5/2) − 18√x + C',
        Fkatex: 'F(x) = \\frac{2}{5}x^{5/2} - 18\\sqrt{x} + C'
    },
    poly3: {
        fn: x => (x !== 0) ? x + 4 * Math.sqrt(Math.abs(x)) * Math.sign(x) - 4 / x : NaN,
        F: x => (x > 0) ? (x ** 2) / 2 + (8 / 3) * Math.pow(x, 1.5) - 4 * Math.log(x) : NaN,
        label: 'f(x) = x + 4√x − 4/x',
        Flabel: 'F(x) = x²/2 + (8/3)x^(3/2) − 4ln|x| + C',
        Fkatex: 'F(x) = \\frac{x^2}{2} + \\frac{8}{3}x^{3/2} - 4\\ln|x| + C'
    },
    poly4: {
        fn: x => (x !== 0) ? x - 1 - 1 / x : NaN,
        F: x => (x > 0) ? (x ** 2) / 2 - x - Math.log(x) : NaN,
        label: 'f(x) = x − 1 − 1/x',
        Flabel: 'F(x) = x²/2 − x − ln|x| + C',
        Fkatex: 'F(x) = \\frac{x^2}{2} - x - \\ln|x| + C'
    }
};

let state = { function: 'poly1', range: 3 };

function updatePlot() {
    const f = functions[state.function];
    const r = state.range;

    // Curva f(x)
    const xF = [], yF = [];
    const steps = 400;
    for (let i = 0; i <= steps; i++) {
        const x = -r + (2 * r * i) / steps;
        const y = f.fn(x);
        if (isFinite(y)) {
            xF.push(x);
            yF.push(y);
        }
    }

    const traceF = {
        x: xF, y: yF, type: 'scatter', mode: 'lines',
        name: f.label, line: { color: '#0d6efd', width: 3 }
    };

    // Curva F(x)
    const xG = [], yG = [];
    for (let i = 0; i <= steps; i++) {
        const x = 0.01 + (r * i) / steps; // Evitar x=0 para log
        const y = f.F(x);
        if (isFinite(y)) {
            xG.push(x);
            yG.push(y);
        }
    }

    const traceG = {
        x: xG, y: yG, type: 'scatter', mode: 'lines',
        name: f.Flabel, line: { color: '#d63384', width: 3, dash: 'dash' }
    };

    const layout = {
        ...PlotlyConfig.baseLayout,
        title: { text: 'f(x) vs su Antiderivada F(x)', font: { color: '#ffffff' } },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        xaxis: { ...PlotlyConfig.baseLayout.xaxis, range: [-r, r], color: '#cbd5e1' },
        yaxis: { ...PlotlyConfig.baseLayout.yaxis, color: '#cbd5e1' },
        font: { color: '#cbd5e1' },
        legend: { font: { color: '#cbd5e1' } }
    };

    Plotly.newPlot('plot-container', [traceF, traceG], layout, { responsive: true });

    // Mostrar antiderivada en KaTeX
    const display = document.getElementById('antiderivative-display');
    if (f.Fkatex) {
        katex.render(f.Fkatex, display, { throwOnError: false, displayMode: true });
    }
}

function initControls() {
    document.getElementById('function').addEventListener('change', e => {
        state.function = e.target.value;
        updatePlot();
    });
    const slider = document.getElementById('range-value');
    slider.addEventListener('input', e => {
        state.range = parseFloat(e.target.value);
        document.getElementById('range-display').textContent = `[−${state.range}, ${state.range}]`;
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