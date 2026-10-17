(function () {

    const LIMITE = 10; // registros por "página"

    let gastosDelDia = [];
    let visibles = LIMITE;

    setTimeout(() => {

        const lista = document.getElementById('listaGastos');
        const verMasWrap = document.getElementById('verMasWrap');
        const buscador = document.getElementById('buscador');
        const filtroFecha = document.getElementById('filtroFecha');

        // Si venimos de editar, recuperar la fecha que se estaba viendo
        const fechaGuardada = localStorage.getItem('historialFecha');
        localStorage.removeItem('historialFecha');
        filtroFecha.value = fechaGuardada || fechaLocalISO(new Date());

        // Si venimos de guardar una edición, mostrar el aviso
        const aviso = localStorage.getItem('toastPendiente');
        if (aviso) {
            localStorage.removeItem('toastPendiente');
            mostrarAlerta('exito', aviso);
        }

        cargarPorFecha(filtroFecha.value);

        buscador.addEventListener('input', () => {
            visibles = LIMITE;
            renderizar();
        });

        filtroFecha.addEventListener('change', () => {
            visibles = LIMITE;
            cargarPorFecha(filtroFecha.value);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-acciones')) {
                document.querySelectorAll('.dropdown-acciones.abierto').forEach(d => d.classList.remove('abierto'));
            }
        });

        function fechaLocalISO(fecha) {
            return fecha.toLocaleDateString('en-CA'); // YYYY-MM-DD
        }

        window.irHoy = function () {
            visibles = LIMITE;
            filtroFecha.value = fechaLocalISO(new Date());
            cargarPorFecha(filtroFecha.value);
        };

        window.verMas = function () {
            visibles += LIMITE;
            renderizar();
        };

        async function cargarPorFecha(fecha) {
            lista.innerHTML = `<div class="vacio">Cargando...</div>`;
            verMasWrap.innerHTML = '';
            try {
                const res = await fetch(`/gasto/fecha/${fecha}`);
                gastosDelDia = await res.json();
                renderizar();
            } catch (error) {
                mostrarAlerta('error', 'No se pudo cargar el historial.');
            }
        }

        // Color del avatar según la categoría (siempre el mismo color por categoría)
        function colorAvatar(texto) {
            let suma = 0;
            for (const c of String(texto)) suma += c.charCodeAt(0);
            return suma % 6;
        }

        function horaGasto(fechaHora) {
            const d = new Date(fechaHora);
            if (isNaN(d)) return '';
            return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        }

        function renderizar() {
            if (!lista) return;

            const texto = buscador.value.trim().toLowerCase();

            const filtrados = gastosDelDia.filter(g =>
                !texto
                || g.nombre_gasto.toLowerCase().includes(texto)
                || (g.nombre_categoria || '').toLowerCase().includes(texto)
            );

            // El total siempre suma TODOS los filtrados, no solo los visibles
            const sumaTotal = filtrados.reduce((acc, g) => acc + Number(g.total), 0);
            document.getElementById('totalChip').textContent = `$${sumaTotal.toFixed(2)}`;

            const mostrados = Math.min(visibles, filtrados.length);
            document.getElementById('resumenHistorial').textContent =
                filtrados.length === 0
                    ? '0 registros'
                    : `Mostrando ${mostrados} de ${filtrados.length} registro${filtrados.length === 1 ? '' : 's'}`;

            if (filtrados.length === 0) {
                lista.innerHTML = `<div class="vacio">No hay gastos para este filtro.</div>`;
                verMasWrap.innerHTML = '';
                return;
            }

            lista.innerHTML = filtrados.slice(0, visibles).map(g => `
                <div class="gasto-item">
                    <div class="avatar av-${colorAvatar(g.nombre_categoria)}">
                        ${(g.nombre_gasto || '?').charAt(0).toUpperCase()}
                    </div>

                    <div class="gasto-info">
                        <div class="gasto-nombre">${g.nombre_gasto}</div>
                        <div class="gasto-meta">${g.nombre_categoria} · ${horaGasto(g.fecha_hora)}</div>
                    </div>

                    <div class="gasto-monto">$${Number(g.total).toFixed(2)}</div>

                    <div class="menu-acciones">
                        <button class="btn-kebab" onclick="toggleMenu(event, ${g.pk_gasto})">⋮</button>
                        <div class="dropdown-acciones" id="menu-${g.pk_gasto}">
                            <button onclick="editar(${g.pk_gasto})">✏️ Editar</button>
                            <button onclick="desactivar(${g.pk_gasto})">🚫 Desactivar</button>
                            <button class="peligro" onclick="desaparecer(${g.pk_gasto})">🗑️ Eliminar</button>
                        </div>
                    </div>
                </div>
            `).join('');

            // Botón "Ver más" solo si quedan registros por mostrar
            const restantes = filtrados.length - mostrados;
            verMasWrap.innerHTML = restantes > 0
                ? `<button class="btn-ver-mas" onclick="verMas()">Ver más (${restantes} restante${restantes === 1 ? '' : 's'})</button>`
                : '';
        }

        window.toggleMenu = function (event, id) {
            event.stopPropagation();
            const menu = document.getElementById(`menu-${id}`);
            const estabaAbierto = menu.classList.contains('abierto');
            document.querySelectorAll('.dropdown-acciones.abierto').forEach(d => d.classList.remove('abierto'));
            if (!estabaAbierto) menu.classList.add('abierto');
        };

        // Editar: guarda el registro y la fecha actual del filtro, y abre el formulario
        window.editar = (id) => {
            const g = gastosDelDia.find(x => x.pk_gasto === id);
            if (!g) return;
            localStorage.setItem('gastoEditar', JSON.stringify({
                pk_gasto: g.pk_gasto,
                nombre_gasto: g.nombre_gasto,
                fk_categoria: g.fk_categoria,
                cantidad: g.cantidad,
                precio: g.precio,
                total: g.total,
                description: g.description
            }));
            localStorage.setItem('historialFecha', filtroFecha.value);
            cargarVista('gasto');
        };

        window.desactivar = async (id) => {
           if (!await confirmar({ titulo: 'Desactivar gasto', mensaje: 'El gasto dejará de mostrarse en el historial.', textoConfirmar: 'Desactivar', icono: '🚫' })) return;
            try {
                const res = await fetch(`/gasto/${id}/desactivar`, { method: 'PATCH' });
                if (!res.ok) {
                    const err = await res.json();
                    mostrarAlerta('error', err.error || 'No se pudo desactivar el gasto.');
                    return;
                }
                mostrarAlerta('exito', 'Gasto desactivado.');
                cargarPorFecha(filtroFecha.value);
            } catch (error) {
                mostrarAlerta('error', 'No se pudo conectar con el servidor.');
            }
        };

        window.desaparecer = async (id) => {
           if (!await confirmar({ titulo: 'Eliminar gasto', mensaje: 'Se borrará de forma permanente. Esta acción no se puede deshacer.', textoConfirmar: 'Eliminar', peligro: true, icono: '🗑️' })) return;
            try {
                const res = await fetch(`/gasto/${id}`, { method: 'DELETE' });
                const result = await res.json();
                if (!res.ok) {
                    mostrarAlerta('error', result.error || 'No se pudo eliminar el gasto.');
                    return;
                }
                mostrarAlerta('exito', 'Gasto eliminado.');
                cargarPorFecha(filtroFecha.value);
            } catch (error) {
                mostrarAlerta('error', 'No se pudo conectar con el servidor.');
            }
        };

    }, 100);

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

})();