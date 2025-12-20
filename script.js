// Variables globales
let tasks = [];

// Datos de ejemplo para primera vez
const defaultTasks = [
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
let currentCategoryFilter = null; // null = todas las categorías

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadTasks(); // Cargar tareas guardadas
    initializeTheme();
    initializeAccentColor();
    setupEventListeners();
    renderTasks();
    updateTaskCounts();
    setupMobileMenu();
    setupDateInputs();
    updateDailyProgress();
    updateUrgentTasks();
    setupLogout();
    setupStorageSync(); // Sincronización entre pestañas
    initializeNotifications(); // Inicializar sistema de notificaciones
    startReminderChecker(); // Iniciar verificador de recordatorios
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                // Limpiar sesión
                localStorage.removeItem('userData');
                sessionStorage.removeItem('userData');
                // Redirigir al login
                window.location.href = 'login.html';
            }
        });
    }
}

// Función auxiliar para obtener la fecha de hoy en formato local (YYYY-MM-DD)
function getTodayLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mes es 0-indexado, sumar 1
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Función auxiliar para convertir un objeto Date a formato local (YYYY-MM-DD)
function getTodayLocalDateFromDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function setupDateInputs() {
    const today = getTodayLocalDate(); // Usar función que obtiene fecha local
    const taskDateInput = document.getElementById('taskDate');
    
    if (taskDateInput) {
        taskDateInput.value = today;
        taskDateInput.min = today; // No permitir fechas pasadas
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

    // Filtros de categoría
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remover clase active de todas las categorías
            categoryItems.forEach(ci => ci.classList.remove('active'));
            // Agregar clase active al clickeado
            this.classList.add('active');
            
            const categoryName = this.querySelector('span').textContent;
            filterByCategory(categoryName);
            
            // Cerrar menú hamburguesa en móvil
            const sidebarLeft = document.querySelector('.sidebar-left');
            const overlay = document.getElementById('sidebarOverlay');
            if (sidebarLeft && window.innerWidth <= 768) {
                sidebarLeft.classList.remove('mobile-visible');
                if (overlay) {
                    overlay.classList.remove('visible');
                }
            }
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

    // Botón de permisos de notificaciones
    const notificationBtn = document.getElementById('notificationPermissionBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            requestNotificationPermission();
        });
    }
}

// Funciones de persistencia de datos
function saveTasks() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
        const userId = userData.email || 'guest';
        localStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks));
        // Disparar evento personalizado para sincronización entre pestañas
        localStorage.setItem(`tasks_${userId}_sync`, Date.now().toString());
    } catch (error) {
        console.error('Error guardando tareas:', error);
    }
}

// Sincronización entre pestañas
function setupStorageSync() {
    window.addEventListener('storage', function(e) {
        if (e.key && e.key.startsWith('tasks_') && e.key.endsWith('_sync')) {
            // Recargar tareas cuando hay cambios en otra pestaña
            loadTasks();
            renderTasks();
            updateTaskCounts();
            updateDailyProgress();
            updateUrgentTasks();
        }
    });
}

function loadTasks() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
        const userId = userData.email || 'guest';
        const savedTasks = localStorage.getItem(`tasks_${userId}`);
        
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            // Asegurar que las tareas tengan todas las propiedades necesarias
            tasks = tasks.map(task => ({
                id: task.id || Date.now() + Math.random(),
                text: task.text || '',
                completed: task.completed || false,
                tags: task.tags || [],
                category: task.category || 'Personal',
                dueDate: task.dueDate || getTodayLocalDate(),
                reminderTime: task.reminderTime || null, // Incluir hora de recordatorio
                priority: task.priority || 'medium'
            }));
        } else {
            // Si no hay tareas guardadas, usar las de ejemplo solo la primera vez
            tasks = JSON.parse(JSON.stringify(defaultTasks));
            saveTasks(); // Guardar las tareas de ejemplo
        }
    } catch (error) {
        console.error('Error cargando tareas:', error);
        // Si hay error, usar tareas de ejemplo
        tasks = JSON.parse(JSON.stringify(defaultTasks));
    }
}

