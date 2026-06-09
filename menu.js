(function() {
    function updateNavCounts() {
        // Actualizar badge de review
        const savedReviews = localStorage.getItem('reviewQuestions');
        const reviewCount = savedReviews ? JSON.parse(savedReviews).length : 0;
        const reviewBadges = document.querySelectorAll('#navReviewCount');
        reviewBadges.forEach(badge => {
            if (badge) badge.textContent = reviewCount;
        });
        
        // Actualizar badge de excluidas
        const savedExcluded = localStorage.getItem('excludedQuestions');
        const excludedCount = savedExcluded ? JSON.parse(savedExcluded).length : 0;
        const excludedBadges = document.querySelectorAll('#navExcludedCount');
        excludedBadges.forEach(badge => {
            if (badge) badge.textContent = excludedCount;
        });
    }
    
    function ensureBadges() {
        const reviewLink = document.querySelector('.nav-link[href="review.html"]');
        if (reviewLink && !reviewLink.querySelector('#navReviewCount')) {
            const badge = document.createElement('span');
            badge.id = 'navReviewCount';
            badge.className = 'nav-badge';
            badge.textContent = '0';
            reviewLink.appendChild(badge);
        }
        
        const excludedLink = document.querySelector('.nav-link[href="excluded.html"]');
        if (excludedLink && !excludedLink.querySelector('#navExcludedCount')) {
            const badge = document.createElement('span');
            badge.id = 'navExcludedCount';
            badge.className = 'nav-badge';
            badge.textContent = '0';
            excludedLink.appendChild(badge);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ensureBadges();
            updateNavCounts();
        });
    } else {
        ensureBadges();
        updateNavCounts();
    }
    
    window.addEventListener('storage', (e) => {
        if (e.key === 'reviewQuestions' || e.key === 'excludedQuestions') {
            updateNavCounts();
        }
    });
    
    setInterval(updateNavCounts, 1000);
})();