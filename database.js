const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'users.json');

// Leer usuarios desde el archivo JSON
function leerUsuarios() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]');
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// Guardar usuarios en el archivo
function guardarUsuarios(usuarios) {
  fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2));
}

// Agregar un nuevo usuario con fecha
function addUser(name, passwd) {
  const usuarios = leerUsuarios();
  const fecha = new Date().toISOString();  // ← Fecha actual en formato ISO
  usuarios.push({ name, passwd, fecha });
  guardarUsuarios(usuarios);
}

// Obtener lista de usuarios
function userList() {
  return leerUsuarios();
}

module.exports = { addUser, userList };