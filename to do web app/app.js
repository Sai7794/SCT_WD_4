// ==========================================================================
// Application State & Storage
// ==========================================================================
let state = {
  tasks: [],
  lists: [],
  currentView: 'all', // 'all', 'today', 'upcoming', 'completed' or custom list ID
  filter: 'all',      // 'all', 'active', 'completed'
  sortBy: 'default'   // 'default', 'date-asc', 'date-desc', 'priority', 'alphabetical'
};

// Default Initial Data
const defaultLists = [
  { id: 'list-work', name: 'Work', color: '#8b5cf6' },
  { id: 'list-personal', name: 'Personal', color: '#d946ef' },
  { id: 'list-fitness', name: 'Fitness', color: '#06b6d4' }
];

const defaultTasks = [
  {
    id: 'task-1',
    title: 'Design high-fidelity dashboard',
    description: 'Create glassmorphic mockup layouts with violet neon highlight accents.',
    dueDate: getRelativeDateTime(0, 18, 0), // Today at 6:00 PM
    listId: 'list-work',
    completed: false,
    priority: 'high'
  },
  {
    id: 'task-2',
    title: 'Weekly grocery run',
    description: 'Get almond milk, organic berries, avocados, and fresh spinach.',
    dueDate: getRelativeDateTime(1, 10, 0), // Tomorrow at 10:00 AM
    listId: 'list-personal',
    completed: false,
    priority: 'low'
  },
  {
    id: 'task-3',
    title: 'Complete 5km cardio run',
    description: 'Maintain pace under 5:30 mins/km. Check heart rate zones.',
    dueDate: getRelativeDateTime(-1, 8, 0), // Yesterday at 8:00 AM
    listId: 'list-fitness',
    completed: true,
    priority: 'none'
  }
];

// Helper to generate ISO strings relative to current date
function getRelativeDateTime(daysOffset, hours, minutes) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hours, minutes, 0, 0);
  
  // Format to YYYY-MM-DDTHH:MM local format matching datetime-local input
  const pad = (num) => String(num).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

// Load state from LocalStorage
function loadState() {
  const storedTasks = localStorage.getItem('aether_tasks');
  const storedLists = localStorage.getItem('aether_lists');
  const storedView = localStorage.getItem('aether_current_view');

  state.tasks = storedTasks ? JSON.parse(storedTasks) : defaultTasks;
  state.lists = storedLists ? JSON.parse(storedLists) : defaultLists;
  state.currentView = storedView ? storedView : 'all';
  
  // Clean checks
  if (!Array.isArray(state.tasks)) state.tasks = [];
  if (!Array.isArray(state.lists)) state.lists = [];
}

// Save state to LocalStorage
function saveState() {
  localStorage.setItem('aether_tasks', JSON.stringify(state.tasks));
  localStorage.setItem('aether_lists', JSON.stringify(state.lists));
  localStorage.setItem('aether_current_view', state.currentView);
}

// ==========================================================================
// DOM Elements
// ==========================================================================
const sidebar = document.querySelector('.sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileCloseBtn = document.getElementById('mobileCloseBtn');

const addListToggleBtn = document.getElementById('addListToggleBtn');
const newListForm = document.getElementById('newListForm');
const newListInput = document.getElementById('newListInput');
const customListsContainer = document.getElementById('customListsContainer');

const activeListTitle = document.getElementById('activeListTitle');
const listDescription = document.getElementById('listDescription');
const progressPercent = document.getElementById('progressPercent');
const mobileProgressPercent = document.getElementById('mobileProgressPercent');
const progressFill = document.getElementById('progressFill');

const newTaskForm = document.getElementById('newTaskForm');
const taskTitleInput = document.getElementById('taskTitleInput');
const taskDateInput = document.getElementById('taskDateInput');
const taskListSelect = document.getElementById('taskListSelect');
const taskPrioritySelect = document.getElementById('taskPrioritySelect');

const tasksRemainingCount = document.getElementById('tasksRemainingCount');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const sortBySelect = document.getElementById('sortBySelect');

const editModalOverlay = document.getElementById('editModalOverlay');
const editTaskForm = document.getElementById('editTaskForm');
const editTaskId = document.getElementById('editTaskId');
const editTaskTitle = document.getElementById('editTaskTitle');
const editTaskDesc = document.getElementById('editTaskDesc');
const editTaskDate = document.getElementById('editTaskDate');
const editTaskList = document.getElementById('editTaskList');
const editTaskPriority = document.getElementById('editTaskPriority');
const editTaskCompleted = document.getElementById('editTaskCompleted');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const deleteTaskModalBtn = document.getElementById('deleteTaskModalBtn');

// ==========================================================================
// Date Parsing & Helper Checks
// ==========================================================================
function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() &&
         d.getMonth() === today.getMonth() &&
         d.getDate() === today.getDate();
}

