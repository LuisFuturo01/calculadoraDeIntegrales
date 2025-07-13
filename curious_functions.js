document.addEventListener('DOMContentLoaded', () => {

    // Configuration for each GeoGebra applet
    const ggbAppletConfigs = {
        ggbApplet1: {
            formula: (k) => `f(x) = (x-k)^2`, // Changed from ${k} to k
            initialK: 0,
            xMin: -2, xMax: 2, yMin: -5, yMax: 15,
            criticalRange: null // No critical range for parabola
        },
        ggbApplet2: {
            formula: (k) => `f(x) = sin(kx)`, // Changed from ${k} to k
            initialK: 1,
            xMin: 0, xMax: Math.PI, yMin: -2, yMax: 2,
            criticalRange: null // No critical range for sine
        },
        ggbApplet3: {
            formula: (k) => `f(x) = exp(kx)`, // Changed from ${k} to k
            initialK: 0.5,
            xMin: -1, xMax: 1, yMin: -5, yMax: 10,
            criticalRange: null // No critical range for exponential
        },
        ggbApplet4: {
            formula: (k) => `f(x) = k*ln(x)`, // Changed from ${k} to k
            initialK: 1,
            xMin: 1, xMax: 5, yMin: -5, yMax: 5,
            // For ln(x), indeterminacy is x <= 0. Define a range around 0.
            criticalRange: (k, step) => ({ min: 0 - step * 2, max: 0 + step * 2 }) // Range around 0
        },
        ggbApplet5: {
            formula: (k) => `f(x) = k/x`, // Changed from ${k} to k
            initialK: 1,
            xMin: 1, xMax: 5, yMin: -10, yMax: 10,
            // For 1/x, indeterminacy is at x = 0.
            criticalRange: (k, step) => ({ min: 0 - step * 2, max: 0 + step * 2 }) // Range around 0
        },
        ggbApplet6: {
            formula: (k) => `f(x) = 1/(x-k)`, // Changed from ${k} to k
            initialK: 0,
            xMin: -2, xMax: 2, yMin: -5, yMax: 5,
            // Se mantiene a null para que el área siempre intente mostrarse,
            // incluso si hay una singularidad. GeoGebra manejará la visualización.
            criticalRange: (k, step) => ({ min: k - step * 2, max: k + step * 2 })
        },
        ggbApplet7: {
            formula: (k) => `f(x) = x^k`, // Changed from ${k} to k
            initialK: 2,
            xMin: 0.5, xMax: 2, yMin: -5, yMax: 10,
            // For x^k, if k < 0, indeterminacy at x = 0.
            criticalRange: (k, step) => (k < 0 ? { min: 0 - step * 2, max: 0 + step * 2 } : null)
        },
        ggbApplet8: {
            formula: (k) => `f(x) = exp(-k*x)*sin(x)`, // Changed from ${k} to k
            initialK: 0.1,
            xMin: 0, xMax: Math.PI * 2, yMin: -1.5, yMax: 1.5,
            criticalRange: null // No critical range
        },
        ggbApplet9: {
            formula: (k) => `f(x) = x^3 - k*x`, // Changed from ${k} to k
            initialK: 1,
            xMin: -1, xMax: 1, yMin: -5, yMax: 5,
            criticalRange: null // No critical range
        },
        ggbApplet10: {
            formula: (k) => `f(x) = k*abs(x)`, // Changed from ${k} to k
            initialK: 1,
            xMin: -2, xMax: 2, yMin: 0, yMax: 10,
            criticalRange: null // No critical range
        }
    };

    const ggbApplets = {}; // Stores references to GeoGebra API objects by ggbId
    const currentCoords = {}; // Stores current xMin, xMax, yMin, yMax for each applet by ggbId
    const currentKValues = {}; // Store current 'k' value for each applet

    // Helper to get decimal places from step
    const decimalPlaces = (num) => {
        const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) { return 0; }
        return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
    };

    // Helper to check for overlap between two ranges
    const rangesOverlap = (range1Min, range1Max, range2Min, range2Max) => {
        return Math.max(range1Min, range2Min) < Math.min(range1Max, range2Max);
    };

    // Function to ensure a, b, and k are visible/hidden and draggable/fixed
    const setGGBObjectsVisibilityAndFixed = (api, visible, fixed) => {
        api.setVisible('a', visible); // Refer to numerical variable 'a'
        api.setVisible('b', visible); // Refer to numerical variable 'b'
        api.setVisible('k', visible);
        api.setLabelVisible('a', visible);
        api.setLabelVisible('b', visible);
        api.setLabelVisible('k', visible);
        // For numerical sliders, the third argument of setFixed should be true
        // to enable/disable dragging of the slider in GeoGebra's UI.
        api.setFixed('a', fixed, true); 
        api.setFixed('b', fixed, true); 
        api.setFixed('k', fixed, true); 
    };

    // Function to update the integral display for a specific applet
    const updateIntegralDisplay = (ggbId, api) => {
        const integralResultDiv = document.getElementById(`integralResult${ggbId.replace('ggbApplet', '')}`);
        if (integralResultDiv && api) {
            const currentXMin = currentCoords[ggbId].xMin;
            const currentXMax = currentCoords[ggbId].xMax;
            
            const sliderNum = ggbId.replace('ggbApplet', '');
            const xMinSlider = document.getElementById(`xMinSlider${sliderNum}`);
            const step = xMinSlider ? parseFloat(xMinSlider.step) : 0.01;
            const displayPrecision = decimalPlaces(step);

            const config = ggbAppletConfigs[ggbId];
            let isIntegralProblematic = false;
            let criticalRange = null;

            const currentK = currentKValues[ggbId] !== undefined ? currentKValues[ggbId] : config.initialK;

            if (typeof config.criticalRange === 'function') {
                criticalRange = config.criticalRange(currentK, step);
            } else {
                criticalRange = config.criticalRange;
            }

            // Check if the integration interval [currentXMin, currentXMax] overlaps with the critical range
            if (criticalRange !== null && criticalRange.min !== null && criticalRange.max !== null) {
                if (rangesOverlap(currentXMin, currentXMax, criticalRange.min, criticalRange.max)) {
                    isIntegralProblematic = true;
                }
            }

            // Get the integral value regardless of problematic status for display
            const integralValue = api.getValue('c'); 

            if (isIntegralProblematic) {
                integralResultDiv.innerHTML = `Integral: Indefinida o con singularidad en el intervalo`;
                integralResultDiv.style.color = 'orange'; // Highlight warning
                // Para ggbApplet6, forzar la visibilidad del área de la integral incluso si es problemática
                // Esto permite que GeoGebra intente dibujarla a pesar de la singularidad.
                if (ggbId === 'ggbApplet6') {
                    api.setVisible('c', true); 
                } else {
                    api.setVisible('c', false); // Ocultar para otros casos problemáticos
                }
            } else {
                if (integralValue !== undefined && !isNaN(integralValue)) {
                    integralResultDiv.innerHTML = `Integral: $$\\int_{${currentXMin.toFixed(displayPrecision)}}^{${currentXMax.toFixed(displayPrecision)}} f(x) dx = ${integralValue.toFixed(4)}$$`;
                    integralResultDiv.style.color = ''; // Reset color
                    api.setVisible('c', true); // Show the integral area
                } else {
                    // Fallback for other cases where GeoGebra returns NaN or undefined without known singularity
                    integralResultDiv.textContent = 'Integral: Indefinido (Error de cálculo)';
                    integralResultDiv.style.color = 'red'; // Highlight error
                    api.setVisible('c', false); // Hide the integral area
                }
            }
            
            if (window.MathJax) {
                MathJax.typesetPromise([integralResultDiv]);
            }
        }
    };

    // Function to handle slider input for a specific applet
    const handleSliderInput = (ggbId, slider) => {
        const paramType = slider.dataset.paramType;
        let value = parseFloat(slider.value); 
        
        const sliderNum = ggbId.replace('ggbApplet', '');
        const valueSpan = document.getElementById(`${paramType}Value${sliderNum}`);
        const currentStep = parseFloat(slider.step);
        
        const api = ggbApplets[ggbId];
        if (!api) {
            console.warn(`API for ${ggbId} not ready.`);
            return;
        }

        const xMinSlider = document.getElementById(`xMinSlider${sliderNum}`);
        const xMaxSlider = document.getElementById(`xMaxSlider${sliderNum}`); 
        const xMinSpan = document.getElementById(`xMinValue${sliderNum}`);
        const xMaxSpan = document.getElementById(`xMaxValue${sliderNum}`);

        const config = ggbAppletConfigs[ggbId];
        let criticalRange = null;

        // Update currentKValue if 'k' slider is being moved
        if (paramType === 'k') {
            currentKValues[ggbId] = value;
            api.evalCommand(config.formula(value)); // Update function formula in GeoGebra
            api.evalCommand(`k = ${value}`); // Update GeoGebra's k variable
        }

        // Get current critical range based on current K (or newly set K)
        const kForCriticalRange = currentKValues[ggbId] !== undefined ? currentKValues[ggbId] : config.initialK;
        if (typeof config.criticalRange === 'function') {
            criticalRange = config.criticalRange(kForCriticalRange, currentStep);
        } else {
            criticalRange = config.criticalRange;
        }

        // Apply slider value to the span
        valueSpan.textContent = value.toFixed(decimalPlaces(currentStep));

        let a = parseFloat(xMinSlider.value);
        let b = parseFloat(xMaxSlider.value);

        // Coordinate xMin and xMax sliders
        if (paramType === 'xMin') {
            a = value;
            if (a >= b) {
                b = a + currentStep;
                xMaxSlider.value = b;
                xMaxSpan.textContent = b.toFixed(decimalPlaces(currentStep));
            }
            xMaxSlider.min = a; // Ensure xMax cannot go below current xMin
        } else if (paramType === 'xMax') {
            b = value;
            if (b <= a) {
                a = b - currentStep;
                xMinSlider.value = a;
                xMinSpan.textContent = a.toFixed(decimalPlaces(currentStep));
            }
            xMinSlider.max = b; // Ensure xMin cannot go above current xMax
        }
        
        // Update currentCoords with the latest slider values
        currentCoords[ggbId].xMin = a;
        currentCoords[ggbId].xMax = b;
        
        let shouldSendToGeoGebra = true;
        if (criticalRange !== null && criticalRange.min !== null && criticalRange.max !== null) {
            if (rangesOverlap(a, b, criticalRange.min, criticalRange.max)) {
                shouldSendToGeoGebra = false; // Do NOT send commands if problematic
            }
        }

        if (shouldSendToGeoGebra) {
            // Update the numerical variables 'a' and 'b' in GeoGebra
            api.evalCommand(`a = ${a}`);
            api.setVisible('a', true); // Ensure 'a' is visible       
            api.evalCommand(`b = ${b}`);
            api.setVisible('b', true); // Ensure 'a' is visible 
            
            // Re-evaluate the integral with the new 'a' and 'b' values
            api.evalCommand(`c = Integral(f, a, b)`); 
            api.setVisible('c', true); // Ensure integral is visible if valid
        } else {
            // If problematic, ensure integral is hidden
            api.setVisible('c', false);
        }
        
        updateIntegralDisplay(ggbId, api); // Always update display
    };

    // Function to initialize a single GeoGebra applet
    const initializeGGBApplet = (ggbId, config) => {
        const container = document.getElementById(ggbId);
        if (!container) {
            console.warn(`Container for ${ggbId} not found.`);
            return;
        }

        const computedStyle = getComputedStyle(container);
        const width = parseFloat(computedStyle.width);
        const height = parseFloat(computedStyle.height);

        const parameters = {
            id: ggbId,
            width: width,
            height: height,
            appName: 'graphing',
            showToolBar: false,
            showMenuBar: false,
            showAlgebraInput: false,
            showResetIcon: false,
            enableRightClick: false,
            enableLabelDrags: false,
            enableShiftDragZoom: true,
            capturingThreshold: null,
            showFullscreenButton: true,
            showZoomButtons: true,
            showFieldText: false, // Ensures algebra window is not shown
            language: 'es',
            appletOnLoad: (api) => {
                ggbApplets[ggbId] = api;
                
                currentKValues[ggbId] = config.initialK;

                currentCoords[ggbId] = {
                    xMin: config.xMin,
                    xMax: config.xMax,
                    yMin: config.yMin,
                    yMax: config.yMax
                };

                // No se llama a api.setCoordSystem aquí para permitir que GeoGebra maneje su zoom inicial
                
                // Define 'k', 'a', and 'b' as simple numbers (sliders)
                api.evalCommand(`k = ${config.initialK}`);
                api.evalCommand(`a = ${currentCoords[ggbId].xMin}`); // Define 'a' as a number
                api.evalCommand(`b = ${currentCoords[ggbId].xMax}`); // Define 'b' as a number
                
                // Initially hide and fix a, b, and k (for non-fullscreen state)
                // true for fixed means they cannot be dragged in GeoGebra's view, only via HTML sliders
                
                setGGBObjectsVisibilityAndFixed(api, true, true); 

                // Define the function using the 'k' variable
                api.evalCommand(config.formula(config.initialK));

                // Define integral 'c' using the numerical variables 'a' and 'b'
                api.evalCommand(`c = Integral(f, a, b)`);
                api.setColor('c', 0, 150, 136);
                api.setFilling('c', 0.5);
                
                updateIntegralDisplay(ggbId, api); // Initial display state
                
                // Register listener for fullscreen changes
                api.registerClientListener((event) => {
    if (event.type === 'fullscreenchange') {
        alert(`⚡ Evento recibido para ${ggbId}\nEstado: ${event.fullScreen}`);

        const container = document.getElementById(ggbId);
        const isFullscreen = document.fullscreenElement === container;
        alert(`¿Contenedor en fullscreen?: ${isFullscreen}`);

        if (isFullscreen) {
            alert("Entrando a fullscreen 🚀");
            setGGBObjectsVisibilityAndFixed(api, true, false);
        } else {
            alert("Saliendo de fullscreen 🛬");
            setGGBObjectsVisibilityAndFixed(api, false, true);
        }
    }
});



                const sliderNum = ggbId.replace('ggbApplet', '');
                const kSlider = document.getElementById(`kSlider${sliderNum}`) || document.querySelector(`.k-slider[data-ggb-id="${ggbId}"]`);
                const xMinSlider = document.getElementById(`xMinSlider${sliderNum}`);
                const xMaxSlider = document.getElementById(`xMaxSlider${sliderNum}`);
                
                const initialXMin = config.xMin;
                const initialXMax = config.xMax;
                const step = 0.01; // Default step for limits

                if (kSlider) {
                    const kValueSpan = document.getElementById(`kValue${sliderNum}`);
                    Object.assign(kSlider, { value: config.initialK });
                    kValueSpan.textContent = config.initialK.toFixed(decimalPlaces(parseFloat(kSlider.step)));
                    kSlider.addEventListener('input', () => handleSliderInput(ggbId, kSlider));
                }

                if (xMinSlider) {
                    const xMinSpan = document.getElementById(`xMinValue${sliderNum}`);
                    const rangeExtension = Math.abs(initialXMax - initialXMin) > 0 ? Math.abs(initialXMax - initialXMin) * 2 : 5;
                    Object.assign(xMinSlider, { 
                        min: initialXMin - rangeExtension, 
                        max: initialXMax + rangeExtension, 
                        step: step, 
                        value: initialXMin 
                    });
                    xMinSpan.textContent = initialXMin.toFixed(decimalPlaces(step));
                    xMinSlider.addEventListener('input', () => handleSliderInput(ggbId, xMinSlider));
                }

                if (xMaxSlider) {
                    const xMaxSpan = document.getElementById(`xMaxValue${sliderNum}`);
                    const rangeExtension = Math.abs(initialXMax - initialXMin) > 0 ? Math.abs(initialXMax - initialXMin) * 2 : 5;
                    Object.assign(xMaxSlider, { 
                        min: initialXMin - rangeExtension, 
                        max: initialXMax + rangeExtension, 
                        step: step, 
                        value: initialXMax 
                    });
                    xMaxSpan.textContent = initialXMax.toFixed(decimalPlaces(step));
                    xMaxSlider.addEventListener('input', () => handleSliderInput(ggbId, xMaxSlider));
                }

                // Ensure initial coordination of limit sliders
                if (xMinSlider && xMaxSlider) {
                    xMaxSlider.min = parseFloat(xMinSlider.value);
                    xMinSlider.max = parseFloat(xMaxSlider.value);
                }
            }
        };

        const applet = new GGBApplet(parameters, '5.0');
        applet.inject(ggbId);
    };

    for (const ggbId in ggbAppletConfigs) {
        initializeGGBApplet(ggbId, ggbAppletConfigs[ggbId]);
    }

    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const ggbId = entry.target.id;
            const api = ggbApplets[ggbId];
            if (api) {
                requestAnimationFrame(() => {
                    const computedWidth = entry.contentRect.width;
                    const computedHeight = entry.contentRect.height;
                    if (api.getGridWidth() !== computedWidth || api.getGridHeight() !== computedHeight) {
                        api.setSize(computedWidth, computedHeight);
                    }
                    // No se llama a api.setCoordSystem aquí
                });
            }
        }
    });

    document.querySelectorAll('.ggb-element').forEach(element => {
        resizeObserver.observe(element);
    });
});
