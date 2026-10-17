(function () {

    const LIMITE = 10;
    let items = [];
    let visibles = LIMITE;

    const lista = document.getElementById('lista');
    const verMasWrap = document.getElementById('verMasWrap');
    const form = document.getElementById('formAhorro');

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

    function fechaCorta(f) {
        const d = new Date(f);
        return isNaN(d) ? '' : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    }

    async function cargar() {
        try {
            const res = await fetch('/ahorro');
            items = (await res.json()).sort((a, b) => b.pk_ahorro - a.pk_ahorro); // más recientes primero
            renderizar();
        } catch (e) {
            mostrarAlerta('error', 'No se pudieron cargar los ahorros.');
        }
    }

    function renderizar() {
        const total = items.reduce((acc, a) => acc + Number(a.monto), 0);
        document.getElementById('chip').textContent = `$${total.toFixed(2)}`;
        document.getElementById('resumen').textContent = items.length === 0
            ? '0 registros'
            : `Mostrando ${Math.min(visibles, items.length)} de ${items.length}`;

        if (items.length === 0) {
            lista.innerHTML = `<div class="vacio">Aún no hay ahorros. Crea el primero con "+ Nuevo ahorro".</div>`;
            verMasWrap.innerHTML = '';
            return;
        }

        lista.innerHTML = items.slice(0, visibles).map(a => `
            <div class="gasto-item">
                <div class="avatar av-${colorAvatar(a.nombre_ahorro)}">${esc((a.nombre_ahorro || '?').charAt(0).toUpperCase())}</div>
                <div class="gasto-info">
                    <div class="gasto-nombre">${esc(a.nombre_ahorro)}</div>
                    <div class="gasto-meta">${esc(a.descripcion || 'Sin descripción')} · ${fechaCorta(a.fecha_hora)}</div>
                </div>
                <div class="gasto-monto">$${Number(a.monto).toFixed(2)}</div>
                <div class="menu-acciones">
                    <button class="btn-kebab" onclick="toggleMenu(event, ${a.pk_ahorro})">⋮</button>
                    <div class="dropdown-acciones" id="menu-${a.pk_ahorro}">
                        <button onclick="editar(${a.pk_ahorro})">✏️ Editar</button>
                        <button onclick="desactivar(${a.pk_ahorro})">🚫 Desactivar</button>
                        <button class="peligro" onclick="desaparecer(${a.pk_ahorro})">🗑️ Eliminar</button>
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
        document.getElementById('nombre_ahorro').focus();
    };

    window.cerrarFormulario = () => {
        form.reset();
        document.getElementById('pk_ahorro').value = '';
        document.getElementById('tituloForm').textContent = 'Nuevo ahorro';
        document.getElementById('vistaForm').classList.add('d-none');
        document.getElementById('vistaLista').classList.remove('d-none');
    };

    window.editar = (id) => {
        const a = items.find(x => x.pk_ahorro === id);
        if (!a) return;
        abrirFormulario();
        document.getElementById('pk_ahorro').value = a.pk_ahorro;
        document.getElementById('nombre_ahorro').value = a.nombre_ahorro;
        document.getElementById('monto').value = a.monto;
        document.getElementById('descripcion').value = a.descripcion ?? '';
        document.getElementById('tituloForm').textContent = 'Editar ahorro';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('pk_ahorro').value;
        const data = {
            nombre_ahorro: document.getElementById('nombre_ahorro').value,
            monto: document.getElementById('monto').value,
            descripcion: document.getElementById('descripcion').value
        };

        try {
            const res = await fetch(id ? `/ahorro/${id}` : '/ahorro', {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const err = await res.json();
                mostrarAlerta('error', err.error || 'No se pudo guardar el ahorro.');
                return;
            }

            mostrarAlerta('exito', id ? 'Ahorro actualizado.' : 'Ahorro registrado.');
            cerrarFormulario();
            cargar();
        } catch (error) {
            mostrarAlerta('error', 'No se pudo conectar con el servidor.');
        }
    });

    // ========== DESACTIVAR / ELIMINAR ==========
    window.desactivar = async (id) => {
       if (!await confirmar({ titulo: 'Desactivar ahorro', mensaje: 'El ahorro dejará de mostrarse en la lista.', textoConfirmar: 'Desactivar', icono: '🚫' })) return;
        try {
            const res = await fetch(`/ahorro/${id}/desactivar`, { method: 'PATCH' });
            if (!res.ok) {
                const err = await res.json();
                mostrarAlerta('error', err.error || 'No se pudo desactivar.');
                return;
            }
            mostrarAlerta('exito', 'Ahorro desactivado.');
            cargar();
        } catch (error) {
            mostrarAlerta('error', 'No se pudo conectar con el servidor.');
        }
    };

    window.desaparecer = async (id) => {
        if (!await confirmar({ titulo: 'Eliminar ahorro', mensaje: 'Se borrará de forma permanente. Esta acción no se puede deshacer.', textoConfirmar: 'Eliminar', peligro: true, icono: '🗑️' })) return;
        try {
            const res = await fetch(`/ahorro/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (!res.ok) {
                mostrarAlerta('error', result.error || 'No se pudo eliminar.');
                return;
            }
            mostrarAlerta('exito', 'Ahorro eliminado.');
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