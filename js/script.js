function compose(f, g) {
  return (...arg) => f(g(...arg));
}

const cloneArray = (array) => [...array];

// ============================= DATA FUNCTIONS ===============================
// ----*** 1st: UTILITY ⚓ ***----
const saveToLocalStorage = (array, key) => localStorage.setItem(key, JSON.stringify(array));

const getFromLocalStorage = (key) => JSON.parse(localStorage.getItem(key)) ?? [];

const getAllTask = () => getFromLocalStorage('tasks');

const getTask = (tasks, taskTitle) => tasks.find(task => task.taskTitle === taskTitle);

const checkDuplicteTaskError = (tasks, taskTitle) => {
  if (getTask(tasks, taskTitle)) {
    throw new Error('Duplicate Task Title Error')
  }
}

const checkEmptyTaskError = (taskTitle) => {
  if (taskTitle.trim() === '') {
    throw new Error('Empty Task Title Error');
  }
}

const addTask = (tasks, taskTitle) => {
  checkDuplicteTaskError(tasks, taskTitle);
  checkEmptyTaskError(taskTitle);
  const newTasks = cloneArray(tasks);
  newTasks.push({ taskTitle, completed: false });
  return newTasks;
}

const removeTask = (tasks, taskTitle) => tasks.filter(task => task.taskTitle !== taskTitle);

const editTask = (tasks, taskTitle, newTaskTitle) => {
  checkDuplicteTaskError(tasks, newTaskTitle);
  checkEmptyTaskError(newTaskTitle);

  const newTasks = cloneArray(tasks);
  const task = getTask(newTasks, taskTitle);
  task.taskTitle = newTaskTitle;
  return newTasks;
}

const changeTaskIndex = (tasks, taskTitle, targetIndex) => {
  // index1 => draged, index2 => target
  const newTasks = cloneArray(tasks);
  const task = getTask(tasks, taskTitle);
  const indexTask = newTasks.indexOf(task);
  newTasks.splice(indexTask, 1); // remove the task 
  newTasks.splice(targetIndex, 0, task); // add the task to target index
  return newTasks;
}

const toggleCompleted = (tasks, taskTitle) => {
  const newTasks = cloneArray(tasks);
  const task = getTask(tasks, taskTitle);
  if (task) {
    task.completed = task.completed ? false : true;
  }
  return newTasks;
}

const getCompletedTask = (tasks) => tasks.filter(task => task.completed);

const getIncompletedTask = (tasks) => tasks.filter(task => !task.completed);

const isCompleted = (tasks, taskTitle) => getTask(tasks, taskTitle).completed;

// ----*** 2nd: COMPOSED 🔗 ***----
const saveTasksToLocalStorage = tasks => saveToLocalStorage(tasks, 'tasks');

const managerTasks = (actionFunction, ...args) => compose(saveTasksToLocalStorage, actionFunction)(...args);

// ============================= CONTROLLER FUNCTIONS ⚙ ===============================
// control: Determine whether specific data should be rendered.
const getTabs = () => [
  document.getElementById('all-tab'),
  document.getElementById('completed-tab'),
  document.getElementById('incompleted-tab'),
];

const isActiveTab = (tab) => tab.classList.contains('active');

const getFilteredTasks = () => {
  const activeTab = getTabs().find(tab => isActiveTab(tab));
  return activeTab.id === 'completed-tab' ? getCompletedTask(getAllTask())
    : activeTab.id === 'incompleted-tab' ? getIncompletedTask(getAllTask())
      : getAllTask();
}

// ============================= RENDER FUNCTIONS ===============================
// ----*** 1st: UTILITY ⚓ ***----
const bindEvent = (element, event, handleFunc) => element.addEventListener(event, handleFunc);

