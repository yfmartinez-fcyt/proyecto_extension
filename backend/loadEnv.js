const path = require('path');

/** Carga backend/.env sin tips de dotenv en consola. */
function loadEnv() {
  require('dotenv').config({
    path: path.join(__dirname, '.env'),
    quiet: true,
  });
}

module.exports = { loadEnv };
