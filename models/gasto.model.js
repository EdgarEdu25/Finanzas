const Conexion = require('../config/conexion'); // Importa la conexión a PostgreSQL

module.exports = {
    crear: (data) => Conexion.query(
        `INSERT INTO gasto (nombre_gasto, total, description, cantidad, precio, fk_categoria)
         VALUES($1, $2, NULLIF($3, ''), NULLIF($4, '')::decimal, NULLIF($5, '')::decimal, $6)`,
        [data.nombre_gasto, data.total, data.description, data.cantidad, data.precio, data.fk_categoria]
    ),

    listar: () => Conexion.query(
        `SELECT g.*, c.nombre_categoria 
         FROM gasto g
         JOIN categoria c ON g.fk_categoria = c.pk_categoria
         WHERE g.status = true
         ORDER BY g.pk_gasto ASC`
    ),

  listarPorFecha: (fecha) => Conexion.query(
    `SELECT g.*, c.nombre_categoria
     FROM gasto g
     JOIN categoria c ON g.fk_categoria = c.pk_categoria
     WHERE g.status = true
       AND (g.fecha_hora AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City')::date = $1::date
     ORDER BY g.pk_gasto DESC`,
    [fecha]
),

    obtenerPorId: (id) => Conexion.query(
        `SELECT g.*, c.nombre_categoria 
         FROM gasto g
         JOIN categoria c ON g.fk_categoria = c.pk_categoria
         WHERE g.pk_gasto = $1 AND g.status = TRUE`,
        [id]
    ),

    actualizar: (id, data) => Conexion.query(
        `UPDATE gasto 
         SET nombre_gasto=$1, total=$2, description=NULLIF($3, ''), cantidad=NULLIF($4, '')::decimal, precio=NULLIF($5, '')::decimal, fk_categoria=$6
         WHERE pk_gasto=$7`,
        [data.nombre_gasto, data.total, data.description, data.cantidad, data.precio, data.fk_categoria, id]
    ),

    desactivar: (id) => Conexion.query(
        'UPDATE gasto SET status=FALSE WHERE pk_gasto=$1',
        [id]
    ),

    desaparecer: (id) => Conexion.query(
        'DELETE FROM gasto WHERE pk_gasto=$1',
        [id]
    ),

    listarCategoriasParaSelect: () => Conexion.query(
        'SELECT pk_categoria, nombre_categoria FROM categoria WHERE status = true ORDER BY nombre_categoria ASC'
    )
};