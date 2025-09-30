// Variables globales
let tasks = [
    {
        id: 1,
        text: "Pagar la factura de electricidad",
        completed: false,
        tags: ["Hogar", "Vence hoy"],
        category: "Personal"
    },
    {
        id: 2,
        text: "Terminar borrador del brief del proyecto",
        completed: false,
        tags: ["Trabajo", "Mañana"],
        category: "Trabajo"
    },
    {
        id: 3,
        text: "Comprar alimentos para la cena",
        completed: false,
        tags: ["Mandados", "Esta semana"],
        category: "Mandados"
    }
];

let currentFilter = 'Hoy';
let currentSort = 'default';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    renderTasks();
    updateTaskCounts();
}

// Event Listeners
function setupEventListeners() {
    // Añadir nueva tarea
    const addTaskBtn = document.querySelector('.add-btn');
    const taskInput = document.querySelector('.task-input');
    
    addTaskBtn.addEventListener('click', addNewTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewTask();
        }
    });

    // Quick add
    const quickAddBtn = document.querySelector('.quick-add-btn');
    const quickAddInput = document.querySelector('.quick-add input');
    
    quickAddBtn.addEventListener('click', addQuickTask);
    quickAddInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addQuickTask();
        }
    });

    // Filtros de lista
    const listItems = document.querySelectorAll('.list-item');
    listItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remover clase active de todos
            listItems.forEach(li => li.classList.remove('active'));
            // Agregar clase active al clickeado
            this.classList.add('active');
            
            const listName = this.querySelector('span').textContent;
            filterTasks(listName);
        });
    });

    // Botones de ordenar y filtrar
    const sortBtn = document.querySelector('.action-btn:first-child');
    const filterBtn = document.querySelector('.action-btn:last-child');
    
    sortBtn.addEventListener('click', toggleSort);
    filterBtn.addEventListener('click', toggleFilter);

    // Búsqueda
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', function() {
        searchTasks(this.value);
    });
}

// Funciones de tareas
function addNewTask() {
    const taskInput = document.querySelector('.task-input');
    const taskText = taskInput.value.trim();
    
    if (taskText) {
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            tags: ["Personal"],
            category: "Personal"
        };
        
        tasks.push(newTask);
        taskInput.value = '';
        renderTasks();
        updateTaskCounts();
        showNotification('Tarea añadida correctamente');
    }
}

function addQuickTask() {
    const quickInput = document.querySelector('.quick-add input');
    const taskText = quickInput.value.trim();
    
    if (taskText) {
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            tags: ["Personal"],
            category: "Personal"
        };
        
        tasks.push(newTask);
        quickInput.value = '';
        renderTasks();
        updateTaskCounts();
        showNotification('Tarea añadida correctamente');
    }
}

function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
        updateTaskCounts();
    }
}

function deleteTask(taskId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        renderTasks();
        updateTaskCounts();
        showNotification('Tarea eliminada');
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const newText = prompt('Editar tarea:', task.text);
        if (newText && newText.trim()) {
            task.text = newText.trim();
            renderTasks();
            showNotification('Tarea actualizada');
        }
    }
}

// Renderizado
function renderTasks() {
    const tasksContainer = document.querySelector('.tasks-container');
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = '<div class="no-tasks-message">¡No hay más tareas para hoy. ¡Todo al día!</div>';
        return;
    }
    
    tasksContainer.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-checkbox" onclick="toggleTaskComplete(${task.id})">
                <i class="${task.completed ? 'fas fa-check-circle' : 'far fa-circle'}"></i>
            </div>
            <div class="task-content">
                <span class="task-text" style="text-decoration: ${task.completed ? 'line-through' : 'none'}; opacity: ${task.completed ? '0.6' : '1'}">${task.text}</span>
                <div class="task-tags">
                    ${task.tags.map(tag => `<span class="tag" style="background-color: ${getTagColor(tag)};">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="task-actions">
                <i class="fas fa-pencil-alt" onclick="editTask(${task.id})"></i>
                <i class="fas fa-trash" onclick="deleteTask(${task.id})"></i>
            </div>
        </div>
    `).join('');
}

function getFilteredTasks() {
    let filtered = tasks;
    
    // Filtrar por lista
    switch(currentFilter) {
        case 'Hoy':
            filtered = tasks.filter(task => !task.completed);
            break;
        case 'Próximas':
            filtered = tasks.filter(task => !task.completed);
            break;
        case 'Todas':
            filtered = tasks;
            break;
    }
    
    // Ordenar
    switch(currentSort) {
        case 'alphabetical':
            filtered.sort((a, b) => a.text.localeCompare(b.text));
            break;
        case 'date':
            filtered.sort((a, b) => b.id - a.id);
            break;
        case 'priority':
            filtered.sort((a, b) => {
                if (a.completed && !b.completed) return 1;
                if (!a.completed && b.completed) return -1;
                return 0;
            });
            break;
    }
    
    return filtered;
}

function filterTasks(filterName) {
    currentFilter = filterName;
    renderTasks();
}

function searchTasks(searchTerm) {
    const taskItems = document.querySelectorAll('.task-item');
    const term = searchTerm.toLowerCase();
    
    taskItems.forEach(item => {
        const taskText = item.querySelector('.task-text').textContent.toLowerCase();
        if (taskText.includes(term)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function toggleSort() {
    const sortOptions = ['default', 'alphabetical', 'date', 'priority'];
    const currentIndex = sortOptions.indexOf(currentSort);
    currentSort = sortOptions[(currentIndex + 1) % sortOptions.length];
    
    renderTasks();
    showNotification(`Ordenar: ${getSortLabel(currentSort)}`);
}

function toggleFilter() {
    showNotification('Filtro activado');
}

function getSortLabel(sort) {
    const labels = {
        'default': 'Por defecto',
        'alphabetical': 'Alfabético',
        'date': 'Por fecha',
        'priority': 'Por prioridad'
    };
    return labels[sort] || 'Por defecto';
}

function getTagColor(tag) {
    const colors = {
        'Hogar': '#ffb6c1',
        'Trabajo': '#DDA0DD',
        'Mandados': '#ffb6c1',
        'Personal': '#ffb6c1',
        'Vence hoy': '#FFD700',
        'Mañana': '#ffb6c1',
        'Esta semana': '#ffb6c1'
    };
    return colors[tag] || '#e0e0e0';
}

function updateTaskCounts() {
    const todayCount = tasks.filter(t => !t.completed).length;
    const upcomingCount = tasks.filter(t => !t.completed).length;
    const allCount = tasks.length;
    
    const counts = document.querySelectorAll('.count');
    if (counts[0]) counts[0].textContent = todayCount;
    if (counts[1]) counts[1].textContent = upcomingCount;
    if (counts[2]) counts[2].textContent = allCount;
}

function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        font-size: 0.9rem;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Funciones de utilidad
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return new Date(date).toLocaleDateString('es-ES', options);
}

// Efectos visuales adicionales
function addHoverEffects() {
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Inicializar efectos después del renderizado
setTimeout(addHoverEffects, 100);
