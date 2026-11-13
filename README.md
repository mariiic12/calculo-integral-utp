# 🧮 Cálculo Integral — Plataforma Interactiva | UTP

**Matemáticas II · Tecnología en Desarrollo de Software · Periodo 2026-II**

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Activa-2ea44f?style=flat-square)](https://mariiic12.github.io/calculo-integral-utp/)
[![Módulos](https://img.shields.io/badge/Módulos-20%20completos-0dcaf0?style=flat-square)](https://mariiic12.github.io/calculo-integral-utp/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap%205-Zephyr-7952b3?style=flat-square)](https://bootswatch.com/zephyr/)
[![Plotly](https://img.shields.io/badge/Visualizaciones-Plotly.js-3f4f75?style=flat-square)](https://plotly.com/javascript/)

Plataforma web colaborativa de visualización matemática para el curso de Cálculo Integral de la Universidad Tecnológica de Pereira. Proyecto semestral compartido en la red académica como insumo de estudio para estudiantes de la Tecnología en Desarrollo de Software.

## 🌐 Demo en vivo

👉 **[https://mariiic12.github.io/calculo-integral-utp/](https://mariiic12.github.io/calculo-integral-utp/)**

## 📖 Sobre el proyecto

La plataforma articula los contenidos del curso (métodos numéricos, técnicas de integración y aplicaciones de volumen) en **20 módulos interactivos**, cada uno con:

- ✍️ **Fundamento teórico** con fórmulas renderizadas en KaTeX.
- 🎛️ **Visualizador interactivo** (Plotly.js 2D y 3D) con panel de controles: deslizadores, interruptores, animaciones, rotación de cámara y exportación de gráficas a PNG.
- 🧪 **Verificación numérica en vivo**: los chips comparan el valor exacto de la integral con aproximaciones (Riemann, Simpson, suma de rebanadas) para que el estudiante *vea* la convergencia.
- 📚 **Ejemplos didácticos resueltos paso a paso**.

## 🗂️ Estructura del proyecto

    calculo-integral-utp/
    ├── index.html                  # Página de inicio: navegación a los 20 módulos
    ├── README.md
    ├── .gitignore
    ├── css/
    │   ├── styles.css              # Tema oscuro global, tarjetas y componentes
    │   └── modules.css             # Estilos compartidos de los módulos
    ├── js/
    │   ├── main.js                 # Utilidades globales
    │   ├── plotly-config.js        # Configuración base de gráficas
    │   └── modules/
    │       ├── modulo7.js          # Lógica y visualizador de cada módulo
    │       ├── ...                 # (un archivo por módulo: modulo8.js … modulo20.js)
    │       └── modulo20.js
    └── modulos/
        ├── modulo1.html            # Sección A: métodos numéricos
        ├── ...                     # (una página por módulo)
        └── modulo20.html           # Sección C: aplicaciones de volumen

## 📚 Mapa de módulos

| # | Módulo | Sección | Contenido clave |
|---|--------|---------|-----------------|
| 1 | Sumas de Riemann | A · Numéricos | Sumas izquierda, derecha y punto medio |
| 2 | Regla del Trapecio | A · Numéricos | Aproximación por trapecios |
| 3 | Regla del Punto Medio | A · Numéricos | Rectángulos de punto medio |
| 4 | Regla de Simpson | A · Numéricos | Aproximación parabólica (n par) |
| 5 | Integral Definida y Área | A · Numéricos | TFC, área bajo y entre curvas |
| 6 | Integración Directa | A · Numéricos | Fórmulas básicas, f(x) y F(x) |
| 7 | Sustitución y Potencias | B · Técnicas | Cambio de variable u |
| 8 | Exponenciales | B · Técnicas | eˣ, aˣ |
| 9 | Logarítmicas | B · Técnicas | ln\|u\|, productos sen·cos |
| 10 | Trigonométricas | B · Técnicas | sen, cos, tan, identidades |
| 11 | Trigonométricas Inversas | B · Técnicas | arcsin, arctan, arcsec |
| 12 | Hiperbólicas Inversas | B · Técnicas | arcsinh, arccosh, arctanh |
| 13 | Trinomio ax²+bx+c | B · Técnicas | Completar cuadrado, detector de caso |
| 14 | Integración por Partes | B · Técnicas | ∫u·dv, LIATE, método tabular |
| 15 | Fracciones Parciales | B · Técnicas | Descomposición racional, método de tapar |
| 16 | Sustitución Trigonométrica | B · Técnicas | Triángulo de referencia interactivo |
| 17 | Sustitución Universal | B · Técnicas | t = tan(x/2), dos espacios comparados |
| 18 | Integrales Irracionales | B · Técnicas | Racionalización, mcm de índices |
| 19 | Sección Transversal Conocida | C · Aplicaciones | Sólido 3D por rebanadas |
| 20 | Sólidos de Revolución | C · Aplicaciones | Discos, arandelas y capas en 3D |

## 🛠️ Tecnologías

| Capa | Herramienta |
|------|-------------|
| Estructura y estilos | HTML5, CSS3, Bootstrap 5 (tema Bootswatch Zephyr), Bootstrap Icons |
| Animaciones | AOS (Animate On Scroll) |
| Fórmulas matemáticas | KaTeX (renderizado manual por clase `.tex`) |
| Visualizaciones | Plotly.js (gráficas 2D, subplots y superficies 3D paramétricas) |
| Lógica | JavaScript ES6+ (un archivo por módulo en `js/modules/`) |
| Versionado y despliegue | GitHub + GitHub Pages |

## 🚀 Ejecutar localmente

No requiere compilación ni dependencias instalables:

1. Clona el repositorio:
   `git clone https://github.com/mariiic12/calculo-integral-utp.git`
2. Abre `index.html` en tu navegador, o usa la extensión **Live Server** de VS Code.
3. Las librerías (Bootstrap, KaTeX, Plotly, AOS) se cargan por CDN: se necesita conexión a internet.

## 🧭 Cómo contribuir

1. Haz un *fork* o crea una rama: `git checkout -b modulo-nuevo`.
2. Sigue las convenciones del proyecto:
   - **Fórmulas:** usa los elementos `<span class="tex">…</span>` (en línea) o `<div class="tex tex-block">…</div>` (bloque). **Nunca** mezcles la clase con delimitadores `$$…$$`, y escribe `<` y `>` como `\lt` y `\gt` para que el navegador no los interprete como etiquetas HTML.
   - **JavaScript:** la lógica de cada módulo vive en `js/modules/moduloN.js`; el HTML solo maquetación.
   - **Contenido:** ejemplos didácticos propios paso a paso (los ejercicios del taller manual se resuelven a mano y no se publican resueltos).
   - **Iconos:** verifica en [icons.getbootstrap.com](https://icons.getbootstrap.com) que el ícono exista antes de usarlo.
3. Prueba en local con Live Server.
4. Haz commit descriptivo y abre un Pull Request.

## 🤖 Uso de inteligencia artificial

- Se utilizó **Qwen Coder (Qwen Studio)** como asistente de programación para: arquitectura de módulos, generación y depuración de visualizadores Plotly.js, y resolución de conflictos de renderizado de KaTeX.

## 👩‍ Autoría

Desarrollado por **Marie Castañeda Crespo** como parte del curso de Matemáticas II, Grupo 403, Universidad Tecnológica de Pereira.

---

© 2026 Universidad Tecnológica de Pereira
