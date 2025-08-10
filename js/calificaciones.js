// js/simulador.js

// js/simulador.js
// Requisitos cubiertos:
// - Datos remotos (fetch JSON)
// - HTML generado desde JS
// - Reemplazo de alert/prompt/confirm por SweetAlert2
// - Funciones con parámetros, objetos y arrays
// - Asincronía, validación y visualización con Chart.js

const MENSAJE_BIENVENIDA = "Bienvenido al sistema avanzado de calificaciones";
const CALIFICACION_MINIMA = 6;

// Estado del simulador
const state = {
  estudiante: { nombre: "" },
  materias: [], // [{ id, nombre, calificacion }]
  oferta: [],   // lista desde JSON
  chart: null
};

// Utilidades DOM
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function appendConsole(texto) {
  const salida = $("#resultadoConsola");
  salida.textContent += texto + "\n";
}
function clearConsole() {
  $("#resultadoConsola").textContent = "";
}

// Cargar materias (datos remotos simulados)
async function cargarOfertaMaterias() {
  try {
    const res = await fetch("data/materias.json");
    if (!res.ok) throw new Error("No se pudo cargar materias.json");
    const data = await res.json();
    state.oferta = data.oferta || [];
  } catch (err) {
    console.error(err);
    state.oferta = [];
    await Swal.fire({
      icon: "error",
      title: "Error cargando materias",
      text: "No fue posible cargar la lista de materias. Puedes escribirlas manualmente.",
    });
  }
}

// Registro de estudiante con SweetAlert2
async function registrarEstudiante() {
  const { value: nombre } = await Swal.fire({
    title: "Registro",
    input: "text",
    inputLabel: "Ingresa tu nombre completo",
    inputPlaceholder: "Nombre y apellidos",
    inputValue: state.estudiante.nombre || "",
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
    inputValidator: (value) => !value?.trim() && "El nombre es obligatorio"
  });
  if (!nombre) return;

  state.estudiante.nombre = nombre.trim();
  await Swal.fire({
    icon: "success",
    title: `Hola ${state.estudiante.nombre}!`,
    text: MENSAJE_BIENVENIDA,
    timer: 1400,
    showConfirmButton: false
  });
  clearConsole();
  appendConsole(`Estudiante: ${state.estudiante.nombre}`);
  render();
}

// Agregar fila de materia
function agregarMateriaFila(prefillNombre = "", prefillCalif = "") {
  const id = crypto.randomUUID();
  state.materias.push({ id, nombre: prefillNombre, calificacion: prefillCalif });
  renderTablaMaterias();
}

// Eliminar fila
function eliminarMateria(id) {
  state.materias = state.materias.filter(m => m.id !== id);
  renderTablaMaterias();
}

// Calcular promedio
function calcularPromedio(calificaciones = []) {
  if (!calificaciones.length) return 0;
  const suma = calificaciones.reduce((acc, v) => acc + Number(v || 0), 0);
  return suma / calificaciones.length;
}

// Mostrar resultados finales
async function mostrarResultados() {
  if (!state.estudiante.nombre) {
    await Swal.fire({ icon: "info", title: "Registra al estudiante" });
    return;
  }
  // Validar materias
  const limpias = [];
  for (const m of state.materias) {
    const nombre = String(m.nombre || "").trim();
    const cal = Number(m.calificacion);
    if (!nombre) continue; // omitir vacías
    if (Number.isNaN(cal) || cal < 0 || cal > 10) {
      await Swal.fire({ icon: "warning", title: "Calificación inválida", text: `Revisa la materia: ${nombre}` });
      return;
    }
    limpias.push({ nombre, calificacion: cal });
  }
  if (!limpias.length) {
    await Swal.fire({ icon: "info", title: "Agrega al menos una materia válida" });
    return;
  }

  clearConsole();
  appendConsole(`Resultados para ${state.estudiante.nombre}:`);
  appendConsole("----------------------------");

  const califs = [];
  limpias.forEach(({ nombre, calificacion }) => {
    const estado = calificacion >= CALIFICACION_MINIMA ? "Aprobada" : "Reprobada";
    appendConsole(`- ${nombre}: ${calificacion} (${estado})`);
    califs.push(calificacion);
  });

  const promedio = calcularPromedio(califs);
  const estadoFinal = promedio >= CALIFICACION_MINIMA ? "APROBADO" : "REPROBADO";
  appendConsole("----------------------------");
  appendConsole(`Promedio final: ${promedio.toFixed(2)} (${estadoFinal})`);

  // Modal de resultado
  await Swal.fire({
    icon: estadoFinal === "APROBADO" ? "success" : "error",
    title: `Promedio: ${promedio.toFixed(2)}`,
    html: `<b>${state.estudiante.nombre}</b> está <b>${estadoFinal}</b>`
  });

  // Graficar
  renderChart(califs);
}

// Reiniciar datos
async function reiniciar() {
  const confirm = await Swal.fire({
    title: "Reiniciar",
    text: "Se limpiará toda la captura.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, reiniciar",
    cancelButtonText: "Cancelar"
  });
  if (!confirm.isConfirmed) return;

  state.estudiante.nombre = "";
  state.materias = [];
  clearConsole();
  appendConsole("Sistema reiniciado.");
  render();
}

