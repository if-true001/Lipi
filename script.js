// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
const themeIcon = document.querySelector('.theme-icon');

const moonIcon = "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z";
const sunIcon = "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z";

const currentTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (currentTheme === 'dark' || (!currentTheme && systemPrefersDark)) {
    htmlElement.setAttribute('data-theme', 'dark');
    themeIcon.innerHTML = `<path d="${sunIcon}" />`;
} else if (currentTheme === 'light') {
    htmlElement.setAttribute('data-theme', 'light');
    themeIcon.innerHTML = `<path d="${moonIcon}" />`;
}

themeToggleBtn.addEventListener('click', () => {
    const isDark = htmlElement.getAttribute('data-theme') === 'dark' || (!htmlElement.hasAttribute('data-theme') && systemPrefersDark);           
    if (isDark) {
        htmlElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeIcon.innerHTML = `<path d="${moonIcon}" />`;
    } else {
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeIcon.innerHTML = `<path d="${sunIcon}" />`;
    }
});

// --- Text Content Animation Observer ---
const textObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        } else {
            if (entry.boundingClientRect.top > 0) {
                entry.target.classList.remove('in-view');
            }
        }
    });
}, { root: null, rootMargin: '0px', threshold: 0.3 });

document.querySelectorAll('.animate-on-snap').forEach((el) => {
    textObserver.observe(el);
});

// --- Header Logo Transition Observer ---
const header = document.getElementById('main-header');
const heroSection = document.getElementById('hero');

const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            header.classList.remove('scrolled'); // Show text
        } else {
            header.classList.add('scrolled'); // Show SVG
        }
    });
}, { root: null, threshold: 0.5 });

headerObserver.observe(heroSection);


// --- Check if app is in standalone mode ---
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

// --- UI Install Button Listener (Landing Page) ---
const installBtn = document.getElementById('install-btn');
if (installBtn) {
    if (isStandalone) {
        installBtn.style.display = 'none';
        // console.log('[App] Running in standalone mode. Hiding install button.');
    } else if (window.deferredPrompt) {
        installBtn.style.display = 'inline-flex';
        // console.log('[App] Install prompt ready on initial load.');
    }

    installBtn.addEventListener('click', async () => {
        // console.log('[App] Install button clicked.');

        if (isStandalone) {
            // console.log("[App] Lipi is already installed and running as an app.");
            installBtn.style.display = 'none';
            return;
        }

        if (window.deferredPrompt) {
            // console.log('[App] Triggering window.deferredPrompt.prompt()...');
            window.deferredPrompt.prompt();
            const { outcome } = await window.deferredPrompt.userChoice;
            // console.log('[App] User choice outcome:', outcome);
            if (outcome === 'accepted') {
                // console.log('[App] User accepted the install prompt.');
                installBtn.style.display = 'none';
            } else {
                // console.log('[App] User dismissed the install prompt.');
            }
            window.deferredPrompt = null;
        } else {
            // console.log("[App] Install prompt not available. Hiding button.");
            installBtn.style.display = 'none';
        }
    });

    window.addEventListener('pwa-installable', () => {
        // console.log('[App] Event received: pwa-installable');
        if (!isStandalone && window.deferredPrompt) {
            installBtn.style.display = 'inline-flex';
        }
    });

    window.addEventListener('pwa-installed', () => {
        // console.log('[App] Event received: pwa-installed');
        installBtn.style.display = 'none';
    });
}