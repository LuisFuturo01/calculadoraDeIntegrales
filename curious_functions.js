document.addEventListener('DOMContentLoaded', () => {
    const ggbAppletConfigs = {
        ggbApplet1: {
            formula: (k) => `f(x) = (x-k)^2`,
            initialK: 0,
            xMin: -2, xMax: 2, yMin: -5, yMax: 15,
            criticalRange: null
        },
        ggbApplet2: {
            formula: (k) => `f(x) = sin(kx)`,
            initialK: 1,
            xMin: 0, xMax: Math.PI, yMin: -2, yMax: 2,
            criticalRange: null
        },
        ggbApplet3: {
            formula: (k) => `f(x) = exp(kx)`,
            initialK: 0.5,
            xMin: -1, xMax: 1, yMin: -5, yMax: 10,
            criticalRange: null
        },
        ggbApplet4: {
            formula: (k) => `f(x) = k*ln(x)`,
            initialK: 1,
            xMin: 1, xMax: 5, yMin: -5, yMax: 5,
            criticalRange: (k, step) => ({ min: 0 - step * 2, max: 0 + step * 2 })
        },
        ggbApplet5: {
            formula: (k) => `f(x) = k/x`,
            initialK: 1,
            xMin: 1, xMax: 5, yMin: -10, yMax: 10,
            criticalRange: (k, step) => ({ min: 0 - step * 2, max: 0 + step * 2 })
        },
        ggbApplet6: {
            formula: (k) => `f(x) = 1/(x-k)`,
            initialK: 0,
            xMin: -2, xMax: 2, yMin: -5, yMax: 5,
            criticalRange: (k, step) => ({ min: k - step * 2, max: k + step * 2 })
        },
        ggbApplet7: {
            formula: (k) => `f(x) = x^k`,
            initialK: 2,
            xMin: 0.5, xMax: 2, yMin: -5, yMax: 10,
            criticalRange: (k, step) => (k < 0 ? { min: 0 - step * 2, max: 0 + step * 2 } : null)
        },
        ggbApplet8: {
            formula: (k) => `f(x) = exp(-k*x)*sin(x)`,
            initialK: 0.1,
            xMin: 0, xMax: Math.PI * 2, yMin: -1.5, yMax: 1.5,
            criticalRange: null
        },
        ggbApplet9: {
            formula: (k) => `f(x) = x^3 - k*x`,
            initialK: 1,
            xMin: -1, xMax: 1, yMin: -5, yMax: 5,
            criticalRange: null
        },
        ggbApplet10: {
            formula: (k) => `f(x) = k*abs(x)`,
            initialK: 1,
            xMin: -2, xMax: 2, yMin: 0, yMax: 10,
            criticalRange: null
        }
    };

    const ggbApplets = {};
    const currentCoords = {};
    const currentKValues = {};

    const decimalPlaces = (num) => {
        const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) { return 0; }
        return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
    };

    const rangesOverlap = (range1Min, range1Max, range2Min, range2Max) => {
        return Math.max(range1Min, range2Min) < Math.min(range1Max, range2Max);
    };

    const setGGBObjectsVisibilityAndFixed = (api, visible, fixed) => {
        api.setVisible('a', visible);
        api.setVisible('b', visible);
        api.setVisible('k', visible);
        api.setLabelVisible('a', visible);
        api.setLabelVisible('b', visible);
        api.setLabelVisible('k', visible);
        api.setFixed('a', fixed, true);
        api.setFixed('b', fixed, true);
        api.setFixed('k', fixed, true);
    };

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

            if (criticalRange !== null && criticalRange.min !== null && criticalRange.max !== null) {
                if (rangesOverlap(currentXMin, currentXMax, criticalRange.min, criticalRange.max)) {
                    isIntegralProblematic = true;
                }
            }

            const integralValue = api.getValue('c'); 

            if (isIntegralProblematic) {
                integralResultDiv.innerHTML = `Integral: Indefinida o con singularidad en el intervalo`;
                integralResultDiv.style.color = 'orange';
                if (ggbId === 'ggbApplet6') {
                    api.setVisible('c', true); 
                } else {
                    api.setVisible('c', false);
                }
            } else {
                if (integralValue !== undefined && !isNaN(integralValue)) {
                    integralResultDiv.innerHTML = `Integral: $$\\int_{${currentXMin.toFixed(displayPrecision)}}^{${currentXMax.toFixed(displayPrecision)}} f(x) dx = ${integralValue.toFixed(4)}$$`;
                    integralResultDiv.style.color = '';
                    api.setVisible('c', true);
                } else {
                    integralResultDiv.textContent = 'Integral: Indefinido (Error de cálculo)';
                    integralResultDiv.style.color = 'red';
                    api.setVisible('c', false);
                }
            }
            
            if (window.MathJax) {
                MathJax.typesetPromise([integralResultDiv]);
            }
        }
    };

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

        if (paramType === 'k') {
            currentKValues[ggbId] = value;
            api.evalCommand(config.formula(value));
            api.evalCommand(`k = ${value}`);
        }

        const kForCriticalRange = currentKValues[ggbId] !== undefined ? currentKValues[ggbId] : config.initialK;
        if (typeof config.criticalRange === 'function') {
            criticalRange = config.criticalRange(kForCriticalRange, currentStep);
        } else {
            criticalRange = config.criticalRange;
        }

        valueSpan.textContent = value.toFixed(decimalPlaces(currentStep));

        let a = parseFloat(xMinSlider.value);
        let b = parseFloat(xMaxSlider.value);

        if (paramType === 'xMin') {
            a = value;
            if (a >= b) {
                b = a + currentStep;
                xMaxSlider.value = b;
                xMaxSpan.textContent = b.toFixed(decimalPlaces(currentStep));
            }
            xMaxSlider.min = a;
        } else if (paramType === 'xMax') {
            b = value;
            if (b <= a) {
                a = b - currentStep;
                xMinSlider.value = a;
                xMinSpan.textContent = a.toFixed(decimalPlaces(currentStep));
            }
            xMinSlider.max = b;
        }
        
        currentCoords[ggbId].xMin = a;
        currentCoords[ggbId].xMax = b;
        
        let shouldSendToGeoGebra = true;
        if (criticalRange !== null && criticalRange.min !== null && criticalRange.max !== null) {
            if (rangesOverlap(a, b, criticalRange.min, criticalRange.max)) {
                shouldSendToGeoGebra = false;
            }
        }

        if (shouldSendToGeoGebra) {
            api.evalCommand(`a = ${a}`);
            api.setVisible('a', true);
            api.evalCommand(`b = ${b}`);
            api.setVisible('b', true);
            
            api.evalCommand(`c = Integral(f, a, b)`);
            api.setVisible('c', true);
        } else {
            api.setVisible('c', false);
        }
        
        updateIntegralDisplay(ggbId, api);
    };

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
            showFieldText: false,
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
                
                api.evalCommand(`k = ${config.initialK}`);
                api.evalCommand(`a = ${currentCoords[ggbId].xMin}`);
                api.evalCommand(`b = ${currentCoords[ggbId].xMax}`);
                
                setGGBObjectsVisibilityAndFixed(api, true, true); 

                api.evalCommand(config.formula(config.initialK));

                api.evalCommand(`c = Integral(f, a, b)`);
                api.setColor('c', 0, 150, 136);
                api.setFilling('c', 0.5);
                
                updateIntegralDisplay(ggbId, api);
                
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
                const step = 0.01;

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
                });
            }
        }
    });

    document.querySelectorAll('.ggb-element').forEach(element => {
        resizeObserver.observe(element);
    });
});