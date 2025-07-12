// Importa las funciones necesarias de Firebase SDK modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Tu configuración de Firebase (ASEGÚRATE DE QUE ESTOS SON TUS VALORES REALES)
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

// Inicializa Firebase y obtiene la instancia de Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para obtener y mostrar los datos de la colección "EncuestaRendimiento"
const verDatosEncuesta = async () => {
    const dataDisplay = document.getElementById('dataDisplay');
    dataDisplay.innerHTML = '<p class="no-data">Cargando datos...</p>'; // Mensaje de carga

    try {
        const querySnapshot = await getDocs(collection(db, "EncuestaRendimiento"));
        
        if (querySnapshot.empty) {
            dataDisplay.innerHTML = '<p class="no-data">No hay datos de evaluación disponibles en tu base de datos.</p>';
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID Documento</th>
                        <th>Asistencia (días/5)</th>
                        <th>Ejercicios Resueltos (0-5)</th>
                        <th>Horas Estudio Semanal</th>
                        <th>Nota Examen (0-100)</th>
                        <th>Uso de Herramientas</th>
                        <th>Tipo de Examen</th> </tr>
                </thead>
                <tbody>
        `;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Mapeo para mostrar "Primer Examen" o "Segundo Examen" en lugar de "primer" o "segundo"
            const tipoExamenDisplay = {
                'primer': 'Primer Examen',
                'segundo': 'Segundo Examen'
            }[data.tipoExamen] || 'N/A'; // Si no existe o no coincide, muestra 'N/A'

            tableHTML += `
                <tr>
                    <td>${doc.id}</td>
                    <td>${data.asistencia !== undefined ? data.asistencia : 'N/A'}</td>
                    <td>${data.ejerciciosRes !== undefined ? data.ejerciciosRes : 'N/A'}</td>
                    <td>${data.hrsEstudio !== undefined ? data.hrsEstudio : 'N/A'}</td>
                    <td>${data.notaEx !== undefined ? data.notaEx : 'N/A'}</td>
                    <td>${data.herramienta !== undefined ? (data.herramienta === 'si' ? 'Sí' : 'No') : 'N/A'}</td>
                    <td>${tipoExamenDisplay}</td> </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;
        dataDisplay.innerHTML = tableHTML;

    } catch (error) {
        console.error("Error al obtener documentos de la encuesta: ", error);
        dataDisplay.innerHTML = '<p class="no-data" style="color: var(--color-resaltado-secundario);">Error al cargar los datos. Por favor, revisa la consola del navegador para más detalles.</p>';
    }
};

document.addEventListener('DOMContentLoaded', verDatosEncuesta);