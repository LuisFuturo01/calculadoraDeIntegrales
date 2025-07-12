// Importa las funciones necesarias de Firebase SDK modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// Importa setDoc, doc, getDoc para poder verificar y especificar el ID del documento, y serverTimestamp
import { getFirestore, collection, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// TU CONFIGURACIÓN DE FIREBASE (¡ACTUALIZA ESTO CON TUS VALORES REALES!)
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

document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('startSimulation');
    const statusDiv = document.getElementById('status');

    startButton.addEventListener('click', async () => {
        startButton.disabled = true; // Deshabilita el botón para evitar múltiples clics
        statusDiv.textContent = 'Iniciando simulación de envío... Esto puede tardar un poco.';
        statusDiv.style.color = 'orange';

        const numStudents = 30;
        const studentCodes = [];
        const startStudentCode = 1726052;
        const endStudentCode = 1957034;

        // Generar códigos de estudiante únicos y aleatorios dentro del rango
        // Aseguramos que los códigos sean algo espaciados para simular variedad
        const codeDiff = Math.floor((endStudentCode - startStudentCode) / (numStudents * 1.5)); // Para espaciar un poco
        let currentCode = startStudentCode;
        for (let i = 0; i < numStudents; i++) {
            studentCodes.push(currentCode);
            currentCode += Math.floor(Math.random() * codeDiff) + 100; // Incremento aleatorio
            if (currentCode > endStudentCode) { // Asegurar que no se exceda el límite superior
                currentCode = startStudentCode + Math.floor(Math.random() * (endStudentCode - startStudentCode));
            }
        }
        // Shuffle para que no estén en orden estricto
        studentCodes.sort(() => Math.random() - 0.5);

        let sentCount = 0;
        let errorCount = 0;

        for (let i = 0; i < numStudents; i++) {
            const studentCode = studentCodes[i];

            // **********************************************
            // Lógica para el PRIMER EXAMEN
            // **********************************************
            const examType1 = 'primer';
            let herramienta1 = 'no'; // Por defecto, muchos no la usan en el primer examen
            let hrsEstudio1;
            let ejerciciosRes1;
            let attendance1;
            let notaEx1;

            if (Math.random() < 0.3) { // Un 30% de estudiantes sí usó la herramienta desde el principio (para variar)
                herramienta1 = 'si';
                hrsEstudio1 = Math.floor(Math.random() * 8) + 15; // 15-22 hrs, más estudio si usan herramienta
                ejerciciosRes1 = Math.floor(Math.random() * 2) + 4; // 4-5 ejercicios
                attendance1 = Math.floor(Math.random() * 2) + 4; // 4-5 asistencia
                notaEx1 = [60, 80, 100][Math.floor(Math.random() * 3)]; // Notas más altas
            } else { // El 70% no la usó
                hrsEstudio1 = Math.floor(Math.random() * 10) + 5; // 5-14 hrs
                ejerciciosRes1 = Math.floor(Math.random() * 4); // 0-3 ejercicios
                attendance1 = Math.floor(Math.random() * 4); // 0-3 asistencia
                notaEx1 = [20, 40, 60, 80][Math.floor(Math.random() * 4)]; // Notas más variadas, pueden ser buenas sin herramienta
            }

            const dataExam1 = {
                codigoEstudiante: String(studentCode),
                asistencia: attendance1,
                ejerciciosRes: ejerciciosRes1,
                hrsEstudio: hrsEstudio1,
                notaEx: notaEx1,
                herramienta: herramienta1,
                tipoExamen: examType1,
                timestamp: serverTimestamp()
            };

            try {
                const documentId1 = `${dataExam1.codigoEstudiante}_${dataExam1.tipoExamen}`;
                const docRef1 = doc(db, "EncuestaRendimiento", documentId1);
                const docSnap1 = await getDoc(docRef1);

                if (!docSnap1.exists()) { // Solo guardar si no existe
                    await setDoc(docRef1, dataExam1);
                    sentCount++;
                    statusDiv.textContent = `Enviados ${sentCount} de ${numStudents * 2} registros...`;
                } else {
                    console.warn(`Documento existente para ${documentId1}. Saltando.`);
                    errorCount++; // Contar como error de lógica (ya existe)
                }
            } catch (error) {
                console.error(`Error al guardar el primer examen para ${studentCode}:`, error);
                errorCount++;
            }

            // **********************************************
            // Lógica para el SEGUNDO EXAMEN
            // **********************************************
            const examType2 = 'segundo';
            let herramienta2;
            let hrsEstudio2;
            let ejerciciosRes2;
            let attendance2;
            let notaEx2;

            // Si en el primer examen NO usó la herramienta, hay una alta probabilidad de que la use y mejore
            if (herramienta1 === 'no') {
                herramienta2 = Math.random() < 0.8 ? 'si' : 'no'; // 80% de chance de que ahora sí la use
                if (herramienta2 === 'si') {
                    // Mejora significativa si empieza a usar la herramienta
                    hrsEstudio2 = hrsEstudio1 + Math.floor(Math.random() * 8) + 2; // +2 a +9 hrs
                    ejerciciosRes2 = Math.min(5, ejerciciosRes1 + Math.floor(Math.random() * 3) + 1); // +1 a +3, máx 5
                    attendance2 = Math.min(5, attendance1 + Math.floor(Math.random() * 3) + 1); // +1 a +3, máx 5
                    notaEx2 = Math.min(100, notaEx1 + [20, 40, 60][Math.floor(Math.random() * 3)]); // Mejora significativa
                    // Asegurar que la nota sea un múltiplo de 20
                    notaEx2 = Math.round(notaEx2 / 20) * 20;
                    if (notaEx2 > 100) notaEx2 = 100;
                } else {
                    // Si sigue sin usar la herramienta, mejoras leves o estancamiento
                    hrsEstudio2 = hrsEstudio1 + Math.floor(Math.random() * 4); // +0 a +3 hrs
                    ejerciciosRes2 = Math.min(5, ejerciciosRes1 + Math.floor(Math.random() * 2)); // +0 a +1, máx 5
                    attendance2 = Math.min(5, attendance1 + Math.floor(Math.random() * 2)); // +0 a +1, máx 5
                    notaEx2 = notaEx1 + [0, 20][Math.floor(Math.random() * 2)]; // Pequeña mejora o igual
                    notaEx2 = Math.round(notaEx2 / 20) * 20;
                    if (notaEx2 > 100) notaEx2 = 100;
                }
            } else { // Si ya usó la herramienta en el primer examen (mantenerse o mejorar levemente)
                herramienta2 = 'si'; // Asumimos que la sigue usando si ya lo hacía
                hrsEstudio2 = hrsEstudio1 + Math.floor(Math.random() * 3); // Pequeña mejora o igual
                ejerciciosRes2 = Math.min(5, ejerciciosRes1 + Math.floor(Math.random() * 2));
                attendance2 = Math.min(5, attendance1 + Math.floor(Math.random() * 2));
                notaEx2 = Math.min(100, notaEx1 + [0, 20][Math.floor(Math.random() * 2)]);
                notaEx2 = Math.round(notaEx2 / 20) * 20;
                if (notaEx2 > 100) notaEx2 = 100;
            }

            const dataExam2 = {
                codigoEstudiante: String(studentCode),
                asistencia: attendance2,
                ejerciciosRes: ejerciciosRes2,
                hrsEstudio: hrsEstudio2,
                notaEx: notaEx2,
                herramienta: herramienta2,
                tipoExamen: examType2,
                timestamp: serverTimestamp()
            };

            try {
                const documentId2 = `${dataExam2.codigoEstudiante}_${dataExam2.tipoExamen}`;
                const docRef2 = doc(db, "EncuestaRendimiento", documentId2);
                const docSnap2 = await getDoc(docRef2);

                if (!docSnap2.exists()) { // Solo guardar si no existe
                    await setDoc(docRef2, dataExam2);
                    sentCount++;
                    statusDiv.textContent = `Enviados ${sentCount} de ${numStudents * 2} registros...`;
                } else {
                    console.warn(`Documento existente para ${documentId2}. Saltando.`);
                    errorCount++; // Contar como error de lógica (ya existe)
                }
            } catch (error) {
                console.error(`Error al guardar el segundo examen para ${studentCode}:`, error);
                errorCount++;
            }
        }

        if (errorCount === 0) {
            statusDiv.textContent = `¡Simulación completada! Se enviaron ${sentCount} registros exitosamente a Firestore.`;
            statusDiv.style.color = 'green';
        } else {
            statusDiv.textContent = `Simulación completada con ${sentCount} envíos exitosos y ${errorCount} errores (posibles duplicados). Revisa la consola para más detalles.`;
            statusDiv.style.color = 'red';
        }
        startButton.disabled = false;
    });
});