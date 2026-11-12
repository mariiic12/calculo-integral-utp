/**
 * Módulo 11: Trigonométricas Inversas
 * Lógica del visualizador interactivo para f(x) = 1 / (1 + x^2)
 */

document.addEventListener("DOMContentLoaded", function() {
    initInverseTrigPlot();
});

function initInverseTrigPlot() {
    const sliderA = document.getElementById('slider-a');
    const sliderB = document.getElementById('slider-b');
    const valA = document.getElementById('val-a');
    const valB = document.getElementById('val-b');
    const resultDiv = document.getElementById('integral-result');

    if (!sliderA || !sliderB) return;

    function updatePlot() {
        let a = parseFloat(sliderA.value);
        let b = parseFloat(sliderB.value);
        
        if (a >= b) { 
            b = a + 0.1; 
            sliderB.value = b; 
        }
        
        valA.textContent = a.toFixed(1);
        valB.textContent = b.toFixed(1);

        // Función original f(x) = 1 / (1 + x^2)
        const xValues = [];
        const yValues = [];
        const xStart = Math.min(a, -5); 
        const xEnd = Math.max(b, 5);
        
        for (let x = xStart; x <= xEnd; x += 0.05) {
            xValues.push(x);
            yValues.push(1 / (1 + Math.pow(x, 2)));
        }

        // Área sombreada entre a y b
        const xFill = [];
        const yFill = [];
        for (let x = a; x <= b; x += 0.05) {
            xFill.push(x);
            yFill.push(1 / (1 + Math.pow(x, 2)));
        }

        // Calcular integral exacta: F(x) = arctan(x)
        const F = (x) => Math.atan(x);
        const integralVal = F(b) - F(a);
        resultDiv.textContent = integralVal.toFixed(4);

        const trace1 = {
            x: xValues, y: yValues, mode: 'lines', name: 'f(x) = 1/(1+x²)',
            line: {color: '#0dcaf0', width: 3}
        };
        
        const trace2 = {
            x: xFill, y: yFill, mode: 'lines', fill: 'tozeroy', name: 'Área',
            fillcolor: 'rgba(13, 202, 240, 0.3)', line: {color: 'transparent'}
        };

        const layout = {
            paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
            font: {color: '#adb5bd'}, margin: {t: 20, r: 20, b: 40, l: 50},
            xaxis: {title: 'x', gridcolor: 'rgba(255,255,255,0.1)', zerolinecolor: 'rgba(255,255,255,0.2)', range: [-5.5, 5.5]},
            yaxis: {title: 'f(x)', gridcolor: 'rgba(255,255,255,0.1)', zerolinecolor: 'rgba(255,255,255,0.2)', range: [-0.1, 1.2]},
            showlegend: false
        };

        Plotly.newPlot('plot-area', [trace2, trace1], layout, {responsive: true, displayModeBar: false});
    }

    sliderA.addEventListener('input', updatePlot);
    sliderB.addEventListener('input', updatePlot);
    
    updatePlot();
}