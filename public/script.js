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
            showToast('Error al generar contraseña', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
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
        showToast('No hay contraseña para copiar', 'warning');
        return;
    }
    
    passwordInput.select();
    document.execCommand('copy');
    showToast('Contraseña copiada al portapapeles', 'success');
}

// Save user
async function saveUser() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('generatedPassword').value;
    
    if (!username) {
        showToast('Por favor ingrese un nombre de usuario', 'warning');
        return;
    }
    
    if (!password) {
        showToast('Por favor genere una contraseña primero', 'warning');
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
            showToast('Usuario guardado correctamente', 'success');
            document.getElementById('username').value = '';
            document.getElementById('generatedPassword').value = '';
            currentPassword = '';
            loadUsers();
            updateStats();
        } else {
            showToast(result.error || 'Error al guardar usuario', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
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
            showToast('Error al cargar usuarios', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
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
                <div class="ml-4">
                    <div class="w-2 h-2 rounded-full ${getPasswordStrengthColor(user.passwd)}"></div>
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
    showToast('Lista actualizada', 'success');
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
        showToast('Contraseña copiada al portapapeles', 'success');
    }).catch(() => {
        showToast('Error al copiar contraseña', 'error');
    });
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

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    // Set message
    toastMessage.textContent = message;
    
    // Set background color based on type
    toast.className = 'toast fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50';
    
    switch(type) {
        case 'success':
            toast.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            toast.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            toast.classList.add('bg-yellow-500', 'text-white');
            break;
        default:
            toast.classList.add('bg-gray-500', 'text-white');
    }
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Theme toggle (placeholder for future implementation)
function toggleTheme() {
    showToast('Modo oscuro próximamente', 'info');
}
