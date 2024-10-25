require('dotenv').config(); // Cargar variables de entorno desde .env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ticketsRoute = require('./routes/tickets');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors({
  origin: '*', // Permitir todos los orígenes (cuidado con esto en producción)
}));

// Middleware para manejar JSON
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Rutas
app.use('/api/tickets', ticketsRoute);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
