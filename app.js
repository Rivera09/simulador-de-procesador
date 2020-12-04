// DOM
const generateBtn = document.getElementById("generateProcesses");
const start = document.getElementById("start");
const pcbTable = document.getElementById("pcbTable");
const cyclesInput = document.getElementById("cyclesInput");
const stop = document.getElementById("force");

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
// let processExecutionCounter = 0; //Contador para verficar que no hay monopolio.
let currentCycle = 0; //Contador de ciclos.
let interval; //Intervalo en el que se ejecuta el código.
let remainingInstructions;
// const newProcesses = []; Tal vez no sea necesario

let currentId = 1;
let testcounter = 3;

// Event listeners
stop.addEventListener("click", () => {
  clearInterval(interval);
});
generateBtn.addEventListener("click", () => {
  if (!cycles) {
    cycles = parseInt(cyclesInput.value);
    if (!cycles)
      return alert(
        "Ingrese la cantidad de ciclos antes de generar un proceso."
      );
    if (cycles < 5) return alert("Deben haber más de cinco ciclos.");
    remainingInstructions = cycles;
    cyclesInput.disabled = true;
  }
  const process = createRandomProcess();
  processes.push(process);
  switch (process.priority) {
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
  paintTable();
});

start.addEventListener("click", () => {
  // console.log(processes);
  start.disabled = true;
  generateBtn.disabled = true;
  setStateToReady();
  interval = setInterval(() => {
    console.log("ciclo:", currentCycle);
    if (blockedProcesses.length !== processes.length) {
      fetchNextInstruction();
      if (currentInstruction) {
        const {
          programCounter,
          state,
          priority,
          instrunctions,
          blockedInstruction,
          waitingEvent,
        } = currentInstruction;
        console.log(
          `${programCounter}/${state}/${priority}/${instrunctions}/${blockedInstruction}/${waitingEvent}`
        );
      }
    }
    for (let blockedProcess of blockedProcesses) {
      blockedProcess.unlockIn -= 1;
      if (blockedProcess.unlockIn === 0) {
        // console.log("fin de la sentencia");
        blockedProcess.state = "Listo";
        const index = blockedProcesses.findIndex(
          (process) => process.id === blockedProcess.id
        );
        blockedProcesses.splice(index, 1);
        paintTable();
      }
    }
    stopInterval();
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
    state: "Nuevo",
    priority: Math.round(Math.random() * 3) || 1,
    // priority: 1,
    // priority: testcounter,
    // priority: 3,
    // instrunctions: Math.round(Math.random() * 100) + 1,
    instrunctions,
    // instrunctions: 10,
    blockedInstruction,
    waitingEvent: Math.round(Math.random()) ? 3 : 5,
    // waitingEvent: 3,
    programCounter: currentId * 1000,
    unlockIn: 0,
  };
  currentId++;
  testcounter--;
  remainingInstructions -= instrunctions;
  if (remainingInstructions <= 5) generateBtn.disabled = true;
  return process;
}

function paintTable() {
  // let tableBody =
  //   "<tr><th>ID</th><th>Estado</th><th>Prioridad</th><th>Instrucciones</th></tr><tr><td>100</td><td>Nuevo</td><td>3</td><td>5</td></tr>";
  let tableBody =
    "<tr><th>ID</th><th>Estado</th><th>Prioridad</th><th>Instrucciones</th></tr>";
  for (let process of processes) {
    const tableRow = createTableRow(process);
    tableBody += tableRow;
  }
  pcbTable.innerHTML = tableBody;
}

function createTableRow(process) {
  const { id, state, priority, instrunctions } = process;
  return `<tr><td>${
    id * 1000
  }</td><td>${state}</td><td>${priority}</td><td>${instrunctions}</td></tr>`;
}

function fetchNextInstruction() {
  // console.log("fetch");
  let process;
  switch (currentPriority) {
    case 3:
      process = hightPriorityProcesses[currentIndex];
      // if (process?.programCounter === process?.id + process?.instrunctions) {
      //   hightPriorityProcesses.splice(currentIndex, 1);
      // }
      break;
    case 2:
      process = mediumPriorityProcesses[currentIndex];
      // if (process?.programCounter === process?.id + process?.instrunctions) {
      //   mediumPriorityProcesses.splice(currentIndex, 1);
      // }
      break;
    case 1:
      process = lowPriorityProcesses[currentIndex];
      // if (process?.programCounter === process?.id + process?.instrunctions) {
      //   lowPriorityProcesses.splice(currentIndex, 1);
      // }
      break;
  }
  if (process) {
    if (process.state !== "Bloqueado") {
      if (process.state !== "En progeso") {
        process.state = "En proceso";
        paintTable();
      }
      currentInstruction = process;

      if (
        process.programCounter ===
        process.id * 1000 + process.instrunctions
      ) {
        process.state = "Terminado";
        finishedProcesses.push(process);
        removeProcess();
        paintTable();
        // changeCurrentIndex();
      } else if (
        process.programCounter ===
        process.id * 1000 + process.blockedInstruction
      ) {
        process.programCounter++;
        process.state = "Bloqueado";
        process.unlockIn = process.waitingEvent === 3 ? 13 : 27;
        blockedProcesses.push(process);
        paintTable();
      } else {
        process.programCounter++;
        // processExecutionCounter++;
        // if (processExecutionCounter >= 6) {
        //   process.state = "Listo";
        //   changeCurrentIndex();
        // }
      }
    } else {
      // console.log("fetch -> change index");
      // console.log(
      //   `El proceso ${process.programCounter} está bloqueado durante las siguientes ${process.unlockIn}`
      // );
      changeCurrentIndex();
    }
  } else {
    // console.log("fetch -> change priority");
    // console.log(`No hay procesos en la cola ${currentPriority}`);
    changeCurrentPriority();
  }
}

function changeCurrentIndex() {
  // console.log("changeIndex");
  if (processes.length === blockedProcesses.length + finishedProcesses.length)
    return;
  currentIndex++;
  // processExecutionCounter = 0;
  if (
    (currentPriority === 3 && currentIndex === hightPriorityProcesses.length) ||
    (currentPriority === 2 &&
      currentIndex === mediumPriorityProcesses.length) ||
    (currentPriority === 1 && currentIndex === lowPriorityProcesses.length)
  ) {
    if (!stopInterval()) {
      // console.log("change index -> change priority");
      // console.log(`El índice ya está al final de la cola ${currentPriority}`);
      changeCurrentPriority();
    }
  } else {
    if (!stopInterval()) {
      // console.log("change index -> fetch");
      // console.log("Se cambió el índice y ahora se va por otra instrucción.");
      fetchNextInstruction();
    }
  }
}

function changeCurrentPriority() {
  if (processes.length === blockedProcesses.length + finishedProcesses.length)
    return;
  // console.log("change priority");
  // processExecutionCounter = 0;
  currentPriority--;
  // console.log("prioridad anterior", currentPriority + 1);
  if (currentPriority === 0) currentPriority = 3;
  // console.log("prioridad actual", currentPriority);
  currentIndex = 0;
  if (!stopInterval()) {
    // console.log("change priority -> fetch");
    fetchNextInstruction();
  }
}

function setStateToReady() {
  for (process of processes) {
    process.state = "Listo";
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
    clearInterval(interval);
    return true;
  } else {
    return false;
  }
}

function removeProcess() {
  // console.log("removing");
  // let process;
  switch (currentPriority) {
    case 3:
      // process = hightPriorityProcesses[currentIndex];
      // if (process?.programCounter === process?.id + process?.instrunctions) {
      hightPriorityProcesses.splice(currentIndex, 1);
      // }
      break;
    case 2:
      // process = mediumPriorityProcesses[currentIndex];
      // if (process?.programCounter === process?.id + process?.instrunctions) {
      mediumPriorityProcesses.splice(currentIndex, 1);
      // }
      break;
    case 1:
      // process = lowPriorityProcesses[currentIndex];
      // if (process?.programCounter === process?.id + process?.instrunctions) {
      lowPriorityProcesses.splice(currentIndex, 1);
      // }
      break;
  }
}
