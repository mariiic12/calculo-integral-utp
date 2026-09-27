/**
 * JavaScript principal - Plataforma Cálculo Integral UTP
 * Modo oscuro permanente
 */

// --- Renderizado de fórmulas KaTeX ---
function renderAllFormulas() {
    if (typeof katex === 'undefined') return;
    
    document.querySelectorAll('.katex-formula').forEach(element => {
        const formula = element.getAttribute('data-formula');
        if (formula && !element.hasAttribute('data-rendered')) {
            try {
                katex.render(formula, element, {
                    throwOnError: false,
                    displayMode: true
                });
                element.setAttribute('data-rendered', 'true');
            } catch (e) {
                console.error('Error rendering formula:', e);
            }
        }
    });
}

// --- Smooth scroll para anchors ---
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    renderAllFormulas();
    initSmoothScroll();
});