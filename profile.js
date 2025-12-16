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
    setupChangePassword(); // Nueva función para manejar cambio de contraseña
    loadUserData();
    loadProfilePhoto(); // Cargar foto de perfil guardada
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
    // Obtener los valores de los campos del formulario
    const firstName = document.getElementById('firstName').value.trim(); // trim() elimina espacios al inicio y final
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const language = document.getElementById('language').value;
    const timezone = document.getElementById('timezone').value;

    // VALIDACIÓN 1: Verificar que el nombre no esté vacío
    if (!firstName || firstName.length === 0) {
        showError('El nombre es obligatorio');
        document.getElementById('firstName').focus(); // Enfocar el campo con error
        return; // Salir de la función
    }

    // VALIDACIÓN 2: Verificar que el apellido no esté vacío
    if (!lastName || lastName.length === 0) {
        showError('El apellido es obligatorio');
        document.getElementById('lastName').focus();
        return;
    }

    // VALIDACIÓN 3: Verificar que el nombre tenga al menos 2 caracteres
    if (firstName.length < 2) {
        showError('El nombre debe tener al menos 2 caracteres');
        document.getElementById('firstName').focus();
        return;
    }

    // VALIDACIÓN 4: Verificar que el apellido tenga al menos 2 caracteres
    if (lastName.length < 2) {
        showError('El apellido debe tener al menos 2 caracteres');
        document.getElementById('lastName').focus();
        return;
    }

    // VALIDACIÓN 5: Verificar que el email no esté vacío
    if (!email || email.length === 0) {
        showError('El correo electrónico es obligatorio');
        document.getElementById('email').focus();
        return;
    }

    // VALIDACIÓN 6: Verificar formato de email válido
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
        showError('Por favor, ingresa un correo electrónico válido');
        document.getElementById('email').focus();
        return;
    }

    // VALIDACIÓN 7: Verificar que el username no esté vacío
    if (!username || username.length === 0) {
        showError('El nombre de usuario es obligatorio');
        document.getElementById('username').focus();
        return;
    }

    // VALIDACIÓN 8: Verificar que el username tenga al menos 3 caracteres
    if (username.length < 3) {
        showError('El nombre de usuario debe tener al menos 3 caracteres');
        document.getElementById('username').focus();
        return;
    }

    // VALIDACIÓN 9: Verificar que el username solo contenga letras, números, guiones y guiones bajos
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
        showError('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos');
        document.getElementById('username').focus();
        return;
    }

    // VALIDACIÓN 10: Verificar que el username no empiece con guión o guión bajo
    if (username.startsWith('-') || username.startsWith('_')) {
        showError('El nombre de usuario no puede empezar con guión o guión bajo');
        document.getElementById('username').focus();
        return;
    }

    // Obtener datos del usuario actual
    const existingData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
    const currentEmail = existingData.email;

    // VALIDACIÓN 11: Si el email cambió, verificar que no esté en uso por otro usuario
    if (email !== currentEmail) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const emailExists = users.some(u => u.email === email && u.email !== currentEmail);
        
        if (emailExists) {
            showError('Este correo electrónico ya está en uso por otra cuenta');
            document.getElementById('email').focus();
            return;
        }
    }

    // VALIDACIÓN 12: Verificar que el username no esté en uso por otro usuario (si cambió)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const usernameExists = users.some(u => u.username === username && u.email !== currentEmail);
    
    if (usernameExists) {
        showError('Este nombre de usuario ya está en uso');
        document.getElementById('username').focus();
        return;
    }

    // Si todas las validaciones pasan, crear el objeto con los datos actualizados
    const userData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username,
        language: language,
        timezone: timezone,
        fullName: `${firstName} ${lastName}`
    };

    // Actualizar datos en localStorage/sessionStorage
    const updatedData = { ...existingData, ...userData };
    
    if (existingData.rememberMe) {
        localStorage.setItem('userData', JSON.stringify(updatedData));
    } else {
        sessionStorage.setItem('userData', JSON.stringify(updatedData));
    }

    // Si el email cambió, actualizar también en el array de usuarios
    if (email !== currentEmail) {
        const userIndex = users.findIndex(u => u.email === currentEmail);
        if (userIndex !== -1) {
            users[userIndex].email = email;
            users[userIndex].firstName = firstName;
            users[userIndex].lastName = lastName;
            users[userIndex].username = username;
            localStorage.setItem('users', JSON.stringify(users));
        }
    } else {
        // Si el email no cambió, solo actualizar nombre y apellido en el array
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
            users[userIndex].firstName = firstName;
            users[userIndex].lastName = lastName;
            users[userIndex].username = username;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    // Actualizar la visualización del perfil
    updateDisplay();
    
    // Mostrar mensaje de éxito
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

    // Actualizar avatar (solo si no hay foto personalizada guardada)
    const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
    const userEmail = userData.email || 'guest';
    const savedPhoto = localStorage.getItem(`profilePhoto_${userEmail}`) || userData.profilePhoto;
    
    const avatar = document.getElementById('profileAvatar');
    const picture = document.getElementById('profilePicture');
    
    // Si hay foto guardada, usarla; si no, generar avatar automático
    if (savedPhoto) {
        if (avatar) avatar.src = savedPhoto;
        if (picture) picture.src = savedPhoto;
    } else {
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=ff69b4&color=fff`;
        if (avatar) avatar.src = avatarUrl;
        if (picture) picture.src = avatarUrl + '&size=128';
    }
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
        // Crear un elemento input de tipo file (para seleccionar archivos)
        const input = document.createElement('input');
        input.type = 'file'; // Tipo de input para archivos
        input.accept = 'image/*'; // Solo aceptar imágenes (cualquier formato)
        
        // Cuando el usuario selecciona un archivo
        input.onchange = function(e) {
            const file = e.target.files[0]; // Obtener el primer archivo seleccionado
            
            // VALIDACIÓN 1: Verificar que se seleccionó un archivo
            if (!file) {
                return; // Si no hay archivo, salir
            }
            
            // VALIDACIÓN 2: Verificar que el archivo sea una imagen
            if (!file.type.startsWith('image/')) {
                showError('Por favor, selecciona un archivo de imagen válido');
                return; // Si no es imagen, mostrar error y salir
            }
            
            // VALIDACIÓN 3: Verificar el tamaño del archivo (máximo 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB en bytes
            if (file.size > maxSize) {
                showError('La imagen es demasiado grande. Máximo 5MB');
                return; // Si es muy grande, mostrar error y salir
            }
            
            // Crear un FileReader para leer el archivo como base64
            const reader = new FileReader();
            
            // Cuando el archivo se haya leído exitosamente
            reader.onload = function(event) {
                // event.target.result contiene la imagen en formato base64
                const imageBase64 = event.target.result;
                
                // Obtener los elementos de imagen del DOM
                const avatar = document.getElementById('profileAvatar');
                const picture = document.getElementById('profilePicture');
                
                // Actualizar las imágenes con la nueva foto
                if (avatar) avatar.src = imageBase64;
                if (picture) picture.src = imageBase64;
                
                // Obtener datos del usuario actual
                const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
                const userEmail = userData.email || 'guest';
                
                // Guardar la foto en localStorage con una clave única por usuario
                // Usamos base64 para poder guardarlo como string en localStorage
                localStorage.setItem(`profilePhoto_${userEmail}`, imageBase64);
                
                // También guardar en el objeto userData para fácil acceso
                const updatedData = { ...userData, profilePhoto: imageBase64 };
                if (userData.rememberMe) {
                    localStorage.setItem('userData', JSON.stringify(updatedData));
                } else {
                    sessionStorage.setItem('userData', JSON.stringify(updatedData));
                }
                
                // Mostrar notificación de éxito
                showNotification('Foto de perfil actualizada');
            };
            
            // Si hay un error al leer el archivo
            reader.onerror = function() {
                showError('Error al cargar la imagen. Por favor, intenta de nuevo');
            };
            
            // Leer el archivo como Data URL (base64)
            reader.readAsDataURL(file);
        };
        
        // Simular click en el input para abrir el selector de archivos
        input.click();
    });
}

// Función para cargar la foto de perfil guardada al iniciar
function loadProfilePhoto() {
    // Obtener datos del usuario actual
    const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
    const userEmail = userData.email || 'guest';
    
    // Intentar cargar la foto desde localStorage
    const savedPhoto = localStorage.getItem(`profilePhoto_${userEmail}`) || userData.profilePhoto;
    
    // Si hay una foto guardada, actualizar las imágenes
    if (savedPhoto) {
        const avatar = document.getElementById('profileAvatar');
        const picture = document.getElementById('profilePicture');
        
        if (avatar) avatar.src = savedPhoto;
        if (picture) picture.src = savedPhoto;
    } else {
        // Si no hay foto guardada, usar el avatar generado automáticamente
        const fullName = userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
        if (fullName) {
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=ff69b4&color=fff`;
            const avatar = document.getElementById('profileAvatar');
            const picture = document.getElementById('profilePicture');
            if (avatar) avatar.src = avatarUrl;
            if (picture) picture.src = avatarUrl + '&size=128';
        }
    }
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

