/**
 * Módulo 1: Sumas de Riemann
 * Implementación de sumas izquierda, derecha y punto medio
 */

// Definición de funciones disponibles
const functions = {
    x2: {
        fn: x => x * x,
        exact: (a, b) => (b**3 - a**3) / 3,
        label: 'f(x) = x²'
    },
    sqrt: {
        fn: x => Math.sqrt(x),
        exact: (a, b) => (2/3) * (b**(3/2) - a**(3/2)),
        label: 'f(x) = √x'
    },
    sin: {
        fn: x => Math.sin(x),
        exact: (a, b) => -Math.cos(b) + Math.cos(a),
        label: 'f(x) = sin(x)'
    },
    exp: {
        fn: x => Math.exp(x),
        exact: (a, b) => Math.exp(b) - Math.exp(a),
        label: 'f(x) = eˣ'
    }
};

// Estado actual de la visualización
let currentState = {
    function: 'x2',
    a: 0,
    b: 2,
    n: 4,
    type: 'left'
};

/**
 * Calcula la suma de Riemann según el tipo especificado
 */
function calculateRiemannSum(fn, a, b, n, type) {
    const dx = (b - a) / n;
    let sum = 0;
    const rectangles = [];

    for (let i = 0; i < n; i++) {
        const xLeft = a + i * dx;
        const xRight = xLeft + dx;
        let xEval, height;

        switch (type) {
            case 'left':
                xEval = xLeft;
                break;
            case 'right':
                xEval = xRight;
                break;
            case 'mid':
                xEval = (xLeft + xRight) / 2;
                break;
        }

        height = fn(xEval);
        sum += height * dx;

        rectangles.push({
            x: [xLeft, xRight, xRight, xLeft, xLeft],
            y: [0, 0, height, height, 0],
            fill: 'toself',
            fillcolor: type === 'left' ? 'rgba(16, 185, 129, 0.3)' :
                       type === 'right' ? 'rgba(245, 158, 11, 0.3)' :
                       'rgba(139, 92, 246, 0.3)',
            line: { color: type === 'left' ? '#10b981' :
                           type === 'right' ? '#f59e0b' :
                           '#8b5cf6', width: 2 },
            showlegend: i === 0,
            name: type === 'left' ? 'Suma Izquierda' :
                  type === 'right' ? 'Suma Derecha' :
                  'Punto Medio'
        });
    }

    return { sum, rectangles };
}

/**
 * Actualiza la visualización
 */
function updateVisualization() {
    const func = functions[currentState.function];
    const { sum, rectangles } = calculateRiemannSum(
        func.fn,
        currentState.a,
        currentState.b,
        currentState.n,
        currentState.type
    );

    const curveTrace = PlotlyConfig.createCurveTrace(func.fn, currentState.a, currentState.b, func.label);
    
    const traces = [curveTrace, ...rectangles];
    const layout = PlotlyConfig.updateLayout({
        title: `${func.label} - Suma de Riemann (${currentState.type})`,
        xaxis: { title: 'x', range: [currentState.a - 0.5, currentState.b + 0.5] },
        yaxis: { title: 'f(x)' }
    });

    Plotly.newPlot('plot-container', traces, layout, { responsive: true });

    // Actualizar resultados
    const exactValue = func.exact(currentState.a, currentState.b);
    const error = Math.abs(sum - exactValue);
    const errorPercent = (error / Math.abs(exactValue)) * 100;

    document.getElementById('approx-value').textContent = sum.toFixed(6);
    document.getElementById('exact-value').textContent = exactValue.toFixed(6);
    document.getElementById('error-value').textContent = 
        `${error.toFixed(6)} (${errorPercent.toFixed(2)}%)`;
}

/**
 * Inicializa los controles
 */
function initControls() {
    // Selector de función
    document.getElementById('function').addEventListener('change', (e) => {
        currentState.function = e.target.value;
        updateVisualization();
    });

    // Intervalo
    document.getElementById('interval-a').addEventListener('change', (e) => {
        currentState.a = parseFloat(e.target.value);
        updateVisualization();
    });

    document.getElementById('interval-b').addEventListener('change', (e) => {
        currentState.b = parseFloat(e.target.value);
        updateVisualization();
    });

    // Número de subintervalos
    const nSlider = document.getElementById('n-value');
    const nDisplay = document.getElementById('n-display');
    
    nSlider.addEventListener('input', (e) => {
        currentState.n = parseInt(e.target.value);
        nDisplay.textContent = currentState.n;
        updateVisualization();
    });

    // Tipo de suma
    document.getElementById('sum-type').addEventListener('change', (e) => {
        currentState.type = e.target.value;
        updateVisualization();
    });
}

/**
 * Renderiza las fórmulas KaTeX
 */
function renderFormulas() {
    document.querySelectorAll('.katex-formula').forEach(element => {
        const formula = element.getAttribute('data-formula');
        if (formula) {
            katex.render(formula, element, {
                throwOnError: false,
                displayMode: true
            });
        }
    });
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initControls();
    updateVisualization();
    renderFormulas();
});