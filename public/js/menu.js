window.onload = () => cargarVista(localStorage.getItem('vista') || 'gasto');

const modulos = {
    gasto: 'gasto',
    historial_gasto: 'historial_gasto',
    categorias: 'categorias',
    ahorro: 'ahorro',
    limite_gasto: 'limite_gasto'
};

// Enlazar ambos grupos de botones: nav superior (desktop) y nav inferior (móvil)
document.querySelectorAll('nav.nav-links button[data-vista], nav.bottom-nav button[data-vista]').forEach(btn => {
    btn.addEventListener('click', () => cargarVista(btn.dataset.vista));
});

async function cargarVista(vista) {

    localStorage.setItem('vista', vista);

    document.querySelectorAll('nav.nav-links button[data-vista], nav.bottom-nav button[data-vista]').forEach(btn => {
        btn.classList.toggle('activo', btn.dataset.vista === vista);
    });

    const res = await fetch(`/views/${vista}.html`);
    const html = await res.text();

    const contenedor = document.getElementById('contenido');
    contenedor.innerHTML = html;

    document.querySelectorAll('script[data-modulo]').forEach(s => s.remove());

    const modulo = modulos[vista];
    if (!modulo) return;

    const script = document.createElement('script');
    script.src = `/js/${modulo}.js`;
    script.defer = true;
    script.dataset.modulo = modulo;

    contenedor.appendChild(script);
}