// Funcionalidad del Login
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeAccentColor();
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const createAccountLink = document.getElementById('createAccountLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    const socialButtons = document.querySelectorAll('.social-btn');

    // Manejar envío del formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }

    // Manejar envío del formulario de registro
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup();
        });
    }

    // Toggle entre login y registro
    if (createAccountLink) {
        createAccountLink.addEventListener('click', function(e) {
            e.preventDefault();
            showSignupForm();
        });
    }

    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginForm();
        });
    }

    // Botones de login social
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('gmail-btn') ? 'Gmail' : 'GitHub';
            handleSocialLogin(provider);
        });
    });

    // Recuperación de contraseña
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    }
});

// Funciones para toggle entre formularios
function showLoginForm() {
    const loginContainer = document.getElementById('loginFormContainer');
    const signupContainer = document.getElementById('signupFormContainer');
    if (loginContainer && signupContainer) {
        loginContainer.style.display = 'block';
        signupContainer.style.display = 'none';
    }
}

function showSignupForm() {
    const loginContainer = document.getElementById('loginFormContainer');
    const signupContainer = document.getElementById('signupFormContainer');
    if (loginContainer && signupContainer) {
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'block';
    }
}

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

    // Verificar si el usuario existe
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email);

    if (!user) {
        showError('El correo electrónico no está registrado');
        return;
    }

    // Verificar contraseña (en producción esto sería con hash)
    if (user.password !== password) {
        showError('Contraseña incorrecta');
        return;
    }

    // Login exitoso
    const userData = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
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

function handleSignup() {
    const firstName = document.getElementById('signupFirstName').value.trim();
    const lastName = document.getElementById('signupLastName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const rememberMe = document.getElementById('signupRememberMe').checked;

    // Validación básica
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showError('Por favor, completa todos los campos');
        return;
    }

    // Validar formato de email mejorado
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
        showError('Por favor, ingresa un correo electrónico válido');
        return;
    }
    
    // Validar dominio del email
    const emailParts = email.split('@');
    if (emailParts.length !== 2 || !emailParts[1].includes('.')) {
        showError('El correo electrónico debe tener un dominio válido');
        return;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
        showError('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
    }

    // Verificar si el usuario ya existe
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        showError('Este correo electrónico ya está registrado');
        return;
    }

    // Crear nuevo usuario
    const newUser = {
        id: Date.now(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password, // En producción esto debería ser un hash
        createdAt: new Date().toISOString()
    };

    // Guardar usuario
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Iniciar sesión automáticamente
    const userData = {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
        rememberMe: rememberMe,
        loginTime: new Date().toISOString()
    };

    if (rememberMe) {
        localStorage.setItem('userData', JSON.stringify(userData));
    } else {
        sessionStorage.setItem('userData', JSON.stringify(userData));
    }

    // Mostrar mensaje de éxito
    showNotification('¡Cuenta creada exitosamente!');

    // Redirigir a la aplicación principal
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
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

function handleForgotPassword() {
    const email = document.getElementById('email').value;
    
    if (!email) {
        const emailInput = prompt('Ingresa tu correo electrónico para recuperar tu contraseña:');
        if (!emailInput) return;
        
        // Verificar si el usuario existe
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === emailInput);
        
        if (!user) {
            showError('No existe una cuenta con ese correo electrónico');
            return;
        }
        
        // En producción, aquí se enviaría un email con un token de recuperación
        // Por ahora, simulamos mostrando la contraseña (NO hacer esto en producción)
        showNotification(`Se ha enviado un enlace de recuperación a ${emailInput}`);
        
        // Simulación: mostrar contraseña (solo para desarrollo)
        if (confirm('¿Deseas ver tu contraseña? (Solo para desarrollo)')) {
            alert(`Tu contraseña es: ${user.password}\n\n⚠️ En producción, esto se enviaría por email.`);
        }
    } else {
        // Si ya hay un email en el campo
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);
        
        if (!user) {
            showError('No existe una cuenta con ese correo electrónico');
            return;
        }
        
        showNotification(`Se ha enviado un enlace de recuperación a ${email}`);
        
        // Simulación: mostrar contraseña (solo para desarrollo)
        if (confirm('¿Deseas ver tu contraseña? (Solo para desarrollo)')) {
            alert(`Tu contraseña es: ${user.password}\n\n⚠️ En producción, esto se enviaría por email.`);
        }
    }
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
