// Funcionalidad del Perfil
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
});

function initializeProfile() {
    initializeTheme();
    initializeAccentColor();
    setupNavigation();
    setupSaveButton();
    setupQuickActions();
    setupDeleteAccount();
    setupThemeSelector();
    setupAccentColorSelector();
    loadUserData();
    updateStatistics();
}

// Navegación entre secciones
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.profile-section');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover active de todos
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Agregar active al clickeado
            this.classList.add('active');
            const targetSection = this.getAttribute('data-section');
            const section = document.getElementById(targetSection);
            if (section) {
                section.classList.add('active');
            }
        });
    });
}

// Botón de guardar cambios
function setupSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveProfileChanges();
        });
    }
}

// Guardar cambios del perfil
function saveProfileChanges() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const language = document.getElementById('language').value;
    const timezone = document.getElementById('timezone').value;

    // Actualizar datos del usuario
    const userData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username,
        language: language,
        timezone: timezone,
        fullName: `${firstName} ${lastName}`
    };

    // Guardar en localStorage
    const existingData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
    const updatedData = { ...existingData, ...userData };
    
    if (existingData.rememberMe) {
        localStorage.setItem('userData', JSON.stringify(updatedData));
    } else {
        sessionStorage.setItem('userData', JSON.stringify(updatedData));
    }

    // Actualizar display
    updateDisplay();
    
    showNotification('Cambios guardados correctamente');
}

// Cargar datos del usuario
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
    
    if (userData.email) {
        // Cargar datos en los campos
        if (userData.firstName) document.getElementById('firstName').value = userData.firstName;
        if (userData.lastName) document.getElementById('lastName').value = userData.lastName;
        if (userData.email) document.getElementById('email').value = userData.email;
        if (userData.username) document.getElementById('username').value = userData.username;
        if (userData.language) document.getElementById('language').value = userData.language;
        if (userData.timezone) document.getElementById('timezone').value = userData.timezone;
        
        updateDisplay();
    }
}