// ----- FOR TASK LIST -----
const htmlTask = (isCompleted, taskTitle) => {
  const li = document.createElement('li');
  li.draggable = true;
  li.innerHTML += `
  <div class="wrp-drg-task">
      <div class="dragger">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <circle cy="7" cx="9.5" r="1" fill="#999"></circle>
          <circle cy="7" cx="14" r="1" fill="#999"></circle>
          <circle cy="12.5" cx="9.5" r="1" fill="#999"></circle>
          <circle cy="12.5" cx="14" r="1" fill="#999"></circle>
          <circle cy="18" cx="9.5" r="1" fill="#999"></circle>
          <circle cy="18" cx="14" r="1" fill="#999"></circle>
        </svg>
      </div>
      <div class="task" >
        <label id="task" class = ${isCompleted ? `completed` : ``}>
          <span class="custom-checkbox" id="checkbox"></span>
          <span contenteditable="false" id="task-title" >${taskTitle}</span>
        </label>
      </div>
    </div>
    <div class="actions">
      <span class="fa fa-pencil ${isCompleted ? `active` : ``}" id="edit-task" ></span>
      <span class="fa fa-trash " id="remove-task"></span>
    </div>
    `
  return li;
}

const renderTasks = (tasks) => {
  const taskGroup = document.getElementById('task-group');
  taskGroup.innerHTML = '';
  tasks.forEach((task) => {
    const taskElm = htmlTask(task.completed, task.taskTitle);
    taskGroup.appendChild(taskElm);
    // add EventLister to specifid element inside the Task Group
    bindEvent(taskElm.querySelector('#task'), 'click', () => handleToggleEvent(task.taskTitle));
    bindEvent(taskElm.querySelector('#remove-task'), 'click', () => handleRemoveEvent(task.taskTitle));
    bindEvent(taskElm.querySelector('#edit-task'), 'click', () => handleEnterEditEvent(task.taskTitle, taskElm));
    bindEvent(taskElm, 'dragstart', handleDragStartEvent);
    bindEvent(taskElm, 'dragover', handleDragOverEvent);
    bindEvent(taskElm, 'drop', handleDragDropEvent);
    bindEvent(taskElm, 'dragend', handleDragEndEvent);
  })
}

// ----- FOR ERROR MESSAGE -----
const htmlAlert = (message) => {
  const alertContainer = document.getElementById('container-alert');
  const alertElement = document.createElement('div');
  // try use classList.add insted of className
  alertElement.className = 'alert hide';
  alertElement.innerHTML += `
    <span class="fa fa-times-circle"></span>
    <span class="msg" id="msg">${message}</span>
    <div class="close-btn" id="close-btn">
      <span class="fa fa-times"></span>
    </div>
  `;
  alertContainer.appendChild(alertElement);
  return alertElement;
}

const renderAlert = (message) => {
  const alertElement = htmlAlert(message);
  const closeBtn = alertElement.querySelector('#close-btn');

  alertElement.classList.add('show');
  alertElement.classList.remove('hide');
  alertElement.classList.add('show-alert');

  setTimeout(() => {
    alertElement.classList.remove('show');
    alertElement.classList.add('hide');
  }, 5000);

  setTimeout(() => {
    alertElement.remove();
  }, 6000);

  closeBtn.addEventListener('click', () => {
    alertElement.classList.remove('show');
    alertElement.classList.add('hide');
  })
}

const moveCursorToEnd = (element) => {
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(element);
  range.collapse(false); // Collapse the range to the end of the content
  selection.removeAllRanges(); // Clear any existing selection
  selection.addRange(range); // Set the range with the cursor at the end
}

// ----- FOR AUDIO -----
const playAudio = (path) => new Audio(path);


// ----*** 2nd: COMPOSED 🔗 ***----
const renderFilteredTasks = compose(renderTasks, getFilteredTasks);

// ============================= HANDLE EVENT FUNCTIONS ===============================
// ----*** 2nd: COMPOSED 🔗 ***----
const handleAddEvent = (taskTitle) => {
  try {
    managerTasks(addTask, getAllTask(), taskTitle);
    renderFilteredTasks();
  } catch (error) {
    renderAlert(error.message)
  }
}

