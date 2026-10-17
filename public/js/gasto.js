setTimeout(() => {

    const form = document.getElementById('formGasto');
    const selectCategoria = document.getElementById('fk_categoria');
    const cantidadInput = document.getElementById('cantidad');
    const precioInput = document.getElementById('precio');
    const totalInput = document.getElementById('total');

    cargarCategorias().then(cargarEdicionPendiente);

    // ========== SUBMIT DEL FORMULARIO ==========
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('pk_gasto').value;
            const nombre_gasto = document.getElementById('nombre_gasto').value;
            const fk_categoria = document.getElementById('fk_categoria').value;
            const cantidad = cantidadInput.value === '' ? null : cantidadInput.value;
            const precio = precioInput.value === '' ? null : precioInput.value;
            const description = document.getElementById('description').value === '' ? null : document.getElementById('description').value;
            const total = totalInput.value;

            const data = { nombre_gasto, fk_categoria, cantidad, precio, total, description };

            try {
                const res = id
                    ? await fetch(`/gasto/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    })
                    : await fetch('/gasto', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                if (!res.ok) {
                    const err = await res.json();
                    mostrarAlerta('error', err.error || 'No se pudo guardar el gasto.');
                    return;
                }

                if (id) {
                    // Era una edición: guardar el aviso y volver al historial
                    localStorage.setItem('toastPendiente', 'Gasto actualizado correctamente.');
                    cancelarEdicion();
                    cargarVista('historial_gasto');
                    return;
                }

                // Era un registro nuevo: se queda en el formulario
                mostrarAlerta('exito', 'Gasto registrado correctamente.');
                cancelarEdicion();

            } catch (error) {
                mostrarAlerta('error', 'No se pudo conectar con el servidor.');
            }
        });
    }

    // ========== TOTAL SUGERIDO ==========
    function sugerirTotal() {
        const c = parseFloat(cantidadInput.value);
        const p = parseFloat(precioInput.value);
        if (!isNaN(c) && !isNaN(p) && !totalInput.dataset.editadoManual) {
            totalInput.value = (c * p).toFixed(2);
        }
    }
    cantidadInput.addEventListener('input', sugerirTotal);
    precioInput.addEventListener('input', sugerirTotal);
    totalInput.addEventListener('input', () => { totalInput.dataset.editadoManual = 'true'; });

    // ========== CARGAR CATEGORIAS ==========
    async function cargarCategorias() {
        if (!selectCategoria) return;
        const res = await fetch('/gasto/categorias');
        const data = await res.json();
        data.forEach(cat => {
            selectCategoria.innerHTML += `<option value="${cat.pk_categoria}">${cat.nombre_categoria}</option>`;
        });
    }

    // ========== REVISAR SI VIENE DE "EDITAR" DESDE EL HISTORIAL ==========
    function cargarEdicionPendiente() {
        const pendiente = localStorage.getItem('gastoEditar');
        if (!pendiente) return;

        const g = JSON.parse(pendiente);
        localStorage.removeItem('gastoEditar');

        document.getElementById('pk_gasto').value = g.pk_gasto;
        document.getElementById('nombre_gasto').value = g.nombre_gasto;
        document.getElementById('fk_categoria').value = g.fk_categoria;
        cantidadInput.value = g.cantidad ?? '';
        precioInput.value = g.precio ?? '';
        totalInput.value = g.total;
        totalInput.dataset.editadoManual = 'true';
        document.getElementById('description').value = g.description ?? '';

        document.getElementById('tituloFormGasto').textContent = 'Editar gasto';
        document.getElementById('btnCancelar').classList.remove('d-none');

        if (g.cantidad || g.precio || g.description) {
            mostrarDetalle();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

}, 100);

// ========== CANCELAR EDICIÓN / LIMPIAR FORMULARIO ==========
window.cancelarEdicion = function () {
    const form = document.getElementById('formGasto');
    const id = document.getElementById('pk_gasto');
    const titulo = document.getElementById('tituloFormGasto');
    const btnCancelar = document.getElementById('btnCancelar');
    const total = document.getElementById('total');

    if (form) form.reset();
    if (id) id.value = '';
    if (titulo) titulo.textContent = 'Nuevo gasto';
    if (btnCancelar) btnCancelar.classList.add('d-none');
    if (total) total.dataset.editadoManual = '';
    ocultarDetalle();
};

// ========== TOGGLE DE DETALLE ==========
window.toggleDetalle = function () {
    const detalle = document.getElementById('detalleGasto');
    if (detalle.classList.contains('oculto')) {
        mostrarDetalle();
    } else {
        ocultarDetalle();
    }
};

window.mostrarDetalle = function () {
    document.getElementById('detalleGasto').classList.remove('oculto');
    document.getElementById('btnToggleDetalle').textContent = '- Ocultar detalle';
};

window.ocultarDetalle = function () {
    const detalle = document.getElementById('detalleGasto');
    if (detalle) detalle.classList.add('oculto');
    const btn = document.getElementById('btnToggleDetalle');
    if (btn) btn.textContent = '+ Agregar detalle';
};

// ========== TOAST ==========
window.mostrarAlerta = function (tipo, mensaje) {
    const wrap = document.getElementById('toastWrap');
    if (!wrap) return;

    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `
        <span class="icono-toast">${tipo === 'exito' ? '✅' : '⚠️'}</span>
        <div class="texto-toast">
            <strong>${tipo === 'exito' ? 'Listo' : 'Algo salió mal'}</strong>
            ${mensaje}
        </div>
        <button class="cerrar-toast" onclick="this.parentElement.remove()">✕</button>
    `;

    wrap.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('saliendo');
        setTimeout(() => toast.remove(), 200);
    }, 3500);
};