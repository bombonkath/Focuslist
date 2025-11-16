// Funcionalidad del Perfil
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
});

function initializeProfile() {
    initializeTheme();
    setupNavigation();
    setupSaveButton();
    setupQuickActions();
    setupDeleteAccount();
    setupThemeSelector();
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
    // Obtener estadísticas de las tareas (si están disponibles)
    // Por ahora usamos valores por defecto, pero podrías cargarlos desde localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    
    // Actualizar valores
    const completedEl = document.getElementById('completedTasks');
    const pendingEl = document.getElementById('pendingTasks');
    
    if (completedEl) completedEl.textContent = completedTasks || 128;
    if (pendingEl) pendingEl.textContent = pendingTasks || 7;
    
    // Calcular racha (simplificado)
    const streakEl = document.getElementById('streakDays');
    if (streakEl) streakEl.textContent = 12; // Por ahora fijo
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

// Verificar sesión
(function() {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'login.html';
    }
})();
