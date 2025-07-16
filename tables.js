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

    // --- Elementos del DOM ---
    const tableExamen1Body = document.getElementById('tableExamen1');
    const noDataExamen1 = document.getElementById('noDataExamen1');

    const tableExamen2Body = document.getElementById('tableExamen2');
    const noDataExamen2 = document.getElementById('noDataExamen2');

    const tableComparativaBody = document.getElementById('tableComparativa');
    const noDataComparativa = document.getElementById('noDataComparativa');

    let allProcessedStudentData = [];

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
        data.forEach(item => {
            const row = tableExamen1Body.insertRow();
            const estado = item.nota >= 51 ? 'Aprobado' : 'Reprobado';
            row.innerHTML = `
                <td>${item.codigoEstudiante || 'N/A'}</td>
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
        data.forEach(item => {
            const row = tableExamen2Body.insertRow();
            const estado = item.nota >= 51 ? 'Aprobado' : 'Reprobado';
            row.innerHTML = `
                <td>${item.codigoEstudiante || 'N/A'}</td>
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
        data.forEach(item => {
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
            if (item.examen1?.nota !== undefined && item.examen2?.nota !== undefined) {
                promedioFinal = ((item.examen1.nota + item.examen2.nota) / 2).toFixed(2);
            } else if (item.examen1?.nota !== undefined) {
                promedioFinal = item.examen1.nota.toFixed(2);
            } else if (item.examen2?.nota !== undefined) {
                promedioFinal = item.examen2.nota.toFixed(2);
            }

            row.innerHTML = `
                <td>${item.codigoEstudiante || 'N/A'}</td>
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


        try {
            const q = query(collection(db, EXAMS_COLLECTION_PATH), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);

            const studentDataMap = new Map();

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const codigoEstudiante = data.codigoEstudiante;
                const tipoExamen = data.tipoExamen;
                const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : (data.timestamp ? new Date(data.timestamp) : new Date(0));

                if (!codigoEstudiante || !tipoExamen || data.notaEx === undefined) {
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
                    if (!studentEntry.examen1 || timestamp > studentEntry.examen1._timestamp) {
                        studentEntry.examen1 = {
                            nota: data.notaEx,
                            asistencia: data.asistencia,
                            hrsEstudio: data.hrsEstudio,
                            ejerciciosRes: data.ejerciciosRes,
                            _timestamp: timestamp
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

            allProcessedStudentData = Array.from(studentDataMap.values());
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
        }
    };

    // --- Lógica de activación de navegación (para el header) ---
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    loadAndProcessData();
});