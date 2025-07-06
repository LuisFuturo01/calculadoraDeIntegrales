document.addEventListener('DOMContentLoaded', () => {
    const inputFuncion = document.getElementById('inputFuncion');
    const inputVariable = document.getElementById('inputVariable');
    const inputLimiteInferior = document.getElementById('inputLimiteInferior');
    const inputLimiteSuperior = document.getElementById('inputLimiteSuperior');
    const inputDecimales = document.getElementById('inputDecimales');
    const botonCalcular = document.getElementById('botonCalcular');

    const funcionOriginalLatex = document.getElementById('funcionOriginalLatex');
    const integralIndefinidaLatex = document.getElementById('integralIndefinidaLatex');
    const integralDefinidaLatex = document.getElementById('integralDefinidaLatex');
    const valorIntegralDefinida = document.getElementById('valorIntegralDefinida');
    const elementoGgb = document.getElementById('elementoGgb');
    const notaGeogebra = document.querySelector('.nota-geogebra small');
    const previsualizacionFuncion = document.getElementById('previsualizacionFuncion');

    const limpiarResultados = () => {
        funcionOriginalLatex.innerHTML = '';
        integralIndefinidaLatex.innerHTML = '';
        integralDefinidaLatex.innerHTML = '';
        valorIntegralDefinida.innerHTML = '';
        elementoGgb.innerHTML = '';
        notaGeogebra.textContent = 'GeoGebra usa "x". La gráfica de la integral definida solo es posible con límites numéricos.';
    };

    // Función para previsualizar la entrada de la función en LaTeX
    const actualizarPrevisualizacion = async () => {
        const textoFuncion = inputFuncion.value;
        if (textoFuncion.trim() !== '') {
            try {
                // Envía la función al NUEVO endpoint de previsualización en Flask
                const respuesta = await fetch('/previsualizar_funcion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ funcion: textoFuncion })
                });

                const datos = await respuesta.json();

                if (respuesta.ok) {
                    previsualizacionFuncion.innerHTML = `\\(${datos.latex}\\)`;
                } else {
                    // Si el backend devuelve un error de sintaxis, lo mostramos
                    previsualizacionFuncion.innerHTML = `<span style="color: var(--color-resaltado-secundario); font-size: 0.9em;">${datos.error || 'Error de sintaxis.'}</span>`;
                }
            } catch (error) {
                // Error de red u otro error inesperado
                previsualizacionFuncion.innerHTML = `<span style="color: var(--color-resaltado-secundario); font-size: 0.9em;">Error de conexión.</span>`;
                console.error("Error al previsualizar:", error);
            }
        } else {
            previsualizacionFuncion.innerHTML = ''; // Limpiar si el input está vacío
        }
        // Asegurarse de que MathJax renderice el nuevo contenido
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([previsualizacionFuncion]);
        }
    };

    inputFuncion.addEventListener('keyup', actualizarPrevisualizacion);
    inputFuncion.addEventListener('change', actualizarPrevisualizacion); // Para pegar texto
    actualizarPrevisualizacion(); // Llama al cargar la página para el valor inicial

    botonCalcular.addEventListener('click', async () => {
        limpiarResultados();

        const strFuncion = inputFuncion.value;
        const strVariable = inputVariable.value;
        const strLimiteInferior = inputLimiteInferior.value;
        const strLimiteSuperior = inputLimiteSuperior.value;
        const numDecimales = parseInt(inputDecimales.value);

        if (isNaN(numDecimales) || numDecimales < 0 || numDecimales > 15) {
            alert('Por favor, ingresa un número de decimales válido (entre 0 y 15).');
            return;
        }

        try {
            const respuesta = await fetch('/calcular_integral', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    funcion: strFuncion,
                    variable: strVariable,
                    limite_inferior: strLimiteInferior,
                    limite_superior: strLimiteSuperior,
                    decimales: numDecimales
                })
            });

            if (!respuesta.ok) {
                const datosError = await respuesta.json();
                throw new Error(datosError.error || 'Ocurrió un error desconocido.');
            }

            const datos = await respuesta.json();

            funcionOriginalLatex.innerHTML = `\\(f(${datos.latex_variable}) = ${datos.latex_funcion_original}\\)`;
            integralIndefinidaLatex.innerHTML = `\\(\\int ${datos.latex_funcion_original}\\, d${datos.latex_variable} = ${datos.latex_integral_indefinida} + C\\)`;

            if (datos.latex_integral_definida) {
                integralDefinidaLatex.innerHTML = `\\(\\int_{${datos.latex_limite_inferior}}^{${datos.latex_limite_superior}} ${datos.latex_funcion_original}\\, d${datos.latex_variable} = ${datos.latex_integral_definida}\\)`;
                if (datos.valor_numerico_definida) {
                    valorIntegralDefinida.innerHTML = `Valor numérico: <strong>${datos.valor_numerico_definida}</strong>`;
                } else {
                    valorIntegralDefinida.innerHTML = `<em>El valor numérico no pudo ser determinado (podría ser infinito, no real o no evaluable).</em>`;
                }
            } else {
                integralDefinidaLatex.innerHTML = `<em>Límites no válidos o no especificados para la integral definida.</em>`;
                valorIntegralDefinida.innerHTML = '';
            }

            // Lógica para GeoGebra
            const esLimiteNumericoInferior = !isNaN(parseFloat(strLimiteInferior)) && !strLimiteInferior.toLowerCase().includes('inf');
            const esLimiteNumericoSuperior = !isNaN(parseFloat(strLimiteSuperior)) && !strLimiteSuperior.toLowerCase().includes('inf');
            const puedeGraficarArea = esLimiteNumericoInferior && esLimiteNumericoSuperior;
            
            if (datos.hay_infinito_limites) {
                notaGeogebra.textContent = 'GeoGebra no puede graficar el área bajo la curva con límites infinitos. Solo se mostrará la función.';
            } else if (!puedeGraficarArea) {
                notaGeogebra.textContent = 'Ingrese límites numéricos para ver la gráfica del área bajo la curva.';
            } else {
                notaGeogebra.textContent = 'GeoGebra usa "x". La gráfica de la integral definida solo es posible con límites numéricos.';
            }

            const ggbApp = new GGBApplet({
                "appName": "graphing",
                "showToolBar": false,
                "showAlgebraInput": false,
                "showMenuBar": false,
                "width": 800,
                "height": 400,
                "appletOnLoad": function(api) {
                    api.evalCommand(`f(x) = ${strFuncion}`);
                    if (puedeGraficarArea) {
                        const numLimiteInferior = parseFloat(strLimiteInferior);
                        const numLimiteSuperior = parseFloat(strLimiteSuperior);
                        api.evalCommand(`a = ${numLimiteInferior}`);
                        api.evalCommand(`b = ${numLimiteSuperior}`);
                        api.evalCommand("Integral(f, a, b)");
                    }
                    api.evalCommand("ZoomIn()");
                }
            }, true);
            elementoGgb.innerHTML = '';
            ggbApp.inject('elementoGgb');

            // Asegurarse de que MathJax renderice todos los resultados
            if (typeof MathJax !== 'undefined') {
                MathJax.typesetPromise();
            }

        } catch (error) {
            console.error('Error al calcular:', error);
            alert(`Error: ${error.message}`);
            limpiarResultados();
        }
    });
});