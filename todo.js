// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const clearAllBtn = document.getElementById('clearAll');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');
const emptyState = document.getElementById('emptyState');

// Modal Elements
const modal = document.createElement('div');
modal.className = 'modal';
modal.innerHTML = `
    <div class="modal-content">
        <div class="modal-header">Edit Task</div>
        <input type="text" class="modal-input" id="modalInput" placeholder="Edit your task...">
        <div class="modal-buttons">
            <button class="modal-btn modal-save" id="modalSave">Save</button>
            <button class="modal-btn modal-cancel" id="modalCancel">Cancel</button>
        </div>
    </div>
`;
document.body.appendChild(modal);

// State
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// Local Storage
const STORAGE_KEY = 'todos';

function loadTasks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    tasks = stored ? JSON.parse(stored) : [];
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Add task
function addTask() {
    const text = todoInput.value.trim();
    
    if (text === '') {
        alert('Please enter a task!');
        return;
    }

    const task = {
        id: generateId(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    todoInput.value = '';
    todoInput.focus();
    render();
}

// Delete task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        render();
    }
}

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        render();
    }
}

// Open edit modal
function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;
    const modalInput = document.getElementById('modalInput');
    modalInput.value = task.text;
    modal.classList.add('active');
    modalInput.focus();
    modalInput.select();
}

// Close edit modal
function closeEditModal() {
    modal.classList.remove('active');
    editingTaskId = null;
}

// Save edited task
function saveEditedTask() {
    if (!editingTaskId) return;

    const modalInput = document.getElementById('modalInput');
    const newText = modalInput.value.trim();

    if (newText === '') {
        alert('Task cannot be empty!');
        return;
    }

    const task = tasks.find(t => t.id === editingTaskId);
    if (task) {
        task.text = newText;
        saveTasks();
        render();
        closeEditModal();
    }
}

// Clear completed tasks
function clearCompleted() {
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) {
        alert('No completed tasks to clear!');
        return;
    }

    if (confirm(`Clear ${completedTasks.length} completed task(s)?`)) {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        render();
    }
}

// Clear all tasks
function clearAll() {
    if (tasks.length === 0) {
        alert('No tasks to clear!');
        return;
    }

    if (confirm('Clear all tasks? This cannot be undone!')) {
        tasks = [];
        saveTasks();
        render();
    }
}

// Get filtered tasks
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
}

// Render tasks
function render() {
    const filteredTasks = getFilteredTasks();
    todoList.innerHTML = '';

    if (tasks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask('${task.id}')"
            >
            <span class="todo-text">${escapeHtml(task.text)}</span>
            <div class="todo-actions">
                <button class="edit-btn" onclick="openEditModal('${task.id}')">Edit</button>
                <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        `;
        todoList.appendChild(li);
    });

    updateStats();
}

// Event Listeners
addBtn.addEventListener('click', addTask);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);
clearAllBtn.addEventListener('click', clearAll);

// Modal event listeners
document.getElementById('modalSave').addEventListener('click', saveEditedTask);
document.getElementById('modalCancel').addEventListener('click', closeEditModal);
document.getElementById('modalInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveEditedTask();
    if (e.key === 'Escape') closeEditModal();
});

// Close modal on outside click
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeEditModal();
});

// Initialize
loadTasks();
render();