// Función para mostrar errores (similar a showNotification pero con color rojo)
function showError(message) {
    // Crear un elemento div para el mensaje de error
    const errorDiv = document.createElement('div');
    
    // Aplicar estilos CSS inline (mismo estilo que showNotification pero con fondo rojo)
    errorDiv.style.cssText = `
        position: fixed;              /* Posición fija en la pantalla */
        top: 100px;                   /* 100px desde arriba */
        right: 20px;                  /* 20px desde la derecha */
        background-color: #ff4757;     /* Color rojo para errores */
        color: white;                 /* Texto blanco */
        padding: 1rem 1.5rem;         /* Espaciado interno */
        border-radius: 8px;            /* Bordes redondeados */
        box-shadow: 0 4px 12px rgba(0,0,0,0.2); /* Sombra para destacar */
        z-index: 10000;               /* Por encima de otros elementos */
        font-size: 0.9rem;            /* Tamaño de fuente */
        font-weight: 500;             /* Grosor de fuente */
        transform: translateX(100%);  /* Inicialmente fuera de la pantalla (derecha) */
        transition: transform 0.3s ease; /* Animación suave */
    `;
    
    // Establecer el texto del mensaje de error
    errorDiv.textContent = message;
    
    // Agregar el elemento al body del documento
    document.body.appendChild(errorDiv);
    
    // Después de 100ms, animar la entrada (deslizar desde la derecha)
    setTimeout(() => {
        errorDiv.style.transform = 'translateX(0)'; // Mover a posición visible
    }, 100);
    
    // Después de 3 segundos, animar la salida
    setTimeout(() => {
        errorDiv.style.transform = 'translateX(100%)'; // Mover fuera de la pantalla
        // Después de la animación (300ms), eliminar el elemento del DOM
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
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

// Función para cambiar contraseña
function setupChangePassword() {
    // Obtener el formulario de cambio de contraseña por su ID
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    // Verificar que el formulario existe antes de agregar el listener
    if (!changePasswordForm) {
        return; // Si no existe, salir de la función
    }
    
    // Agregar un listener para cuando se envíe el formulario
    changePasswordForm.addEventListener('submit', function(e) {
        // Prevenir el comportamiento por defecto (recargar la página)
        e.preventDefault();
        
        // Llamar a la función que maneja el cambio de contraseña
        handleChangePassword();
    });
}

function handleChangePassword() {
    // Obtener los valores de los campos del formulario
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Obtener los datos del usuario actual desde localStorage o sessionStorage
    const userData = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
    const userEmail = userData.email;
    
    // Validación 1: Verificar que el usuario tenga email (esté logueado)
    if (!userEmail) {
        showError('No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.');
        return; // Salir de la función si no hay email
    }
    
    // Validación 2: Verificar que todos los campos estén llenos
    if (!currentPassword || !newPassword || !confirmPassword) {
        showError('Por favor, completa todos los campos');
        return; // Salir si falta algún campo
    }
    
    // Validación 3: Verificar que la nueva contraseña tenga al menos 6 caracteres
    if (newPassword.length < 6) {
        showError('La nueva contraseña debe tener al menos 6 caracteres');
        return; // Salir si la contraseña es muy corta
    }
    
    // Validación 4: Verificar que ambas contraseñas nuevas coincidan
    if (newPassword !== confirmPassword) {
        showError('Las contraseñas nuevas no coinciden');
        return; // Salir si no coinciden
    }
    
    // Validación 5: Verificar que la nueva contraseña sea diferente a la actual
    if (currentPassword === newPassword) {
        showError('La nueva contraseña debe ser diferente a la actual');
        return; // Salir si son iguales
    }
    
    // Obtener el array de usuarios desde localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Buscar el usuario actual en el array por su email
    const userIndex = users.findIndex(u => u.email === userEmail);
    
    // Validación 6: Verificar que el usuario existe en el array
    if (userIndex === -1) {
        showError('Usuario no encontrado');
        return; // Salir si no se encuentra el usuario
    }
    
    // Validación 7: Verificar que la contraseña actual sea correcta
    // Comparar la contraseña ingresada con la guardada (en producción esto sería con hash)
    if (users[userIndex].password !== currentPassword) {
        showError('La contraseña actual es incorrecta');
        return; // Salir si la contraseña no coincide
    }
    
    // Si todas las validaciones pasan, actualizar la contraseña
    users[userIndex].password = newPassword;
    
    // Guardar el array actualizado en localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Limpiar los campos del formulario
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    // Mostrar mensaje de éxito
    showNotification('Contraseña cambiada exitosamente');
}

// Verificar sesión
(function() {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'login.html';
    }
})();
