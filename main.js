const readline = require('readline');
const { keyGen } = require('./keyGen');
const { addUser, userList } = require('./database');

// Crear interfaz para leer desde la terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Preguntar al usuario el nombre
rl.question('Ingrese su nombre de usuario: ', (name) => {
  const generatedPassword = keyGen(24);
  addUser(name, generatedPassword);

  console.log('\n✅ Usuario creado correctamente:');
  console.log(userList());

  rl.close(); // Cerrar la interfaz después de usarla
});