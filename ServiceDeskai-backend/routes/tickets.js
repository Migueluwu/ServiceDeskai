const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const Ticket = require('../models/Ticket');

const router = express.Router();

// Configuración de body-parser
router.use(bodyParser.json({ limit: '10mb' }));
router.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Configuración de multer para manejar archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Cambia la ruta según donde quieras almacenar los archivos
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Configurar multer con el almacenamiento y los límites de tamaño
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limitar a 10 MB
});

// Crear un nuevo ticket
router.post('/', upload.single('media'), async (req, res) => {
    try {
        const { userId, description, geolocation } = req.body;

        if (!userId || !description || !geolocation || !geolocation.coordinates) {
            return res.status(400).send({ error: 'Faltan datos requeridos' });
        }

        console.log(req.file);  // Asegúrate de que req.file no sea undefined
        const media = req.file ? [req.file.path] : [];
        const ticket = new Ticket({
            userId,
            description,
            media,
            geolocation: JSON.parse(geolocation),
            status: 'unreviewed'
        });

        await ticket.save();
        res.status(201).send(ticket);
    } catch (error) {
        console.error('Error al crear el ticket:', error);
        res.status(400).send({ error: 'Error al crear el ticket' });
    }
});


// Obtener todos los tickets
router.get('/', async (req, res) => {
    try {
        const tickets = await Ticket.find();
        res.status(200).send(tickets);
    } catch (error) {
        console.error('Error al obtener los tickets:', error);
        res.status(500).send({ error: 'Error al obtener los tickets' });
    }
});

// Usar el router en la ruta correcta
module.exports = router; // Exportar el router
