const Conexion = require('../config/conexion'); // Importa la conexión a PostgreSQL

module.exports = {
    // Crear un nuevo limite de gasto
    crear: (data) => Conexion.query(
        'INSERT INTO limite_gasto (fecha, monto, comentario) VALUES($1, $2, $3)',
        [data.fecha, data.monto, data.comentario]
    ),

    // Listar todos los limites activos (status = true)
    listar: () => Conexion.query(
        'SELECT * FROM limite_gasto WHERE status = true ORDER BY pk_limite ASC'
    ),

    // Obtener un limite por su ID
    obtenerPorId: (id) => Conexion.query(
        'SELECT * FROM limite_gasto WHERE pk_limite = $1 AND status = TRUE',
        [id]
    ),

    // Actualizar datos de un limite
    actualizar: (id, data) => Conexion.query(
        'UPDATE limite_gasto SET fecha=$1, monto=$2, comentario=$3 WHERE pk_limite=$4',
        [data.fecha, data.monto, data.comentario, id]
    ),

    // Desactivar limite (soft delete - cambiar estado a false)
    desactivar: (id) => Conexion.query(
        'UPDATE limite_gasto SET status=FALSE WHERE pk_limite=$1',
        [id]
    ),

    // Eliminar limite permanentemente (hard delete)
    desaparecer: (id) => Conexion.query(
        'DELETE FROM limite_gasto WHERE pk_limite=$1',
        [id]
    )
};