function isUpcoming(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  // Clear seconds for accurate comparison
  now.setSeconds(0, 0);
  return d > now && !isToday(dateStr);
}

function isOverdue(dateStr, completed) {
  if (!dateStr || completed) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d < now;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  
  // Format options
  const dateOptions = { month: 'short', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  
  const formattedDate = d.toLocaleDateString(undefined, dateOptions);
  const formattedTime = d.toLocaleTimeString(undefined, timeOptions);
  
  if (isToday(dateStr)) {
    return `Today at ${formattedTime}`;
  }
  
  // Yesterday check
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.getFullYear() === yesterday.getFullYear() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getDate() === yesterday.getDate()) {
    return `Yesterday at ${formattedTime}`;
  }
  
  return `${formattedDate}, ${formattedTime}`;
}

// ==========================================================================
// Render Logic
// ==========================================================================

// Render navigation list elements (custom and default)
function renderLists() {
  // Update select dropdowns
  const optionsHtml = `
    <option value="inbox">Inbox</option>
    ${state.lists.map(list => `<option value="${list.id}">${list.name}</option>`).join('')}
  `;
  taskListSelect.innerHTML = optionsHtml;
  editTaskList.innerHTML = optionsHtml;

  // Render Custom List Items
  customListsContainer.innerHTML = '';
  state.lists.forEach(list => {
    const li = document.createElement('li');
    li.className = `list-item ${state.currentView === list.id ? 'active' : ''}`;
    li.dataset.id = list.id;
    
    li.innerHTML = `
      <span class="list-item-bullet" style="background-color: ${list.color || 'var(--color-primary)'}"></span>
      <span class="list-item-text">${list.name}</span>
      <button class="list-item-delete" title="Delete list">
        <i data-lucide="trash-2"></i>
      </button>
    `;
    
    // Add Click listener to switch view
    li.addEventListener('click', (e) => {
      // Do not switch view if delete button was clicked
      if (e.target.closest('.list-item-delete')) return;
      state.currentView = list.id;
      document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));
      saveState();
      updateActiveViewClass();
      renderTasks();
    });
    
    // Delete event
    li.querySelector('.list-item-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteList(list.id);
    });
    
    customListsContainer.appendChild(li);
  });

  updateBadges();
  lucide.createIcons();
}

// Update Counts badges in sidebar
function updateBadges() {
  const counts = {
    all: state.tasks.length,
    today: state.tasks.filter(t => isToday(t.dueDate) && !t.completed).length,
    upcoming: state.tasks.filter(t => isUpcoming(t.dueDate) && !t.completed).length,
    completed: state.tasks.filter(t => t.completed).length
  };

  document.getElementById('badge-all').textContent = counts.all;
  document.getElementById('badge-today').textContent = counts.today;
  document.getElementById('badge-upcoming').textContent = counts.upcoming;
  document.getElementById('badge-completed').textContent = counts.completed;
}

