import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDpZ1iVlOE07m1vXW71A8rJq6o1-u9zq1g",
    authDomain: "dbcalculadoraint.firebaseapp.com",
    databaseURL: "https://dbcalculadoraint-default-rtdb.firebaseio.com",
    projectId: "dbcalculadoraint",
    storageBucket: "dbcalculadoraint.firebasestorage.app",
    messagingSenderId: "804940860014",
    appId: "1:804940860014:web:a1fee6fb321c992400747f",
    measurementId: "G-9MZYELC460"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', async () => {
    const promedio = arr => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const colores = {
        primary: '#61dafb',
        secondary: '#ffc107',
        success: '#4caf50',
        danger: '#e91e63',
        info: '#00bcd4',
        warning: '#ff5722',
        light: '#e6e6e6',
        dark: '#444'
    };

    const charts = {};

    let estudiantesCalculoII = [];

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    function showTab(tabId) {
        Object.values(charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        for (const key in charts) {
            delete charts[key];
        }

        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');

        renderCharts(tabId);
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            showTab(button.dataset.tab);
        });
    });

    const renderCharts = (tabId) => {
        const estudiantesExamen1 = estudiantesCalculoII.filter(e => e.examen1?.nota !== undefined);
        const estudiantesExamen2 = estudiantesCalculoII.filter(e => e.examen2?.nota !== undefined);
        
        const estudiantesConAmbosExamenes = estudiantesCalculoII.filter(e => 
            e.examen1?.nota !== undefined && e.examen2?.nota !== undefined
        );

        if (tabId === 'examen1') {
            renderHistogramChart('graficaNotasExamen1', estudiantesExamen1.map(e => e.examen1.nota), 'Notas del Primer Examen', 'Nota', 10, 100);
            renderHistogramChart('graficaAsistenciaExamen1', estudiantesExamen1.map(e => e.examen1.asistencia), 'Distribución de Asistencia', 'Clases Asistidas (de 5)', 1, 5);
            renderHistogramChart('graficaTiempoEstudioExamen1', estudiantesExamen1.map(e => e.examen1.hrsEstudio), 'Distribución de Tiempo de Estudio (horas/sem)', 'Horas por Semana', 1, 15);
            renderHistogramChart('graficaEjerciciosExamen1', estudiantesExamen1.map(e => e.examen1.ejerciciosRes), 'Distribución de Ejercicios Resueltos', 'Ejercicios (de 5)', 1, 5);

        } else if (tabId === 'examen2') {
            renderHistogramChart('graficaNotasExamen2', estudiantesExamen2.map(e => e.examen2.nota), 'Notas del Segundo Examen', 'Nota', 10, 100);
            const usados = estudiantesExamen2.filter(e => e.examen2.herramienta === 'si').length;
            const noUsados = estudiantesExamen2.filter(e => e.examen2.herramienta === 'no').length;
            renderDoughnutChart('graficaUsoHerramientaExamen2', usados, noUsados, '¿Uso de Herramienta para Segundo Examen?');
            renderHistogramChart('graficaAsistenciaExamen2', estudiantesExamen2.map(e => e.examen2.asistencia), 'Distribución de Asistencia', 'Clases Asistidas (de 5)', 1, 5);
            renderHistogramChart('graficaTiempoEstudioExamen2', estudiantesExamen2.map(e => e.examen2.hrsEstudio), 'Distribución de Tiempo de Estudio (horas/sem)', 'Horas por Semana', 1, 15);
            renderHistogramChart('graficaEjerciciosExamen2', estudiantesExamen2.map(e => e.examen2.ejerciciosRes), 'Distribución de Ejercicios Resueltos', 'Ejercicios (de 5)', 1, 5);

        } else if (tabId === 'comparativa') {
            renderComparativaNotasChart(estudiantesConAmbosExamenes);
            renderRelacionHerramientaNotaChart(estudiantesConAmbosExamenes);
            renderPromediosGeneralesComparativaChart(estudiantesConAmbosExamenes);
        }
    };

    const renderHistogramChart = (canvasId, dataArray, titleText, xAxisLabel, binSize, maxVal) => {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas con ID '${canvasId}' no encontrado.`);
            return;
        }
        const context = ctx.getContext('2d');
        if (charts[canvasId]) {
            charts[canvasId].destroy();
        }

        const bins = {};
        for (let i = 0; i <= maxVal; i += binSize) {
            let label = `${i}-${Math.min(i + binSize -1, maxVal)}`;
            if (binSize === 1) {
                label = `${i}`;
                if (i === maxVal) label = `${maxVal}`;
            }
            bins[label] = 0;
        }
        
        dataArray.forEach(value => {
            if (value < 0 || value > maxVal) {
                console.warn(`Valor ${value} está fuera del rango definido (0-${maxVal}) para el histograma ${canvasId}.`);
                return;
            }

            let foundBin = false;
            for (let i = 0; i <= maxVal; i += binSize) {
                const lowerBound = i;
                const upperBound = Math.min(i + binSize - (binSize === 1 ? 0 : 1), maxVal);
                
                if (value >= lowerBound && value <= upperBound) {
                    let binKey = `${lowerBound}-${upperBound}`;
                    if (binSize === 1) {
                        binKey = `${lowerBound}`;
                        if (lowerBound === maxVal) binKey = `${maxVal}`;
                    }
                    if (bins[binKey] !== undefined) {
                        bins[binKey]++;
                        foundBin = true;
                        break;
                    }
                }
            }
            if (!foundBin) {
                const lastBinLowerBound = Math.floor(maxVal / binSize) * binSize;
                const lastBinUpperBound = maxVal;
                let lastBinKey = `${lastBinLowerBound}-${lastBinUpperBound}`;
                if (binSize === 1) {
                    lastBinKey = `${lastBinLowerBound}`;
                    if (lastBinLowerBound === maxVal) lastBinKey = `${maxVal}`;
                }

                if (value >= lastBinLowerBound && value <= lastBinUpperBound && bins[lastBinKey] !== undefined) {
                    bins[lastBinKey]++;
                } else {
                    console.warn(`Valor ${value} no se pudo asignar a un bin en ${canvasId}.`);
                }
            }
        });

        const labels = Object.keys(bins);
        const data = Object.values(bins);
        
        charts[canvasId] = new Chart(context, {
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
                maintainAspectRatio: false,
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

    const renderDoughnutChart = (canvasId, usedCount, notUsedCount, titleText) => {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas con ID '${canvasId}' no encontrado.`);
            return;
        }
        const context = ctx.getContext('2d');
        if (charts[canvasId]) {
            charts[canvasId].destroy();
        }
        charts[canvasId] = new Chart(context, {
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
                maintainAspectRatio: false,
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

    const renderComparativaNotasChart = (dataStudents) => {
        const ctx = document.getElementById('graficaComparativaNotas');
        if (!ctx) {
            console.error(`Canvas con ID 'graficaComparativaNotas' no encontrado.`);
            return;
        }
        const context = ctx.getContext('2d');
        if (charts['graficaComparativaNotas']) {
            charts['graficaComparativaNotas'].destroy();
        }
        charts['graficaComparativaNotas'] = new Chart(context, {
            type: 'bar',
            data: {
                labels: dataStudents.map(e => e.codigoEstudiante), 
                datasets: [
                    {
                        label: 'Examen 1',
                        data: dataStudents.map(e => e.examen1?.nota),
                        backgroundColor: colores.primary
                    },
                    {
                        label: 'Examen 2',
                        data: dataStudents.map(e => e.examen2?.nota),
                        backgroundColor: colores.secondary
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: colores.light } },
                    title: {
                        display: true,
                        text: 'Notas Individuales: Examen 1 vs. Examen 2 (por Código)',
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

    const renderRelacionHerramientaNotaChart = (dataStudents) => {
        const ctx = document.getElementById('graficaRelacionHerramientaNota');
        if (!ctx) {
            console.error(`Canvas con ID 'graficaRelacionHerramientaNota' no encontrado.`);
            return;
        }
        const context = ctx.getContext('2d');
        if (charts['graficaRelacionHerramientaNota']) {
            charts['graficaRelacionHerramientaNota'].destroy();
        }

        const dataUsuariosHerramienta = dataStudents.filter(e => e.examen2?.herramienta === 'si');
        const dataNoUsuariosHerramienta = dataStudents.filter(e => e.examen2?.herramienta === 'no');

        charts['graficaRelacionHerramientaNota'] = new Chart(context, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Usó Herramienta',
                        data: dataUsuariosHerramienta.map(e => ({ x: e.examen2.nota, y: e.examen2.ejerciciosRes, codigoEstudiante: e.codigoEstudiante })),
                        backgroundColor: colores.success,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'No Usó Herramienta',
                        data: dataNoUsuariosHerramienta.map(e => ({ x: e.examen2.nota, y: e.examen2.ejerciciosRes, codigoEstudiante: e.codigoEstudiante })),
                        backgroundColor: colores.danger,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.raw.codigoEstudiante) {
                                    label += `Estudiante: ${context.raw.codigoEstudiante}, `;
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

    const renderPromediosGeneralesComparativaChart = (dataStudents) => {
        const ctx = document.getElementById('graficaPromediosComparativa');
        if (!ctx) {
            console.error(`Canvas con ID 'graficaPromediosComparativa' no encontrado.`);
            return;
        }
        const context = ctx.getContext('2d');
        if (charts['graficaPromediosComparativa']) {
            charts['graficaPromediosComparativa'].destroy();
        }

        const notasExamen1 = dataStudents.map(e => e.examen1?.nota).filter(n => n !== undefined);
        const asistenciaExamen1 = dataStudents.map(e => e.examen1?.asistencia).filter(a => a !== undefined);
        const tiemposEstudioExamen1 = dataStudents.map(e => e.examen1?.hrsEstudio).filter(t => t !== undefined);
        const ejerciciosResExamen1 = dataStudents.map(e => e.examen1?.ejerciciosRes).filter(ej => ej !== undefined);

        const promExamen1 = {
            nota: notasExamen1.length > 0 ? promedio(notasExamen1) : 0,
            asistencia: asistenciaExamen1.length > 0 ? promedio(asistenciaExamen1) : 0,
            tiempoEstudio: tiemposEstudioExamen1.length > 0 ? promedio(tiemposEstudioExamen1) : 0,
            ejerciciosResueltos: ejerciciosResExamen1.length > 0 ? promedio(ejerciciosResExamen1) : 0
        };

        const notasExamen2 = dataStudents.map(e => e.examen2?.nota).filter(n => n !== undefined);
        const asistenciaExamen2 = dataStudents.map(e => e.examen2?.asistencia).filter(a => a !== undefined);
        const tiemposEstudioExamen2 = dataStudents.map(e => e.examen2?.hrsEstudio).filter(t => t !== undefined);
        const ejerciciosResExamen2 = dataStudents.map(e => e.examen2?.ejerciciosRes).filter(ej => ej !== undefined);

        const promExamen2 = {
            nota: notasExamen2.length > 0 ? promedio(notasExamen2) : 0,
            asistencia: asistenciaExamen2.length > 0 ? promedio(asistenciaExamen2) : 0,
            tiempoEstudio: tiemposEstudioExamen2.length > 0 ? promedio(tiemposEstudioExamen2) : 0,
            ejerciciosResueltos: ejerciciosResExamen2.length > 0 ? promedio(ejerciciosResExamen2) : 0
        };

        const scale = (value, originalMax) => originalMax === 0 ? 0 : (value / originalMax) * 100;

        charts['graficaPromediosComparativa'] = new Chart(context, {
            type: 'radar',
            data: {
                labels: [
                    'Nota (0-100)',
                    'Asistencia (0-5)',
                    'Tiempo Estudio (hrs/sem)',
                    'Ejercicios Resueltos (0-5)'
                ],
                datasets: [
                    {
                        label: 'Promedio Examen 1',
                        data: [
                            promExamen1.nota,
                            scale(promExamen1.asistencia, 5),
                            scale(promExamen1.tiempoEstudio, 15),
                            scale(promExamen1.ejerciciosResueltos, 5)
                        ],
                        backgroundColor: "rgba(97,218,251,0.3)",
                        borderColor: colores.primary,
                        pointBackgroundColor: colores.primary,
                        fill: true
                    },
                    {
                        label: 'Promedio Examen 2',
                        data: [
                            promExamen2.nota,
                            scale(promExamen2.asistencia, 5),
                            scale(promExamen2.tiempoEstudio, 15),
                            scale(promExamen2.ejerciciosResueltos, 5)
                        ],
                        backgroundColor: "rgba(255,193,7,0.3)",
                        borderColor: colores.secondary,
                        pointBackgroundColor: colores.secondary,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                        suggestedMax: 100,
                        pointLabels: { color: colores.light, font: { size: 12 } },
                        ticks: {
                            backdropColor: "rgba(0,0,0,0.5)",
                            color: colores.light,
                            beginAtZero: true,
                            stepSize: 20
                        },
                        grid: { color: colores.dark }
                    }
                }
            }
        });
    };

    const loadAndProcessData = async () => {
        const loadingMessageElement = document.querySelector('.estadistica-contenedor p.no-data');
        if (loadingMessageElement) {
            loadingMessageElement.textContent = 'Cargando datos...';
            loadingMessageElement.style.display = 'block';
        }

        try {
            const q = query(collection(db, "EncuestaRendimiento"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);

            const studentDataMap = new Map();

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const codigoEstudiante = data.codigoEstudiante;
                const tipoExamen = data.tipoExamen;
                const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(0); 

                if (!codigoEstudiante || !tipoExamen || data.notaEx === undefined || data.asistencia === undefined || data.hrsEstudio === undefined || data.ejerciciosRes === undefined) {
                    console.warn(`[Datos Incompletos] Documento ${doc.id} tiene datos faltantes. Saltando.`, data);
                    return;
                }

                if (!studentDataMap.has(codigoEstudiante)) {
                    studentDataMap.set(codigoEstudiante, {
                        codigoEstudiante: codigoEstudiante,
                        examen1: null,
                        examen2: null
                    });
                }
                const studentEntry = studentDataMap.get(codigoEstudiante);

                if (tipoExamen === 'primer') {
                    if (!studentEntry.examen1) {
                        studentEntry.examen1 = {
                            nota: data.notaEx,
                            asistencia: data.asistencia,
                            hrsEstudio: data.hrsEstudio,
                            ejerciciosRes: data.ejerciciosRes,
                            _timestamp: timestamp
                        };
                    }
                } else if (tipoExamen === 'segundo') {
                    if (!studentEntry.examen2) {
                        studentEntry.examen2 = {
                            nota: data.notaEx,
                            asistencia: data.asistencia,
                            herramienta: data.herramienta,
                            hrsEstudio: data.hrsEstudio,
                            ejerciciosRes: data.ejerciciosRes,
                            _timestamp: timestamp
                        };
                    }
                }
            });

            estudiantesCalculoII = Array.from(studentDataMap.values());

            if (loadingMessageElement) {
                loadingMessageElement.style.display = 'none';
            }

            if (estudiantesCalculoII.length === 0) {
                document.querySelector('.estadistica-contenedor').innerHTML = '<p class="no-data" style="color: ' + colores.light + ';">No hay datos de estudiantes disponibles para generar gráficas.</p>';
                return;
            }

            showTab('examen1');

        } catch (error) {
            console.error("[ERROR FATAL] Error al cargar o procesar datos de Firebase:", error);
            if (loadingMessageElement) {
                loadingMessageElement.textContent = 'Error al cargar los datos. Por favor, revisa la consola del navegador para más detalles.';
                loadingMessageElement.style.color = colores.danger;
                loadingMessageElement.style.display = 'block';
            }
        }
    };

    loadAndProcessData();
});