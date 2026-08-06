// ==========================================
// --- LIPI PWA SERVICE WORKER REGISTRATION ---
// ==========================================

// IndexedDB Helper to track installation status
function setInstallFlag(value) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('LipiDB', 1);

        request.onupgradeneeded = (event) => {
            event.target.result.createObjectStore('flags');
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction('flags', 'readwrite');
            const store = transaction.objectStore('flags');
            store.put(value, 'isInstalled').onsuccess = () => resolve();
        };
        request.onerror = () => reject(request.error);
    });
}

// Global deferred prompt so UI buttons can trigger installation
window.deferredPrompt = window.deferredPrompt || null;

if ('serviceWorker' in navigator) {
    // 1. REGISTRATION
    window.addEventListener('load', () => {
        const swPath = window.location.pathname.endsWith('app.html') ? '../service_worker.js' : './service_worker.js';
        navigator.serviceWorker.register(swPath)
            // .then(() => console.log('[ServiceWorker] Registered successfully.'))
            .catch((err) => {}); // console.error('[ServiceWorker] Registration failed:', err);
    });

    // 2. THE INSTALL PROMPT LISTENER
    window.addEventListener('beforeinstallprompt', (event) => {
        // console.log('[ServiceWorker] beforeinstallprompt event captured.');
        event.preventDefault();
        window.deferredPrompt = event;
        window.dispatchEvent(new CustomEvent('pwa-installable'));

        setInstallFlag(false);
    });

    // 3. THE INSTALL TRIGGER
    window.addEventListener('appinstalled', (event) => {
        // console.log('[ServiceWorker] Lipi native installation confirmed!');
        window.deferredPrompt = null;
        window.dispatchEvent(new CustomEvent('pwa-installed'));

        setInstallFlag(true);
    });
} else {
    // console.warn('[ServiceWorker] Service Workers are not supported in this browser.');
}