// Ensure the HTML sidebar active classes match current state view
function updateActiveViewClass() {
  // Clear all list actives
  document.querySelectorAll('.custom-lists-container .list-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));

  // Default views
  const navItem = document.querySelector(`.sidebar-nav .nav-item[data-view="${state.currentView}"]`);
  if (navItem) {
    navItem.classList.add('active');
  } else {
    // Custom list view active state
    const listItem = document.querySelector(`.custom-lists-container .list-item[data-id="${state.currentView}"]`);
    if (listItem) {
      listItem.classList.add('active');
    } else {
      // Fallback
      state.currentView = 'all';
      const allItem = document.querySelector('.sidebar-nav .nav-item[data-view="all"]');
      if (allItem) allItem.classList.add('active');
    }
  }
}

// Render Tasks based on view, filter, and sort state
function renderTasks() {
  updateActiveViewClass();
  
  // Set headers
  let viewTitle = 'All Tasks';
  let viewDesc = 'A complete overview of your upcoming work.';
  
  if (state.currentView === 'today') {
    viewTitle = 'Today';
    viewDesc = 'Tasks due at any point today.';
  } else if (state.currentView === 'upcoming') {
    viewTitle = 'Upcoming';
    viewDesc = 'Future tasks and planning items.';
  } else if (state.currentView === 'completed') {
    viewTitle = 'Completed';
    viewDesc = 'Your historical archive of achievements.';
  } else if (state.currentView !== 'all') {
    const currentList = state.lists.find(l => l.id === state.currentView);
    if (currentList) {
      viewTitle = currentList.name;
      viewDesc = `Category tasks sorted in ${currentList.name}.`;
    }
  }
  
  activeListTitle.textContent = viewTitle;
  listDescription.textContent = viewDesc;

  // Filter 1: Main View Filter
  let filteredTasks = state.tasks;
  if (state.currentView === 'today') {
    filteredTasks = state.tasks.filter(t => isToday(t.dueDate));
  } else if (state.currentView === 'upcoming') {
    filteredTasks = state.tasks.filter(t => isUpcoming(t.dueDate));
  } else if (state.currentView === 'completed') {
    filteredTasks = state.tasks.filter(t => t.completed);
  } else if (state.currentView !== 'all') {
    filteredTasks = state.tasks.filter(t => t.listId === state.currentView);
  }

  // Filter 2: Tab Controls (All / Active / Completed)
  const activeDashboardFilter = document.querySelector('.filter-btn.active').dataset.filter;
  if (activeDashboardFilter === 'active') {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  } else if (activeDashboardFilter === 'completed') {
    filteredTasks = filteredTasks.filter(t => t.completed);
  }

  // Sort
  if (state.sortBy === 'date-asc') {
    filteredTasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  } else if (state.sortBy === 'date-desc') {
    filteredTasks.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(b.dueDate) - new Date(a.dueDate);
    });
  } else if (state.sortBy === 'priority') {
    const priorityWeight = { high: 3, none: 2, low: 1 };
    filteredTasks.sort((a, b) => (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2));
  } else if (state.sortBy === 'alphabetical') {
    filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Render Tasks list
  tasksList.innerHTML = '';
  
  if (filteredTasks.length === 0) {
    emptyState.classList.remove('hidden');
    tasksList.appendChild(emptyState);
  } else {
    emptyState.classList.add('hidden');
    
    filteredTasks.forEach(task => {
      const card = document.createElement('div');
      
      // Classes
      let cardClasses = ['task-card'];
      if (task.completed) cardClasses.push('completed');
      if (isOverdue(task.dueDate, task.completed)) cardClasses.push('overdue');
      else if (isToday(task.dueDate) && !task.completed) cardClasses.push('due-today');
      
      card.className = cardClasses.join(' ');
      card.dataset.id = task.id;
      
      // Find list name
      let listName = 'Inbox';
      if (task.listId !== 'inbox') {
        const matchingList = state.lists.find(l => l.id === task.listId);
        if (matchingList) listName = matchingList.name;
      }
      
      // Form due date badge
      const formattedDate = formatDisplayDate(task.dueDate);
      const dateBadgeHtml = task.dueDate ? `
        <span class="badge-date">
          <i data-lucide="calendar"></i>
          <span>${formattedDate}</span>
        </span>
      ` : '';

      // Priority color classes
      const priorityHtml = task.priority !== 'none' ? `
        <div class="priority-indicator priority-${task.priority}"></div>
      ` : '<div class="priority-indicator priority-none"></div>';

      card.innerHTML = `
        ${priorityHtml}
        <label class="task-checkbox-container">
          <input type="checkbox" ${task.completed ? 'checked' : ''} class="task-checkbox">
          <span class="checkmark"></span>
        </label>
        <div class="task-content">
          <span class="task-title">${escapeHTML(task.title)}</span>
          ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}
          <div class="task-meta">
            <span class="badge-list">${escapeHTML(listName)}</span>
            ${dateBadgeHtml}
          </div>
        </div>
        <div class="task-actions">
          <button class="action-btn btn-edit" title="Edit Task">
            <i data-lucide="edit-3"></i>
          </button>
          <button class="action-btn btn-delete" title="Delete Task">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      `;

      // Event listeners
      const checkbox = card.querySelector('.task-checkbox');
      checkbox.addEventListener('change', () => toggleTaskCompleted(task.id));

      const editBtn = card.querySelector('.btn-edit');
      editBtn.addEventListener('click', () => openEditModal(task.id));

      const deleteBtn = card.querySelector('.btn-delete');
      deleteBtn.addEventListener('click', () => deleteTask(task.id));

      tasksList.appendChild(card);
    });
  }

  // Update statistics counts
  updateStats(filteredTasks);
  updateBadges();
  lucide.createIcons();
}