// Funciones de tareas
function addNewTask() {
    const taskInput = document.querySelector('.task-input');
    const dateInput = document.getElementById('taskDate');
    const timeInput = document.getElementById('taskTime'); // Nuevo: selector de hora
    const categorySelect = document.getElementById('taskCategory');
    const taskText = taskInput.value.trim();
    const selectedDate = dateInput.value;
    const selectedTime = timeInput ? timeInput.value : ''; // Obtener hora seleccionada
    const selectedCategory = categorySelect ? categorySelect.value : 'Personal';
    
    if (taskText) {
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            tags: [selectedCategory],
            category: selectedCategory,
            dueDate: selectedDate || getTodayLocalDate(), // Usar fecha seleccionada o hoy por defecto
            reminderTime: selectedTime || null, // Guardar hora de recordatorio (null si no se especifica)
            priority: "medium"
        };
        
        tasks.push(newTask);
        saveTasks(); // Guardar después de agregar
        
        // Debug: mostrar información de la tarea creada
        console.log('Tarea creada:', {
            text: newTask.text,
            dueDate: newTask.dueDate,
            reminderTime: newTask.reminderTime,
            fechaHoy: getTodayLocalDate()
        });
        
        taskInput.value = '';
        dateInput.value = ''; // Limpiar el selector de fecha
        if (timeInput) timeInput.value = ''; // Limpiar el selector de hora
        renderTasks();
        updateTaskCounts();
        updateDailyProgress();
        updateUrgentTasks();
        showNotification('Tarea añadida correctamente');
    }
}

// Funciones de progreso y urgentes
function updateDailyProgress() {
    const today = getTodayLocalDate();
    const todayTasks = tasks.filter(task => task.dueDate === today);
    const completedTasks = todayTasks.filter(task => task.completed);
    const totalToday = todayTasks.length;
    const completedToday = completedTasks.length;
    const pendingToday = totalToday - completedToday;
    
    const percentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
    
    // Actualizar porcentaje
    const progressPercentage = document.getElementById('progressPercentage');
    if (progressPercentage) {
        progressPercentage.textContent = `${percentage}%`;
    }
    
    // Actualizar círculo de progreso
    const progressCircle = document.getElementById('progressCircle');
    if (progressCircle) {
        const degrees = (percentage / 100) * 360;
        const accentColor = localStorage.getItem('accentColor') || '#DDA0DD';
        progressCircle.style.background = `conic-gradient(${accentColor} ${degrees}deg, #e0e0e0 ${degrees}deg)`;
    }
    
    // Actualizar estadísticas
    const todayTotalEl = document.getElementById('todayTotal');
    const todayCompletedEl = document.getElementById('todayCompleted');
    const todayPendingEl = document.getElementById('todayPending');
    
    if (todayTotalEl) todayTotalEl.textContent = totalToday;
    if (todayCompletedEl) todayCompletedEl.textContent = completedToday;
    if (todayPendingEl) todayPendingEl.textContent = pendingToday;
}

function updateUrgentTasks() {
    const today = getTodayLocalDate();
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = getTodayLocalDateFromDate(tomorrowDate);
    
    // Tareas que vencen hoy o mañana (solo pendientes)
    const urgentTasks = tasks.filter(task => {
        if (task.completed) return false;
        return task.dueDate === today || task.dueDate === tomorrow;
    }).sort((a, b) => {
        // Primero las de hoy, luego las de mañana
        if (a.dueDate === today && b.dueDate !== today) return -1;
        if (a.dueDate !== today && b.dueDate === today) return 1;
        return 0;
    });
    
    const urgentList = document.getElementById('urgentList');
    if (!urgentList) return;
    
    if (urgentTasks.length === 0) {
        urgentList.innerHTML = '<div class="no-urgent">¡No hay tareas urgentes! 🎉</div>';
        return;
    }
    
    urgentList.innerHTML = urgentTasks.map(task => {
        const isToday = task.dueDate === today;
        const dateLabel = isToday ? 'Hoy' : 'Mañana';
        const urgencyClass = isToday ? '' : 'soon';
        
        return `
            <div class="urgent-item ${urgencyClass}" onclick="scrollToTask(${task.id})">
                <span class="urgent-text">${task.text}</span>
                <span class="urgent-date">${dateLabel}</span>
            </div>
        `;
    }).join('');
}

function scrollToTask(taskId) {
    // Scroll a la tarea en la lista principal
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
        taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Resaltar temporalmente
        taskElement.style.backgroundColor = '#fff9e6';
        setTimeout(() => {
            taskElement.style.backgroundColor = '';
        }, 2000);
    }
}

function toggleTaskComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks(); // Guardar después de cambiar estado
        renderTasks();
        updateTaskCounts();
        updateDailyProgress();
        updateUrgentTasks();
    }
}

