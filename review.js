class ReviewPage {
    constructor() {
        this.originalQuestions = [];
        this.reviewQuestions = new Set();
        this.loadData();
    }

    async loadData() {
        try {
            const response = await fetch('data/questions.json');
            this.originalQuestions = await response.json();
            
            const savedReviews = localStorage.getItem('reviewQuestions');
            if (savedReviews) {
                this.reviewQuestions = new Set(JSON.parse(savedReviews));
            }
            
            this.displayReviewQuestions();
            this.updateNavReviewCount();
        } catch (error) {
            console.error('Error cargando datos:', error);
        }
    }

    displayReviewQuestions() {
        const container = document.getElementById('reviewContainer');
        const reviewList = Array.from(this.reviewQuestions).sort((a, b) => a - b);
        
        if (reviewList.length === 0) {
            container.innerHTML = `
                <div class="empty-review">
                    <i class="fas fa-flag"></i>
                    <p>No tienes preguntas marcadas para repasar</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">Ve al cuestionario y marca las preguntas que quieras repasar con el botón <i class="fas fa-flag"></i></p>
                </div>
            `;
            return;
        }

        container.innerHTML = reviewList.map(originalIndex => {
            const question = this.originalQuestions[originalIndex];
            if (!question) return '';
            
            const correctLetter = question.correct.toUpperCase();
            const correctText = question.options[question.correct.charCodeAt(0) - 97];
            
            let questionText = question.text;
            // Formatear código si es necesario
            if (questionText.includes('$') || questionText.includes('echo') || questionText.includes('foreach')) {
                questionText = `<pre class="code-block" style="margin-top: 10px;"><code>${this.escapeHtml(this.formatCode(questionText))}</code></pre>`;
            }
            
            return `
                <div class="review-item" data-index="${originalIndex}">
                    <div class="review-question-text">
                        <strong>Pregunta:</strong><br>
                        ${questionText}
                    </div>
                    <div class="review-answer">
                        <strong><i class="fas fa-check-circle"></i> Respuesta correcta:</strong><br>
                        ${correctLetter}) ${this.escapeHtml(correctText)}
                    </div>
                    <div class="review-actions">
                        <button class="remove-review-btn" data-index="${originalIndex}">
                            <i class="fas fa-trash-alt"></i> Quitar de repaso
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Agregar event listeners a los botones de eliminar
        document.querySelectorAll('.remove-review-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.dataset.index);
                this.removeFromReview(index);
            });
        });
    }

    formatCode(text) {
        let cleanCode = text;
        const prefixes = [/¿Cuál es la salida del siguiente código\?/i, /Dado el siguiente código\?/i, /¿Qué muestra el siguiente código\?/i];
        prefixes.forEach(prefix => { cleanCode = cleanCode.replace(prefix, ''); });
        
        let formatted = cleanCode;
        formatted = formatted.replace(/;\s*/g, ';\n    ');
        formatted = formatted.replace(/\{\s*/g, '{\n    ');
        formatted = formatted.replace(/\}\s*else/g, '\n} else');
        formatted = formatted.replace(/\}\s*/g, '\n}\n');
        formatted = formatted.replace(/if\s*\(/g, 'if (');
        formatted = formatted.replace(/foreach\s*\(/g, 'foreach (');
        formatted = formatted.replace(/\)\s*\{/g, ') {');
        
        let indentLevel = 0;
        let lines = formatted.split('\n');
        let formattedLines = [];
        for (let line of lines) {
            if (line.includes('}')) indentLevel = Math.max(0, indentLevel - 1);
            formattedLines.push('    '.repeat(indentLevel) + line.trim());
            if (line.includes('{') && !line.includes('}')) indentLevel++;
        }
        return formattedLines.join('\n');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    removeFromReview(originalIndex) {
        this.reviewQuestions.delete(originalIndex);
        localStorage.setItem('reviewQuestions', JSON.stringify(Array.from(this.reviewQuestions)));
        this.displayReviewQuestions();
        this.updateNavReviewCount();
        this.showToast('Pregunta removida de la lista de repaso', 'success');
        
        // Disparar evento para actualizar el menú
        window.dispatchEvent(new Event('updateCounters'));
    }

    updateNavReviewCount() {
        const badge = document.getElementById('navReviewCount');
        if (badge) {
            badge.textContent = this.reviewQuestions.size;
        }
    }

    showToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icon = type === 'success' ? '<i class="fas fa-check-circle"></i> ' : '<i class="fas fa-info-circle"></i> ';
        toast.innerHTML = icon + message;
        toast.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            background: ${type === 'success' ? '#a8dc6f' : '#6fa8dc'};
            color: ${type === 'success' ? '#1E293B' : 'white'};
            padding: 12px 24px; border-radius: 8px; font-weight: 500;
            z-index: 2000; animation: slideUp 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => { new ReviewPage(); });