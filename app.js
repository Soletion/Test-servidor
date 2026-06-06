class QuizApp {
    constructor() {
        this.questions = [];
        this.originalQuestions = [];
        this.currentIndex = 0;
        this.userAnswers = {};
        this.feedbackGiven = {};
        this.totalQuestions = 0;
        this.reviewQuestions = new Set();
        this.selectedCount = 0;
        this.quizStarted = false;
        
        this.loadQuestions();
        this.setupSelectionButtons();
        this.updateNavReviewCount();
    }

    async loadQuestions() {
        try {
            const response = await fetch('data/questions.json');
            this.originalQuestions = await response.json();
            
            // Cargar preguntas marcadas desde localStorage
            const savedReviews = localStorage.getItem('reviewQuestions');
            if (savedReviews) {
                this.reviewQuestions = new Set(JSON.parse(savedReviews));
                this.updateNavReviewCount();
            }
        } catch (error) {
            console.error('Error cargando preguntas:', error);
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
        const shuffled = [...this.originalQuestions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        this.questions = shuffled.slice(0, this.selectedCount);
    }

    saveReviewQuestions() {
        localStorage.setItem('reviewQuestions', JSON.stringify(Array.from(this.reviewQuestions)));
        this.updateNavReviewCount();
    }

    updateNavReviewCount() {
        const badge = document.getElementById('navReviewCount');
        if (badge) {
            badge.textContent = this.reviewQuestions.size;
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
        const question = this.questions[this.currentIndex];
        if (!question) return;

        const selectedAnswer = this.userAnswers[this.currentIndex] || '';
        const feedbackGiven = this.feedbackGiven[this.currentIndex];
        const isMarkedForReview = this.reviewQuestions.has(this.getOriginalQuestionIndex());

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
                    <input type="radio" name="question" value="${letter}" id="opt_${letter}" 
                        ${isSelected ? 'checked' : ''} ${feedbackGiven ? 'disabled' : ''}>
                    <label for="opt_${letter}"><strong>${letter.toUpperCase()})</strong> ${this.escapeHtml(option)}</label>
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
                </div>
            </div>
        `;

        const reviewBtn = document.getElementById('reviewBtn');
        if (reviewBtn) reviewBtn.addEventListener('click', () => this.toggleReviewQuestion());

        if (!feedbackGiven) {
            const options = container.querySelectorAll('.option');
            options.forEach(opt => {
                const radio = opt.querySelector('input[type="radio"]');
                opt.addEventListener('click', () => {
                    if (!this.feedbackGiven[this.currentIndex]) {
                        radio.checked = true;
                        this.selectAndVerify(radio.value);
                    }
                });
                radio.addEventListener('change', () => {
                    if (!this.feedbackGiven[this.currentIndex] && radio.checked) {
                        this.selectAndVerify(radio.value);
                    }
                });
            });
        }

        this.updateNavigationButtons();
    }

    selectAndVerify(answer) {
        if (this.feedbackGiven[this.currentIndex]) return;
        
        this.userAnswers[this.currentIndex] = answer;
        const isCorrect = answer === this.questions[this.currentIndex].correct;
        this.feedbackGiven[this.currentIndex] = true;
        
        if (isCorrect) this.updateScore('correct', true);
        else this.updateScore('incorrect', true);
        
        this.displayQuestion();
    }

    updateScore(type, increment) {
        const element = document.getElementById(type);
        element.textContent = parseInt(element.textContent) + (increment ? 1 : 0);
    }

    updateStats() {
        document.getElementById('total').textContent = this.totalQuestions;
        document.getElementById('current').textContent = this.currentIndex + 1;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        prevBtn.disabled = this.currentIndex === 0;
        
        if (this.currentIndex === this.totalQuestions - 1) {
            nextBtn.innerHTML = 'Finalizar <i class="fas fa-flag-checkered"></i>';
        } else {
            nextBtn.innerHTML = 'Siguiente <i class="fas fa-arrow-right"></i>';
        }
    }

    nextQuestion() {
        if (this.currentIndex < this.totalQuestions - 1) {
            this.currentIndex++;
            this.updateStats();
            this.displayQuestion();
        } else if (this.currentIndex === this.totalQuestions - 1) {
            if (this.feedbackGiven[this.currentIndex]) this.showResults();
            else this.showToast('Selecciona una respuesta antes de finalizar', 'info');
        }
    }

    previousQuestion() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateStats();
            this.displayQuestion();
        }
    }

    showResults() {
        const totalCorrect = parseInt(document.getElementById('correct').textContent);
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
        document.getElementById('prevBtn').addEventListener('click', () => this.previousQuestion());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('restartBtn').addEventListener('click', () => this.resetQuiz());
    }
}

document.addEventListener('DOMContentLoaded', () => { new QuizApp(); });