function deleteTask(taskId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks(); // Guardar después de eliminar
        renderTasks();
        updateTaskCounts();
        updateDailyProgress();
        updateUrgentTasks();
        showNotification('Tarea eliminada');
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const newText = prompt('Editar tarea:', task.text);
        if (newText && newText.trim()) {
            task.text = newText.trim();
            saveTasks(); // Guardar después de editar
            renderTasks();
            updateUrgentTasks();
            showNotification('Tarea actualizada');
        }
    }
}

// Renderizado
function renderTasks() {
    const tasksContainer = document.querySelector('.tasks-container');
    const filteredTasks = getFilteredTasks();
    
    tasksContainer.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="task-checkbox" onclick="toggleTaskComplete(${task.id})">
                <i class="${task.completed ? 'fas fa-check-circle' : 'far fa-circle'}"></i>
            </div>
            <div class="task-content">
                <span class="task-text" style="text-decoration: ${task.completed ? 'line-through' : 'none'}; opacity: ${task.completed ? '0.6' : '1'}">${task.text}</span>
                <div class="task-tags">
                    ${task.tags.map(tag => `<span class="tag" style="background-color: ${getTagColor(tag)};">${tag}</span>`).join('')}
                    <span class="tag" style="background-color: ${getDueDateColor(task.dueDate)};">${formatDueDate(task.dueDate)}</span>
                    ${task.reminderTime ? `<span class="tag" style="background-color: #4A90E2;"><i class="fas fa-clock"></i> ${task.reminderTime.substring(0, 5)}</span>` : ''}
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
    
    // Filtrar por lista - usar fecha local, no UTC
    const today = getTodayLocalDate(); // Usar función que obtiene fecha local
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1); // Sumar 1 día
    const tomorrow = getTodayLocalDateFromDate(tomorrowDate); // Convertir a formato local
    
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
    
    // Filtrar por categoría si hay un filtro activo
    if (currentCategoryFilter) {
        filtered = filtered.filter(task => task.category === currentCategoryFilter);
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

function filterByCategory(categoryName) {
    // Si se hace click en la misma categoría, quitar el filtro
    if (currentCategoryFilter === categoryName) {
        currentCategoryFilter = null;
        // Remover clase active de todas las categorías
        document.querySelectorAll('.category-item').forEach(ci => ci.classList.remove('active'));
    } else {
        currentCategoryFilter = categoryName;
    }
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
    const today = getTodayLocalDate();
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = getTodayLocalDateFromDate(tomorrowDate);
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
    const today = getTodayLocalDate();
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = getTodayLocalDateFromDate(tomorrowDate);
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
    const today = getTodayLocalDate();
    
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

// Funcionalidad de Tema Oscuro
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    const body = document.body;
    
    if (theme === 'dark') {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }
    
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    return newTheme;
}

// Función global para cambiar tema desde otras páginas
window.setTheme = setTheme;
window.toggleTheme = toggleTheme;

// Funcionalidad de Color de Acento
function initializeAccentColor() {
    const savedColor = localStorage.getItem('accentColor') || '#DDA0DD';
    const savedColorHover = localStorage.getItem('accentColorHover') || '#C8A2C8';
    applyAccentColor(savedColor, savedColorHover);
}

function applyAccentColor(color, colorHover) {
    // Actualizar variables CSS
    document.documentElement.style.setProperty('--accent-color', color);
    document.documentElement.style.setProperty('--accent-color-hover', colorHover);
    
    // Aplicar a elementos que usan el color directamente
    const style = document.createElement('style');
    style.id = 'accent-color-override';
    
    // Remover estilo anterior si existe
    const existingStyle = document.getElementById('accent-color-override');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    style.textContent = `
        .mobile-sidebar-btn,
        .add-btn,
        .action-btn:hover,
        .task-input:focus,
        .date-input:focus,
        .category-select:focus,
        .search-bar input:focus,
        .notification-icon:hover,
        .user-profile:hover {
            color: ${color} !important;
            border-color: ${color} !important;
        }
        .list-item.active,
        .add-btn {
            background-color: ${color} !important;
        }
        .add-btn {
            color: white !important;
        }
        .list-item.active {
            color: white !important;
        }
        .list-item.active i {
            color: white !important;
        }
        .list-item.active span {
            color: white !important;
        }
        .add-btn:hover {
            background-color: ${colorHover} !important;
        }
        .action-btn:hover,
        .task-input:focus,
        .date-input:focus,
        .category-select:focus,
        .search-bar input:focus {
            border-color: ${color} !important;
        }
        .progress-circle {
            background: conic-gradient(${color} var(--progress-degrees, 0deg), #e0e0e0 var(--progress-degrees, 0deg)) !important;
        }
    `;
    
    document.head.appendChild(style);
}

// ============================================
// SISTEMA DE NOTIFICACIONES Y RECORDATORIOS
// ============================================

// Variable para almacenar el intervalo del verificador de recordatorios
let reminderInterval = null;

// Función para inicializar el sistema de notificaciones
function initializeNotifications() {
    // Verificar si el navegador soporta notificaciones
    if (!('Notification' in window)) {
        console.log('Este navegador no soporta notificaciones del sistema');
        return; // Si no soporta, salir de la función
    }
    
    // Verificar el estado actual del permiso
    const permission = Notification.permission;
    
    // Si el permiso es "default" (aún no se ha preguntado), solicitar permiso
    if (permission === 'default') {
        // Mostrar un mensaje informativo al usuario
        console.log('Las notificaciones están disponibles. Se solicitará permiso cuando sea necesario.');
    } else if (permission === 'granted') {
        // Si ya tiene permiso, mostrar mensaje de confirmación
        console.log('Permisos de notificación concedidos');
    } else if (permission === 'denied') {
        // Si el permiso fue denegado, informar al usuario
        console.log('Permisos de notificación denegados');
    }
}

// Función para solicitar permiso de notificaciones
function requestNotificationPermission() {
    // Verificar si el navegador soporta notificaciones
    if (!('Notification' in window)) {
        showNotification('Tu navegador no soporta notificaciones');
        return Promise.resolve(false); // Retornar promesa resuelta con false
    }
    
    // Si ya tiene permiso concedido, retornar true
    if (Notification.permission === 'granted') {
        return Promise.resolve(true);
    }
    
    // Si el permiso fue denegado, informar al usuario
    if (Notification.permission === 'denied') {
        showNotification('Los permisos de notificación fueron denegados. Por favor, habilítalos en la configuración del navegador.');
        return Promise.resolve(false);
    }
    
    // Solicitar permiso al usuario (solo funciona si es "default")
    return Notification.requestPermission().then(function(permission) {
        // permission puede ser: "granted", "denied", o "default"
        if (permission === 'granted') {
            showNotification('Notificaciones habilitadas correctamente');
            return true;
        } else {
            showNotification('Permisos de notificación denegados');
            return false;
        }
    });
}

// Función para mostrar una notificación del navegador
function showBrowserNotification(title, options) {
    // Verificar si el navegador soporta notificaciones
    if (!('Notification' in window)) {
        console.log('Este navegador no soporta notificaciones');
        return; // Salir si no soporta
    }
    
    // Verificar si tiene permiso
    if (Notification.permission !== 'granted') {
        // Si no tiene permiso, solicitarlo primero
        requestNotificationPermission().then(function(hasPermission) {
            if (hasPermission) {
                // Si se concedió el permiso, crear la notificación
                createNotification(title, options);
            }
        });
        return; // Salir de la función
    }
    
    // Si ya tiene permiso, crear la notificación directamente
    createNotification(title, options);
}

// Función auxiliar para crear la notificación
function createNotification(title, options) {
    // Opciones por defecto para la notificación
    const defaultOptions = {
        body: '', // Cuerpo del mensaje
        icon: '/favicon.ico', // Icono (si existe)
        badge: '/favicon.ico', // Badge para móviles
        tag: 'task-reminder', // Tag para agrupar notificaciones similares
        requireInteraction: false, // Si es true, requiere interacción del usuario
        silent: false // Si es true, no reproduce sonido
    };
    
    // Combinar opciones por defecto con las opciones proporcionadas
    const notificationOptions = { ...defaultOptions, ...options };
    
    // Crear la notificación
    const notification = new Notification(title, notificationOptions);
    
    // Cuando el usuario hace click en la notificación, enfocar la ventana
    notification.onclick = function() {
        window.focus(); // Enfocar la ventana del navegador
        notification.close(); // Cerrar la notificación
    };
    
    // Cerrar automáticamente después de 5 segundos
    setTimeout(function() {
        notification.close();
    }, 5000);
}

// Variable para rastrear recordatorios ya mostrados (evitar duplicados)
let shownReminders = new Set();

// Función para iniciar el verificador de recordatorios
function startReminderChecker() {
    // Si ya hay un intervalo activo, no crear otro
    if (reminderInterval) {
        return; // Salir si ya está corriendo
    }
    
    // Verificar recordatorios inmediatamente al iniciar
    checkReminders();
    
    // Verificar recordatorios cada 30 segundos (30000 milisegundos)
    // Esto permite detectar recordatorios más rápido
    reminderInterval = setInterval(function() {
        checkReminders();
    }, 30000); // 30000ms = 30 segundos
}

// Función para detener el verificador de recordatorios
function stopReminderChecker() {
    // Si hay un intervalo activo, detenerlo
    if (reminderInterval) {
        clearInterval(reminderInterval); // Limpiar el intervalo
        reminderInterval = null; // Establecer a null
    }
}

// Función para verificar y mostrar recordatorios
function checkReminders() {
    // Obtener la fecha y hora actual
    const now = new Date();
    const currentDate = getTodayLocalDate(); // Fecha en formato YYYY-MM-DD (local)
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // Hora en formato HH:MM
    
    // Debug: mostrar información de verificación
    console.log('Verificando recordatorios:', {
        fechaActual: currentDate,
        horaActual: currentTime,
        totalTareas: tasks.length,
        tareasConRecordatorio: tasks.filter(t => t.reminderTime).length
    });
    
    // Convertir hora actual a minutos desde medianoche para comparación
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;
    
    // Filtrar tareas que tienen recordatorio configurado
    const tasksWithReminders = tasks.filter(function(task) {
        // Debe tener hora de recordatorio
        if (!task.reminderTime) {
            return false; // Si no tiene hora, no incluir
        }
        
        // No debe estar completada
        if (task.completed) {
            return false; // Si está completada, no incluir
        }
        
        // La fecha de vencimiento debe ser hoy
        if (task.dueDate !== currentDate) {
            return false; // Si no es hoy, no incluir
        }
        
        // Obtener hora de recordatorio en formato HH:MM
        const reminderTime = task.reminderTime.substring(0, 5);
        const [reminderHour, reminderMinute] = reminderTime.split(':').map(Number);
        const reminderMinutes = reminderHour * 60 + reminderMinute;
        
        // Crear clave única para este recordatorio (taskId + fecha + hora)
        const reminderKey = `${task.id}-${task.dueDate}-${reminderTime}`;
        
        // Verificar si este recordatorio ya fue mostrado
        if (shownReminders.has(reminderKey)) {
            return false; // Si ya se mostró, no incluir
        }
        
        // Verificar si la hora de recordatorio ya pasó o es ahora (con margen de 1 minuto)
        // Esto permite mostrar recordatorios que ya pasaron pero no se han mostrado
        const timeDifference = currentMinutes - reminderMinutes;
        
        // Mostrar si la hora coincide exactamente o si pasó hace menos de 1 minuto
        if (timeDifference >= 0 && timeDifference <= 1) {
            // Marcar como mostrado para evitar duplicados
            shownReminders.add(reminderKey);
            return true; // Incluir esta tarea
        }
        
        return false; // Si no cumple las condiciones, no incluir
    });
    
    // Para cada tarea con recordatorio, mostrar notificación
    tasksWithReminders.forEach(function(task) {
        // Crear título de la notificación
        const notificationTitle = 'Recordatorio de tarea';
        
        // Crear cuerpo del mensaje
        const notificationBody = `${task.text}\nCategoría: ${task.category}`;
        
        // Mostrar la notificación del navegador
        showBrowserNotification(notificationTitle, {
            body: notificationBody, // Mensaje de la notificación
            icon: '/favicon.ico', // Icono (si existe)
            tag: `task-${task.id}`, // Tag único por tarea
            requireInteraction: false // No requiere interacción
        });
        
        // También mostrar notificación visual en la app
        showNotification(`Recordatorio: ${task.text}`);
    });
    
    // Limpiar recordatorios antiguos (de días anteriores) del Set
    // Esto evita que el Set crezca indefinidamente
    const keysToRemove = [];
    shownReminders.forEach(function(key) {
        const keyParts = key.split('-');
        const reminderDate = keyParts[1]; // La fecha está en la segunda parte
        if (reminderDate !== currentDate) {
            keysToRemove.push(key); // Marcar para eliminar
        }
    });
    keysToRemove.forEach(function(key) {
        shownReminders.delete(key); // Eliminar del Set
    });
}

