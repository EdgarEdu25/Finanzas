const Conexion = require('../config/conexion'); // Importa la conexión a PostgreSQL

module.exports = {
    // Crear un nuevo categorias
    crear: (data) => Conexion.query(
        'INSERT INTO categoria(nombre_categoria) VALUES($1)',
        [data.nombre_categoria]
    ),

    // Listar todos los categorias activos (estado = 1)
    listar: () => Conexion.query(
        'SELECT * FROM categoria WHERE status = true ORDER BY pk_categoria ASC'
    ),

    // Obtener un categorias por su ID (necesario para el select en pedidos)
    obtenerPorId: (id) => Conexion.query(
        'SELECT * FROM categoria WHERE pk_categoria = $1 AND status = true',
        [id]
    ),

    // Actualizar datos de un categorias
    actualizar: (id, data) => Conexion.query(
        'UPDATE categoria SET nombre_categoria=$1 WHERE pk_categoria=$2',
        [data.nombre_categoria, id]
    ),

    // Desactivar categorias (soft delete - cambiar estado a 0)
    desactivar: (id) => Conexion.query(
        'UPDATE categoria SET status=false WHERE pk_categoria=$1',
        [id]
    ),

    // Eliminar categorias permanentemente (hard delete)
    // NOTA: Fallará si tiene pedidos asociados por la FK RESTRICT
    desaparecer: (id) => Conexion.query(
        'DELETE FROM categoria WHERE pk_categoria=$1',
        [id]
    )
};