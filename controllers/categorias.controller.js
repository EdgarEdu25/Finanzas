const categorias = require('../models/categorias.model'); // Importa el modelo de categoriass

// Crear un nuevo categorias
exports.crear = async (req, res) => {
    try {
        await categorias.crear(req.body); // Inserta los datos del body
        res.json({ mensaje: 'categorias creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message }); // Maneja errores (ej: email duplicado)
    }
};

// Listar todos los categoriass activos
exports.listar = async (req, res) => {
    try {
        const data = await categorias.listar(); // Obtiene todos los categoriass
        res.json(data.rows); // Devuelve solo las filas
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un categorias específico por ID
exports.obtenerPorId = async (req, res) => {
    try {
        const data = await categorias.obtenerPorId(req.params.id);
        res.json(data.rows[0]); // Devuelve solo el primer registro
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un categorias existente
exports.actualizar = async (req, res) => {
    try {
        await categorias.actualizar(req.params.id, req.body); // Actualiza con el ID de la URL
        res.json({ mensaje: 'categorias actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Desactivar categorias (soft delete)
exports.desactivar = async (req, res) => {
    try {
        await categorias.desactivar(req.params.id);
        res.json({ mensaje: 'categorias desactivado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar categorias permanentemente (hard delete)
exports.desaparecer = async (req, res) => {
    try {
        await categorias.desaparecer(req.params.id);
        res.json({ mensaje: 'categorias eliminado permanentemente' });
    } catch (error) {
        // Si tiene pedidos asociados, PostgreSQL lanzará error por la FK RESTRICT
        res.status(500).json({ error: 'No se puede eliminar: el categorias tiene pedidos asociados' });
    }
};