const handleToggleEvent = (taskTitle) => {
  try {
    managerTasks(toggleCompleted, getAllTask(), taskTitle)
    renderFilteredTasks();
    if (isCompleted(getAllTask(), taskTitle)) {
      playAudio('../music/complete.mp3').play();
    }
  } catch (error) {
    renderAlert(error.message)
  }
}

const handleRemoveEvent = (taskTitle) => {
  try {
    managerTasks(removeTask, getAllTask(), taskTitle)
    renderFilteredTasks();
    playAudio('../music/delete.mp3').play();
  } catch (error) {
    renderAlert(error.message)
  }
}

const handleEnterEditEvent = (taskTitle, taskElm) => {
  try {
    const taskTitleElm = taskElm.querySelector('#task-title');
    taskElm.classList.add('active');
    taskTitleElm.contentEditable = 'true';
    taskTitleElm.focus();
    moveCursorToEnd(taskTitleElm);
    playAudio('../music/edit.mp3').play();
    let isBlurEvent = true;
    taskElm.addEventListener('keydown', event => {
      if (event.keyCode === 13) {
        isBlurEvent = false;
        handleLeaveEditEvent(taskTitle, taskElm);
      }
    });

    taskTitleElm.addEventListener('blur', event => {
      if (isBlurEvent) {
        handleLeaveEditEvent(taskTitle, taskElm)
      }
    });

  } catch (error) {
    renderAlert(error.message)
  }
}

const handleLeaveEditEvent = (taskTitle, taskElm) => {
  try {
    const newTaskTitle = taskElm.querySelector('#task-title').textContent.trim();
    taskElm.classList.remove('active');
    return taskTitle === newTaskTitle ? null : managerTasks(editTask, getAllTask(), taskTitle, newTaskTitle);
  } catch (error) {
    renderAlert(error.message);
  } finally {
    renderFilteredTasks();
  }
}

const handleTabEvent = (tab) => {
  getTabs().forEach(tab => tab.classList.remove('active'));
  tab.classList.add('active');
  renderFilteredTasks();
}

let dragedItem = null;
const handleDragStartEvent = (event) => {
  dragedItem = event.target;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', event.target.textContent);
  event.target.classList.add('dragged');

}

const handleDragOverEvent = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

const handleDragDropEvent = (event) => {
  const taskGroup = document.getElementById('task-group');
  const targetItem = event.target.closest('li');

  if (dragedItem && dragedItem !== targetItem) {
    const targetIndex = Array.from(taskGroup.children).indexOf(targetItem);
    const dragedIndex = Array.from(taskGroup.children).indexOf(dragedItem);

    if (targetIndex > dragedIndex) {
      taskGroup.insertBefore(dragedItem, targetItem.nextSibling);
    } else {
      taskGroup.insertBefore(dragedItem, targetItem);
    }
    managerTasks(changeTaskIndex, getAllTask(), dragedItem.textContent.trim(), targetIndex)
    renderFilteredTasks();
  }
}

const handleDragEndEvent = (event) => {
  draggedItem = null;
  event.target.classList.remove('dragged');
}

const handleDarkLightEvent = (event) => {
  document.body.classList.toggle('light-mode');
}

// ============================= ADD EVENT LISENTER =============================
document.getElementById('add-task').addEventListener('click', () => {
  const inputTask = document.getElementById('input-task');
  handleAddEvent(inputTask.value);
  inputTask.value = '';
})

document.getElementById('input-task').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const inputTask = document.getElementById('input-task');
    handleAddEvent(inputTask.value);
    inputTask.value = '';
  }
})

getTabs().forEach((tab) => {
  tab.addEventListener('click', () => {
    handleTabEvent(tab)
  })
})

document.getElementById('dark-light').addEventListener('click', (event) => {
  handleDarkLightEvent();
  saveToLocalStorage(Array.from(document.body.classList), 'drak-light');
});

// ============================= RELODING FUNCTIONS ===============================
(function () {
  compose(renderTasks, getFromLocalStorage)('tasks');

  if (getFromLocalStorage('drak-light').length !== 0)
    document.body.classList.add(getFromLocalStorage('drak-light'));
})();
