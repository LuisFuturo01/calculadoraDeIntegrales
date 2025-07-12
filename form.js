// Importa las funciones necesarias de Firebase SDK modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// Importa setDoc, doc, getDoc para poder verificar y especificar el ID del documento, y serverTimestamp
import { getFirestore, collection, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Tu configuración de Firebase (DEBES MANTENER TUS VALORES REALES AQUÍ)
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

document.addEventListener('DOMContentLoaded', function () {
    const studyForm = document.getElementById('studyForm');

    studyForm.addEventListener('submit', function (event) {
        event.preventDefault();

        let isValid = true;

        // Limpiar todos los mensajes de error al inicio de cada intento de envío
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.textContent = '';
            msg.style.display = 'none';
        });

        function showError(id, mensaje) {
            const el = document.getElementById(id);
            el.textContent = mensaje;
            el.style.display = 'block';
            isValid = false;
        }

        // Obtener valores de los campos
        const studentCode = document.getElementById('studentCode').value.trim();
        const tools = document.querySelector('input[name="toolsUsed"]:checked');
        const studyTime = parseInt(document.getElementById('studyTime').value);
        const exercisesSolved = parseInt(document.getElementById('exercisesSolved').value);
        const examScore = parseInt(document.getElementById('examScore').value);
        const attendance = parseInt(document.getElementById('attendance').value);
        const examType = document.getElementById('examType').value;

        // Validaciones básicas de campos
        if (studentCode === '') {
            showError('studentCodeError', 'Por favor, ingresa el Código del Estudiante.');
        }
        if (!tools) {
            showError('toolsUsedError', 'Por favor, selecciona si has usado herramientas.');
        }
        if (isNaN(studyTime) || studyTime < 0) {
            showError('studyTimeError', 'Ingresa un tiempo de estudio válido (ej: 10 horas).');
        }
        if (isNaN(exercisesSolved) || exercisesSolved < 0 || exercisesSolved > 5) {
            showError('exercisesSolvedError', 'Ingresa un número entre 0 y 5.');
        }
        if (isNaN(examScore) || examScore < 0 || examScore > 100 || examScore % 20 !== 0) {
            showError('examScoreError', 'Ingresa una nota válida (0, 20, 40, 60, 80, 100).');
        }
        if (isNaN(attendance) || attendance < 0 || attendance > 5) {
            showError('attendanceError', 'Ingresa un número entre 0 y 5.');
        }
        if (examType === '') {
            showError('examTypeError', 'Por favor, selecciona el tipo de examen.');
        }
        
        // Si todas las validaciones básicas pasan, intentar guardar los datos
        if (isValid) {
            guardarDatos();
        }
    });
});

const guardarDatos = async () => {
    // Obtener los valores de los campos (ya validados por el listener del submit)
    const studentCodeValue = document.getElementById('studentCode').value.trim();
    const herramientaValue = document.querySelector('input[name="toolsUsed"]:checked').value;
    const hrsEstudioValue = parseInt(document.getElementById('studyTime').value);
    const ejerciciosResValue = parseInt(document.getElementById('exercisesSolved').value);
    const notaExValue = parseInt(document.getElementById('examScore').value);
    const asistenciaValue = parseInt(document.getElementById('attendance').value);
    const examTypeValue = document.getElementById('examType').value;

    try {
        // Construye el ID del documento para este estudiante y tipo de examen
        const documentId = `${studentCodeValue}_${examTypeValue}`;
        const docRef = doc(db, "EncuestaRendimiento", documentId);

        // **Paso de validación clave: Verificar si el documento ya existe**
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Si el documento ya existe, significa que este examen ya fue enviado por este estudiante.
            // Mostramos un mensaje de alerta y no guardamos.
            alert(`El estudiante con código ${studentCodeValue} ya ha enviado el ${examTypeValue === 'primer' ? 'Primer Examen' : 'Segundo Examen'}. No se permiten múltiples envíos para el mismo examen.`);
            console.warn(`Intento de re-envío detectado para el código ${studentCodeValue} y examen ${examTypeValue}.`);
            return; // Detener la función aquí
        }

        // Si el documento NO existe, procedemos a guardarlo
        await setDoc(docRef, {
            codigoEstudiante: studentCodeValue,
            asistencia: asistenciaValue,
            ejerciciosRes: ejerciciosResValue,
            hrsEstudio: hrsEstudioValue,
            notaEx: notaExValue,
            herramienta: herramientaValue,
            tipoExamen: examTypeValue,
            timestamp: serverTimestamp() // Marca de tiempo del servidor para ordenar
        });
        alert("¡Datos guardados exitosamente!");
        document.getElementById('studyForm').reset(); // Limpiar el formulario después del envío exitoso
    } catch (error) {
        console.error("Error al guardar el documento: ", error);
        alert("Error al guardar los datos. Por favor, inténtalo de nuevo.");
    }
};