// Actualizar display del perfil
function updateDisplay() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const fullName = `${firstName} ${lastName}`;

    // Actualizar título
    const profileName = document.getElementById('profileName');
    if (profileName) {
        profileName.textContent = `Perfil de ${fullName}`;
    }

    // Actualizar nombre e email en la sección de foto
    const displayName = document.getElementById('displayName');
    const displayEmail = document.getElementById('displayEmail');
    if (displayName) displayName.textContent = fullName;
    if (displayEmail) displayEmail.textContent = email;

    // Actualizar avatar
    const avatar = document.getElementById('profileAvatar');
    const picture = document.getElementById('profilePicture');
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=ff69b4&color=fff`;
    if (avatar) avatar.src = avatarUrl;
    if (picture) picture.src = avatarUrl + '&size=128';
}

// Actualizar estadísticas
function updateStatistics() {
    // Obtener estadísticas de las tareas desde localStorage
    try {
        const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
        const userId = userData.email || 'guest';
        const savedTasks = localStorage.getItem(`tasks_${userId}`);
        
        let tasks = [];
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
        
        const completedTasks = tasks.filter(t => t.completed).length;
        const pendingTasks = tasks.filter(t => !t.completed).length;
        
        // Actualizar valores
        const completedEl = document.getElementById('completedTasks');
        const pendingEl = document.getElementById('pendingTasks');
        
        if (completedEl) completedEl.textContent = completedTasks;
        if (pendingEl) pendingEl.textContent = pendingTasks;
        
        // Calcular racha (simplificado - días consecutivos con al menos una tarea completada)
        const streakEl = document.getElementById('streakDays');
        if (streakEl) {
            // Por ahora fijo, pero se puede calcular basándose en las fechas de completado
            streakEl.textContent = calculateStreak(tasks);
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        // Valores por defecto si hay error
        const completedEl = document.getElementById('completedTasks');
        const pendingEl = document.getElementById('pendingTasks');
        if (completedEl) completedEl.textContent = 0;
        if (pendingEl) pendingEl.textContent = 0;
    }
}

function calculateStreak(tasks) {
    // Calcular racha de días consecutivos con tareas completadas
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) return 0;
    
    // Por ahora retornamos un valor simple basado en tareas completadas
    // En el futuro se puede mejorar calculando días consecutivos reales
    return Math.min(completedTasks.length, 30); // Máximo 30 días
}

// Acciones rápidas
function setupQuickActions() {
    const actionLinks = document.querySelectorAll('.action-link');
    
    actionLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.closest('.quick-action-item').querySelector('span').textContent;
            handleQuickAction(action);
        });
    });
}

function handleQuickAction(action) {
    switch(action) {
        case 'Editar nombre':
            document.getElementById('firstName').focus();
            document.getElementById('resumen').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'Cambiar contraseña':
            // Cambiar a sección de seguridad
            document.querySelector('[data-section="seguridad"]').click();
            showNotification('Funcionalidad de cambio de contraseña próximamente');
            break;
        case 'Preferencias de tema':
            // Cambiar a sección de apariencia
            document.querySelector('[data-section="apariencia"]').click();
            break;
    }
}

// Eliminar cuenta
function setupDeleteAccount() {
    const deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                if (confirm('Esta acción eliminará todos tus datos. ¿Continuar?')) {
                    // Limpiar datos
                    localStorage.clear();
                    sessionStorage.clear();
                    // Redirigir al login
                    window.location.href = 'login.html';
                }
            }
        });
    }
}

// Botones de navegación
const backBtn = document.getElementById('backBtn');
if (backBtn) {
    backBtn.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
}

const settingsBtn = document.getElementById('settingsBtn');
if (settingsBtn) {
    settingsBtn.addEventListener('click', function() {
        // Por ahora solo muestra un mensaje
        showNotification('Ajustes generales próximamente');
    });
}

// Cambiar foto
const changePhotoBtn = document.querySelector('.change-photo-btn');
if (changePhotoBtn) {
    changePhotoBtn.addEventListener('click', function() {
        // Crear input de archivo
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const avatar = document.getElementById('profileAvatar');
                    const picture = document.getElementById('profilePicture');
                    if (avatar) avatar.src = event.target.result;
                    if (picture) picture.src = event.target.result;
                    showNotification('Foto de perfil actualizada');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });
}

// Notificaciones
function showNotification(message) {
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
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Funcionalidad de Tema Oscuro
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    updateThemeSelector(savedTheme);
}

function setTheme(theme) {
    const body = document.body;
    
    if (theme === 'dark') {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }
    
    localStorage.setItem('theme', theme);
    updateThemeSelector(theme);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    return newTheme;
}

function updateThemeSelector(theme) {
    const themeBadge = document.querySelector('#apariencia .setting-item:first-child .badge');
    if (themeBadge) {
        const icon = themeBadge.querySelector('i');
        const text = theme === 'dark' ? 'Oscuro' : 'Claro';
        const iconClass = theme === 'dark' ? 'fa-moon' : 'fa-sun';
        
        if (icon) {
            icon.className = `fas ${iconClass}`;
        }
        themeBadge.innerHTML = `<i class="fas ${iconClass}"></i> ${text}`;
    }
}

function setupThemeSelector() {
    const themeSetting = document.querySelector('#apariencia .setting-item:first-child');
    if (themeSetting) {
        themeSetting.style.cursor = 'pointer';
        themeSetting.addEventListener('click', function() {
            const newTheme = toggleTheme();
            showNotification(`Tema cambiado a ${newTheme === 'dark' ? 'oscuro' : 'claro'}`);
        });
    }
}

// Funcionalidad de Color de Acento
function initializeAccentColor() {
    const savedColor = localStorage.getItem('accentColor') || '#DDA0DD';
    const savedColorName = localStorage.getItem('accentColorName') || 'Pastel';
    const savedColorHover = localStorage.getItem('accentColorHover') || '#C8A2C8';
    
    applyAccentColor(savedColor, savedColorHover);
    updateAccentColorBadge(savedColorName);
}

function setupAccentColorSelector() {
    const accentColorSetting = document.getElementById('accentColorSetting');
    const colorPickerDropdown = document.getElementById('colorPickerDropdown');
    const colorOptions = document.querySelectorAll('.color-option');
    
    if (!accentColorSetting || !colorPickerDropdown) return;
    
    // Función para posicionar el dropdown
    function positionDropdown() {
        const rect = accentColorSetting.getBoundingClientRect();
        const settingValue = accentColorSetting.querySelector('.setting-value');
        const valueRect = settingValue ? settingValue.getBoundingClientRect() : rect;
        
        const dropdownWidth = 200;
        const dropdownHeight = colorPickerDropdown.scrollHeight || 300;
        
        // Calcular posición: alineado con el badge (setting-value)
        let top = valueRect.bottom + 8;
        let left = valueRect.right - dropdownWidth;
        
        // Ajustar si se sale por la derecha
        if (left < 20) {
            left = valueRect.left;
        }
        
        // Ajustar si se sale por abajo
        if (top + dropdownHeight > window.innerHeight - 20) {
            top = valueRect.top - dropdownHeight - 8;
            // Si tampoco cabe arriba, ponerlo arriba del viewport
            if (top < 20) {
                top = 20;
            }
        }
        
        colorPickerDropdown.style.top = `${top}px`;
        colorPickerDropdown.style.left = `${left}px`;
    }
    
    // Toggle dropdown al hacer click en el setting
    accentColorSetting.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const isShowing = colorPickerDropdown.classList.contains('show');
        
        if (!isShowing) {
            // Calcular posición antes de mostrar
            positionDropdown();
        }
        
        colorPickerDropdown.classList.toggle('show');
    });
    
    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!accentColorSetting.contains(e.target) && !colorPickerDropdown.contains(e.target)) {
            colorPickerDropdown.classList.remove('show');
        }
    });
    
    // Reposicionar al hacer scroll o resize
    window.addEventListener('scroll', function() {
        if (colorPickerDropdown.classList.contains('show')) {
            positionDropdown();
        }
    });
    
    window.addEventListener('resize', function() {
        if (colorPickerDropdown.classList.contains('show')) {
            positionDropdown();
        }
    });
    
    // Seleccionar color
    colorOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const color = this.getAttribute('data-color');
            const colorName = this.getAttribute('data-name');
            const colorHover = this.getAttribute('data-hover');
            
            applyAccentColor(color, colorHover);
            updateAccentColorBadge(colorName);
            
            // Guardar preferencia
            localStorage.setItem('accentColor', color);
            localStorage.setItem('accentColorName', colorName);
            localStorage.setItem('accentColorHover', colorHover);
            
            // Cerrar dropdown
            colorPickerDropdown.classList.remove('show');
            
            showNotification(`Color de acento cambiado a ${colorName}`);
        });
    });
}

function applyAccentColor(color, colorHover) {
    // Actualizar variables CSS
    document.documentElement.style.setProperty('--accent-color', color);
    document.documentElement.style.setProperty('--accent-color-hover', colorHover);
    
    // Aplicar a elementos que usan el color directamente (para compatibilidad)
    const style = document.createElement('style');
    style.id = 'accent-color-override';
    
    // Remover estilo anterior si existe
    const existingStyle = document.getElementById('accent-color-override');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    style.textContent = `
        .mobile-sidebar-btn,
        .list-item.active,
        .add-btn,
        .save-btn,
        .login-btn,
        .action-btn:hover,
        .task-input:focus,
        .date-input:focus,
        .category-select:focus,
        .search-bar input:focus,
        .notification-icon:hover,
        .user-profile:hover,
        .badge.active,
        .forgot-password,
        .action-link,
        .change-photo-btn:hover,
        .nav-btn:hover,
        .progress-percentage {
            color: ${color} !important;
            border-color: ${color} !important;
        }
        .list-item.active,
        .add-btn,
        .save-btn,
        .login-btn,
        .nav-item.active,
        .badge.active {
            background-color: ${color} !important;
        }
        .add-btn,
        .save-btn,
        .login-btn {
            color: white !important;
        }
        .badge.active {
            color: white !important;
        }
        .badge.active i {
            color: white !important;
        }
        .nav-item.active {
            color: white !important;
        }
        .nav-item.active i {
            color: white !important;
        }
        .nav-item.active span {
            color: white !important;
        }
        .add-btn:hover,
        .save-btn:hover,
        .login-btn:hover {
            background-color: ${colorHover} !important;
            color: white !important;
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

function updateAccentColorBadge(colorName) {
    const badge = document.getElementById('accentColorBadge');
    const nameSpan = document.getElementById('accentColorName');
    
    if (nameSpan) {
        nameSpan.textContent = colorName;
    }
}

// Verificar sesión
(function() {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'login.html';
    }
})();
