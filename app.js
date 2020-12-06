// DOM
const generateBtn = document.getElementById("generateProcesses");
const start = document.getElementById("start");
const pcbTable = document.getElementById("pcbTable");
const cyclesInput = document.getElementById("cyclesInput");
const resetBtn = document.getElementById("resetBtn");
const logsDiv = document.getElementById("logs");
const displayCycle = document.getElementById("displayCycle");

// Colas de procesos.
const processes = [];
const hightPriorityProcesses = [];
const mediumPriorityProcesses = [];
const lowPriorityProcesses = [];
const blockedProcesses = [];
const finishedProcesses = [];

// Variables.
let cycles; //La cantidad de ciclos que se ejecutarán.
let currentIndex = 0; //El índice actual de el arreglo en el que se esté.
let currentPriority = 3; //La prioridad que se está ejecutando.
let currentInstruction; //La instrucción actual.
let currentCycle = 0; //Contador de ciclos.
let interval; //Intervalo en el que se ejecuta el código.
let remainingInstructions; //Cantidad de instrucciones restantes.
let logs = ""; //Guarda la salida para crear un archivo.

let currentId = 1; //El id actual asignable.

// Event listeners

// Botón para reiniciar todo.
resetBtn.addEventListener("click", () => {
  clearInterval(interval);
  logs = "";
  start.classList.remove("disabled");
  generateBtn.classList.remove("disabled");
  start.disabled = false;
  generateBtn.disabled = false;
  cyclesInput.disabled = false;
  currentId = 1;
  currentIndex = 0;
  currentPriority = 3;
  currentCycle = 0;
  processes.length = 0;
  hightPriorityProcesses.length = 0;
  mediumPriorityProcesses.length = 0;
  lowPriorityProcesses.length = 0;
  blockedProcesses.length = 0;
  finishedProcesses.length = 0;
  paintTable();
  logsDiv.innerText = "";
  cyclesInput.value = "";
  displayCycle.innerText = "";
  cycles = 0;
});

generateBtn.addEventListener("click", () => {
  if (!cycles) {
    //Primero verifica que los ciclos no se hayan definido antes.
    cycles = parseInt(cyclesInput.value); //En caso de que no hayan sido definidos, les asigna un valor.
    if (!cycles)
      //Si el input de ciclos estaba vacío, se entrará a éste if.
      return alert(
        "Ingrese la cantidad de ciclos antes de generar un proceso."
      );
    if (cycles < 5) return alert("Deben haber más de cinco ciclos."); //La cantidad mínima de ciclos es 5.
    remainingInstructions = cycles; //No pueden haber más instrucciones que ciclos.
    cyclesInput.disabled = true; //Desactiva el input de ciclos.
  }
  const process = createRandomProcess(); //Crea un proceso aleatorio..
  processes.push(process); //Agrega el proceso a la lista de procesos.
  switch (
    process.priority //Agrega el proceso a una lista en base a su prioridad.
  ) {
    case 1:
      lowPriorityProcesses.push(process);
      break;
    case 2:
      mediumPriorityProcesses.push(process);
      break;
    case 3:
      hightPriorityProcesses.push(process);
      break;
  }
  paintTable(); //Imprime la lista de procesos.
});

// Evento que sucede al iniciar todos los procesos.
start.addEventListener("click", () => {
  start.disabled = true; //Desactiva el botón para iniciar.
  start.classList.add("disabled");
  generateBtn.disabled = true; //Desactiva el botón para crear procesos.
  generateBtn.classList.add("disabled");
  setStateToReady(); //Cambia el estado de todos los procesos a listo.
  interval = setInterval(() => {
    //Se inicia el intervalo donde sucede todo.
    displayCycle.innerText = currentCycle; //Imprime el ciclo actual.
    //Sólo puede entrar a éste if si al menos un proceso no está bloqueado.
    if (
      blockedProcesses.length + finishedProcesses.length !==
      processes.length
    ) {
      fetchNextInstruction(); //Obtiene la siguiente instrucción.
      if (currentInstruction) {
        //Sólo entra aquí en caso de que la instrucción no venga vacía.
        //Obtiene los datos de la instrucción actual.
        const {
          programCounter,
          state,
          priority,
          instrunctions,
          blockedInstruction,
          waitingEvent,
          displayState,
        } = currentInstruction;
        // Imprime la instrucción actual en el log.
        const record = `${programCounter}/${state}/${priority}/${instrunctions}/${blockedInstruction}/${waitingEvent};`;
        logsDiv.innerText += record;
        logs += record;
        // Imprime la tabla.
        paintTable();
      }
    }
    // Recorre todos los procesos bloqueados.
    for (let blockedProcess of blockedProcesses) {
      // Va restando un ciclo a la cantidad de ciclos bloqueados.
      blockedProcess.unlockIn -= 1;
      // Sólo entra al if si la cantidad de ciclos bloqueados restantes es cero.
      if (blockedProcess.unlockIn === 0) {
        // Cambia el estado a listo
        blockedProcess.state = 1;
        blockedProcess.displayState = "Listo";
        // Encuentra el índice del ciclo bloqueado.
        const index = blockedProcesses.findIndex(
          (process) => process.id === blockedProcess.id
        );
        // Elimina el proceso de la lista de procesos bloqueados.
        blockedProcesses.splice(index, 1);
        // Imprime la tabla.
        paintTable();
      }
    }
    // Comprueba que no se cumplan las condiciones para terminar el programa.
    stopInterval();
    // Aumenta un ciclo.
    currentCycle++;
  }, 1000);
});

// Funciones

