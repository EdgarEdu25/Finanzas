const express = require('express');
const router = express.Router();
const controller = require('../controllers/limite.controller'); // Importa el controlador

// GET /limite - Listar todos los limites
router.get('/', controller.listar);

// GET /limite/:id - Obtener un limite específico
router.get('/:id', controller.obtenerPorId);

// POST /limite - Crear un nuevo limite
router.post('/', controller.crear);

// PUT /limite/:id - Actualizar un limite existente
router.put('/:id', controller.actualizar);

// PATCH /limite/:id/desactivar - Desactivar limite (soft delete)
router.patch('/:id/desactivar', controller.desactivar);

// DELETE /limite/:id - Eliminar limite permanentemente (hard delete)
router.delete('/:id', controller.desaparecer);

module.exports = router; // Exporta el router para usarlo en app.js