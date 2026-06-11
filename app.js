class QuizApp {
    constructor() {
        this.questions = [];
        this.originalQuestions = [];
        this.currentIndex = 0;
        this.userAnswers = {};
        this.feedbackGiven = {};
        this.totalQuestions = 0;
        this.reviewQuestions = new Set();
        this.excludedQuestions = new Set();
        this.selectedCount = 0;
        this.quizStarted = false;
        
        this.loadQuestions();
        this.setupSelectionButtons();
        this.updateNavReviewCount();
        this.updateNavExcludedCount();
    }

    async loadQuestions() {
        try {
            const response = await fetch('data/questions.json');
            this.originalQuestions = await response.json();
            
            // Cargar preguntas marcadas para repaso
            const savedReviews = localStorage.getItem('reviewQuestions');
            if (savedReviews) {
                this.reviewQuestions = new Set(JSON.parse(savedReviews));
                this.updateNavReviewCount();
            }
            
            // Cargar preguntas excluidas
            const savedExcluded = localStorage.getItem('excludedQuestions');
            if (savedExcluded) {
                this.excludedQuestions = new Set(JSON.parse(savedExcluded));
                this.updateNavExcludedCount();
            }
            
            console.log('Preguntas cargadas:', this.originalQuestions.length);
            console.log('Preguntas excluidas:', this.excludedQuestions.size);
        } catch (error) {
            console.error('Error cargando preguntas:', error);
            document.getElementById('quiz-container').innerHTML = `
                <div class="error-message">
                    <h3>Error al cargar las preguntas</h3>
                    <p>Por favor, asegúrate de que el archivo data/questions.json existe.</p>
                </div>
            `;
        }
    }

    setupSelectionButtons() {
        const buttons = document.querySelectorAll('.selection-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const count = parseInt(btn.dataset.count);
                this.startQuiz(count);
            });
        });
    }

    startQuiz(count) {
        console.log('Iniciando quiz con', count, 'preguntas');
        this.selectedCount = count;
        this.selectQuestions();
        this.userAnswers = {};
        this.feedbackGiven = {};
        this.currentIndex = 0;
        
        document.getElementById('correct').textContent = '0';
        document.getElementById('incorrect').textContent = '0';
        
        this.totalQuestions = this.questions.length;
        this.updateStats();
        
        // Ocultar pantalla de selección y mostrar quiz
        document.getElementById('selectionScreen').style.display = 'none';
        document.getElementById('quizScreen').style.display = 'block';
        
        this.displayQuestion();
        this.setupEventListeners();
        this.setupResetButton();
        
        this.showToast(`Comenzando test con ${count} preguntas`, 'success');
    }

    selectQuestions() {
        // Filtrar preguntas no excluidas
        const availableQuestions = this.originalQuestions.filter((_, index) => {
            return !this.excludedQuestions.has(index);
        });
        
        if (availableQuestions.length === 0) {
            this.showToast('No hay preguntas disponibles. Restaura algunas desde la página de excluidas.', 'info');
            this.questions = [];
            return;
        }
        
        const shuffled = [...availableQuestions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        const takeCount = Math.min(this.selectedCount, shuffled.length);
        this.questions = shuffled.slice(0, takeCount);
        
        if (this.questions.length < this.selectedCount) {
            this.showToast(`Solo hay ${this.questions.length} preguntas disponibles. ${this.selectedCount - this.questions.length} están excluidas.`, 'info');
        }
        
        console.log('Preguntas seleccionadas (excluyendo ' + this.excludedQuestions.size + '):', this.questions.length);
    }

    saveReviewQuestions() {
        localStorage.setItem('reviewQuestions', JSON.stringify(Array.from(this.reviewQuestions)));
        this.updateNavReviewCount();
    }

    saveExcludedQuestions() {
        localStorage.setItem('excludedQuestions', JSON.stringify(Array.from(this.excludedQuestions)));
        this.updateNavExcludedCount();
    }

    updateNavReviewCount() {
        const badge = document.getElementById('navReviewCount');
        if (badge) {
            badge.textContent = this.reviewQuestions.size;
        }
    }

    updateNavExcludedCount() {
        const badge = document.getElementById('navExcludedCount');
        if (badge) {
            badge.textContent = this.excludedQuestions.size;
        }
    }

    toggleReviewQuestion() {
        const originalIndex = this.getOriginalQuestionIndex();
        
        if (this.reviewQuestions.has(originalIndex)) {
            this.reviewQuestions.delete(originalIndex);
            this.showToast('Pregunta removida de la lista de repaso', 'info');
        } else {
            this.reviewQuestions.add(originalIndex);
            this.showToast('Pregunta añadida a la lista de repaso', 'success');
        }
        
        this.saveReviewQuestions();
        this.displayQuestion();
        
        // Disparar evento para actualizar el menú
        window.dispatchEvent(new Event('updateCounters'));
    }

    excludeQuestion() {
        const originalIndex = this.getOriginalQuestionIndex();
        
        if (this.excludedQuestions.has(originalIndex)) {
            this.excludedQuestions.delete(originalIndex);
            this.showToast('Pregunta removida de excluidas. Aparecerá en futuros tests', 'info');
        } else {
            this.excludedQuestions.add(originalIndex);
            if (this.reviewQuestions.has(originalIndex)) {
                this.reviewQuestions.delete(originalIndex);
                this.saveReviewQuestions();
            }
            this.showToast('Pregunta excluida. No aparecerá en futuros tests', 'success');
        }
        
        this.saveExcludedQuestions();
        this.displayQuestion();
        
        // Disparar evento para actualizar el menú
        window.dispatchEvent(new Event('updateCounters'));
    }

    getOriginalQuestionIndex() {
        const currentQuestion = this.questions[this.currentIndex];
        return this.originalQuestions.findIndex(q => q.text === currentQuestion.text);
    }

    formatCodeBlock(text) {
        let code = text;
        const phpPatterns = [/\$[a-zA-Z_][a-zA-Z0-9_]*/, /\becho\b/, /\bfunction\b/, /\bif\b/, /\belse\b/, /\bwhile\b/, /\bfor\b/, /\bforeach\b/];
        const hasCode = phpPatterns.some(pattern => pattern.test(code));
        
        if (hasCode) {
            let cleanCode = code;
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
            formatted = formattedLines.join('\n');
            return `<pre class="code-block"><code>${this.escapeHtml(formatted)}</code></pre>`;
        }
        return null;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    displayQuestion() {
        const container = document.getElementById('quiz-container');
        
        // Verificar que hay preguntas
        if (!this.questions || this.questions.length === 0) {
            console.error('No hay preguntas para mostrar');
            container.innerHTML = '<div class="error-message">Error: No hay preguntas disponibles. Restaura algunas desde la página de excluidas.</div>';
            return;
        }
        
        const question = this.questions[this.currentIndex];
        if (!question) {
            console.error('Pregunta no encontrada en índice:', this.currentIndex);
            return;
        }

        const selectedAnswer = this.userAnswers[this.currentIndex] || '';
        const feedbackGiven = this.feedbackGiven[this.currentIndex];
        const isMarkedForReview = this.reviewQuestions.has(this.getOriginalQuestionIndex());
        const isExcluded = this.excludedQuestions.has(this.getOriginalQuestionIndex());

        let formattedQuestionText = question.text;
        const codeBlock = this.formatCodeBlock(question.text);
        if (codeBlock) {
            formattedQuestionText = codeBlock;
        }

        const optionsHtml = question.options.map((option, idx) => {
            const letter = String.fromCharCode(97 + idx);
            const isSelected = selectedAnswer === letter;
            let additionalClass = '';
            if (feedbackGiven) {
                if (letter === question.correct) additionalClass = 'correct';
                else if (isSelected && letter !== question.correct) additionalClass = 'incorrect';
            } else if (isSelected) additionalClass = 'selected';
            
            return `
                <div class="option ${additionalClass}" data-option="${letter}">
                    <input type="radio" name="question_${this.currentIndex}" value="${letter}" id="opt_${this.currentIndex}_${letter}" 
                        ${isSelected ? 'checked' : ''} ${feedbackGiven ? 'disabled' : ''}>
                    <label for="opt_${this.currentIndex}_${letter}"><strong>${letter.toUpperCase()})</strong> ${this.escapeHtml(option)}</label>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="question-card">
                <div class="question-text">
                    <strong>Pregunta ${this.currentIndex + 1} de ${this.totalQuestions}:</strong><br>
                    ${formattedQuestionText}
                </div>
                <div class="options">${optionsHtml}</div>
                <div class="question-actions">
                    <button class="action-btn action-btn-review ${isMarkedForReview ? 'active' : ''}" id="reviewBtn">
                        <i class="fas fa-flag"></i> ${isMarkedForReview ? 'Quitar de repaso' : 'Marcar para repasar'}
                    </button>
                    <button class="action-btn action-btn-exclude" id="excludeBtn">
                        <i class="fas fa-eye-slash"></i> ${isExcluded ? 'Restaurar pregunta' : 'Excluir pregunta'}
                    </button>
                </div>
            </div>
        `;

        // Evento para el botón de review
        const reviewBtn = document.getElementById('reviewBtn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleReviewQuestion();
            });
        }
        
        // Evento para el botón de excluir
        const excludeBtn = document.getElementById('excludeBtn');
        if (excludeBtn) {
            excludeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.excludeQuestion();
            });
        }

        // Eventos para las opciones SOLO si no hay feedback dado
        if (!feedbackGiven) {
            const options = container.querySelectorAll('.option');
            options.forEach(opt => {
                const radio = opt.querySelector('input[type="radio"]');
                if (radio) {
                    // Click en la opción
                    opt.addEventListener('click', (e) => {
                        if (!this.feedbackGiven[this.currentIndex]) {
                            e.stopPropagation();
                            radio.checked = true;
                            this.selectAndVerify(radio.value);
                        }
                    });
                    
                    // Cambio directo del radio
                    radio.addEventListener('change', (e) => {
                        if (!this.feedbackGiven[this.currentIndex] && radio.checked) {
                            e.stopPropagation();
                            this.selectAndVerify(radio.value);
                        }
                    });
                }
            });
        }

        this.updateNavigationButtons();
    }

    selectAndVerify(answer) {
        if (this.feedbackGiven[this.currentIndex]) return;
        
        console.log('Seleccionada respuesta:', answer, 'para pregunta', this.currentIndex);
        
        this.userAnswers[this.currentIndex] = answer;
        const isCorrect = answer === this.questions[this.currentIndex].correct;
        this.feedbackGiven[this.currentIndex] = true;
        
        if (isCorrect) {
            this.updateScore('correct', true);
        } else {
            this.updateScore('incorrect', true);
        }
        
        // Refrescar la pregunta para mostrar el resultado
        this.displayQuestion();
    }

    updateScore(type, increment) {
        const element = document.getElementById(type);
        if (element) {
            const currentValue = parseInt(element.textContent) || 0;
            element.textContent = currentValue + (increment ? 1 : 0);
        }
    }

    updateStats() {
        const totalSpan = document.getElementById('total');
        const currentSpan = document.getElementById('current');
        if (totalSpan) totalSpan.textContent = this.totalQuestions;
        if (currentSpan) currentSpan.textContent = this.currentIndex + 1;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
        
        if (nextBtn) {
            if (this.currentIndex === this.totalQuestions - 1) {
                nextBtn.innerHTML = 'Finalizar <i class="fas fa-flag-checkered"></i>';
            } else {
                nextBtn.innerHTML = 'Siguiente <i class="fas fa-arrow-right"></i>';
            }
        }
    }

    nextQuestion() {
        console.log('nextQuestion - Índice actual:', this.currentIndex, 'Total:', this.totalQuestions);
        
        if (this.currentIndex < this.totalQuestions - 1) {
            this.currentIndex++;
            this.updateStats();
            this.displayQuestion();
        } else if (this.currentIndex === this.totalQuestions - 1) {
            if (this.feedbackGiven[this.currentIndex]) {
                this.showResults();
            } else {
                this.showToast('Por favor, selecciona una respuesta antes de finalizar', 'info');
            }
        }
    }

    previousQuestion() {
        console.log('previousQuestion - Índice actual:', this.currentIndex);
        
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateStats();
            this.displayQuestion();
        }
    }

    showResults() {
        const totalCorrect = parseInt(document.getElementById('correct').textContent) || 0;
        const percentage = (totalCorrect / this.totalQuestions) * 100;
        
        document.getElementById('finalScore').textContent = totalCorrect;
        document.getElementById('totalQuestions').textContent = this.totalQuestions;
        document.getElementById('percentage').innerHTML = `
            Porcentaje de aciertos: <strong style="font-size: 1.4em; color: #6f72dc;">${percentage.toFixed(1)}%</strong>
        `;
        
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('prevBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('results').style.display = 'block';
    }

    resetQuiz() {
        document.getElementById('selectionScreen').style.display = 'flex';
        document.getElementById('quizScreen').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('prevBtn').style.display = 'block';
        document.getElementById('nextBtn').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        
        // Limpiar estado
        this.currentIndex = 0;
        this.userAnswers = {};
        this.feedbackGiven = {};
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
        setTimeout(() => toast.remove(), 3000);
    }

    setupResetButton() {
        if (!document.getElementById('resetQuizBtn')) {
            const resetBtn = document.createElement('button');
            resetBtn.id = 'resetQuizBtn';
            resetBtn.className = 'reset-quiz-btn';
            resetBtn.innerHTML = '<i class="fas fa-rotate-right"></i> Nuevo Test';
            resetBtn.addEventListener('click', () => this.resetQuiz());
            document.body.appendChild(resetBtn);
        }
    }

    setupEventListeners() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const restartBtn = document.getElementById('restartBtn');
        
        if (prevBtn) {
            const newPrevBtn = prevBtn.cloneNode(true);
            prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
            newPrevBtn.addEventListener('click', () => this.previousQuestion());
        }
        
        if (nextBtn) {
            const newNextBtn = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
            newNextBtn.addEventListener('click', () => this.nextQuestion());
        }
        
        if (restartBtn) {
            const newRestartBtn = restartBtn.cloneNode(true);
            restartBtn.parentNode.replaceChild(newRestartBtn, restartBtn);
            newRestartBtn.addEventListener('click', () => this.resetQuiz());
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando QuizApp');
    new QuizApp();
});