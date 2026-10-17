const CACHE = 'finanzas-v1';
const ARCHIVOS = [
    '/index.html',
    '/css/estilos.css',
    '/views/layout.html',
    '/views/inicio.html'
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});