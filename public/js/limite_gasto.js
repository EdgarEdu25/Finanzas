(function () {

    const LIMITE = 10;
    let items = [];
    let visibles = LIMITE;

    const lista = document.getElementById('lista');
    const verMasWrap = document.getElementById('verMasWrap');
    const form = document.getElementById('formLimite');

    cargar();

    document.onclick = (e) => {
        if (!e.target.closest('.menu-acciones')) {
            document.querySelectorAll('.dropdown-acciones.abierto').forEach(d => d.classList.remove('abierto'));
        }
    };

    function esc(t) {
        return String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Trabaja con el texto YYYY-MM-DD para evitar desfases de zona horaria
    function soloFecha(f) {
        return String(f).slice(0, 10);
    }

    function fechaLarga(f) {
        const [y, m, d] = soloFecha(f).split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }

    async function cargar() {
        try {
            const res = await fetch('/limite');
            items = (await res.json()).sort((a, b) => soloFecha(b.fecha).localeCompare(soloFecha(a.fecha))); // más reciente primero
            renderizar();
        } catch (e) {
            mostrarAlerta('error', 'No se pudieron cargar los límites.');
        }
    }

    function renderizar() {
        // Chip: límite de hoy, si existe
        const hoy = new Date().toLocaleDateString('en-CA');
        const delDia = items.find(l => soloFecha(l.fecha) === hoy);
        document.getElementById('chip').textContent = delDia ? `Hoy: $${Number(delDia.monto).toFixed(2)}` : 'Sin límite hoy';

        document.getElementById('resumen').textContent = items.length === 0
            ? '0 registros'
            : `Mostrando ${Math.min(visibles, items.length)} de ${items.length}`;

        if (items.length === 0) {
            lista.innerHTML = `<div class="vacio">Aún no hay límites. Crea el primero con "+ Nuevo límite".</div>`;
            verMasWrap.innerHTML = '';
            return;
        }

        lista.innerHTML = items.slice(0, visibles).map(l => {
            const [y, m, d] = soloFecha(l.fecha).split('-').map(Number);
            return `
            <div class="gasto-item">
                <div class="avatar av-${m % 6}">${d}</div>
                <div class="gasto-info">
                    <div class="gasto-nombre">${esc(fechaLarga(l.fecha))}</div>
                    <div class="gasto-meta">${esc(l.comentario || 'Sin comentario')}</div>
                </div>
                <div class="gasto-monto">$${Number(l.monto).toFixed(2)}</div>
                <div class="menu-acciones">
                    <button class="btn-kebab" onclick="toggleMenu(event, ${l.pk_limite})">⋮</button>
                    <div class="dropdown-acciones" id="menu-${l.pk_limite}">
                        <button onclick="editar(${l.pk_limite})">✏️ Editar</button>
                        <button onclick="desactivar(${l.pk_limite})">🚫 Desactivar</button>
                        <button class="peligro" onclick="desaparecer(${l.pk_limite})">🗑️ Eliminar</button>
                    </div>
                </div>
            </div>`;
        }).join('');

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
        document.getElementById('fecha').focus();
    };

    window.cerrarFormulario = () => {
        form.reset();
        document.getElementById('pk_limite').value = '';
        document.getElementById('tituloForm').textContent = 'Nuevo límite';
        document.getElementById('vistaForm').classList.add('d-none');
        document.getElementById('vistaLista').classList.remove('d-none');
    };

    window.editar = (id) => {
        const l = items.find(x => x.pk_limite === id);
        if (!l) return;
        abrirFormulario();
        document.getElementById('pk_limite').value = l.pk_limite;
        document.getElementById('fecha').value = soloFecha(l.fecha);
        document.getElementById('monto').value = l.monto;
        document.getElementById('comentario').value = l.comentario ?? '';
        document.getElementById('tituloForm').textContent = 'Editar límite';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('pk_limite').value;
        const data = {
            fecha: document.getElementById('fecha').value,
            monto: document.getElementById('monto').value,
            comentario: document.getElementById('comentario').value
        };

        try {
            const res = await fetch(id ? `/limite/${id}` : '/limite', {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const err = await res.json();
                const duplicado = (err.error || '').includes('duplicate') || (err.error || '').includes('unique');
                mostrarAlerta('error', duplicado ? 'Ya existe un límite para esa fecha.' : (err.error || 'No se pudo guardar el límite.'));
                return;
            }

            mostrarAlerta('exito', id ? 'Límite actualizado.' : 'Límite registrado.');
            cerrarFormulario();
            cargar();
        } catch (error) {
            mostrarAlerta('error', 'No se pudo conectar con el servidor.');
        }
    });

    // ========== DESACTIVAR / ELIMINAR ==========
    window.desactivar = async (id) => {
        if (!await confirmar({ titulo: 'Desactivar límite', mensaje: 'El límite dejará de mostrarse en la lista.', textoConfirmar: 'Desactivar', icono: '🚫' })) return;
        try {
            const res = await fetch(`/limite/${id}/desactivar`, { method: 'PATCH' });
            if (!res.ok) {
                const err = await res.json();
                mostrarAlerta('error', err.error || 'No se pudo desactivar.');
                return;
            }
            mostrarAlerta('exito', 'Límite desactivado.');
            cargar();
        } catch (error) {
            mostrarAlerta('error', 'No se pudo conectar con el servidor.');
        }
    };

    window.desaparecer = async (id) => {
       if (!await confirmar({ titulo: 'Eliminar límite', mensaje: 'Se borrará de forma permanente. Esta acción no se puede deshacer.', textoConfirmar: 'Eliminar', peligro: true, icono: '🗑️' })) return;
        try {
            const res = await fetch(`/limite/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (!res.ok) {
                mostrarAlerta('error', result.error || 'No se pudo eliminar.');
                return;
            }
            mostrarAlerta('exito', 'Límite eliminado.');
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