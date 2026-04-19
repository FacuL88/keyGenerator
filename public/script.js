// Global variables
let currentPassword = '';
let users = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    updateStats();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Password length slider
    const lengthSlider = document.getElementById('passwordLength');
    const lengthValue = document.getElementById('lengthValue');
    
    lengthSlider.addEventListener('input', function() {
        lengthValue.textContent = this.value;
    });

    // Character options change
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (currentPassword) {
                generatePassword();
            }
        });
    });

    // Enter key on username input
    document.getElementById('username').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generatePassword();
        }
    });
}

// Generate password
async function generatePassword() {
    const length = parseInt(document.getElementById('passwordLength').value);
    const options = {
        uppercase: document.getElementById('uppercase').checked,
        lowercase: document.getElementById('lowercase').checked,
        numbers: document.getElementById('numbers').checked,
        symbols: document.getElementById('symbols').checked
    };

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ length, options })
        });

        const result = await response.json();
        
        if (result.success) {
            currentPassword = result.data.password;
            document.getElementById('generatedPassword').value = currentPassword;
            updatePasswordStrength(currentPassword);
        } else {
            showNotification('Error al generar contraseña', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
    }
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    let strengthLabel = 'Débil';
    let strengthClass = 'password-strength-weak';
    
    // Calculate strength
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (password.length >= 16) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    // Update UI based on strength
    if (strength <= 2) {
        strengthLabel = 'Débil';
        strengthClass = 'password-strength-weak';
    } else if (strength <= 4) {
        strengthLabel = 'Media';
        strengthClass = 'password-strength-medium';
    } else {
        strengthLabel = 'Fuerte';
        strengthClass = 'password-strength-strong';
    }
    
    strengthBar.className = `h-full transition-all duration-300 ${strengthClass}`;
    strengthText.textContent = `Fuerza: ${strengthLabel}`;
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('generatedPassword');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

// Copy password to clipboard
function copyPassword() {
    const passwordInput = document.getElementById('generatedPassword');
    
    if (!passwordInput.value) {
        showNotification('No hay contraseña para copiar', 'warning');
        return;
    }
    
    passwordInput.select();
    document.execCommand('copy');
    showNotification('Contraseña copiada al portapapeles', 'success');
}

// Save user
async function saveUser() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('generatedPassword').value;
    
    if (!username) {
        showNotification('Por favor ingrese un nombre de usuario', 'warning');
        return;
    }
    
    if (!password) {
        showNotification('Por favor genere una contraseña primero', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: username, password })
        });

        const result = await response.json();
        
        if (result.success) {
            showNotification('Usuario guardado correctamente', 'success');
            document.getElementById('username').value = '';
            document.getElementById('generatedPassword').value = '';
            currentPassword = '';
            loadUsers();
            updateStats();
        } else {
            showNotification(result.error || 'Error al guardar usuario', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
    }
}

// Load users from server
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const result = await response.json();
        
        if (result.success) {
            users = result.data;
            displayUsers(users);
            updateUserCount(users.length);
        } else {
            showNotification('Error al cargar usuarios', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
    }
}