function createRandomProcess() {
  let instrunctions = Math.round(Math.random() * 6) + 5;
  instrunctions =
    instrunctions > remainingInstructions
      ? remainingInstructions
      : instrunctions;
  const blockedInstruction = Math.round(Math.random() * instrunctions);
  const process = {
    id: currentId,
    state: 0,
    displayState: "Nuevo",
    priority: Math.round(Math.random() * 3) || 1,
    instrunctions,
    blockedInstruction,
    waitingEvent: Math.round(Math.random()) ? 3 : 5,
    programCounter: currentId * 1000,
    unlockIn: 0,
  };
  currentId++;
  remainingInstructions -= instrunctions;
  if (remainingInstructions <= 5) generateBtn.disabled = true;
  return process;
}

function paintTable() {
  let tableBody = "";
  for (let process of processes) {
    const tableRow = createTableRow(process);
    tableBody += tableRow;
  }
  pcbTable.innerHTML = tableBody;
}

function createTableRow(process) {
  const {
    id,
    state,
    priority,
    instrunctions,
    displayState,
    blockedInstruction,
    waitingEvent,
    programCounter,
  } = process;
  let rowClass;
  switch (state) {
    case 0:
      rowClass = "new";
      break;
    case 1:
      rowClass = "ready";
      break;
    case 2:
      rowClass = "in-process";
      break;
    case 3:
      rowClass = "blocked";
      break;
    case 4:
      rowClass = "ended";
      break;
  }
  return `<tr class=${rowClass}>
  <td>${id * 1000}</td>
  <td>${programCounter}</td>
  <td>${displayState}(${state})</td>
  <td>${priority}</td>
  <td>${instrunctions}</td>
  <td>${blockedInstruction}</td>
  <td>${waitingEvent}</td>
  </tr>`;
}

function fetchNextInstruction() {
  let process;
  switch (currentPriority) {
    case 3:
      process = hightPriorityProcesses[currentIndex];
      break;
    case 2:
      process = mediumPriorityProcesses[currentIndex];
      break;
    case 1:
      process = lowPriorityProcesses[currentIndex];
      break;
  }
  if (process) {
    if (process.state !== 3) {
      if (process.state !== 2) {
        process.state = 2;
        process.displayState = "En proceso";
        paintTable();
      }
      currentInstruction = process;

      if (
        process.programCounter ===
        process.id * 1000 + process.instrunctions
      ) {
        process.state = 4;
        process.displayState = "Terminado";
        finishedProcesses.push(process);
        removeProcess();
        paintTable();
      } else if (
        process.programCounter ===
        process.id * 1000 + process.blockedInstruction
      ) {
        process.programCounter++;
        process.state = 3;
        process.displayState = "Bloqueado";
        process.unlockIn = process.waitingEvent === 3 ? 13 : 27;
        blockedProcesses.push(process);
        paintTable();
      } else {
        process.programCounter++;
      }
    } else {
      changeCurrentIndex();
    }
  } else {
    changeCurrentPriority();
  }
}

function changeCurrentIndex() {
  if (processes.length === blockedProcesses.length + finishedProcesses.length)
    return;
  currentIndex++;
  if (
    (currentPriority === 3 && currentIndex === hightPriorityProcesses.length) ||
    (currentPriority === 2 &&
      currentIndex === mediumPriorityProcesses.length) ||
    (currentPriority === 1 && currentIndex === lowPriorityProcesses.length)
  ) {
    if (!stopInterval()) {
      changeCurrentPriority();
    }
  } else {
    if (!stopInterval()) {
      fetchNextInstruction();
    }
  }
}

function changeCurrentPriority() {
  if (processes.length === blockedProcesses.length + finishedProcesses.length)
    return;
  currentPriority--;
  if (currentPriority === 0) currentPriority = 3;
  currentIndex = 0;
  if (!stopInterval()) {
    fetchNextInstruction();
  }
}

function setStateToReady() {
  for (process of processes) {
    process.state = 1;
    process.displayState = "Listo";
  }
  paintTable();
}

function stopInterval() {
  if (
    currentCycle === cycles ||
    (hightPriorityProcesses.length === 0 &&
      mediumPriorityProcesses.length === 0 &&
      lowPriorityProcesses.length === 0)
  ) {
    console.log("fin");
    download();
    clearInterval(interval);
    return true;
  } else {
    return false;
  }
}

function removeProcess() {
  switch (currentPriority) {
    case 3:
      hightPriorityProcesses.splice(currentIndex, 1);
      break;
    case 2:
      mediumPriorityProcesses.splice(currentIndex, 1);
      break;
    case 1:
      lowPriorityProcesses.splice(currentIndex, 1);
      break;
  }
}

function download() {
  // Crea un archivo con el string geneardo.
  let file = new Blob([logs], { type: "text/plain" });
  // Para Internet explorer
  if (window.navigator.msSaveOrOpenBlob)
    // Guarda el archivo.
    window.navigator.msSaveOrOpenBlob(
      file,
      `Registro de proceso ${Date.now()}`
    );
  // Para los demás navegadores.
  else {
    // Crea un elemento tipo achor (para enlaces)
    let a = document.createElement("a");
    // Crea la url del archivo.
    let url = URL.createObjectURL(file);
    // Le asigna la url al elemento anchor
    a.href = url;
    // Le asigna un nombre por defecto al archivo a guardar.
    a.download = `Registro de proceso ${Date.now()}`;
    // Agrega el elemento a la página anchor.
    document.body.appendChild(a);
    // Clickea el elemento anchor.
    a.click();
    setTimeout(function () {
      // Remueve el elemento anchor de la página
      document.body.removeChild(a);
      // Elimina la url generada previamente.
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}
