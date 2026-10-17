const gasto = require('../models/gasto.model'); // Importa el modelo de gasto

// Crear un nuevo gasto
exports.crear = async (req, res) => {
    try {
        await gasto.crear(req.body); // Inserta los datos del body
        res.json({ mensaje: 'Gasto creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Listar todos los gastos activos
exports.listar = async (req, res) => {
    try {
        const data = await gasto.listar(); // Obtiene todos los gastos con su categoria
        res.json(data.rows); // Devuelve solo las filas
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.listarPorFecha = async (req, res) => {
    try {
        const data = await gasto.listarPorFecha(req.params.fecha);
        res.json(data.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un gasto específico por ID
exports.obtenerPorId = async (req, res) => {
    try {
        const data = await gasto.obtenerPorId(req.params.id);
        res.json(data.rows[0]); // Devuelve solo el primer registro
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un gasto existente
exports.actualizar = async (req, res) => {
    try {
        await gasto.actualizar(req.params.id, req.body); // Actualiza con el ID de la URL
        res.json({ mensaje: 'Gasto actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Desactivar gasto (soft delete)
exports.desactivar = async (req, res) => {
    try {
        await gasto.desactivar(req.params.id);
        res.json({ mensaje: 'Gasto desactivado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar gasto permanentemente (hard delete)
exports.desaparecer = async (req, res) => {
    try {
        await gasto.desaparecer(req.params.id);
        res.json({ mensaje: 'Gasto eliminado permanentemente' });
    } catch (error) {
        // Si tiene registros asociados por alguna FK, PostgreSQL lanzará error
        res.status(500).json({ error: 'No se puede eliminar: el gasto tiene registros asociados' });
    }
};

// Listar categorias activas (para poblar el <select> del formulario en el frontend)
exports.listarCategoriasParaSelect = async (req, res) => {
    try {
        const data = await gasto.listarCategoriasParaSelect();
        res.json(data.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};