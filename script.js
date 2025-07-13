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
    // El selector para notaGeogebra puede no existir en tu HTML, revisar.
    const notaGeogebra = document.querySelector('.nota-geogebra small'); 
    const previsualizacionFuncion = document.getElementById('previsualizacionFuncion');

    // Referencias a los deslizadores de límites y sus displays de valor
    const deslA = document.getElementById('deslizadorA');
    const deslB = document.getElementById('deslizadorB');
    // Asumiendo que existen elementos para mostrar los valores en tu HTML
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

    let ggbApplet = null; // Variable global para la instancia de GeoGebra
    let currentFunctionString = ''; // Almacena la última función enviada a GeoGebra

    const limpiarResultados = () => {
        funcionOriginalLatex.innerHTML = '';
        integralIndefinidaLatex.innerHTML = '';
        integralDefinidaLatex.innerHTML = '';
        valorIntegralDefinida.innerHTML = '';
        // No limpiar elementoGgb.innerHTML aquí, GeoGebra se mantiene
        if (valorDeslizadorA) valorDeslizadorA.textContent = '';
        if (valorDeslizadorB) valorDeslizadorB.textContent = '';
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
            previsualizacionFuncion.innerHTML = '';
        }
        // Vuelve a renderizar MathJax después de actualizar el contenido
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([previsualizacionFuncion]);
        }
    };

    // --- FUNCIÓN CENTRAL PARA ACTUALIZAR GEOGEBRA ---
    // Esta función ahora se encarga de definir la función y limpiar/mostrar la integral
    // y de configurar los deslizadores si corresponde.
    const updateGeoGebraGraph = () => {
        if (!ggbApplet) {
            console.error("GeoGebra applet not initialized. Cannot update graph.");
            return;
        }

        const strFuncion = inputFuncion.value;
        const strVariable = inputVariable.value; 
        const strLimiteInferior = inputLimiteInferior.value;
        const strLimiteSuperior = inputLimiteSuperior.value;

        // Limpiar objetos viejos si la función ha cambiado significativamente
        if (strFuncion !== currentFunctionString) {
            currentFunctionString = strFuncion;
        }

        // Define la función
        ggbApplet.evalCommand(`f(${strVariable}) = ${strFuncion.replace(/\*\*/g, '^')}`); // GeoGebra usa ^ para potencias
        
        // Si hay límites definidos y son números, dibuja la integral
        const esLimiteNumericoInferior = !isNaN(parseFloat(strLimiteInferior)) && !strLimiteInferior.toLowerCase().includes('inf');
        const esLimiteNumericoSuperior = !isNaN(parseFloat(strLimiteSuperior)) && !strLimiteSuperior.toLowerCase().includes('inf');
        const puedeGraficarArea = esLimiteNumericoInferior && esLimiteNumericoSuperior;

        if (puedeGraficarArea) {
            const aIni = parseFloat(strLimiteInferior);
            const bIni = parseFloat(strLimiteSuperior);
            
            // Enviar comandos a GeoGebra para los límites y la integral
            ggbApplet.evalCommand(`a = ${aIni}`);
            ggbApplet.evalCommand(`b = ${bIni}`);
            ggbApplet.evalCommand(`c = Integral(f, a, b)`);
            ggbApplet.setVisible('a', false); // Asegura que los puntos 'a' y 'b' sean visibles
            ggbApplet.setVisible('b', false);
            ggbApplet.setVisible('c', true); // Asegura que la integral sea visible

            // Configurar los deslizadores HTML y sus valores
            if (deslA && deslB) {
                const minRange = Math.min(aIni, bIni) - 5; 
                const maxRange = Math.max(aIni, bIni) + 5;
                const step = 0.01; 

                Object.assign(deslA, { min: minRange, max: maxRange, step: step, value: aIni });
                Object.assign(deslB, { min: minRange, max: maxRange, step: step, value: bIni });
                
                if (valorDeslizadorA) valorDeslizadorA.textContent = aIni.toFixed(2);
                if (valorDeslizadorB) valorDeslizadorB.textContent = bIni.toFixed(2);

                // Adjuntar Event Listeners para los deslizadores A y B
                // Se adjuntan aquí para asegurar que se hagan solo cuando la gráfica es relevante
                // y que interactúen con la instancia de ggbApplet.
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
            // Si no hay límites numéricos, asegúrate de que no haya integral definida visible
            if (ggbApplet.getObjectType('c') === 'numeric') {
                ggbApplet.evalCommand('Delete(c)');
            }
            if (ggbApplet.getObjectType('a') === 'numeric') { ggbApplet.evalCommand('Delete(a)'); }
            if (ggbApplet.getObjectType('b') === 'numeric') { ggbApplet.evalCommand('Delete(b)'); }
            // Asegúrate de que los deslizadores no estén activos o visibles
            if (deslA) deslA.oninput = null;
            if (deslB) deslB.oninput = null;
            if (valorDeslizadorA) valorDeslizadorA.textContent = '';
            if (valorDeslizadorB) valorDeslizadorB.textContent = '';
        }
        ggbApplet.evalCommand("ZoomIn()"); // Ajusta el zoom para que se vea bien la función y los límites
    };

    // Escucha cambios en el input de la función para previsualizar
    inputFuncion.addEventListener('input', () => {
        actualizarPrevisualizacion();
    });
    inputVariable.addEventListener('input', () => {
        // Si GeoGebra ya está inicializado, actualiza la gráfica
        if (ggbApplet) {
            updateGeoGebraGraph();
        }
    });

    // --- INICIALIZACIÓN DE GEOGEBRA SE MUEVE AL BOTÓN CALCULAR ---
    // La lógica de inicialización y actualización de GeoGebra, junto con los deslizadores,
    // se encuentra ahora completamente dentro del evento click del botón Calcular.


    botonCalcular.addEventListener('click', async () => {
        limpiarResultados(); // Limpia los resultados anteriores
        const section1 = document.getElementById('seccionResultados');
        const section2 = document.getElementById('seccionGeoGebra');
        section1.style.display = 'block'; // Muestra la sección de resultados
        section2.style.display = 'block'; // Muestra la sección de GeoGebra
        const strFuncion = inputFuncion.value;
        const strVariable = inputVariable.value; 
        const strLimiteInferior = inputLimiteInferior.value;
        const strLimiteSuperior = inputLimiteSuperior.value;
        const numDecimales = parseInt(inputDecimales.value);

        if (isNaN(numDecimales) || numDecimales < 0 || numDecimales > 15) {
            alert('Por favor, ingresa un número de decimales válido (entre 0 y 15).');
            return;
        }

        // Validación básica de campos
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

            // Muestra los resultados en los elementos HTML
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

            // Renderiza todas las expresiones MathJax en la página
            if (typeof MathJax !== 'undefined') {
                MathJax.typesetPromise();
            }

            // --- Lógica de GeoGebra que se ejecuta SOLO al presionar Calcular ---
            if (!ggbApplet) {
                // Si el applet no está inicializado, lo inicializamos ahora
                const params = {
                    "appName": "graphing",
                    "showToolBar": false,
                    "showAlgebraInput": false,
                    "showMenuBar": false,
                    "width": 800,
                    "height": 400,
                    "appletOnLoad": function(api) {
                        ggbApplet = api; // Asigna la instancia de la API globalmente
                        updateGeoGebraGraph(); // Carga la gráfica inicial con los valores actuales
                    }
                };
                elementoGgb.innerHTML = ''; // Limpia el contenedor antes de inyectar
                new GGBApplet(params, true).inject('elementoGgb');
            } else {
                // Si el applet ya está inicializado, simplemente actualizamos la gráfica
                updateGeoGebraGraph();
            }
            
        } catch (error) {
            console.error('Error al calcular:', error);
            alert(`Error: ${error.message}`);
            limpiarResultados(); 
        }
    });

    // Llamada inicial para previsualizar la función por defecto
    actualizarPrevisualizacion();
});
