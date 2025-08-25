// Buttons
const addTodoBtn = document.getElementById("add-todo");
const openSettingsBtn = document.getElementById("open-dialog");
const closeSettingsBtn = document.getElementById("close-dialog");

// Dialog
const settingsDialog = document.getElementById("todo-dialog");

// Lists
const todoTaskList = document.getElementById("todo-list");
const doingTaskList = document.getElementById("doing-list");
const doneTaskList = document.getElementById("done-list");

// Popovers
const noteColorPopup = document.getElementById("note-color");
const reminderPopover = document.getElementById("reminder-popover");

// Etc.
const noteColors = noteColorPopup.querySelectorAll(".note-color");

for (let noteColor of noteColors) {
  noteColor.addEventListener("click", function () {
    console.log(noteColors);

    let note = document.getElementById(noteColorPopup.dataset.target);

    note.color = noteColor.value;
  });
}

const Tasker = {};

Tasker.TodoElement = class Todo extends HTMLLIElement {
  constructor() {
    super();

    this.id = UUID();
    this._id = this.id;

    this._status = "todo"; // todo, doing, done

    // Basic Todo Data
    this._title = "";
    this._description = ""; // MD format

    // Customization
    this._color = "yellow";

    // Dates & Reminders
    this._firstCreated = new Date();
    this._lastUpdated = new Date();
    this._reminderAt = [];

    const template = document.getElementById("task-list__item--template");

    console.log("?");

    if (template && "content" in document.createElement("template")) {
      const templateContent = document.importNode(template.content, true);
      this.appendChild(templateContent);
    } else {
      // Handle cases where templates are not supported
      console.error("Template not supported or template element not found.");
      //You could add a fallback here, such as creating the dom elements programmatically.
    }

    this.createEvents();
  }

  update() {
    let textarea = this.querySelector(".task-list__textarea");

    textarea.value = this.title;
    
    textarea.innerHTML =
      marked.parse(this.title);

    textarea.parentElement.parentElement.style.setProperty(
      "--note-color",
      `var(--color-${this.color})`
    );
  }

  createEvents() {
    let textarea = this.querySelector(".task-list__textarea");

    let paletteBtn = this.querySelector(".btn-palette");
    let notificationBtn = this.querySelector(".btn-notifications");

    let closeBtn = this.querySelector(".close-btn");

    textarea.addEventListener("input", () => {
      this.title = textarea.value;
    });

    paletteBtn.addEventListener("mouseover", (e) => {
      noteColorPopup.removeAttribute("hidden");

      const paletteBtnRect = paletteBtn.getBoundingClientRect();
      const popupRect = noteColorPopup.getBoundingClientRect();

      console.log(popupRect);

      // popup is not close to button
      const left =
        paletteBtnRect.left - popupRect.width / 2 + paletteBtnRect.width / 2;

      // Calculate top position (bottom of button + some spacing)
      const top = paletteBtnRect.bottom; // Adjust 10 for desired spacing

      noteColorPopup.style.left = `${left}px`;
      noteColorPopup.style.top = `${top}px`;

      console.log(this.color);

      const noteColorSelected = document.querySelector(
        `[note-color='${this.color}']`
      );

      console.log(noteColorSelected);

      noteColorPopup.dataset.target = this.id;
    });

    paletteBtn.addEventListener("mouseout", (e) => {
      noteColorPopup.setAttribute("hidden", "");
    });

    noteColorPopup.addEventListener("mouseover", (e) => {
      noteColorPopup.removeAttribute("hidden");
    });

    noteColorPopup.addEventListener("mouseout", (e) => {
      noteColorPopup.setAttribute("hidden", "");
    });

    notificationBtn.addEventListener("mouseover", () => {
      reminderPopover.removeAttribute("hidden");

      console.log("SDIFOHSDIOFBSIODBNFIO");

      const paletteBtnRect = notificationBtn.getBoundingClientRect();
      const popupRect = reminderPopover.getBoundingClientRect();

      console.log(popupRect);

      // popup is not close to button
      const left =
        paletteBtnRect.left - popupRect.width / 2 + paletteBtnRect.width / 2;

      // Calculate top position (bottom of button + some spacing)
      const top = paletteBtnRect.bottom; // Adjust 10 for desired spacing

      console.log(top);

      reminderPopover.style.left = `${left}px`;
      reminderPopover.style.top = `${top}px`;
    });
    
    notificationBtn.addEventListener("mouseout", (e) => {
      reminderPopover.setAttribute("hidden", "");
    });
    
    reminderPopover.addEventListener("mouseover", (e) => {
      reminderPopover.removeAttribute("hidden");
    });

    reminderPopover.addEventListener("mouseout", (e) => {
      reminderPopover.setAttribute("hidden", "");
    });

    closeBtn.addEventListener("click", () => {
      this.remove();
      Tasker.storage.deleteTodo(this);
    });
  }

  connectedCallback() {
    //Called when the element is added to the DOM.
    //You can perform actions here, such as fetching data.
  }

  get status() {
    return this._status;
  }

  set status(s) {
    if (!["todo", "doing", "done"].includes(s))
      throw new Error("s must be the string 'todo', 'doing' or 'done'.");

    Tasker.storage.updateTodo(this);

    this._status = s;
  }

  get title() {
    return this._title;
  }

  set title(t) {
    if (typeof t != "string") throw Error("title must be a string.");
    if (t.length == 0) throw Error("title cannot be empty.");

    this._title = t;
    this._lastUpdated = new Date();

    Tasker.storage.updateTodo(this);
  }

  get description() {
    return this._description;
  }

  set description(t) {
    if (typeof t != "string") throw Error("description must be a string.");

    this._description = t;
    this._lastUpdated = new Date();

    Tasker.storage.updateTodo(this);
  }

  get color() {
    return this._color;
  }

  set color(c) {
    if (typeof c != "string" || !["yellow", "red", "blue", "green"].includes(c))
      throw Error("color must be strings (yellow, red, blue, green)");

    this._color = c;
    this._lastUpdated = new Date();

    this.update();

    Tasker.storage.updateTodo(this);

    console.log(Tasker.storage.fetchTodos());
  }
};

