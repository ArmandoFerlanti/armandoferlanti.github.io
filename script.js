// Funzione per cancellare il testo dalla textarea
document.getElementById("rimuovi").addEventListener("click", rimuovitesto);

function rimuovitesto() {
  document.getElementById("textarea").value = "";
}
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Funzione per creare e aggiungere un nuovo task all'HTML
function createTaskElement(taskContent, isCompleted = false) {
  // Crea un nuovo elemento div per il task
  let newTask = document.createElement("div");
  newTask.className = "task";
  newTask.draggable = true; // Rende il task trascinabile
  newTask.ondragstart = dragStart;
  newTask.ondragover = dragOver;
  newTask.ondrop = drop;
  newTask.ondragend = dragEnd;

  // Crea un div per il testo del task
  let textDiv = document.createElement("div");
  textDiv.className = "task-text";
  textDiv.textContent = taskContent;

  // Se il task è completato, aggiungi la decorazione di testo
  if (isCompleted) {
    textDiv.style.textDecoration = "line-through";
  }

  // Crea un div per i bottoni
  let buttonsDiv = document.createElement("div");
  buttonsDiv.className = "task-buttons";

  // Crea un pulsante "Completa" con icona
  let completeButton = document.createElement("button");
  completeButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    `;
  completeButton.className = "complete-button";

  // Disabilita il pulsante "Completa" se il task è già completato
  if (isCompleted) {
    completeButton.disabled = true;
  }

  // Crea un pulsante "Rimuovi" con icona
  let removeButton = document.createElement("button");
  removeButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `;
  removeButton.className = "remove-button";

  // Aggiungi i bottoni al div dei bottoni
  buttonsDiv.appendChild(completeButton);
  buttonsDiv.appendChild(removeButton);

  // Aggiungi il div del testo e il div dei bottoni al div del task
  newTask.appendChild(textDiv);
  newTask.appendChild(buttonsDiv);

  // Aggiungi il nuovo task al div con id "header"
  document.getElementById("header").appendChild(newTask);

  // Aggiungi l'evento di click per rimuovere il task con animazione
  removeButton.addEventListener("click", function () {
    // Aggiungi la classe per l'animazione di uscita
    newTask.classList.add("remove");

    // Rimuovi l'elemento dal DOM dopo che l'animazione è completata
    newTask.addEventListener("animationend", function () {
      newTask.remove();
      updateLocalStorage(); // Aggiorna il localStorage dopo la rimozione
    });
  });

  // Aggiungi l'evento di click per completare il task
  completeButton.addEventListener("click", function () {
    textDiv.style.textDecoration = "line-through";
    completeButton.disabled = true; // Disabilita il pulsante "Completa" dopo l'uso
    updateLocalStorage(); // Aggiorna il localStorage dopo aver completato il task
  });
}

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Funzione per aggiungere un nuovo task e salvarlo nel localStorage
function aggiungitask() {
  const taskContent = document.getElementById("textarea").value.trim();
  if (taskContent) {
    createTaskElement(taskContent);
    updateLocalStorage(); // Salva il nuovo task nel localStorage
    document.getElementById("textarea").value = ""; // Svuota la textarea
  }
}

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Funzione per aggiornare il localStorage
function updateLocalStorage() {
  const tasks = [];
  document.querySelectorAll(".task").forEach((task) => {
    tasks.push({
      content: task.querySelector(".task-text").textContent,
      completed: task.querySelector(".complete-button").disabled,
    });
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Funzione per caricare i task dal localStorage
function loadTasksFromLocalStorage() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach((task) => createTaskElement(task.content, task.completed));
}

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Aggiungi l'evento di click al pulsante "aggiungi"
document.getElementById("aggiungi").addEventListener("click", aggiungitask);

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Carica i task dal localStorage all'avvio
loadTasksFromLocalStorage();

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// registro il safe worker

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/service-worker.js").then(
      function (registration) {
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
      },
      function (err) {
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}
// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

let draggedTask = null;

function dragStart(event) {
  draggedTask = event.target;
  draggedTask.classList.add("dragging"); // Aggiunge la classe per l'animazione di sollevamento
  event.dataTransfer.effectAllowed = "move";
}

function dragOver(event) {
  event.preventDefault();
  const targetTask = event.target.closest(".task");

  if (draggedTask !== targetTask) {
    targetTask.style.backgroundColor = "#1665b5"; // Cambia il colore di sfondo del task target
  }
}

function drop(event) {
  event.preventDefault();
  if (draggedTask !== event.target) {
    const targetTask = event.target.closest(".task");
    const header = document.getElementById("header");

    // Inserisce il task trascinato sopra o sotto il task target
    if (
      event.clientY <
      targetTask.getBoundingClientRect().top + targetTask.offsetHeight / 2
    ) {
      header.insertBefore(draggedTask, targetTask); // Inserisce sopra
    } else {
      header.insertBefore(draggedTask, targetTask.nextSibling); // Inserisce sotto
    }

    draggedTask.classList.add("dropping"); // Aggiunge la classe per l'animazione di rilascio

    // Rimuove la classe dopo che l'animazione è completata
    draggedTask.addEventListener("animationend", function () {
      draggedTask.classList.remove("dropping");
    });

    // Ripristina il colore di sfondo dei task dopo il rilascio
    document.querySelectorAll(".task").forEach((task) => {
      task.style.backgroundColor = ""; // Ripristina il colore originale
    });

    // Aggiorna il localStorage per riflettere il nuovo ordine
    updateLocalStorage();
  }
}

function dragEnd(event) {
  event.target.classList.remove("dragging"); // Rimuove la classe di animazione
  draggedTask = null;
}