// Escape HTML safety utility
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Update dashboard header stats
function updateStats(visibleTasks) {
  // Base stats on active context tasks
  let activeContextTasks = state.tasks;
  if (state.currentView === 'today') {
    activeContextTasks = state.tasks.filter(t => isToday(t.dueDate));
  } else if (state.currentView === 'upcoming') {
    activeContextTasks = state.tasks.filter(t => isUpcoming(t.dueDate));
  } else if (state.currentView === 'completed') {
    activeContextTasks = state.tasks.filter(t => t.completed);
  } else if (state.currentView !== 'all') {
    activeContextTasks = state.tasks.filter(t => t.listId === state.currentView);
  }

  const total = activeContextTasks.length;
  const completed = activeContextTasks.filter(t => t.completed).length;
  
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  progressPercent.textContent = `${percentage}%`;
  mobileProgressPercent.textContent = `${percentage}%`;
  progressFill.style.width = `${percentage}%`;
  
  const left = activeContextTasks.filter(t => !t.completed).length;
  tasksRemainingCount.textContent = `${left} task${left !== 1 ? 's' : ''} left`;
}

// ==========================================================================
// Controllers & Event Actions
// ==========================================================================

// Add Custom List
function addList(name) {
  const listId = `list-${Date.now()}`;
  const randomColors = ['#8b5cf6', '#d946ef', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  const color = randomColors[state.lists.length % randomColors.length];
  
  state.lists.push({
    id: listId,
    name: name,
    color: color
  });
  
  saveState();
  renderLists();
}

// Delete Custom List
function deleteList(listId) {
  // Confirm or notify list deletion (cascades tasks to inbox)
  state.lists = state.lists.filter(l => l.id !== listId);
  
  // Re-assign tasks of this list to 'inbox'
  state.tasks = state.tasks.map(t => {
    if (t.listId === listId) {
      t.listId = 'inbox';
    }
    return t;
  });

  // If current view was the deleted list, switch to all tasks
  if (state.currentView === listId) {
    state.currentView = 'all';
  }

  saveState();
  renderLists();
  renderTasks();
}

// Create Task
function addTask(title, dueDate, listId, priority) {
  const taskId = `task-${Date.now()}`;
  state.tasks.push({
    id: taskId,
    title: title.trim(),
    description: '',
    dueDate: dueDate || null,
    listId: listId || 'inbox',
    completed: false,
    priority: priority || 'none'
  });
  
  saveState();
  renderTasks();
}

// Toggle Completed Checkbox
function toggleTaskCompleted(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveState();
    
    // Add visual feedback delay before potential filters hide it
    const cardEl = document.querySelector(`.task-card[data-id="${taskId}"]`);
    if (cardEl) {
      cardEl.classList.toggle('completed', task.completed);
      // Brief timeout before full list refresh to allow css transition completion
      setTimeout(() => {
        renderTasks();
      }, 300);
    } else {
      renderTasks();
    }
  }
}