Tasker.storage = {};

Tasker.storage.deleteTodo = (todo) => {
  let list = Tasker.storage.fetchTodos();
  let todos = list.tasks;
  let storage_todo = todos.find((t) => t._id === todo._id);

  if (storage_todo) {
    // Delete todo
    list.tasks = todos.filter((t) => t._id !== todo._id);
  }

  localStorage.setItem(Tasker.storage.getCurrentListID(), JSON.stringify(list));
};

Tasker.storage.updateTodo = (todo) => {
  let list = Tasker.storage.fetchTodos();
  let currentTodos = list.tasks;
  let storage_todo = currentTodos.find((t) => t._id === todo._id);

  if (storage_todo) {
    Object.assign(storage_todo, todo);
  } else {
    currentTodos.push(JSON.parse(JSON.stringify(todo)));
  }

  localStorage.setItem(Tasker.storage.getCurrentListID(), JSON.stringify(list));
};

Tasker.storage.getCurrentListID = function () {
  let UUID = localStorage.getItem("current-list");

  return `list-${UUID}`;
};
Tasker.storage.fetchTodos = function () {
  if (localStorage.version && localStorage.version === "2") {
    localStorage.clear();
    window.location.reload();
  }

  return (
    JSON.parse(localStorage.getItem(Tasker.storage.getCurrentListID())) ||
    Tasker.storage.init()
  );
};
Tasker.storage.init = function () {
  // Check if list is empty
  if (localStorage.length === 0) {
    // Creates new list
    localStorage.clear();

    let listUUID = UUID();
    let listTemplate = {
      name: "My List",
      version: "3",
      description: "This is my list of things to do.",
      tasks: [], // tasks is now a single list
    };

    localStorage.setItem("current-list", listUUID);
    localStorage.setItem(
      Tasker.storage.getCurrentListID(),
      JSON.stringify(listTemplate)
    );
  }

  return JSON.parse(localStorage.getItem(Tasker.storage.getCurrentListID()));
};

Tasker.renderTodos = function () {
  let todos = Tasker.storage.fetchTodos();

  // Clear existing lists
  todoTaskList.innerHTML = "";
  doingTaskList.innerHTML = "";
  doneTaskList.innerHTML = "";

  for (let t of todos.tasks) {
    let todo = document.createElement("li", { is: "todo-item" });

    todo.id = t._id;
    Object.assign(todo, t);
    todo.update();

    switch (todo.status) {
      case "todo":
        todoTaskList.appendChild(todo);
        break;
      case "doing":
        doingTaskList.appendChild(todo);
        break;
      case "done":
        doneTaskList.appendChild(todo);
        break;
    }
  }
};

Tasker.createEvents = function () {
  openSettingsBtn.addEventListener("click", () => {
    settingsDialog.showModal();
  });

  // "Close" button closes the dialog
  closeSettingsBtn.addEventListener("click", () => {
    settingsDialog.close();
  });

  addTodoBtn.addEventListener("click", () => {
    let todo = document.createElement("li", { is: "todo-item" });
    console.log("click");
    todoTaskList.appendChild(todo);
  });
};

Tasker.main = () => {
  customElements.define("todo-item", Tasker.TodoElement, { extends: "li" });

  Tasker.createEvents();
  Tasker.renderTodos();
};

function UUID() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  console.log(ev.target.parentNode.parentNode);

  ev.dataTransfer.setData("Text", ev.target.parentNode.parentNode.id);
}

function drop(ev) {
  let data = ev.dataTransfer.getData("Text");

  let tasker = document.getElementById(data);

  switch (ev.target) {
    case todoTaskList:
      tasker.status = "todo";
      console.log("todo");
      break;

    case doingTaskList:
      console.log("doing");

      tasker.status = "doing";
      break;

    case doneTaskList:
      console.log("done");

      tasker.status = "done";
      break;
  }

  if (
    ev.target.classList.contains("task-list__textarea-container") ||
    ev.target.classList.contains("task-list__textarea") ||
    ev.target.classList.contains("task-btn")
  ) {
    ev.target.parentNode.parentNode.parentNode.insertBefore(
      document.getElementById(data),
      ev.target.parentNode.parentNode
    );
  } else if (ev.target.classList.contains("tasklist-list")) {
    ev.target.appendChild(document.getElementById(data));
  } else {
    ev.target.parentNode
      .querySelector(".task-list")
      .appendChild(document.getElementById(data));
  }

  ev.preventDefault();
}

Tasker.main();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async function () {
    let registration = await navigator.serviceWorker.register(
      "/assets/js/sw.js"
    );

    console.log(registration);
  });
}
