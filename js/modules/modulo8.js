/**
 * Módulo 8: Exponenciales
 * Lógica del visualizador interactivo para f(x) = e^(2x)
 */

document.addEventListener("DOMContentLoaded", function() {
    initExponentialPlot();
});

function initExponentialPlot() {
    const sliderA = document.getElementById('slider-a');
    const sliderB = document.getElementById('slider-b');
    const valA = document.getElementById('val-a');
    const valB = document.getElementById('val-b');
    const resultDiv = document.getElementById('integral-result');

    // Si no existen los elementos (por si el usuario navega a otra página), salir.
    if (!sliderA || !sliderB) return;

    function updatePlot() {
        let a = parseFloat(sliderA.value);
        let b = parseFloat(sliderB.value);
        
        // Evitar que el límite inferior sea mayor o igual al superior
        if (a >= b) { 
            b = a + 0.1; 
            sliderB.value = b; 
        }
        
        valA.textContent = a.toFixed(1);
        valB.textContent = b.toFixed(1);

        // Función original f(x) = e^(2x)
        const xValues = [];
        const yValues = [];
        const xStart = Math.min(a, -2); 
        const xEnd = Math.max(b, 2);
        
        for (let x = xStart; x <= xEnd; x += 0.05) {
            xValues.push(x);
            yValues.push(Math.exp(2 * x));
        }

        // Área sombreada entre a y b
        const xFill = [];
        const yFill = [];
        for (let x = a; x <= b; x += 0.05) {
            xFill.push(x);
            yFill.push(Math.exp(2 * x));
        }

        // Calcular integral exacta: F(x) = (1/2) * e^(2x)
        const F = (x) => 0.5 * Math.exp(2 * x);
        const integralVal = F(b) - F(a);
        resultDiv.textContent = integralVal.toFixed(4);

        // Trazado de la función
        const trace1 = {
            x: xValues, y: yValues, mode: 'lines', name: 'f(x) = e^(2x)',
            line: {color: '#0dcaf0', width: 3}
        };
        
        // Trazado del área
        const trace2 = {
            x: xFill, y: yFill, mode: 'lines', fill: 'tozeroy', name: 'Área',
            fillcolor: 'rgba(13, 202, 240, 0.3)', line: {color: 'transparent'}
        };

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
            font: {color: '#adb5bd'}, margin: {t: 20, r: 20, b: 40, l: 50},
            xaxis: {title: 'x', gridcolor: 'rgba(255,255,255,0.1)', zerolinecolor: 'rgba(255,255,255,0.2)'},
            yaxis: {title: 'f(x)', gridcolor: 'rgba(255,255,255,0.1)', zerolinecolor: 'rgba(255,255,255,0.2)'},
            showlegend: false
        };

        Plotly.newPlot('plot-area', [trace2, trace1], layout, {responsive: true, displayModeBar: false});
    }

    sliderA.addEventListener('input', updatePlot);
    sliderB.addEventListener('input', updatePlot);
    
    // Renderizado inicial
    updatePlot();
}