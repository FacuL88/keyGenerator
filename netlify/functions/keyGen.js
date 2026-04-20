function keyGen(length = 24) {
  const character = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*+=/<>';
  let pass = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * character.length);
    pass += character[index];
  }
  return pass;
}

module.exports = { keyGen };
