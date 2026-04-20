const express = require('express');
const path = require('path');
const { keyGen } = require('./keyGen');
const { addUser, userList, deleteUser } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// API Routes
app.get('/api/users', (req, res) => {
    try {
        const users = userList();
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/users', (req, res) => {
    try {
        const { name, password } = req.body;
        
        if (!name || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nombre y contraseña son requeridos' 
            });
        }

        addUser(name.trim(), password);
        const users = userList();
        
        res.json({ 
            success: true, 
            message: 'Usuario guardado correctamente',
            data: users 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/users', (req, res) => {
    try {
        const { name, fecha } = req.body;
        
        if (!name || !fecha) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nombre y fecha son requeridos' 
            });
        }

        const updatedUsers = deleteUser(name.trim(), fecha);
        
        res.json({ 
            success: true, 
            message: 'Usuario eliminado correctamente',
            data: updatedUsers 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/generate', (req, res) => {
    try {
        const { length = 24, options = {} } = req.body;
        
        let characters = '';
        if (options.uppercase !== false) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (options.lowercase !== false) characters += 'abcdefghijklmnopqrstuvwxyz';
        if (options.numbers !== false) characters += '0123456789';
        if (options.symbols !== false) characters += '!@#$%^&*+=/<>';
        
        if (!characters) {
            characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*+=/<>';
        }
        
        let password = '';
        for (let i = 0; i < length; i++) {
            const index = Math.floor(Math.random() * characters.length);
            password += characters[index];
        }
        
        res.json({ 
            success: true, 
            data: { password, length }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/stats', (req, res) => {
    try {
        const users = userList();
        const today = new Date().toISOString().split('T')[0];
        
        const stats = {
            totalUsers: users.length,
            todayUsers: users.filter(user => user.fecha && user.fecha.startsWith(today)).length,
            avgPasswordLength: users.length > 0 
                ? Math.round(users.reduce((sum, user) => sum + (user.passwd?.length || 0), 0) / users.length)
                : 0,
            strongPasswords: users.filter(user => user.passwd && user.passwd.length >= 16).length
        };
        
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});

// Export for Netlify Functions
module.exports = app;
