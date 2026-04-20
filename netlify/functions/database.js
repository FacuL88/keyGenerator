// Database for Netlify Functions - using in-memory storage
let users = [];

// Initialize with empty users array
function initializeUsers() {
  // In Netlify, we can't persist to filesystem, so we use in-memory storage
  // For production, you might want to use a database service
  if (users.length === 0) {
    users = [];
  }
  return users;
}

// Leer usuarios
function leerUsuarios() {
  return initializeUsers();
}

// Guardar usuarios
function guardarUsuarios(usuariosArray) {
  users = usuariosArray;
}

// Agregar un nuevo usuario con fecha
function addUser(name, passwd) {
  const usuarios = leerUsuarios();
  const fecha = new Date().toISOString();
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
