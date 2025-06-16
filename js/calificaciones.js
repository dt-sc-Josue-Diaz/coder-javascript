// js/simulador.js

const mensajeBienvenida = "Bienvenido al simulador avanzado de calificaciones";
let nombreEstudiante = "";
let materias = [];
let calificaciones = [];
const calificacionMinima = 6;

// Mostrar texto en pantalla
function mostrarEnPantalla(texto) {
    const salida = document.getElementById("resultadoConsola");
    salida.textContent += texto + "\n";
}

// Limpiar salida
function limpiarPantalla() {
    const salida = document.getElementById("resultadoConsola");
    salida.textContent = "";
}

// Función para registrar al estudiante
function registrarEstudiante() {
    nombreEstudiante = prompt("Por favor, ingresa tu nombre completo:");
    if (nombreEstudiante) {
        alert(`Hola ${nombreEstudiante}!\n${mensajeBienvenida}`);
        limpiarPantalla();
        mostrarEnPantalla(`Estudiante: ${nombreEstudiante}`);
    }
}

// Ingreso de materias y calificaciones
function ingresarDatos() {
    materias = [];
    calificaciones = [];

    let numMaterias = parseInt(prompt("¿Cuántas materias cursaste?"));
    while (isNaN(numMaterias) || numMaterias <= 0) {
        numMaterias = parseInt(prompt("Número inválido. Ingresa un número mayor a cero:"));
    }

    for (let i = 0; i < numMaterias; i++) {
        let materia = prompt(`Ingresa el nombre de la materia ${i + 1}:`);
        materias.push(materia);

        let calif;
        do {
            calif = parseFloat(prompt(`Ingresa la calificación en '${materia}':`));
        } while (isNaN(calif) || calif < 0 || calif > 10);

        calificaciones.push(calif);
    }

    mostrarEnPantalla("Datos cargados correctamente.");
}

// Calcular promedio
function calcularPromedio() {
    let suma = calificaciones.reduce((acc, val) => acc + val, 0);
    return suma / calificaciones.length;
}

// Mostrar resultados finales
function mostrarResultados() {
    limpiarPantalla();
    mostrarEnPantalla(`Resultados para ${nombreEstudiante}:`);
    mostrarEnPantalla("----------------------------");

    materias.forEach((materia, i) => {
        let estado = calificaciones[i] >= calificacionMinima ? "Aprobada" : "Reprobada";
        mostrarEnPantalla(`- ${materia}: ${calificaciones[i]} (${estado})`);
    });

    const promedio = calcularPromedio();
    let estadoFinal = promedio >= calificacionMinima ? "APROBADO" : "REPROBADO";

    mostrarEnPantalla("----------------------------");
    mostrarEnPantalla(`Promedio final: ${promedio.toFixed(2)} (${estadoFinal})`);
    alert(`${nombreEstudiante}, tu promedio es: ${promedio.toFixed(2)}\nEstado final: ${estadoFinal}`);
}

// Reiniciar datos
function reiniciarSimulacion() {
    limpiarPantalla();
    nombreEstudiante = "";
    materias = [];
    calificaciones = [];
    alert("Simulación reiniciada.");
    mostrarEnPantalla("Simulación reiniciada.");
}
