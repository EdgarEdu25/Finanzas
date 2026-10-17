const express = require('express');
const router = express.Router();
const controller = require('../controllers/categorias.controller'); // Importa el controlador

// GET /categorias - Listar todos los categorias
router.get('/', controller.listar);

// GET /categorias/:id - Obtener un categorias específico
router.get('/:id', controller.obtenerPorId);

// POST /categorias - Crear un nuevo categorias
router.post('/', controller.crear);

// PUT /categorias/:id - Actualizar un categorias existente
router.put('/:id', controller.actualizar);

// PATCH /categorias/:id/desactivar - Desactivar categorias (soft delete)
router.patch('/:id/desactivar', controller.desactivar);

// DELETE /categorias/:id - Eliminar categorias permanentemente (hard delete)
router.delete('/:id', controller.desaparecer);

module.exports = router; // Exporta el router para usarlo en app.js