// Descargar reporte como JSON
function descargarReporte() {
  if (!state.estudiante.nombre) return;
  const data = {
    estudiante: state.estudiante,
    materias: state.materias.map(m => ({ nombre: m.nombre, calificacion: Number(m.calificacion) })),
    promedio: calcularPromedio(state.materias.map(m => Number(m.calificacion || 0)))
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_${state.estudiante.nombre.replace(/\s+/g,'_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Render principal (HTML generado desde JS)
function render() {
  const app = $("#app");
  app.innerHTML = `
    <div class="card">
      <div class="form-grid">
        <div class="input">
          <label>Nombre del estudiante</label>
          <input id="inpNombre" type="text" placeholder="Nombre y apellidos" value="${state.estudiante.nombre}" />
        </div>
        <div class="input">
          <label>Materia sugerida</label>
          <select id="selMateria">
            <option value="">(Selecciona de la oferta)</option>
            ${state.oferta.map(m => `<option value="${m}">${m}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="controls" style="margin-top:.8rem;">
        <button id="btnGuardarNombre">Guardar estudiante</button>
        <button class="secondary" id="btnAgregarFila">Agregar materia</button>
        <button class="ghost" id="btnPrecargar">Precargar ejemplo</button>
      </div>
    </div>

    <div class="card">
      <div class="flex-between">
        <h3>Materias y calificaciones</h3>
        <div>
          <button class="secondary" id="btnResultados">Mostrar Resultados</button>
          <button class="ghost" id="btnDescargar" ${!state.estudiante.nombre ? 'disabled' : ''}>Descargar reporte</button>
          <button class="danger" id="btnReiniciar">Reiniciar</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th style="width:50%">Materia</th>
              <th style="width:25%">Calificación (0-10)</th>
              <th class="right" style="width:25%">Acciones</th>
            </tr>
          </thead>
          <tbody id="tbodyMaterias"></tbody>
        </table>
      </div>
      <div class="canvas-wrap">
        <canvas id="chart" height="120"></canvas>
      </div>
    </div>
  `;

  // Eventos
  $("#btnGuardarNombre").addEventListener("click", () => {
    const nombre = $("#inpNombre").value.trim();
    if (!nombre) { Swal.fire({icon:"info", title:"Escribe un nombre"}); return; }
    state.estudiante.nombre = nombre;
    appendConsole(`Estudiante: ${nombre}`);
    render();
  });

  $("#btnAgregarFila").addEventListener("click", () => {
    const sel = $("#selMateria");
    const sugerida = sel.value || "";
    agregarMateriaFila(sugerida, "");
  });

  $("#btnPrecargar").addEventListener("click", () => {
    if (!state.materias.length) {
      const ejemplo = [
        { nombre: state.oferta[0] || "Matemáticas", calificacion: 8 },
        { nombre: state.oferta[2] || "Programación", calificacion: 9.5 },
        { nombre: state.oferta[4] || "Bases de Datos", calificacion: 6.5 }
      ];
      for (const e of ejemplo) agregarMateriaFila(e.nombre, e.calificacion);
      Swal.fire({icon:"success", title:"Datos de ejemplo cargados"});
    }
  });

  $("#btnResultados").addEventListener("click", mostrarResultados);
  $("#btnReiniciar").addEventListener("click", reiniciar);
  $("#btnDescargar").addEventListener("click", descargarReporte);

  renderTablaMaterias();
}

function renderTablaMaterias() {
  const tbody = $("#tbodyMaterias");
  tbody.innerHTML = state.materias.map((m) => `
    <tr>
      <td>
        <input data-id="${m.id}" data-field="nombre" type="text" placeholder="Nombre de la materia" value="${m.nombre ?? ''}" />
      </td>
      <td>
        <input data-id="${m.id}" data-field="calificacion" type="number" min="0" max="10" step="0.1" placeholder="0-10" value="${m.calificacion ?? ''}" />
      </td>
      <td class="right">
        <button class="danger" data-del="${m.id}">Eliminar</button>
      </td>
    </tr>
  `).join("");

  // Delegación de eventos para inputs y eliminar
  tbody.addEventListener('input', (e) => {
    const id = e.target.getAttribute('data-id');
    const field = e.target.getAttribute('data-field');
    if (!id || !field) return;
    const fila = state.materias.find(x => x.id === id);
    if (!fila) return;
    fila[field] = field === 'calificacion' ? e.target.valueAsNumber : e.target.value;
  });

  tbody.querySelectorAll('button[data-del]').forEach(btn => {
    btn.addEventListener('click', () => eliminarMateria(btn.getAttribute('data-del')));
  });

  // Actualizar gráfico si existe
  if (state.chart) {
    const califs = state.materias.map(m => Number(m.calificacion || 0));
    renderChart(califs, { silent: true });
  }
}

function renderChart(califs, opts = {}) {
  const ctx = $("#chart");
  const labels = state.materias.map(m => m.nombre || 'Materia');
  const aprobados = califs.filter(c => c >= CALIFICACION_MINIMA).length;
  const reprobados = califs.length - aprobados;

  // Bar: calificaciones por materia
  if (!state.chart) {
    state.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Calificación', data: califs }]
      },
      options: { responsive: true, animation: { duration: opts.silent ? 0 : 600 } }
    });
  } else {
    state.chart.data.labels = labels;
    state.chart.data.datasets[0].data = califs;
    state.chart.update();
  }

  // Escribir resumen rápido debajo de la tabla
  const resumenId = 'resumenFast';
  let resumen = document.getElementById(resumenId);
  if (!resumen) {
    resumen = document.createElement('div');
    resumen.id = resumenId;
    resumen.style.marginTop = '.6rem';
    ctx.parentElement.appendChild(resumen);
  }
  const prom = calcularPromedio(califs).toFixed(2);
  const estado = prom >= CALIFICACION_MINIMA ? 'ok' : 'bad';
  resumen.innerHTML = `
    <span class="tag ${estado}">Promedio: ${prom}</span>
    <span class="tag ok">Aprobadas: ${aprobados}</span>
    <span class="tag bad">Reprobadas: ${reprobados}</span>
  `;
}

// Inicio
(async function init() {
  await cargarOfertaMaterias();
  render();
})();
