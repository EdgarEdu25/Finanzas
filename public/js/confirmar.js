window.confirmar = function ({ titulo, mensaje, textoConfirmar = 'Aceptar', peligro = false, icono = '⚠️' }) {
    return new Promise((resolve) => {

        // Cerrar cualquier menú de 3 puntos que siga abierto
        document.querySelectorAll('.dropdown-acciones.abierto').forEach(d => d.classList.remove('abierto'));

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-card" role="alertdialog" aria-modal="true">
                <div class="modal-icono ${peligro ? 'peligro' : ''}"></div>
                <h3 class="modal-titulo"></h3>
                <p class="modal-mensaje"></p>
                <div class="modal-botones">
                    <button type="button" class="btn btn-secundario" data-accion="cancelar">Cancelar</button>
                    <button type="button" class="btn ${peligro ? 'btn-confirmar-peligro' : 'btn-confirmar'}" data-accion="aceptar"></button>
                </div>
            </div>
        `;

        overlay.querySelector('.modal-icono').textContent = icono;
        overlay.querySelector('.modal-titulo').textContent = titulo;
        overlay.querySelector('.modal-mensaje').textContent = mensaje;
        overlay.querySelector('[data-accion="aceptar"]').textContent = textoConfirmar;

        function cerrar(resultado) {
            document.removeEventListener('keydown', onTecla);
            overlay.classList.add('saliendo');
            setTimeout(() => overlay.remove(), 150);
            resolve(resultado);
        }

        function onTecla(e) {
            if (e.key === 'Escape') cerrar(false);
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cerrar(false); // clic fuera de la tarjeta
        });
        overlay.querySelector('[data-accion="cancelar"]').onclick = () => cerrar(false);
        overlay.querySelector('[data-accion="aceptar"]').onclick = () => cerrar(true);
        document.addEventListener('keydown', onTecla);

        document.body.appendChild(overlay);
        overlay.querySelector('[data-accion="cancelar"]').focus(); // por seguridad, el foco inicia en Cancelar
    });
};