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

// Eliminar un usuario por nombre y fecha
function deleteUser(name, fecha) {
  const usuarios = leerUsuarios();
  const filteredUsers = usuarios.filter(user => 
    !(user.name.trim() === name.trim() && user.fecha === fecha)
  );
  guardarUsuarios(filteredUsers);
  return filteredUsers;
}

module.exports = { addUser, userList, deleteUser };