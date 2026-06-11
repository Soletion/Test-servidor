// menú.js - Maneja los contadores de review y excluidas
(function() {
    // Función para actualizar el badge de review
    function updateNavReviewCount() {
        try {
            const savedReviews = localStorage.getItem('reviewQuestions');
            let reviewCount = 0;
            
            if (savedReviews) {
                const parsed = JSON.parse(savedReviews);
                reviewCount = Array.isArray(parsed) ? parsed.length : 0;
            }
            
            const badge = document.getElementById('navReviewCount');
            if (badge) {
                badge.textContent = reviewCount;
                // Ocultar badge si es 0
                if (reviewCount === 0) {
                    badge.style.display = 'none';
                } else {
                    badge.style.display = 'inline-block';
                }
            }
        } catch (e) {
            console.error('Error actualizando badge de review:', e);
            const badge = document.getElementById('navReviewCount');
            if (badge) badge.textContent = '0';
        }
    }

    // Función para actualizar el badge de excluidas
    function updateNavExcludedCount() {
        try {
            const savedExcluded = localStorage.getItem('excludedQuestions');
            let excludedCount = 0;
            
            if (savedExcluded) {
                const parsed = JSON.parse(savedExcluded);
                excludedCount = Array.isArray(parsed) ? parsed.length : 0;
            }
            
            const badge = document.getElementById('navExcludedCount');
            if (badge) {
                badge.textContent = excludedCount;
                // Ocultar badge si es 0
                if (excludedCount === 0) {
                    badge.style.display = 'none';
                } else {
                    badge.style.display = 'inline-block';
                }
            }
        } catch (e) {
            console.error('Error actualizando badge de excluidas:', e);
            const badge = document.getElementById('navExcludedCount');
            if (badge) badge.textContent = '0';
        }
    }

    // Función para crear los badges si no existen
    function ensureBadges() {
        // Badge para review
        const reviewLink = document.querySelector('.nav-link[href="review.html"]');
        if (reviewLink && !reviewLink.querySelector('#navReviewCount')) {
            const badge = document.createElement('span');
            badge.id = 'navReviewCount';
            badge.className = 'nav-badge';
            badge.textContent = '0';
            badge.style.display = 'none';
            reviewLink.appendChild(badge);
        }
        
        // Badge para excluidas
        const excludedLink = document.querySelector('.nav-link[href="excluded.html"]');
        if (excludedLink && !excludedLink.querySelector('#navExcludedCount')) {
            const badge = document.createElement('span');
            badge.id = 'navExcludedCount';
            badge.className = 'nav-badge';
            badge.textContent = '0';
            badge.style.display = 'none';
            excludedLink.appendChild(badge);
        }
    }

    // Función para forzar actualización desde cualquier página
    function forceUpdate() {
        ensureBadges();
        updateNavReviewCount();
        updateNavExcludedCount();
    }

    // Función para escuchar cambios en localStorage
    function setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'reviewQuestions') {
                updateNavReviewCount();
            } else if (e.key === 'excludedQuestions') {
                updateNavExcludedCount();
            }
        });
        
        // También escuchar eventos personalizados para actualización inmediata
        window.addEventListener('updateCounters', () => {
            updateNavReviewCount();
            updateNavExcludedCount();
        });
    }

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ensureBadges();
            updateNavReviewCount();
            updateNavExcludedCount();
            setupStorageListener();
        });
    } else {
        ensureBadges();
        updateNavReviewCount();
        updateNavExcludedCount();
        setupStorageListener();
    }
    
    // Actualizar cada 500ms (por si acaso)
    setInterval(() => {
        updateNavReviewCount();
        updateNavExcludedCount();
    }, 500);
})();