// Edit Task Modal Save
function updateTaskDetails(id, updates) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    Object.assign(task, updates);
    saveState();
    renderTasks();
  }
}

// Delete Task
function deleteTask(taskId) {
  state.tasks = state.tasks.filter(t => t.id !== taskId);
  saveState();
  renderTasks();
}

// ==========================================================================
// Modal Handlers
// ==========================================================================
function openEditModal(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  editTaskId.value = task.id;
  editTaskTitle.value = task.title;
  editTaskDesc.value = task.description || '';
  editTaskDate.value = task.dueDate || '';
  editTaskList.value = task.listId;
  editTaskPriority.value = task.priority;
  editTaskCompleted.checked = task.completed;

  editModalOverlay.classList.add('active');
}

function closeEditModal() {
  editModalOverlay.classList.remove('active');
  editTaskForm.reset();
}

// ==========================================================================
// Initialization & Listeners
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  
  // Render
  renderLists();
  renderTasks();

  // Sidebar Toggles for navigation views
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', () => {
      state.currentView = item.dataset.view;
      saveState();
      renderTasks();
      
      // Close mobile sidebar on navigation selection
      sidebar.classList.remove('open');
    });
  });

  // Mobile sidebar menu toggles
  mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
  });

  mobileCloseBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });

  // List Form toggling
  addListToggleBtn.addEventListener('click', () => {
    newListForm.classList.toggle('hidden');
    if (!newListForm.classList.contains('hidden')) {
      newListInput.focus();
    }
  });

  // Add List Form Submit
  newListForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const listName = newListInput.value.trim();
    if (listName) {
      addList(listName);
      newListInput.value = '';
      newListForm.classList.add('hidden');
    }
  });

  // Quick Add Task Form Submit
  newTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = taskTitleInput.value;
    const date = taskDateInput.value;
    const list = taskListSelect.value;
    const priority = taskPrioritySelect.value;

    if (title.trim()) {
      addTask(title, date, list, priority);
      taskTitleInput.value = '';
      taskDateInput.value = '';
      taskPrioritySelect.value = 'none';
      
      // Match selector view default
      if (state.currentView !== 'all' && state.currentView !== 'today' && state.currentView !== 'upcoming' && state.currentView !== 'completed') {
        taskListSelect.value = state.currentView;
      } else {
        taskListSelect.value = 'inbox';
      }
    }
  });

  // Sort Selection Listener
  sortBySelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderTasks();
  });

  // Sub-Filter Tabs (All / Active / Completed)
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(el => el.classList.remove('active'));
      e.target.classList.add('active');
      renderTasks();
    });
  });

  // Modal Save Form Submit
  editTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = editTaskId.value;
    const updates = {
      title: editTaskTitle.value.trim(),
      description: editTaskDesc.value.trim(),
      dueDate: editTaskDate.value || null,
      listId: editTaskList.value,
      priority: editTaskPriority.value,
      completed: editTaskCompleted.checked
    };
    
    updateTaskDetails(id, updates);
    closeEditModal();
  });

  // Modal Cancel events
  modalCloseBtn.addEventListener('click', closeEditModal);
  cancelModalBtn.addEventListener('click', closeEditModal);
  
  // Modal Delete Button Action
  deleteTaskModalBtn.addEventListener('click', () => {
    const id = editTaskId.value;
    if (id) {
      deleteTask(id);
      closeEditModal();
    }
  });

  // Close modal when clicking outside form box
  editModalOverlay.addEventListener('click', (e) => {
    if (e.target === editModalOverlay) {
      closeEditModal();
    }
  });
});
