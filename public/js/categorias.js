(function () {

    const LIMITE = 10;
    let items = [];
    let visibles = LIMITE;

    const lista = document.getElementById('lista');
    const verMasWrap = document.getElementById('verMasWrap');
    const form = document.getElementById('formCategorias');

    cargar();

    document.onclick = (e) => {
        if (!e.target.closest('.menu-acciones')) {
            document.querySelectorAll('.dropdown-acciones.abierto').forEach(d => d.classList.remove('abierto'));
        }
    };

    function esc(t) {
        return String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function colorAvatar(texto) {
        let s = 0;
        for (const c of String(texto)) s += c.charCodeAt(0);
        return s % 6;
    }

    async function cargar() {
        try {
            const res = await fetch('/categorias');
            items = await res.json();
            renderizar();
        } catch (e) {
            mostrarAlerta('error', 'No se pudieron cargar las categorías.');
        }
    }

    function renderizar() {
        document.getElementById('chip').textContent = `${items.length} activa${items.length === 1 ? '' : 's'}`;
        document.getElementById('resumen').textContent = items.length === 0
            ? '0 categorías'
            : `Mostrando ${Math.min(visibles, items.length)} de ${items.length}`;

        if (items.length === 0) {
            lista.innerHTML = `<div class="vacio">Aún no hay categorías. Crea la primera con "+ Nueva categoría".</div>`;
            verMasWrap.innerHTML = '';
            return;
        }

        lista.innerHTML = items.slice(0, visibles).map(c => `
            <div class="gasto-item">
                <div class="avatar av-${colorAvatar(c.nombre_categoria)}">${esc((c.nombre_categoria || '?').charAt(0).toUpperCase())}</div>
                <div class="gasto-info">
                    <div class="gasto-nombre">${esc(c.nombre_categoria)}</div>
                    <div class="gasto-meta">Activa</div>
                </div>
                <div class="menu-acciones">
                    <button class="btn-kebab" onclick="toggleMenu(event, ${c.pk_categoria})">⋮</button>
                    <div class="dropdown-acciones" id="menu-${c.pk_categoria}">
                        <button onclick="editar(${c.pk_categoria})">✏️ Editar</button>
                        <button onclick="desactivar(${c.pk_categoria})">🚫 Desactivar</button>
                        <button class="peligro" onclick="desaparecer(${c.pk_categoria})">🗑️ Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('');

        const restantes = items.length - visibles;
        verMasWrap.innerHTML = restantes > 0
            ? `<button class="btn-ver-mas" onclick="verMas()">Ver más (${restantes} restante${restantes === 1 ? '' : 's'})</button>`
            : '';
    }

    window.verMas = () => { visibles += LIMITE; renderizar(); };

    window.toggleMenu = (event, id) => {
        event.stopPropagation();
        const menu = document.getElementById(`menu-${id}`);
        const abierto = menu.classList.contains('abierto');
        document.querySelectorAll('.dropdown-acciones.abierto').forEach(d => d.classList.remove('abierto'));
        if (!abierto) menu.classList.add('abierto');
    };

    // ========== FORMULARIO ==========
    window.abrirFormulario = () => {
        document.getElementById('vistaLista').classList.add('d-none');
        document.getElementById('vistaForm').classList.remove('d-none');
        document.getElementById('nombre').focus();
    };

    window.cerrarFormulario = () => {
        form.reset();
        document.getElementById('pk_categoria').value = '';
        document.getElementById('tituloForm').textContent = 'Nueva categoría';
        document.getElementById('vistaForm').classList.add('d-none');
        document.getElementById('vistaLista').classList.remove('d-none');
    };

    window.editar = (id) => {
        const c = items.find(x => x.pk_categoria === id);
        if (!c) return;
        abrirFormulario();
        document.getElementById('pk_categoria').value = c.pk_categoria;
        document.getElementById('nombre').value = c.nombre_categoria;
        document.getElementById('tituloForm').textContent = 'Editar categoría';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('pk_categoria').value;
        const data = { nombre_categoria: document.getElementById('nombre').value };

        try {
            const res = await fetch(id ? `/categorias/${id}` : '/categorias', {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const err = await res.json();
                mostrarAlerta('error', err.error || 'No se pudo guardar la categoría.');
                return;
            }

            mostrarAlerta('exito', id ? 'Categoría actualizada.' : 'Categoría creada.');
            cerrarFormulario();
            cargar();
        } catch (error) {
            mostrarAlerta('error', 'No se pudo conectar con el servidor.');
        }
    });

    // ========== DESACTIVAR / ELIMINAR ==========
    window.desactivar = async (id) => {
       if (!await confirmar({ titulo: 'Desactivar categoría', mensaje: 'La categoría dejará de aparecer al registrar gastos.', textoConfirmar: 'Desactivar', icono: '🚫' })) return;
        try {
            const res = await fetch(`/categorias/${id}/desactivar`, { method: 'PATCH' });
            if (!res.ok) {
                const err = await res.json();
                mostrarAlerta('error', err.error || 'No se pudo desactivar.');
                return;
            }
            mostrarAlerta('exito', 'Categoría desactivada.');
            cargar();
        } catch (error) {
            mostrarAlerta('error', 'No se pudo conectar con el servidor.');
        }
    };

    window.desaparecer = async (id) => {
       if (!await confirmar({ titulo: 'Eliminar categoría', mensaje: 'Se borrará de forma permanente. Si tiene gastos asociados, no podrá eliminarse.', textoConfirmar: 'Eliminar', peligro: true, icono: '🗑️' })) return;
        try {
            const res = await fetch(`/categorias/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (!res.ok) {
                mostrarAlerta('error', result.error || 'No se pudo eliminar. Puede tener gastos asociados.');
                return;
            }
            mostrarAlerta('exito', 'Categoría eliminada.');
            cargar();
        } catch (error) {
            mostrarAlerta('error', 'No se pudo conectar con el servidor.');
        }
    };

    window.mostrarAlerta = function (tipo, mensaje) {
        const wrap = document.getElementById('toastWrap');
        if (!wrap) return;
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.innerHTML = `
            <span class="icono-toast">${tipo === 'exito' ? '✅' : '⚠️'}</span>
            <div class="texto-toast"><strong>${tipo === 'exito' ? 'Listo' : 'Algo salió mal'}</strong>${mensaje}</div>
            <button class="cerrar-toast" onclick="this.parentElement.remove()">✕</button>
        `;
        wrap.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('saliendo');
            setTimeout(() => toast.remove(), 200);
        }, 3500);
    };

})();