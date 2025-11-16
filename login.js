// Funcionalidad del Login
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeAccentColor();
    const loginForm = document.getElementById('loginForm');
    const createAccountLink = document.getElementById('createAccountLink');
    const socialButtons = document.querySelectorAll('.social-btn');

    // Manejar envío del formulario
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    // Link para crear cuenta
    if (createAccountLink) {
        createAccountLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Por ahora solo muestra un mensaje, puedes implementar registro después
            alert('Funcionalidad de registro próximamente');
        });
    }

    // Botones de login social
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('gmail-btn') ? 'Gmail' : 'GitHub';
            handleSocialLogin(provider);
        });
    });
});

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
        .login-btn,
        .remember-me input[type="checkbox"] {
            background-color: ${color} !important;
            color: white !important;
            accent-color: ${color} !important;
        }
        .login-btn:hover {
            background-color: ${colorHover} !important;
            color: white !important;
        }
        .forgot-password {
            color: ${color} !important;
        }
        .form-group input:focus {
            border-color: ${color} !important;
            box-shadow: 0 0 0 3px ${color}33 !important;
        }
    `;
    
    document.head.appendChild(style);
}

function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validación básica
    if (!email || !password) {
        showError('Por favor, completa todos los campos');
        return;
    }

    // Simulación de login (en producción esto sería una llamada a API)
    // Por ahora, guardamos en localStorage y redirigimos
    const userData = {
        email: email,
        rememberMe: rememberMe,
        loginTime: new Date().toISOString()
    };

    // Guardar en localStorage
    if (rememberMe) {
        localStorage.setItem('userData', JSON.stringify(userData));
    } else {
        sessionStorage.setItem('userData', JSON.stringify(userData));
    }

    // Redirigir a la aplicación principal
    window.location.href = 'index.html';
}

function handleSocialLogin(provider) {
    // Simulación de login social
    showNotification(`Iniciando sesión con ${provider}...`);
    
    // En producción, aquí iría la autenticación real con OAuth
    setTimeout(() => {
        const userData = {
            email: `user@${provider.toLowerCase()}.com`,
            provider: provider,
            loginTime: new Date().toISOString()
        };

        sessionStorage.setItem('userData', JSON.stringify(userData));
        window.location.href = 'index.html';
    }, 1000);
}

function showError(message) {
    // Crear elemento de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: #ff4757;
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
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Animar entrada
    setTimeout(() => {
        errorDiv.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        errorDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 300);
    }, 3000);
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
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Verificar si ya hay sesión activa
function checkExistingSession() {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (userData) {
        // Si hay sesión, redirigir directamente a la app
        // window.location.href = 'index.html';
    }
}

// Ejecutar al cargar
checkExistingSession();