// Display users in the UI
function displayUsers(usersToShow) {
    const usersList = document.getElementById('usersList');
    const emptyState = document.getElementById('emptyState');
    
    if (usersToShow.length === 0) {
        usersList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    usersList.innerHTML = usersToShow.map(user => `
        <div class="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-user-circle text-purple-600"></i>
                        <h4 class="font-semibold text-gray-800">${escapeHtml(user.name)}</h4>
                    </div>
                    <div class="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span class="flex items-center">
                            <i class="fas fa-key mr-1 text-gray-400"></i>
                            <span class="font-mono">${maskPassword(user.passwd)}</span>
                        </span>
                        <button onclick="copyUserPassword('${escapeHtml(user.passwd)}')" class="text-purple-600 hover:text-purple-800">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="mt-1 text-xs text-gray-500">
                        <i class="fas fa-clock mr-1"></i>
                        ${formatDate(user.fecha)}
                    </div>
                </div>
                <div class="ml-4 flex items-center space-x-2">
                    <div class="w-2 h-2 rounded-full ${getPasswordStrengthColor(user.passwd)}"></div>
                    <button 
                        onclick="deleteUser('${escapeHtml(user.name)}', '${user.fecha}')"
                        class="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Eliminar usuario"
                    >
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Search users
function searchUsers() {
    const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm)
    );
    displayUsers(filteredUsers);
}

// Refresh users list
function refreshUsers() {
    loadUsers();
    showNotification('Lista actualizada', 'success');
}

// Update statistics
async function updateStats() {
    try {
        const response = await fetch('/api/stats');
        const result = await response.json();
        
        if (result.success) {
            const stats = result.data;
            document.getElementById('totalUsers').textContent = stats.totalUsers;
            document.getElementById('todayUsers').textContent = stats.todayUsers;
            document.getElementById('avgPasswordLength').textContent = stats.avgPasswordLength;
            document.getElementById('strongPasswords').textContent = stats.strongPasswords;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Copy user password
function copyUserPassword(password) {
    navigator.clipboard.writeText(password).then(() => {
        showNotification('Contraseña copiada al portapapeles', 'success');
    }).catch(() => {
        showNotification('Error al copiar contraseña', 'error');
    });
}

// Delete user
async function deleteUser(name, fecha) {
    const actions = `
        <button onclick="closeModal()" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors">
            Cancelar
        </button>
        <button onclick="confirmDeleteUser('${escapeHtml(name)}', '${fecha}')" class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Eliminar
        </button>
    `;
    
    showModal('Confirmar Eliminación', `¿Estás seguro de que quieres eliminar al usuario "${name}"?`, 'question', actions);
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function maskPassword(password) {
    if (!password) return '';
    if (password.length <= 4) return password;
    return password.substring(0, 4) + '*'.repeat(password.length - 4);
}

function formatDate(dateString) {
    if (!dateString) return 'Fecha desconocida';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getPasswordStrengthColor(password) {
    if (!password) return 'bg-gray-300';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (password.length >= 16) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
}

function updateUserCount(count) {
    document.getElementById('userCount').textContent = `${count} usuario${count !== 1 ? 's' : ''}`;
}

// Modal system
function showModal(title, message, type = 'info', actions = null) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalIcon = document.getElementById('modalIcon');
    const modalActions = document.getElementById('modalActions');
    
    // Set content
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Set icon based on type
    let iconHtml = '';
    switch(type) {
        case 'success':
            iconHtml = '<i class="fas fa-check-circle text-green-500 text-2xl"></i>';
            break;
        case 'error':
            iconHtml = '<i class="fas fa-exclamation-circle text-red-500 text-2xl"></i>';
            break;
        case 'warning':
            iconHtml = '<i class="fas fa-exclamation-triangle text-yellow-500 text-2xl"></i>';
            break;
        case 'question':
            iconHtml = '<i class="fas fa-question-circle text-blue-500 text-2xl"></i>';
            break;
        default:
            iconHtml = '<i class="fas fa-info-circle text-blue-500 text-2xl"></i>';
    }
    modalIcon.innerHTML = iconHtml;
    
    // Set actions
    if (actions) {
        modalActions.innerHTML = actions;
    } else {
        modalActions.innerHTML = `
            <button onclick="closeModal()" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Aceptar
            </button>
        `;
    }
    
    // Show modal with animation
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    
    // Hide modal with animation
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
}

// Show modal notification (replaces showToast)
function showNotification(message, type = 'success') {
    let title = '';
    switch(type) {
        case 'success':
            title = '¡Éxito!';
            break;
        case 'error':
            title = 'Error';
            break;
        case 'warning':
            title = 'Advertencia';
            break;
        case 'info':
            title = 'Información';
            break;
        default:
            title = 'Notificación';
    }
    
    showModal(title, message, type);
}

// Theme toggle (placeholder for future implementation)
function toggleTheme() {
    showNotification('Modo oscuro próximamente', 'info');
}

// Confirm delete user function
function confirmDeleteUser(name, fecha) {
    closeModal();
    deleteUserAction(name, fecha);
}

// Actual delete function
async function deleteUserAction(name, fecha) {
    try {
        const response = await fetch('/api/users', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, fecha })
        });

        const result = await response.json();
        
        if (result.success) {
            showNotification('Usuario eliminado correctamente', 'success');
            loadUsers();
            updateStats();
        } else {
            showNotification(result.error || 'Error al eliminar usuario', 'error');
        }
    } catch (error) {
        showNotification('Error de conexión', 'error');
    }
}
