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

    const deslA = document.getElementById('deslizadorA');
    const deslB = document.getElementById('deslizadorB');
    const valorDeslizadorA = deslA ? document.createElement('span') : null;
    const valorDeslizadorB = deslB ? document.createElement('span') : null;

    if (deslA && deslA.parentNode && valorDeslizadorA) {
        deslA.parentNode.insertBefore(valorDeslizadorA, deslA.nextSibling);
        valorDeslizadorA.style.marginLeft = '10px';
        valorDeslizadorA.style.fontWeight = 'bold';
    }
    if (deslB && deslB.parentNode && valorDeslizadorB) {
        deslB.parentNode.insertBefore(valorDeslizadorB, deslB.nextSibling);
        valorDeslizadorB.style.marginLeft = '10px';
        valorDeslizadorB.style.fontWeight = 'bold';
    }

    let ggbApplet = null;
    let currentFunctionString = '';

    const limpiarResultados = () => {
        funcionOriginalLatex.innerHTML = '';
        integralIndefinidaLatex.innerHTML = '';
        integralDefinidaLatex.innerHTML = '';
        valorIntegralDefinida.innerHTML = '';
        if (valorDeslizadorA) valorDeslizadorA.textContent = '';
        if (valorDeslizadorB) valorDeslizadorB.textContent = '';
    };

    const actualizarPrevisualizacion = async () => {
        const textoFuncion = inputFuncion.value;
        if (textoFuncion.trim() !== '') {
            try {
                const respuesta = await fetch('/previsualizar_funcion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ funcion: textoFuncion })
                });

                const datos = await respuesta.json();

                if (respuesta.ok) {
                    previsualizacionFuncion.innerHTML = `\\(${datos.latex}\\)`;
                } else {
                    previsualizacionFuncion.innerHTML = `<span class="errorPrev">${datos.error || 'Error de sintaxis.'}</span>`;
                }
            } catch (error) {
                previsualizacionFuncion.innerHTML = `<span class"errorPrev">Error de conexión.</span>`;
                console.error("Error al previsualizar:", error);
            }
        } else {
            previsualizacionFuncion.innerHTML = '';
        }
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([previsualizacionFuncion]);
        }
    };

    const updateGeoGebraGraph = () => {
        if (!ggbApplet) {
            console.error("GeoGebra applet not initialized. Cannot update graph.");
            return;
        }

        const strFuncion = inputFuncion.value;
        const strVariable = inputVariable.value;
        const strLimiteInferior = inputLimiteInferior.value;
        const strLimiteSuperior = inputLimiteSuperior.value;

        if (strFuncion !== currentFunctionString) {
            currentFunctionString = strFuncion;
        }

        ggbApplet.evalCommand(`f(${strVariable}) = ${strFuncion.replace(/\*\*/g, '^')}`);

        const esLimiteNumericoInferior = !isNaN(parseFloat(strLimiteInferior)) && !strLimiteInferior.toLowerCase().includes('inf');
        const esLimiteNumericoSuperior = !isNaN(parseFloat(strLimiteSuperior)) && !strLimiteSuperior.toLowerCase().includes('inf');
        const puedeGraficarArea = esLimiteNumericoInferior && esLimiteNumericoSuperior;

        if (puedeGraficarArea) {
            const aIni = parseFloat(strLimiteInferior);
            const bIni = parseFloat(strLimiteSuperior);
            
            ggbApplet.evalCommand(`a = ${aIni}`);
            ggbApplet.evalCommand(`b = ${bIni}`);
            ggbApplet.evalCommand(`c = Integral(f, a, b)`);
            ggbApplet.setVisible('a', false);
            ggbApplet.setVisible('b', false);
            ggbApplet.setVisible('c', true);

            if (deslA && deslB) {
                const minRange = Math.min(aIni, bIni) - 5;
                const maxRange = Math.max(aIni, bIni) + 5;
                const step = 0.01;

                Object.assign(deslA, { min: minRange, max: maxRange, step: step, value: aIni });
                Object.assign(deslB, { min: minRange, max: maxRange, step: step, value: bIni });
                
                if (valorDeslizadorA) valorDeslizadorA.textContent = aIni.toFixed(2);
                if (valorDeslizadorB) valorDeslizadorB.textContent = bIni.toFixed(2);

                deslA.oninput = () => {
                    let a = parseFloat(deslA.value);
                    let b = parseFloat(deslB.value);
                    if (a > b) {
                        deslB.value = a;
                        b = a;
                    }
                    if (ggbApplet) {
                        ggbApplet.evalCommand(`a = ${a}`);
                        ggbApplet.evalCommand(`b = ${b}`);
                        ggbApplet.evalCommand(`c = Integral(f, a, b)`);
                        
                    }
                    if (valorDeslizadorA) valorDeslizadorA.textContent = a.toFixed(2);
                    if (valorDeslizadorB) valorDeslizadorB.textContent = b.toFixed(2);
                    deslB.min = a;
                };

                deslB.oninput = () => {
                    let b = parseFloat(deslB.value);
                    let a = parseFloat(deslA.value);
                    if (b < a) {
                        deslA.value = b;
                        a = b;
                    }
                    if (ggbApplet) {
                        ggbApplet.evalCommand(`a = ${a}`);
                        ggbApplet.evalCommand(`b = ${b}`);
                        ggbApplet.evalCommand(`c = Integral(f, a, b)`);
                    }
                    if (valorDeslizadorA) valorDeslizadorA.textContent = a.toFixed(2);
                    if (valorDeslizadorB) valorDeslizadorB.textContent = b.toFixed(2);
                    deslA.max = b;
                };
            }

        } else {
            if (ggbApplet.getObjectType('c') === 'numeric') {
                ggbApplet.evalCommand('Delete(c)');
            }
            if (ggbApplet.getObjectType('a') === 'numeric') { ggbApplet.evalCommand('Delete(a)'); }
            if (ggbApplet.getObjectType('b') === 'numeric') { ggbApplet.evalCommand('Delete(b)'); }
            if (deslA) deslA.oninput = null;
            if (deslB) deslB.oninput = null;
            if (valorDeslizadorA) valorDeslizadorA.textContent = '';
            if (valorDeslizadorB) valorDeslizadorB.textContent = '';
        }
        ggbApplet.evalCommand("ZoomIn()");
    };

    inputFuncion.addEventListener('input', () => {
        actualizarPrevisualizacion();
    });
    inputVariable.addEventListener('input', () => {
        if (ggbApplet) {
            updateGeoGebraGraph();
        }
    });

    botonCalcular.addEventListener('click', async () => {
        const contenedor = document.getElementById('previsualizacionFuncion');
        const span = contenedor?.querySelector('span');
        const section1 = document.getElementById('seccionResultados');
        const section2 = document.getElementById('seccionGeoGebra');

        if (span && span.classList.contains('errorPrev')) {
            section1.style.display = 'none';
            section2.style.display = 'none';
        }else{

            limpiarResultados();
            
            section1.style.display = 'block';
            section2.style.display = 'block';
            const strFuncion = inputFuncion.value;
            const strVariable = inputVariable.value;
            const strLimiteInferior = inputLimiteInferior.value;
            const strLimiteSuperior = inputLimiteSuperior.value;
            const numDecimales = parseInt(inputDecimales.value);

            if (isNaN(numDecimales) || numDecimales < 0 || numDecimales > 15) {
                alert('Por favor, ingresa un número de decimales válido (entre 0 y 15).');
                return;
            }

            if (!strFuncion) {
                alert('Por favor, ingresa una función.');
                return;
            }
            if (!strVariable) {
                alert('Por favor, ingresa la variable de integración.');
                return;
            }

            try {
                const respuesta = await fetch('/calcular_integral', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                        if(datos.valor_numerico_definida === "No numérico / Complejo"){
                            document.getElementById('seccionGeoGebra').style.display = 'none';
                        }else{
                            document.getElementById('seccionGeoGebra').style.display = 'block';
                        }
                    } else {
                        valorIntegralDefinida.innerHTML = `<em>El valor numérico no pudo ser determinado (podría ser infinito, no real o no evaluable).</em>`;
                    }
                } else {
                    integralDefinidaLatex.innerHTML = `<em>Límites no válidos o no especificados para la integral definida.</em>`;
                    valorIntegralDefinida.innerHTML = '';
                }

                if (typeof MathJax !== 'undefined') {
                    MathJax.typesetPromise();
                }

                if (!ggbApplet) {
                    const params = {
                        "appName": "graphing",
                        "showToolBar": false,
                        "showAlgebraInput": false,
                        "showMenuBar": false,
                        "width": 800,
                        "height": 400,
                        "showFullscreenButton": true,
                        "enableRightClick": true,
                        "enableLabelDrags": true,
                        "enableShiftDragZoom": true,
                        "showZoomButtons": true,
                        "showFullscreenButton": true,
                        "appletOnLoad": (api) => {
                            ggbApplet = api;
                            updateGeoGebraGraph();
                        }
                    };
                    elementoGgb.innerHTML = '';
                    new GGBApplet(params, true).inject('elementoGgb');
                } else {
                    updateGeoGebraGraph();
                }
                
            } catch (error) {
                console.error('Error al calcular:', error);
                alert(`Error: ${error.message}`);
                limpiarResultados();
            }
        }
    });

    actualizarPrevisualizacion();
});