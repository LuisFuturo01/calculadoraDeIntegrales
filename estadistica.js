document.addEventListener('DOMContentLoaded', () => {

    // Utilidad para promedios
    const promedio = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

    // Colores para los gráficos (ajustados para el tema oscuro)
    const colores = {
        primary: '#61dafb', // Azul claro, vibrante
        secondary: '#ffc107', // Amarillo, vibrante
        success: '#4caf50', // Verde, para "Sí" o progreso positivo
        danger: '#e91e63', // Rojo, para "No" o áreas de mejora
        info: '#00bcd4', // Cian
        warning: '#ff5722', // Naranja
        light: '#e6e6e6', // Para texto en ejes, ticks
        dark: '#444' // Para líneas de cuadrícula
    };

    // Almacena las instancias de Chart para poder destruirlas antes de recrearlas
    const charts = {};

    // Datos simulados de estudiantes con resultados para ambos exámenes.
    // REEMPLAZA ESTOS DATOS CON TUS DATOS REALES DE LAS ENCUESTAS.
    // Asegúrate de que las notas estén entre 0-100, asistencia 0-20, tiempoEstudio en horas, ejerciciosResueltos 0-5.
    const estudiantesCalculoII = [
        {
            nombre: "Estudiante 1",
            examen1: { nota: 55, asistencia: 16, tiempoEstudio: 6, ejerciciosResueltos: 3 },
            examen2: { nota: 75, asistencia: 18, usoHerramienta: true, tiempoEstudio: 4, ejerciciosResueltos: 4 }
        },
        {
            nombre: "Estudiante 2",
            examen1: { nota: 60, asistencia: 18, tiempoEstudio: 8, ejerciciosResueltos: 4 },
            examen2: { nota: 80, asistencia: 19, usoHerramienta: true, tiempoEstudio: 7, ejerciciosResueltos: 5 }
        },
        {
            nombre: "Estudiante 3",
            examen1: { nota: 40, asistencia: 14, tiempoEstudio: 3, ejerciciosResueltos: 2 },
            examen2: { nota: 65, asistencia: 15, usoHerramienta: false, tiempoEstudio: 5, ejerciciosResueltos: 3 }
        },
        {
            nombre: "Estudiante 4",
            examen1: { nota: 70, asistencia: 19, tiempoEstudio: 10, ejerciciosResueltos: 5 },
            examen2: { nota: 90, asistencia: 20, usoHerramienta: true, tiempoEstudio: 9, ejerciciosResueltos: 5 }
        },
        {
            nombre: "Estudiante 5",
            examen1: { nota: 50, asistencia: 15, tiempoEstudio: 4, ejerciciosResueltos: 2 },
            examen2: { nota: 70, asistencia: 16, usoHerramienta: false, tiempoEstudio: 6, ejerciciosResueltos: 3 }
        },
        // ADD MORE STUDENTS HERE following the same structure
        { nombre: "Estudiante 6", examen1: { nota: 65, asistencia: 17, tiempoEstudio: 7, ejerciciosResueltos: 4 }, examen2: { nota: 85, asistencia: 19, usoHerramienta: true, tiempoEstudio: 8, ejerciciosResueltos: 5 } },
        { nombre: "Estudiante 7", examen1: { nota: 45, asistencia: 13, tiempoEstudio: 2, ejerciciosResueltos: 1 }, examen2: { nota: 50, asistencia: 14, usoHerramienta: false, tiempoEstudio: 3, ejerciciosResueltos: 2 } },
        { nombre: "Estudiante 8", examen1: { nota: 75, asistencia: 20, tiempoEstudio: 12, ejerciciosResueltos: 5 }, examen2: { nota: 95, asistencia: 20, usoHerramienta: true, tiempoEstudio: 10, ejerciciosResueltos: 5 } },
        { nombre: "Estudiante 9", examen1: { nota: 30, asistencia: 10, tiempoEstudio: 1, ejerciciosResueltos: 0 }, examen2: { nota: 40, asistencia: 12, usoHerramienta: false, tiempoEstudio: 2, ejerciciosResueltos: 1 } },
        { nombre: "Estudiante 10", examen1: { nota: 80, asistencia: 19, tiempoEstudio: 9, ejerciciosResueltos: 4 }, examen2: { nota: 88, asistencia: 20, usoHerramienta: true, tiempoEstudio: 8, ejerciciosResueltos: 5 } },
        { nombre: "Estudiante 11", examen1: { nota: 58, asistencia: 16, tiempoEstudio: 5, ejerciciosResueltos: 3 }, examen2: { nota: 72, asistencia: 17, usoHerramienta: true, tiempoEstudio: 6, ejerciciosResueltos: 4 } },
        { nombre: "Estudiante 12", examen1: { nota: 62, asistencia: 17, tiempoEstudio: 6, ejerciciosResueltos: 3 }, examen2: { nota: 78, asistencia: 18, usoHerramienta: false, tiempoEstudio: 7, ejerciciosResueltos: 4 } },
        { nombre: "Estudiante 13", examen1: { nota: 35, asistencia: 11, tiempoEstudio: 2, ejerciciosResueltos: 1 }, examen2: { nota: 55, asistencia: 13, usoHerramienta: true, tiempoEstudio: 4, ejerciciosResueltos: 2 } },
        { nombre: "Estudiante 14", examen1: { nota: 78, asistencia: 20, tiempoEstudio: 11, ejerciciosResueltos: 5 }, examen2: { nota: 92, asistencia: 20, usoHerramienta: true, tiempoEstudio: 10, ejerciciosResueltos: 5 } },
        { nombre: "Estudiante 15", examen1: { nota: 48, asistencia: 14, tiempoEstudio: 3, ejerciciosResueltos: 2 }, examen2: { nota: 68, asistencia: 15, usoHerramienta: false, tiempoEstudio: 5, ejerciciosResueltos: 3 } },
        { nombre: "Estudiante 16", examen1: { nota: 68, asistencia: 18, tiempoEstudio: 7, ejerciciosResueltos: 4 }, examen2: { nota: 82, asistencia: 19, usoHerramienta: true, tiempoEstudio: 7, ejerciciosResueltos: 4 } },
        { nombre: "Estudiante 17", examen1: { nota: 52, asistencia: 15, tiempoEstudio: 4, ejerciciosResueltos: 2 }, examen2: { nota: 60, asistencia: 16, usoHerramienta: false, tiempoEstudio: 5, ejerciciosResueltos: 3 } },
        { nombre: "Estudiante 18", examen1: { nota: 73, asistencia: 19, tiempoEstudio: 9, ejerciciosResueltos: 4 }, examen2: { nota: 89, asistencia: 20, usoHerramienta: true, tiempoEstudio: 9, ejerciciosResueltos: 5 } },
        { nombre: "Estudiante 19", examen1: { nota: 38, asistencia: 12, tiempoEstudio: 1, ejerciciosResueltos: 1 }, examen2: { nota: 48, asistencia: 13, usoHerramienta: false, tiempoEstudio: 3, ejerciciosResueltos: 2 } },
        { nombre: "Estudiante 20", examen1: { nota: 85, asistencia: 20, tiempoEstudio: 10, ejerciciosResueltos: 5 }, examen2: { nota: 98, asistencia: 20, usoHerramienta: true, tiempoEstudio: 11, ejerciciosResueltos: 5 } },
        { nombre: "Estudiante 21", examen1: { nota: 57, asistencia: 16, tiempoEstudio: 5, ejerciciosResueltos: 3 }, examen2: { nota: 71, asistencia: 17, usoHerramienta: true, tiempoEstudio: 6, ejerciciosResueltos: 4 } },
        { nombre: "Estudiante 22", examen1: { nota: 63, asistencia: 17, tiempoEstudio: 6, ejerciciosResueltos: 3 }, examen2: { nota: 79, asistencia: 18, usoHerramienta: false, tiempoEstudio: 7, ejerciciosResueltos: 4 } },
        { nombre: "Estudiante 23", examen1: { nota: 32, asistencia: 11, tiempoEstudio: 2, ejerciciosResueltos: 1 }, examen2: { nota: 52, asistencia: 13, usoHerramienta: true, tiempoEstudio: 4, ejerciciosResueltos: 2 } },
        { nombre: "Estudiante 24", examen1: { nota: 77, asistencia: 20, tiempoEstudio: 11, ejerciciosResueltos: 5 }, examen2: { nota: 91, asistencia: 20, usoHerramienta: true, tiempoEstudio: 10, ejerciciosResueltos: 5 } },
        { nombre: "Estudiante 25", examen1: { nota: 47, asistencia: 14, tiempoEstudio: 3, ejerciciosResueltos: 2 }, examen2: { nota: 67, asistencia: 15, usoHerramienta: false, tiempoEstudio: 5, ejerciciosResueltos: 3 } },
        { nombre: "Estudiante 26", examen1: { nota: 69, asistencia: 18, tiempoEstudio: 7, ejerciciosResueltos: 4 }, examen2: { nota: 83, asistencia: 19, usoHerramienta: true, tiempoEstudio: 7, ejerciciosResueltos: 4 } },
        { nombre: "Estudiante 27", examen1: { nota: 51, asistencia: 15, tiempoEstudio: 4, ejerciciosResueltos: 2 }, examen2: { nota: 59, asistencia: 16, usoHerramienta: false, tiempoEstudio: 5, ejerciciosResueltos: 3 } },
        { nombre: "Estudiante 28", examen1: { nota: 72, asistencia: 19, tiempoEstudio: 9, ejerciciosResueltos: 4 }, examen2: { nota: 87, asistencia: 20, usoHerramienta: true, tiempoEstudio: 9, ejerciciosResueltos: 5 } },
        { nombre: "Estudiante 29", examen1: { nota: 37, asistencia: 12, tiempoEstudio: 1, ejerciciosResueltos: 1 }, examen2: { nota: 47, asistencia: 13, usoHerramienta: false, tiempoEstudio: 3, ejerciciosResueltos: 2 } },
        { nombre: "Estudiante 30", examen1: { nota: 84, asistencia: 20, tiempoEstudio: 10, ejerciciosResueltos: 5 }, examen2: { nota: 97, asistencia: 20, usoHerramienta: true, tiempoEstudio: 11, ejerciciosResueltos: 5 } },
        { nombre: "Estudiante 31", examen1: { nota: 59, asistencia: 16, tiempoEstudio: 5, ejerciciosResueltos: 3 }, examen2: { nota: 73, asistencia: 17, usoHerramienta: true, tiempoEstudio: 6, ejerciciosResueltos: 4 } },
        { nombre: "Estudiante 32", examen1: { nota: 61, asistencia: 17, tiempoEstudio: 6, ejerciciosResueltos: 3 }, examen2: { nota: 77, asistencia: 18, usoHerramienta: false, tiempoEstudio: 7, ejerciciosResueltos: 4 } },
        { nombre: "Estudiante 33", examen1: { nota: 33, asistencia: 11, tiempoEstudio: 2, ejerciciosResueltos: 1 }, examen2: { nota: 53, asistencia: 13, usoHerramienta: true, tiempoEstudio: 4, ejerciciosResueltos: 2 } },
        { nombre: "Estudiante 34", examen1: { nota: 76, asistencia: 20, tiempoEstudio: 11, ejerciciosResueltos: 5 }, examen2: { nota: 90, asistencia: 20, usoHerramienta: true, tiempoEstudio: 10, ejerciciosResueltos: 5 } },
        { nombre: "Estudiante 35", examen1: { nota: 49, asistencia: 14, tiempoEstudio: 3, ejerciciosResueltos: 2 }, examen2: { nota: 69, asistencia: 15, usoHerramienta: false, tiempoEstudio: 5, ejerciciosResueltos: 3 } }
    ];

    // --- Lógica de Pestañas ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    function showTab(tabId) {
        // Destruir todas las instancias de Chart antes de cambiar de pestaña
        Object.values(charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        // Limpiar el objeto charts
        for (const key in charts) {
            delete charts[key];
        }

        // Remover 'active' de todos los botones y contenidos
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Añadir 'active' al botón y contenido seleccionados
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');

        // Renderizar solo los gráficos de la pestaña activa
        renderCharts(tabId);
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            showTab(button.dataset.tab);
        });
    });

    // Función principal para renderizar los gráficos de la pestaña activa
    const renderCharts = (tabId) => {
        if (tabId === 'examen1') {
            // Notas del Primer Examen (Distribución)
            renderHistogramChart('graficaNotasExamen1', estudiantesCalculoII.map(e => e.examen1.nota), 'Notas del Primer Examen', 'Nota', 10, 100); // 10 bins, max 100
            // Asistencia (Distribución)
            renderHistogramChart('graficaAsistenciaExamen1', estudiantesCalculoII.map(e => e.examen1.asistencia), 'Distribución de Asistencia', 'Clases Asistidas', 1, 20); // 1 bin, max 20
            // Tiempo de Estudio (Distribución)
            renderHistogramChart('graficaTiempoEstudioExamen1', estudiantesCalculoII.map(e => e.examen1.tiempoEstudio), 'Distribución de Tiempo de Estudio (horas/sem)', 'Horas por Semana', 1, 15); // 1 bin, max 15
            // Ejercicios Resueltos (Distribución)
            renderHistogramChart('graficaEjerciciosExamen1', estudiantesCalculoII.map(e => e.examen1.ejerciciosResueltos), 'Distribución de Ejercicios Resueltos', 'Ejercicios (de 5)', 1, 5); // 1 bin, max 5

        } else if (tabId === 'examen2') {
            // Notas del Segundo Examen (Distribución)
            renderHistogramChart('graficaNotasExamen2', estudiantesCalculoII.map(e => e.examen2.nota), 'Notas del Segundo Examen', 'Nota', 10, 100);
            // Uso de Herramienta (Gráfico de Dona)
            const usados = estudiantesCalculoII.filter(e => e.examen2.usoHerramienta).length;
            const noUsados = estudiantesCalculoII.length - usados;
            renderDoughnutChart('graficaUsoHerramientaExamen2', usados, noUsados, '¿Uso de Herramienta para Segundo Examen?');
            // Asistencia (Distribución)
            renderHistogramChart('graficaAsistenciaExamen2', estudiantesCalculoII.map(e => e.examen2.asistencia), 'Distribución de Asistencia', 'Clases Asistidas', 1, 20);
            // Tiempo de Estudio (Distribución)
            renderHistogramChart('graficaTiempoEstudioExamen2', estudiantesCalculoII.map(e => e.examen2.tiempoEstudio), 'Distribución de Tiempo de Estudio (horas/sem)', 'Horas por Semana', 1, 15);
            // Ejercicios Resueltos (Distribución)
            renderHistogramChart('graficaEjerciciosExamen2', estudiantesCalculoII.map(e => e.examen2.ejerciciosResueltos), 'Distribución de Ejercicios Resueltos', 'Ejercicios (de 5)', 1, 5);

        } else if (tabId === 'comparativa') {
            renderComparativaNotasChart();
            renderRelacionHerramientaNotaChart(); // Scatter plot para correlación
            renderPromediosGeneralesComparativaChart(); // Radar chart
        }
    };

    // --- Funciones para Generar Gráficos (Generalizadas y Reutilizables) ---

    // Función para crear un histograma de barras (distribución de valores)
    const renderHistogramChart = (canvasId, dataArray, titleText, xAxisLabel, binSize, maxVal) => {
        const ctx = document.getElementById(canvasId).getContext('2d');
        // Destruir gráfico existente si lo hay
        if (charts[canvasId]) {
            charts[canvasId].destroy();
        }

        // Crear bins para el histograma
        const bins = {};
        for (let i = 0; i <= maxVal; i += binSize) {
            bins[`${i}-${Math.min(i + binSize -1, maxVal)}`] = 0; // Rangos como "0-9", "10-19"
        }
        
        dataArray.forEach(value => {
            let foundBin = false;
            for (let i = 0; i <= maxVal; i += binSize) {
                const upperLimit = Math.min(i + binSize -1, maxVal);
                if (value >= i && value <= upperLimit) {
                    const binKey = `${i}-${upperLimit}`;
                    if (bins[binKey] !== undefined) {
                        bins[binKey]++;
                        foundBin = true;
                        break;
                    }
                }
            }
            // Para valores que no caen perfectamente en los bins (ej. 90.5 si binSize es 10)
            if (!foundBin && value >= 0 && value <= maxVal) {
                    // Buscar el bin más cercano o un bin específico para valores exactos.
                    // Para este simple histograma, asignamos a su bin inicial
                    const binKey = `${Math.floor(value / binSize) * binSize}-${Math.min(Math.floor(value / binSize) * binSize + binSize -1, maxVal)}`;
                    if(bins[binKey] !== undefined) {
                        bins[binKey]++;
                    } else {
                        console.warn(`Valor ${value} fuera de rango o sin bin asignado en ${canvasId}`);
                    }
            }
        });

        // Convertir bins a arrays para Chart.js
        const labels = Object.keys(bins);
        const data = Object.values(bins);
        
        charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cantidad de Estudiantes',
                    data: data,
                    backgroundColor: colores.primary,
                    borderColor: colores.primary,
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow charts to adapt to container height
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: titleText,
                        color: colores.light
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: colores.light, stepSize: 1 },
                        grid: { color: colores.dark }
                    },
                    x: {
                        title: { display: true, text: xAxisLabel, color: colores.light },
                        ticks: { color: colores.light },
                        grid: { color: colores.dark }
                    }
                }
            }
        });
    };

    // Función para crear un gráfico de dona (pastel)
    const renderDoughnutChart = (canvasId, usedCount, notUsedCount, titleText) => {
        const ctx = document.getElementById(canvasId).getContext('2d');
        if (charts[canvasId]) {
            charts[canvasId].destroy();
        }
        charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Sí', 'No'],
                datasets: [{
                    data: [usedCount, notUsedCount],
                    backgroundColor: [colores.success, colores.danger],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow charts to adapt to container height
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: colores.light }
                    },
                    title: {
                        display: true,
                        text: titleText,
                        color: colores.light
                    }
                }
            }
        });
    };

    // --- Gráficos Comparativos ---

    // Comparativa de Notas: Examen 1 vs. Examen 2 (barras agrupadas)
    const renderComparativaNotasChart = () => {
        const ctx = document.getElementById('graficaComparativaNotas').getContext('2d');
        if (charts['graficaComparativaNotas']) {
            charts['graficaComparativaNotas'].destroy();
        }
        charts['graficaComparativaNotas'] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: estudiantesCalculoII.map(e => e.nombre),
                datasets: [
                    {
                        label: 'Examen 1',
                        data: estudiantesCalculoII.map(e => e.examen1.nota),
                        backgroundColor: colores.primary
                    },
                    {
                        label: 'Examen 2',
                        data: estudiantesCalculoII.map(e => e.examen2.nota),
                        backgroundColor: colores.secondary
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow charts to adapt to container height
                plugins: {
                    legend: { position: 'top', labels: { color: colores.light } },
                    title: {
                        display: true,
                        text: 'Notas Individuales: Examen 1 vs. Examen 2',
                        color: colores.light
                    }
                },
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: colores.light }, grid: { color: colores.dark } },
                    x: { ticks: { color: colores.light }, grid: { color: colores.dark } }
                }
            }
        });
    };

    // Comparativa: Uso de Herramienta vs. Nota del Segundo Examen (scatter plot)
    const renderRelacionHerramientaNotaChart = () => {
        const ctx = document.getElementById('graficaRelacionHerramientaNota').getContext('2d');
        if (charts['graficaRelacionHerramientaNota']) {
            charts['graficaRelacionHerramientaNota'].destroy();
        }

        const dataUsuariosHerramienta = estudiantesCalculoII.filter(e => e.examen2.usoHerramienta);
        const dataNoUsuariosHerramienta = estudiantesCalculoII.filter(e => !e.examen2.usoHerramienta);

        charts['graficaRelacionHerramientaNota'] = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Usó Herramienta',
                        data: dataUsuariosHerramienta.map(e => ({ x: e.examen2.nota, y: e.examen2.ejerciciosResueltos, nombre: e.nombre })),
                        backgroundColor: colores.success,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'No Usó Herramienta',
                        data: dataNoUsuariosHerramienta.map(e => ({ x: e.examen2.nota, y: e.examen2.ejerciciosResueltos, nombre: e.nombre })),
                        backgroundColor: colores.danger,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow charts to adapt to container height
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: colores.light }
                    },
                    title: {
                        display: true,
                        text: 'Relación entre Nota (Examen 2) y Ejercicios Resueltos por Uso de Herramienta',
                        color: colores.light
                    },
                    tooltip: { // Chart.js v4+ tooltip configuration
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.raw.nombre) { // Access the custom 'nombre' property
                                    label += `Estudiante: ${context.raw.nombre}, `;
                                }
                                label += `Nota: ${context.parsed.x}, Ejercicios: ${context.parsed.y}`;
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: { display: true, text: 'Nota Examen 2 (0-100)', color: colores.light },
                        min: 0,
                        max: 100,
                        ticks: { color: colores.light },
                        grid: { color: colores.dark }
                    },
                    y: {
                        title: { display: true, text: 'Ejercicios Resueltos (0-5)', color: colores.light },
                        min: 0,
                        max: 5,
                        ticks: { color: colores.light, stepSize: 1 },
                        grid: { color: colores.dark }
                    }
                }
            }
        });
    };

    // Comparativa de Promedios Generales (Examen 1 vs Examen 2) - Radar chart
    const renderPromediosGeneralesComparativaChart = () => {
        const ctx = document.getElementById('graficaPromediosComparativa').getContext('2d');
        if (charts['graficaPromediosComparativa']) {
            charts['graficaPromediosComparativa'].destroy();
        }

        const promExamen1 = {
            nota: promedio(estudiantesCalculoII.map(e => e.examen1.nota)),
            asistencia: promedio(estudiantesCalculoII.map(e => e.examen1.asistencia)),
            tiempoEstudio: promedio(estudiantesCalculoII.map(e => e.examen1.tiempoEstudio)),
            ejerciciosResueltos: promedio(estudiantesCalculoII.map(e => e.examen1.ejerciciosResueltos))
        };

        const promExamen2 = {
            nota: promedio(estudiantesCalculoII.map(e => e.examen2.nota)),
            asistencia: promedio(estudiantesCalculoII.map(e => e.examen2.asistencia)),
            tiempoEstudio: promedio(estudiantesCalculoII.map(e => e.examen2.tiempoEstudio)),
            ejerciciosResueltos: promedio(estudiantesCalculoII.map(e => e.examen2.ejerciciosResueltos))
        };

        // Escalar para el radar chart a un máximo de 100 para todas las métricas para comparabilidad
        const scale = (value, originalMax) => (value / originalMax) * 100;

        charts['graficaPromediosComparativa'] = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    'Nota (0-100)',
                    'Asistencia (0-20)',
                    'Tiempo Estudio (hrs/sem)',
                    'Ejercicios Resueltos (0-5)'
                ],
                datasets: [
                    {
                        label: 'Promedio Examen 1',
                        data: [
                            promExamen1.nota,
                            scale(promExamen1.asistencia, 20), // Asistencia escala 0-20
                            scale(promExamen1.tiempoEstudio, 15), // Tiempo Estudio escala 0-15 (ajusta según tu máximo real)
                            scale(promExamen1.ejerciciosResueltos, 5) // Ejercicios escala 0-5
                        ],
                        backgroundColor: "rgba(97,218,251,0.3)", // Azul claro
                        borderColor: colores.primary,
                        pointBackgroundColor: colores.primary,
                        fill: true
                    },
                    {
                        label: 'Promedio Examen 2',
                        data: [
                            promExamen2.nota,
                            scale(promExamen2.asistencia, 20),
                            scale(promExamen2.tiempoEstudio, 15),
                            scale(promExamen2.ejerciciosResueltos, 5)
                        ],
                        backgroundColor: "rgba(255,193,7,0.3)", // Amarillo
                        borderColor: colores.secondary,
                        pointBackgroundColor: colores.secondary,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow charts to adapt to container height
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: colores.light }
                    },
                    title: {
                        display: true,
                        text: 'Comparativa de Promedios Generales (Examen 1 vs. Examen 2)',
                        color: colores.light
                    }
                },
                scales: {
                    r: {
                        angleLines: { display: true, color: colores.dark },
                        suggestedMin: 0,
                        suggestedMax: 100, // Escala todas las métricas a un rango de 0-100 para comparabilidad
                        pointLabels: { color: colores.light, font: { size: 12 } },
                        ticks: {
                            backdropColor: "rgba(0,0,0,0.5)",
                            color: colores.light,
                            beginAtZero: true,
                            stepSize: 20 // Pasos de 20 en 20
                        },
                        grid: { color: colores.dark }
                    }
                }
            }
        });
    };


    // Inicializar la primera pestaña al cargar la página
    showTab('examen1');
});