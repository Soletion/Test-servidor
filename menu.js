(function() {
    // Función para actualizar el badge de review en el navbar
    function updateNavReviewCount() {
        const savedReviews = localStorage.getItem('reviewQuestions');
        const reviewCount = savedReviews ? JSON.parse(savedReviews).length : 0;
        
        // Actualizar todos los badges que existan en la página
        const badges = document.querySelectorAll('#navReviewCount');
        badges.forEach(badge => {
            if (badge) badge.textContent = reviewCount;
        });
    }
    
    // Crear el badge en el navbar si no existe 
    function ensureBadge() {
        const reviewLink = document.querySelector('.nav-link[href="review.html"]');
        if (reviewLink && !reviewLink.querySelector('#navReviewCount')) {
            const badge = document.createElement('span');
            badge.id = 'navReviewCount';
            badge.className = 'nav-badge';
            badge.textContent = '0';
            reviewLink.appendChild(badge);
        }
    }
    
    // Actualizar cuando se carga la página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ensureBadge();
            updateNavReviewCount();
        });
    } else {
        ensureBadge();
        updateNavReviewCount();
    }
    
    // Escuchar cambios en localStorage (cuando se añaden/quitan preguntas de repaso)
    window.addEventListener('storage', (e) => {
        if (e.key === 'reviewQuestions') {
            updateNavReviewCount();
        }
    });
    
    // También actualizar periódicamente (por si acaso)
    setInterval(updateNavReviewCount, 1000);
})();