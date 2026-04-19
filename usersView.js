const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'users.json');

if (!fs.existsSync(filePath)) {
  console.log('El archivo users.json no existe aún.');
  process.exit();
}

const data = fs.readFileSync(filePath, 'utf8');
const usuarios = JSON.parse(data);

console.log('\n📋 Lista de usuarios guardados:\n');
console.table(usuarios);