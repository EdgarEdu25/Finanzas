const limite = require('../models/limite.model'); // Importa el modelo de limite_gasto

// Crear un nuevo limite de gasto
exports.crear = async (req, res) => {
    try {
        await limite.crear(req.body); // Inserta los datos del body
        res.json({ mensaje: 'Limite de gasto creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message }); // Maneja errores (ej: fecha duplicada por UNIQUE)
    }
};

// Listar todos los limites activos
exports.listar = async (req, res) => {
    try {
        const data = await limite.listar(); // Obtiene todos los limites
        res.json(data.rows); // Devuelve solo las filas
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un limite específico por ID
exports.obtenerPorId = async (req, res) => {
    try {
        const data = await limite.obtenerPorId(req.params.id);
        res.json(data.rows[0]); // Devuelve solo el primer registro
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un limite existente
exports.actualizar = async (req, res) => {
    try {
        await limite.actualizar(req.params.id, req.body); // Actualiza con el ID de la URL
        res.json({ mensaje: 'Limite de gasto actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Desactivar limite (soft delete)
exports.desactivar = async (req, res) => {
    try {
        await limite.desactivar(req.params.id);
        res.json({ mensaje: 'Limite de gasto desactivado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar limite permanentemente (hard delete)
exports.desaparecer = async (req, res) => {
    try {
        await limite.desaparecer(req.params.id);
        res.json({ mensaje: 'Limite de gasto eliminado permanentemente' });
    } catch (error) {
        res.status(500).json({ error: 'No se puede eliminar: el limite tiene registros asociados' });
    }
};