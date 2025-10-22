// Variables globales
let tasks = [
    {
        id: 1,
        text: "Pagar la factura de electricidad",
        completed: false,
        tags: ["Hogar", "Vence hoy"],
        category: "Personal",
        dueDate: new Date().toISOString().split('T')[0], // Hoy
        priority: "high"
    },
    {
        id: 2,
        text: "Terminar borrador del brief del proyecto",
        completed: false,
        tags: ["Trabajo", "Mañana"],
        category: "Trabajo",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
        priority: "medium"
    },
    {
        id: 3,
        text: "Comprar alimentos para la cena",
        completed: false,
        tags: ["Mandados", "Esta semana"],
        category: "Mandados",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // En 3 días
        priority: "low"
    },
    {
        id: 4,
        text: "Revisar notas de la reunión",
        completed: false,
        tags: ["Trabajo"],
        category: "Trabajo",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // En 1 semana
        priority: "medium"
    },
    {
        id: 5,
        text: "Llamar al dentista",
        completed: true,
        tags: ["Personal"],
        category: "Personal",
        dueDate: new Date().toISOString().split('T')[0], // Hoy (completada)
        priority: "low"
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
    setupMobileMenu();
    setupDateInputs();
}

function setupDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    const taskDateInput = document.getElementById('taskDate');
    const quickTaskDateInput = document.getElementById('quickTaskDate');
    
    if (taskDateInput) {
        taskDateInput.value = today;
        taskDateInput.min = today; // No permitir fechas pasadas
    }
    
    if (quickTaskDateInput) {
        quickTaskDateInput.value = today;
        quickTaskDateInput.min = today; // No permitir fechas pasadas
    }
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
    const dateInput = document.getElementById('taskDate');
    const taskText = taskInput.value.trim();
    const selectedDate = dateInput.value;
    
    if (taskText) {
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            tags: ["Personal"],
            category: "Personal",
            dueDate: selectedDate || new Date().toISOString().split('T')[0], // Usar fecha seleccionada o hoy por defecto
            priority: "medium"
        };
        
        tasks.push(newTask);
        taskInput.value = '';
        dateInput.value = ''; // Limpiar el selector de fecha
        renderTasks();
        updateTaskCounts();
        showNotification('Tarea añadida correctamente');
    }
}

function addQuickTask() {
    const quickInput = document.querySelector('.quick-add input[type="text"]');
    const quickDateInput = document.getElementById('quickTaskDate');
    const taskText = quickInput.value.trim();
    const selectedDate = quickDateInput.value;
    
    if (taskText) {
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            tags: ["Personal"],
            category: "Personal",
            dueDate: selectedDate || new Date().toISOString().split('T')[0], // Usar fecha seleccionada o hoy por defecto
            priority: "medium"
        };
        
        tasks.push(newTask);
        quickInput.value = '';
        quickDateInput.value = ''; // Limpiar el selector de fecha
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
                    <span class="tag" style="background-color: ${getDueDateColor(task.dueDate)};">${formatDueDate(task.dueDate)}</span>
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
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    switch(currentFilter) {
        case 'Hoy':
            // Tareas que vencen hoy (completadas y pendientes)
            filtered = tasks.filter(task => task.dueDate === today);
            break;
        case 'Próximas':
            // Tareas que vencen en el futuro (solo pendientes)
            filtered = tasks.filter(task => !task.completed && task.dueDate > today);
            break;
        case 'Todas':
            // Todas las tareas
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

function formatDueDate(dueDate) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const taskDate = new Date(dueDate);
    const todayDate = new Date(today);
    
    if (dueDate === today) {
        return 'Hoy';
    } else if (dueDate === tomorrow) {
        return 'Mañana';
    } else {
        const diffTime = taskDate - todayDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `Hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`;
        } else if (diffDays <= 7) {
            return `En ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
        } else {
            return taskDate.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'short' 
            });
        }
    }
}

function getDueDateColor(dueDate) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const taskDate = new Date(dueDate);
    const todayDate = new Date(today);
    
    if (dueDate === today) {
        return '#FF6B6B'; // Rojo para hoy
    } else if (dueDate === tomorrow) {
        return '#FFD93D'; // Amarillo para mañana
    } else {
        const diffTime = taskDate - todayDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return '#FF4757'; // Rojo oscuro para vencidas
        } else if (diffDays <= 3) {
            return '#FFA502'; // Naranja para próximas
        } else {
            return '#2ED573'; // Verde para futuras
        }
    }
}

function updateTaskCounts() {
    const today = new Date().toISOString().split('T')[0];
    
    // Tareas que vencen hoy (completadas y pendientes)
    const todayCount = tasks.filter(t => t.dueDate === today).length;
    
    // Tareas que vencen en el futuro (solo pendientes)
    const upcomingCount = tasks.filter(t => !t.completed && t.dueDate > today).length;
    
    // Todas las tareas
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

// Mobile Menu Functions
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileSidebarBtn = document.getElementById('mobileSidebarBtn');
    const sidebarLeft = document.querySelector('.sidebar-left');
    const sidebarRight = document.querySelector('.sidebar-right');
    const overlay = document.getElementById('sidebarOverlay');
    
    function updateOverlay() {
        const isLeftOpen = sidebarLeft && sidebarLeft.classList.contains('mobile-visible');
        const isRightOpen = sidebarRight && sidebarRight.classList.contains('mobile-visible');
        
        if (overlay) {
            if (isLeftOpen || isRightOpen) {
                overlay.classList.add('visible');
            } else {
                overlay.classList.remove('visible');
            }
        }
    }
    
    if (mobileMenuBtn && sidebarLeft) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebarLeft.classList.toggle('mobile-visible');
            // Cerrar sidebar derecho si está abierto
            if (sidebarRight) {
                sidebarRight.classList.remove('mobile-visible');
            }
            updateOverlay();
        });
    }
    
    if (mobileSidebarBtn && sidebarRight) {
        mobileSidebarBtn.addEventListener('click', function() {
            sidebarRight.classList.toggle('mobile-visible');
            // Cerrar sidebar izquierdo si está abierto
            if (sidebarLeft) {
                sidebarLeft.classList.remove('mobile-visible');
            }
            updateOverlay();
        });
    }
    
    // Cerrar menús al hacer click en el overlay
    if (overlay) {
        overlay.addEventListener('click', function() {
            if (sidebarLeft) sidebarLeft.classList.remove('mobile-visible');
            if (sidebarRight) sidebarRight.classList.remove('mobile-visible');
            updateOverlay();
        });
    }
    
    // Cerrar menús al hacer click fuera
    document.addEventListener('click', function(e) {
        if (sidebarLeft && !sidebarLeft.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            sidebarLeft.classList.remove('mobile-visible');
        }
        if (sidebarRight && !sidebarRight.contains(e.target) && !mobileSidebarBtn.contains(e.target)) {
            sidebarRight.classList.remove('mobile-visible');
        }
        updateOverlay();
    });
    
    // Cerrar menús al redimensionar ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            if (sidebarLeft) sidebarLeft.classList.remove('mobile-visible');
            if (sidebarRight) sidebarRight.classList.remove('mobile-visible');
            updateOverlay();
        }
    });
}

// Inicializar efectos después del renderizado
setTimeout(addHoverEffects, 100);
