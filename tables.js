// --- Importaciones de Firebase Firestore ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    // --- Configuración de Firebase (¡TU CONFIGURACIÓN REAL!) ---
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

    // Inicializa Firebase App y Firestore
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log("Firebase (Firestore) inicializado correctamente para tables.js.");

    // --- Ruta de la Colección en Firestore ---
    const EXAMS_COLLECTION_PATH = 'EncuestaRendimiento';

    // --- Elementos del DOM de las tablas ---
    const tableExamen1Body = document.getElementById('tableExamen1');
    const noDataExamen1 = document.getElementById('noDataExamen1');

    const tableExamen2Body = document.getElementById('tableExamen2');
    const noDataExamen2 = document.getElementById('noDataExamen2');

    const tableComparativaBody = document.getElementById('tableComparativa');
    const noDataComparativa = document.getElementById('noDataComparativa');

    // --- Elementos del DOM para las estadísticas ---
    const totalExamen1Span = document.getElementById('totalExamen1');
    const aprobadosExamen1Span = document.getElementById('aprobadosExamen1');
    const reprobadosExamen1Span = document.getElementById('reprobadosExamen1');

    const totalExamen2Span = document.getElementById('totalExamen2');
    const aprobadosExamen2Span = document.getElementById('aprobadosExamen2');
    const reprobadosExamen2Span = document.getElementById('reprobadosExamen2');

    const totalEstudiantesGeneralSpan = document.getElementById('totalEstudiantesGeneral');
    const promedioGeneralSpan = document.getElementById('promedioGeneral');

    let allProcessedStudentData = []; // Almacena los datos procesados para el resumen

    // --- Funciones para poblar tablas ---

    /**
     * Rellena la tabla del Primer Examen.
     * @param {Array} data - Array de objetos de examen del primer tipo.
     */
    const populateTableExamen1 = (data) => {
        if (!tableExamen1Body) {
            console.error("Elemento tbody con ID 'tableExamen1' no encontrado.");
            return;
        }
        tableExamen1Body.innerHTML = '';
        if (!data || data.length === 0) {
            noDataExamen1.textContent = 'No hay datos para el Primer Examen.';
            noDataExamen1.style.display = 'block';
            return;
        }

        noDataExamen1.style.display = 'none';
        data.forEach((item, index) => { // Agregamos 'index' para la enumeración
            const row = tableExamen1Body.insertRow();
            const estado = item.nota >= 51 ? 'Aprobado' : 'Reprobado';
            row.innerHTML = `
                <td>${index + 1}</td> <td>${item.codigoEstudiante || 'N/A'}</td>
                <td>${item.nota !== undefined ? item.nota : ''}</td>
                <td>${item.asistencia !== undefined ? item.asistencia : ''}</td>
                <td>${item.hrsEstudio !== undefined ? item.hrsEstudio : ''}</td>
                <td>${item.ejerciciosRes !== undefined ? item.ejerciciosRes : ''}</td>
                <td>${estado}</td>
            `;
            row.classList.add(estado === 'Aprobado' ? 'estado-aprobado' : 'estado-reprobado');
        });
    };

    /**
     * Rellena la tabla del Segundo Examen.
     * @param {Array} data - Array de objetos de examen del segundo tipo.
     */
    const populateTableExamen2 = (data) => {
        if (!tableExamen2Body) {
            console.error("Elemento tbody con ID 'tableExamen2' no encontrado.");
            return;
        }
        tableExamen2Body.innerHTML = '';
        if (!data || data.length === 0) {
            noDataExamen2.textContent = 'No hay datos para el Segundo Examen.';
            noDataExamen2.style.display = 'block';
            return;
        }

        noDataExamen2.style.display = 'none';
        data.forEach((item, index) => { // Agregamos 'index'
            const row = tableExamen2Body.insertRow();
            const estado = item.nota >= 51 ? 'Aprobado' : 'Reprobado';
            row.innerHTML = `
                <td>${index + 1}</td> <td>${item.codigoEstudiante || 'N/A'}</td>
                <td>${item.nota !== undefined ? item.nota : ''}</td>
                <td>${item.asistencia !== undefined ? item.asistencia : ''}</td>
                <td>${item.hrsEstudio !== undefined ? item.hrsEstudio : ''}</td>
                <td>${item.ejerciciosRes !== undefined ? item.ejerciciosRes : ''}</td>
                <td>${item.herramienta !== undefined ? (item.herramienta === 'si' ? 'Sí' : 'No') : ''}</td>
                <td>${estado}</td>
            `;
            row.classList.add(estado === 'Aprobado' ? 'estado-aprobado' : 'estado-reprobado');
        });
    };

    /**
     * Rellena la tabla Comparativa.
     * @param {Array} data - Array de objetos con datos comparativos.
     */
    const populateTableComparativa = (data) => {
        if (!tableComparativaBody) {
            console.error("Elemento tbody con ID 'tableComparativa' no encontrado.");
            return;
        }
        tableComparativaBody.innerHTML = '';
        if (!data || data.length === 0) {
            noDataComparativa.textContent = 'No hay datos comparativos disponibles.';
            noDataComparativa.style.display = 'block';
            return;
        }

        noDataComparativa.style.display = 'none';
        data.forEach((item, index) => { // Agregamos 'index'
            const row = tableComparativaBody.insertRow();

            // Datos del Examen 1
            const notaEx1 = item.examen1?.nota !== undefined ? item.examen1.nota : 'N/A';
            const asistenciaEx1 = item.examen1?.asistencia !== undefined ? item.examen1.asistencia : 'N/A';
            const hrsEstudioEx1 = item.examen1?.hrsEstudio !== undefined ? item.examen1.hrsEstudio : 'N/A';
            const ejerciciosResEx1 = item.examen1?.ejerciciosRes !== undefined ? item.examen1.ejerciciosRes : 'N/A';

            // Datos del Examen 2
            const notaEx2 = item.examen2?.nota !== undefined ? item.examen2.nota : 'N/A';
            const asistenciaEx2 = item.examen2?.asistencia !== undefined ? item.examen2.asistencia : 'N/A';
            const hrsEstudioEx2 = item.examen2?.hrsEstudio !== undefined ? item.examen2.hrsEstudio : 'N/A';
            const ejerciciosResEx2 = item.examen2?.ejerciciosRes !== undefined ? item.examen2.ejerciciosRes : 'N/A';
            const usoHerramientaEx2 = item.examen2?.herramienta !== undefined ? (item.examen2.herramienta === 'si' ? 'Sí' : 'No') : 'N/A';

            let promedioFinal = 'N/A';
            let promedioNumerico = null; // Para calcular el promedio general
            if (item.examen1?.nota !== undefined && item.examen2?.nota !== undefined) {
                promedioNumerico = (item.examen1.nota + item.examen2.nota) / 2;
                promedioFinal = promedioNumerico.toFixed(2);
            } else if (item.examen1?.nota !== undefined) {
                promedioNumerico = item.examen1.nota;
                promedioFinal = promedioNumerico.toFixed(2);
            } else if (item.examen2?.nota !== undefined) {
                promedioNumerico = item.examen2.nota;
                promedioFinal = promedioNumerico.toFixed(2);
            }

            row.innerHTML = `
                <td>${index + 1}</td> <td>${item.codigoEstudiante || 'N/A'}</td>
                <td>${notaEx1}</td>
                <td>${asistenciaEx1}</td>
                <td>${hrsEstudioEx1}</td>
                <td>${ejerciciosResEx1}</td>
                <td>${notaEx2}</td>
                <td>${asistenciaEx2}</td>
                <td>${hrsEstudioEx2}</td>
                <td>${ejerciciosResEx2}</td>
                <td>${usoHerramientaEx2}</td>
                <td>${promedioFinal}</td>
            `;
        });
    };

    /**
     * Actualiza las estadísticas en el resumen.
     * @param {Array} dataForExamen1 - Datos del examen 1.
     * @param {Array} dataForExamen2 - Datos del examen 2.
     * @param {Array} allStudentsComparativeData - Todos los datos procesados para la comparativa.
     */
    const updateStatisticsSummary = (dataForExamen1, dataForExamen2, allStudentsComparativeData) => {
        // Estadísticas para Examen 1
        const totalEx1 = dataForExamen1.length;
        const aprobadosEx1 = dataForExamen1.filter(item => item.nota >= 51).length;
        const reprobadosEx1 = totalEx1 - aprobadosEx1;

        totalExamen1Span.textContent = totalEx1;
        aprobadosExamen1Span.textContent = aprobadosEx1;
        reprobadosExamen1Span.textContent = reprobadosEx1;

        // Estadísticas para Examen 2
        const totalEx2 = dataForExamen2.length;
        const aprobadosEx2 = dataForExamen2.filter(item => item.nota >= 51).length;
        const reprobadosEx2 = totalEx2 - aprobadosEx2;

        totalExamen2Span.textContent = totalEx2;
        aprobadosExamen2Span.textContent = aprobadosEx2;
        reprobadosExamen2Span.textContent = reprobadosEx2;

        // Estadísticas Generales
        totalEstudiantesGeneralSpan.textContent = allStudentsComparativeData.length;

        let sumOfPromedios = 0;
        let countForPromedio = 0;

        allStudentsComparativeData.forEach(student => {
            let promedioNumerico = null;
            if (student.examen1?.nota !== undefined && student.examen2?.nota !== undefined) {
                promedioNumerico = (student.examen1.nota + student.examen2.nota) / 2;
            } else if (student.examen1?.nota !== undefined) {
                promedioNumerico = student.examen1.nota;
            } else if (student.examen2?.nota !== undefined) {
                promedioNumerico = student.examen2.nota;
            }

            if (promedioNumerico !== null) {
                sumOfPromedios += promedioNumerico;
                countForPromedio++;
            }
        });

        const promedioGeneralValue = countForPromedio > 0 ? (sumOfPromedios / countForPromedio).toFixed(2) : 'N/A';
        promedioGeneralSpan.textContent = promedioGeneralValue;
    };


    // --- Lógica de Carga y Procesamiento de Datos ---
    const loadAndProcessData = async () => {
        // Mostrar mensajes de carga en todas las tablas
        [noDataExamen1, noDataExamen2, noDataComparativa].forEach(el => {
            if (el) {
                el.textContent = 'Cargando datos...';
                el.style.display = 'block';
            }
        });

        // Limpiar las tablas antes de cargar nuevos datos
        if (tableExamen1Body) tableExamen1Body.innerHTML = '';
        if (tableExamen2Body) tableExamen2Body.innerHTML = '';
        if (tableComparativaBody) tableComparativaBody.innerHTML = '';

        // Resetear estadísticas
        totalExamen1Span.textContent = '0';
        aprobadosExamen1Span.textContent = '0';
        reprobadosExamen1Span.textContent = '0';
        totalExamen2Span.textContent = '0';
        aprobadosExamen2Span.textContent = '0';
        reprobadosExamen2Span.textContent = '0';
        totalEstudiantesGeneralSpan.textContent = '0';
        promedioGeneralSpan.textContent = 'N/A';


        try {
            const q = query(collection(db, EXAMS_COLLECTION_PATH), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);

            const studentDataMap = new Map();

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const codigoEstudiante = data.codigoEstudiante;
                const tipoExamen = data.tipoExamen;
                // Asegúrate de que `timestamp` sea una fecha válida para la comparación
                const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : (data.timestamp ? new Date(data.timestamp) : new Date(0));

                if (!codigoEstudiante || !tipoExamen || data.notaEx === undefined) {
                    return; // Saltar documentos incompletos
                }

                if (!studentDataMap.has(codigoEstudiante)) {
                    studentDataMap.set(codigoEstudiante, {
                        codigoEstudiante: codigoEstudiante,
                        examen1: null,
                        examen2: null
                    });
                }
                const studentEntry = studentDataMap.get(codigoEstudiante);

                // Solo guarda el registro más reciente para cada tipo de examen por estudiante
                if (tipoExamen === 'primer') {
                    if (!studentEntry.examen1 || timestamp > studentEntry.examen1._timestamp) {
                        studentEntry.examen1 = {
                            nota: data.notaEx,
                            asistencia: data.asistencia,
                            hrsEstudio: data.hrsEstudio,
                            ejerciciosRes: data.ejerciciosRes,
                            _timestamp: timestamp // Guardar timestamp para futuras comparaciones
                        };
                    }
                } else if (tipoExamen === 'segundo') {
                    if (!studentEntry.examen2 || timestamp > studentEntry.examen2._timestamp) {
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

            // Convertir el mapa a un array, filtrando los estudiantes sin ningún examen registrado si es necesario
            allProcessedStudentData = Array.from(studentDataMap.values()).filter(s => s.examen1 || s.examen2);
            console.log("Datos de estudiantes procesados:", allProcessedStudentData);

            const dataForExamen1Table = allProcessedStudentData
                                        .filter(s => s.examen1 !== null)
                                        .map(s => ({
                                            codigoEstudiante: s.codigoEstudiante,
                                            nota: s.examen1.nota,
                                            asistencia: s.examen1.asistencia,
                                            hrsEstudio: s.examen1.hrsEstudio,
                                            ejerciciosRes: s.examen1.ejerciciosRes
                                        }));

            const dataForExamen2Table = allProcessedStudentData
                                        .filter(s => s.examen2 !== null)
                                        .map(s => ({
                                            codigoEstudiante: s.codigoEstudiante,
                                            nota: s.examen2.nota,
                                            asistencia: s.examen2.asistencia,
                                            hrsEstudio: s.examen2.hrsEstudio,
                                            ejerciciosRes: s.examen2.ejerciciosRes,
                                            herramienta: s.examen2.herramienta
                                        }));

            const dataForComparativaTable = allProcessedStudentData;

            populateTableExamen1(dataForExamen1Table);
            populateTableExamen2(dataForExamen2Table);
            populateTableComparativa(dataForComparativaTable);
            updateStatisticsSummary(dataForExamen1Table, dataForExamen2Table, dataForComparativaTable); // Llamar a la función para actualizar el resumen

        } catch (error) {
            console.error(`Error al cargar datos de Firestore desde '${EXAMS_COLLECTION_PATH}':`, error);
            const errorMessage = `Error al cargar los datos: ${error.message}. Asegúrate de que la colección '${EXAMS_COLLECTION_PATH}' existe en tu Firestore y que tienes permisos de lectura.`;
            [noDataExamen1, noDataExamen2, noDataComparativa].forEach(el => {
                if (el) {
                    el.textContent = errorMessage;
                    el.style.color = 'red';
                    el.style.display = 'block';
                }
            });
            // También mostrar el error en el resumen si hay un problema general
            [totalExamen1Span, aprobadosExamen1Span, reprobadosExamen1Span,
             totalExamen2Span, aprobadosExamen2Span, reprobadosExamen2Span,
             totalEstudiantesGeneralSpan, promedioGeneralSpan].forEach(el => {
                if (el) el.textContent = 'Error';
             });
        }
    };

    // --- Lógica de activación de navegación (para el header) ---
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        // Si el archivo actual es tables.html, asegúrate de que 'Estadística de Estudiantes' esté activo
        if (currentPath === 'tables.html' && linkPath === 'tables.html') {
            link.classList.add('active');
        } else if (currentPath !== 'tables.html' && linkPath === currentPath) {
             // Para otros archivos, si el nombre del archivo coincide, actívalo
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    loadAndProcessData();
});