const Conexion = require('../config/conexion'); // Importa la conexión a PostgreSQL

module.exports = {
    // Crear un nuevo categorias
    crear: (data) => Conexion.query(
        'INSERT INTO ahorro (nombre_ahorro, monto, descripcion) VALUES($1, $2, $3)',
        [data.nombre_ahorro, data.monto, data.descripcion]
    ),

    // Listar todos los categorias activos (estado = 1)
    listar: () => Conexion.query(
        'SELECT * FROM ahorro WHERE status = true ORDER BY pk_ahorro ASC'
    ),

    // Obtener un categorias por su ID (necesario para el select en pedidos)
    obtenerPorId: (id) => Conexion.query(
        'SELECT * FROM ahorro WHERE pk_ahorro = $1 AND status = TRUE',
        [id]
    ),

    // Actualizar datos de un categorias
    actualizar: (id, data) => Conexion.query(
        'UPDATE ahorro SET nombre_ahorro=$1, monto=$2, descripcion=$3 WHERE pk_ahorro=$4',
        [data.nombre_ahorro, data.monto, data.descripcion, id]
    ),

    // Desactivar categorias (soft delete - cambiar estado a 0)
    desactivar: (id) => Conexion.query(
        'UPDATE ahorro SET status=FALSE WHERE pk_ahorro=$1',
        [id]
    ),

    // Eliminar categorias permanentemente (hard delete)
    // NOTA: Fallará si tiene pedidos asociados por la FK RESTRICT
    desaparecer: (id) => Conexion.query(
        'DELETE FROM ahorro WHERE pk_ahorro=$1',
        [id]
    )
};