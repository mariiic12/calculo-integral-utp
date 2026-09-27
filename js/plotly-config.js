/**
 * Configuración global de Plotly para visualizaciones matemáticas
 */
const PlotlyConfig = {
    // Layout base para todas las gráficas
    baseLayout: {
        autosize: true,
        margin: { l: 60, r: 40, t: 40, b: 60 },
        paper_bgcolor: '#ffffff',
        plot_bgcolor: '#f9fafb',
        font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            size: 12,
            color: '#1f2937'
        },
        xaxis: {
            gridcolor: '#e5e7eb',
            zerolinecolor: '#9ca3af',
            zerolinewidth: 2,
            title: {
                font: { size: 14, color: '#374151' }
            }
        },
        yaxis: {
            gridcolor: '#e5e7eb',
            zerolinecolor: '#9ca3af',
            zerolinewidth: 2,
            title: {
                font: { size: 14, color: '#374151' }
            }
        },
        showlegend: true,
        legend: {
            x: 1,
            xanchor: 'right',
            y: 1,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            bordercolor: '#e5e7eb',
            borderwidth: 1
        }
    },

    // Colores para diferentes elementos
    colors: {
        curve: '#2563eb',
        leftSum: '#10b981',
        rightSum: '#f59e0b',
        midSum: '#8b5cf6',
        trapezoid: '#3b82f6',
        simpson: '#ec4899'
    },

    /**
     * Genera puntos para graficar una función
     * @param {Function} fn - Función a graficar
     * @param {number} a - Límite inferior
     * @param {number} b - Límite superior
     * @param {number} numPoints - Número de puntos
     * @returns {Object} Objeto con arrays x e y
     */
    generatePoints: function(fn, a, b, numPoints = 200) {
        const x = [];
        const y = [];
        const step = (b - a) / numPoints;
        
        for (let i = 0; i <= numPoints; i++) {
            const xi = a + i * step;
            x.push(xi);
            y.push(fn(xi));
        }
        
        return { x, y };
    },

    /**
     * Crea un trace para la curva de la función
     */
    createCurveTrace: function(fn, a, b, label = 'f(x)') {
        const points = this.generatePoints(fn, a, b);
        
        return {
            x: points.x,
            y: points.y,
            type: 'scatter',
            mode: 'lines',
            name: label,
            line: {
                color: this.colors.curve,
                width: 3
            }
        };
    },

    /**
     * Actualiza el layout con configuraciones específicas
     */
    updateLayout: function(customLayout = {}) {
        return { ...this.baseLayout, ...customLayout };
    }
};