require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV,
  server: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiry: (60 * 60 * 60) * 5,
  },
  session: {
    secret: process.env.APP_SESSION_SECRET,
    resave: false,
    unset: 'destroy',
    saveUninitialized: true,
  },
  ssl: {
    certificatePath: '',
    privateKeyPath: '',
  },
  steam: {
    key: process.env.STEAM_API_KEY,
  },
};