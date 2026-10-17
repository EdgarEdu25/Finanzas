const ahorro = require('../models/ahorro.model'); // Importa el modelo de categoriass

// Crear un nuevo ahorro
exports.crear = async (req, res) => {
    try {
        await ahorro.crear(req.body); // Inserta los datos del body
        res.json({ mensaje: 'ahorro creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message }); // Maneja errores (ej: email duplicado)
    }
};

// Listar todos los categoriass activos
exports.listar = async (req, res) => {
    try {
        const data = await ahorro.listar(); // Obtiene todos los categoriass
        res.json(data.rows); // Devuelve solo las filas
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un ahorro específico por ID
exports.obtenerPorId = async (req, res) => {
    try {
        const data = await ahorro.obtenerPorId(req.params.id);
        res.json(data.rows[0]); // Devuelve solo el primer registro
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un ahorro existente
exports.actualizar = async (req, res) => {
    try {
        await ahorro.actualizar(req.params.id, req.body); // Actualiza con el ID de la URL
        res.json({ mensaje: 'ahorro actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Desactivar ahorro (soft delete)
exports.desactivar = async (req, res) => {
    try {
        await ahorro.desactivar(req.params.id);
        res.json({ mensaje: 'ahorro desactivado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar ahorro permanentemente (hard delete)
exports.desaparecer = async (req, res) => {
    try {
        await ahorro.desaparecer(req.params.id);
        res.json({ mensaje: 'ahorro eliminado permanentemente' });
    } catch (error) {
        // Si tiene pedidos asociados, PostgreSQL lanzará error por la FK RESTRICT
        res.status(500).json({ error: 'No se puede eliminar: el ahorro tiene pedidos asociados' });
    }
};