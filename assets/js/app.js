function UUID() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

class Todo {
  constructor(title) {
    this.id = UUID();
    
    // Basic Todo Data
    this._title = title;
    this._description = ""; // MD format
    
    // Customization
    this._color = [255, 244, 214];
        
    // Dates & Reminders
    this._firstCreated = new Date();
    this._lastUpdated = new Date();
    this._reminderAt = [];
  }
  
  get title() {
    return this._title;
  }
  
  set title(t) {
    if (typeof t != "string") throw Error("title must be a string.");
    if (t.length() == 0) throw Error("title cannot be empty.");
    
    this._title = t;
    this._lastUpdated = new Date();
  }
  
  get description() {
    return this._description;
  }
  
  set description(t) {
    if (typeof t != "string") throw Error("description must be a string.");
    
    this._description = t;
    this._lastUpdated = new Date();
  }
  
  set color(c) {
    if (typeof c != "array" || c.length() != 3) throw Error("color must be an array [0-255, 0-255, 0-255]");
    
    this._color = c;
    this._lastUpdated = new Date();
  }
}

// Buttons
const addTodoBtn = document.getElementById("add-todo");
const openSettingsBtn = document.getElementById("open-dialog");
const closeSettingsBtn = document.getElementById("close-dialog");

// Dialog
const settingsDialog = document.getElementById("todo-dialog");

// Lists
const todoTaskList = document.getElementById("todo-list");
const inProgressTaskList = document.getElementById("in-progress-list");
const closedTaskList = document.getElementById("closed-list");

openSettingsBtn.addEventListener("click", () => {
  settingsDialog.showModal();
});

// "Close" button closes the dialog
closeSettingsBtn.addEventListener("click", () => {
  settingsDialog.close();
});

addTodoBtn.onclick = () => {
  todoTaskList.insertAdjacentHTML("beforeend", createTaskHTML());

  saveList();
};

function createTaskHTML(value = "") {
  return `
<li id='task-${UUID()}'>
  <div class="task-list__item btn-group">
    <button class='btn task-btn' draggable="true" ondragstart="drag(event)">:::</button>
    
    <div class="task-list__textarea-container">
      <textarea rows="4" oninput="saveList();" class="form-control task-list__textarea">${value}</textarea>
      <nav class="task-list__nav">
        <button class="btn btn--small" style="background-color: transparent; box-shadow: none;">
          <span class="material-symbols-outlined" style="font-size: 16px;">
            notifications
          </span>
        </button>
      </nav>
    </div>
    
    <button class='btn task-btn' onclick='this.parentElement.parentElement.remove(); saveList();'>✕</button>
  </div>
</li>
`;
}

// alert("Website will be updating soon. Any todos will not be saved.");

function loadList() {
  let data = JSON.parse(localStorage.getItem("list")) || {
    todo: [],
    inProgress: [],
    closed: [],
  };

  console.log(data);

  for (let i = 0; i < data.todo.length; i++) {
    todoTaskList.insertAdjacentHTML("beforeend", createTaskHTML(data.todo[i]));
  }

  for (let i = 0; i < data.inProgress.length; i++) {
    inProgressTaskList.insertAdjacentHTML(
      "beforeend",
      createTaskHTML(data.inProgress[i])
    );
  }

  for (let i = 0; i < data.closed.length; i++) {
    closedTaskList.insertAdjacentHTML(
      "beforeend",
      createTaskHTML(data.closed[i])
    );
  }
}

function saveList() {
  let data = {
    todo: [],
    inProgress: [],
    closed: [],
  };

  for (let i = 0; i < todoTaskList.children.length; i++) {
    data.todo.push(todoTaskList.children[i].querySelector("textarea").value);
  }

  for (let i = 0; i < inProgressTaskList.children.length; i++) {
    data.inProgress.push(
      inProgressTaskList.children[i].querySelector("textarea").value
    );
  }

  for (let i = 0; i < closedTaskList.children.length; i++) {
    data.closed.push(
      closedTaskList.children[i].querySelector("textarea").value
    );
  }

  console.log(data);

  localStorage.setItem("list", JSON.stringify(data));
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  console.log(ev.target.parentNode.parentNode.id);

  ev.dataTransfer.setData("Text", ev.target.parentNode.parentNode.id);
}

function drop(ev) {
  let data = ev.dataTransfer.getData("Text");

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

  saveList();
}

loadList();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async function () {
    let registration = await navigator.serviceWorker.register(
      "/assets/js/sw.js"
    );

    console.log(registration);
  });
}
