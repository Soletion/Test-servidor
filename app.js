// Clase principal del Quiz
class QuizApp {
    constructor() {
        this.questions = [];
        this.originalQuestions = [];
        this.currentIndex = 0;
        this.userAnswers = {};
        this.feedbackGiven = {};
        this.totalQuestions = 0;
        this.loadQuestions();
        this.createModal();
    }

    async loadQuestions() {
        try {
            const response = await fetch('data/questions.json');
            this.originalQuestions = await response.json();
            
            const savedProgress = this.loadProgress();
            
            if (savedProgress && savedProgress.questions && savedProgress.questions.length === this.originalQuestions.length) {
                this.questions = savedProgress.questions;
                this.currentIndex = savedProgress.currentIndex;
                this.userAnswers = savedProgress.userAnswers;
                this.feedbackGiven = savedProgress.feedbackGiven;
                
                let correctCount = 0;
                let incorrectCount = 0;
                Object.keys(this.feedbackGiven).forEach(key => {
                    if (this.feedbackGiven[key]) {
                        const questionIndex = parseInt(key);
                        const isCorrect = this.userAnswers[questionIndex] === this.questions[questionIndex].correct;
                        if (isCorrect) {
                            correctCount++;
                        } else {
                            incorrectCount++;
                        }
                    }
                });
                
                document.getElementById('correct').textContent = correctCount;
                document.getElementById('incorrect').textContent = incorrectCount;
            } else {
                this.shuffleQuestions();
                this.userAnswers = {};
                this.feedbackGiven = {};
                this.currentIndex = 0;
                document.getElementById('correct').textContent = '0';
                document.getElementById('incorrect').textContent = '0';
            }
            
            this.totalQuestions = this.questions.length;
            this.updateStats();
            this.displayQuestion();
            this.setupEventListeners();
            this.setupResetButton();
        } catch (error) {
            console.error('Error cargando preguntas:', error);
            document.getElementById('quiz-container').innerHTML = `
                <div class="error-message">
                    <h3>Error al cargar las preguntas</h3>
                    <p>Por favor, asegúrate de que el archivo data/questions.json existe y tiene el formato correcto.</p>
                </div>
            `;
        }
    }

createModal() {
    const modalHTML = `
        <div id="confirmModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <span class="modal-icon"><i class="fas fa-rotate-right"></i></span>
                    <h3>Reiniciar Cuestionario</h3>
                </div>
                <div class="modal-body">
                    <p><i class="fas fa-question-circle"></i> ¿Estás seguro de que quieres reiniciar el cuestionario?</p>
                    <p class="modal-warning"><i class="fas fa-exclamation-triangle"></i> ¡Se perderá todo el progreso actual!</p>
                </div>
                <div class="modal-footer">
                    <button id="modalCancelBtn" class="modal-btn modal-btn-cancel"><i class="fas fa-times"></i> Cancelar</button>
                    <button id="modalConfirmBtn" class="modal-btn modal-btn-confirm"><i class="fas fa-check"></i> Sí, reiniciar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Estilos del modal (actualizar tamaño de icono)
    const style = document.createElement('style');
    style.textContent = `
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            z-index: 3000;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.2s ease;
        }
        
        .modal.show {
            display: flex;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        
        .modal-content {
            background: white;
            border-radius: 24px;
            max-width: 450px;
            width: 90%;
            overflow: hidden;
            animation: slideIn 0.3s ease;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        @keyframes slideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .modal-header {
            background: #dc6fa8;
            color: white;
            padding: 24px;
            text-align: center;
        }
        
        .modal-icon {
            font-size: 3em;
            display: block;
            margin-bottom: 12px;
        }
        
        .modal-header h3 {
            margin: 0;
            font-size: 1.5em;
            font-weight: 600;
        }
        
        .modal-body {
            padding: 32px 24px;
            text-align: center;
        }
        
        .modal-body p {
            margin: 8px 0;
            font-size: 1.05em;
            color: #1E293B;
        }
        
        .modal-warning {
            color: #dc6fa8;
            font-weight: 600;
            margin-top: 12px !important;
        }
        
        .modal-footer {
            display: flex;
            gap: 12px;
            padding: 20px 24px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
        }
        
        .modal-btn {
            flex: 1;
            padding: 12px 24px;
            border: none;
            border-radius: 12px;
            font-size: 0.95em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .modal-btn-cancel {
            background: #e2e8f0;
            color: #1E293B;
        }
        
        .modal-btn-cancel:hover {
            background: #cbd5e1;
            transform: translateY(-2px);
        }
        
        .modal-btn-confirm {
            background: #dc6fa8;
            color: white;
        }
        
        .modal-btn-confirm:hover {
            background: #c85a96;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(220, 111, 168, 0.3);
        }
        
        @media (max-width: 768px) {
            .modal-content {
                width: 95%;
            }
            
            .modal-header {
                padding: 20px;
            }
            
            .modal-body {
                padding: 24px 20px;
            }
            
            .modal-footer {
                padding: 16px 20px;
            }
            
            .modal-btn {
                padding: 10px 20px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Configurar eventos del modal
    const modal = document.getElementById('confirmModal');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    
    cancelBtn.addEventListener('click', () => {
        this.hideModal();
    });
    
    confirmBtn.addEventListener('click', () => {
        this.hideModal();
        this.executeReset();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            this.hideModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            this.hideModal();
        }
    });
}
    
    showModal() {
        const modal = document.getElementById('confirmModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    hideModal() {
        const modal = document.getElementById('confirmModal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    formatCodeBlock(text) {
        let code = text;
        
        const phpPatterns = [
            /\$[a-zA-Z_][a-zA-Z0-9_]*/,
            /\becho\b/,
            /\bfunction\b/,
            /\bif\b/,
            /\belse\b/,
            /\bwhile\b/,
            /\bfor\b/,
            /\bforeach\b/,
            /\breturn\b/,
            /\btrue\b/,
            /\bfalse\b/,
            /\bnull\b/,
            /=>/,
            /===/,
            /==/,
            /->/,
            /array\(/,
            /\[\]/
        ];
        
        const hasCode = phpPatterns.some(pattern => pattern.test(code));
        
        if (hasCode && (code.includes('$') || code.includes('echo') || code.includes('function') || code.includes('foreach') || code.includes('array'))) {
            let cleanCode = code;
            
            const prefixes = [
                /¿Cuál es la salida del siguiente código\?/i,
                /Dado el siguiente código\?/i,
                /¿Qué muestra el siguiente código\?/i,
                /Código:/i,
                /php/i
            ];
            
            prefixes.forEach(prefix => {
                cleanCode = cleanCode.replace(prefix, '');
            });
            
            let formatted = cleanCode;
            
            formatted = formatted.replace(/;\s*/g, ';\n    ');
            formatted = formatted.replace(/\{\s*/g, '{\n    ');
            formatted = formatted.replace(/\}\s*else/g, '\n} else');
            formatted = formatted.replace(/\}\s*/g, '\n}\n');
            formatted = formatted.replace(/if\s*\(/g, 'if (');
            formatted = formatted.replace(/foreach\s*\(/g, 'foreach (');
            formatted = formatted.replace(/for\s*\(/g, 'for (');
            formatted = formatted.replace(/while\s*\(/g, 'while (');
            formatted = formatted.replace(/\)\s*\{/g, ') {');
            formatted = formatted.replace(/array\s*\(/g, 'array(');
            formatted = formatted.replace(/,/g, ', ');
            formatted = formatted.replace(/\s+/g, ' ').trim();
            
            formatted = formatted
                .split(';')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join(';\n    ');
            
            let indentLevel = 0;
            let lines = formatted.split('\n');
            let formattedLines = [];
            
            for (let line of lines) {
                if (line.includes('}')) {
                    indentLevel = Math.max(0, indentLevel - 1);
                }
                
                let indent = '    '.repeat(indentLevel);
                formattedLines.push(indent + line.trim());
                
                if (line.includes('{') && !line.includes('}')) {
                    indentLevel++;
                }
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

    formatText(text) {
        if (this.formatCodeBlock(text)) {
            return this.formatCodeBlock(text);
        }
        return text.replace(/\n/g, '<br>');
    }

    saveProgress() {
        const progress = {
            questions: this.questions,
            currentIndex: this.currentIndex,
            userAnswers: this.userAnswers,
            feedbackGiven: this.feedbackGiven,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('quizProgress', JSON.stringify(progress));
    }

    loadProgress() {
        const saved = localStorage.getItem('quizProgress');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error cargando progreso:', e);
                return null;
            }
        }
        return null;
    }

    executeReset() {
        localStorage.removeItem('quizProgress');
        this.shuffleQuestions();
        this.currentIndex = 0;
        this.userAnswers = {};
        this.feedbackGiven = {};
        
        document.getElementById('correct').textContent = '0';
        document.getElementById('incorrect').textContent = '0';
        
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('prevBtn').style.display = 'block';
        document.getElementById('nextBtn').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        
        this.totalQuestions = this.questions.length;
        this.updateStats();
        this.displayQuestion();
        this.saveProgress();
        this.showToast('Cuestionario reiniciado correctamente', 'success');
    }

    resetQuiz() {
        this.showModal();
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? '<i class="fas fa-check-circle"></i> ' : '<i class="fas fa-info-circle"></i> ';
        toast.innerHTML = icon + message;
        
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#a8dc6f' : '#6fa8dc'};
            color: ${type === 'success' ? '#1E293B' : 'white'};
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 2000;
            animation: slideUp 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-family: 'Inter', sans-serif;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    shuffleQuestions() {
        this.questions = [...this.originalQuestions];
        for (let i = this.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
        }
    }

    displayQuestion() {
        const container = document.getElementById('quiz-container');
        const question = this.questions[this.currentIndex];
        
        if (!question) return;

        const selectedAnswer = this.userAnswers[this.currentIndex] || '';
        const feedbackGiven = this.feedbackGiven[this.currentIndex];

        let formattedQuestionText = question.text;
        
        let questionPrefix = '';
        let codePart = question.text;
        
        const separators = ['?', ':', '¿'];
        for (let sep of separators) {
            if (question.text.includes(sep)) {
                const parts = question.text.split(sep);
                if (parts.length > 1) {
                    questionPrefix = parts[0] + sep;
                    codePart = parts.slice(1).join(sep);
                    break;
                }
            }
        }
        
        const codeBlock = this.formatCodeBlock(codePart);
        
        if (codeBlock) {
            formattedQuestionText = `
                <div>${this.escapeHtml(questionPrefix)}</div>
                ${codeBlock}
            `;
        } else {
            formattedQuestionText = this.formatText(question.text);
        }

        const optionsHtml = question.options.map((option, idx) => {
            const letter = String.fromCharCode(97 + idx);
            const isSelected = selectedAnswer === letter;
            let additionalClass = '';
            
            if (feedbackGiven) {
                if (letter === question.correct) {
                    additionalClass = 'correct';
                } else if (isSelected && letter !== question.correct) {
                    additionalClass = 'incorrect';
                }
            } else if (isSelected) {
                additionalClass = 'selected';
            }
            
            return `
                <div class="option ${additionalClass}" data-option="${letter}">
                    <input type="radio" 
                           name="question" 
                           value="${letter}" 
                           id="opt_${letter}" 
                           ${isSelected ? 'checked' : ''}
                           ${feedbackGiven ? 'disabled' : ''}>
                    <label for="opt_${letter}">
                        <strong>${letter.toUpperCase()})</strong> ${this.escapeHtml(option)}
                    </label>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="question-card">
                <div class="question-text">
                    <strong>Pregunta ${this.currentIndex + 1} de ${this.totalQuestions}:</strong><br>
                    ${formattedQuestionText}
                </div>
                <div class="options">
                    ${optionsHtml}
                </div>
            </div>
        `;

        if (!feedbackGiven) {
            const options = container.querySelectorAll('.option');
            options.forEach(opt => {
                const radio = opt.querySelector('input[type="radio"]');
                
                opt.addEventListener('click', (e) => {
                    if (!this.feedbackGiven[this.currentIndex]) {
                        if (e.target.type !== 'radio') {
                            radio.checked = true;
                        }
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
        
        const question = this.questions[this.currentIndex];
        const isCorrect = answer === question.correct;
        
        this.feedbackGiven[this.currentIndex] = true;
        
        if (isCorrect) {
            this.updateScore('correct', true);
        } else {
            this.updateScore('incorrect', true);
        }
        
        this.displayQuestion();
        this.saveProgress();
    }

    updateScore(type, increment = true) {
        const element = document.getElementById(type);
        let currentValue = parseInt(element.textContent);
        if (increment) {
            element.textContent = currentValue + 1;
        } else {
            element.textContent = currentValue;
        }
    }

    updateStats() {
        document.getElementById('total').textContent = this.totalQuestions;
        document.getElementById('current').textContent = this.currentIndex + 1;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.disabled = this.currentIndex === 0;
        
        const isLastQuestion = this.currentIndex === this.totalQuestions - 1;
        if (isLastQuestion) {
            nextBtn.textContent = '🏁 Finalizar';
        } else {
            nextBtn.textContent = 'Siguiente ▶';
        }
    }

    nextQuestion() {
        if (this.currentIndex < this.totalQuestions - 1) {
            this.currentIndex++;
            this.updateStats();
            this.displayQuestion();
            this.saveProgress();
        } else if (this.currentIndex === this.totalQuestions - 1) {
            if (this.feedbackGiven[this.currentIndex]) {
                this.showResults();
            } else {
                this.showToast('Por favor, selecciona una respuesta antes de finalizar', 'info');
            }
        }
    }

    previousQuestion() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateStats();
            this.displayQuestion();
            this.saveProgress();
        }
    }

    showResults() {
        const totalCorrect = parseInt(document.getElementById('correct').textContent);
        const percentage = (totalCorrect / this.totalQuestions) * 100;
        
        let message = '';
        if (percentage === 100) {
            message = '<i class="fas fa-trophy"></i> ¡Perfecto! ¡Has acertado todas las preguntas! <i class="fas fa-star"></i>';
        } else if (percentage >= 80) {
            message = '<i class="fas fa-gem"></i> ¡Excelente trabajo! <i class="fas fa-thumbs-up"></i>';
        } else if (percentage >= 60) {
            message = '<i class="fas fa-smile-wink"></i> ¡Bien hecho! Sigue practicando <i class="fas fa-graduation-cap"></i>';
        } else {
            message = '<i class="fas fa-book"></i> Sigue practicando, ¡lo lograrás! <i class="fas fa-rocket"></i>';
        }
        
        document.getElementById('finalScore').textContent = totalCorrect;
        document.getElementById('totalQuestions').textContent = this.totalQuestions;
        document.getElementById('percentage').innerHTML = `
            Porcentaje de aciertos: <strong style="font-size: 1.4em; color: #6f72dc;">${percentage.toFixed(1)}%</strong><br>
            <span style="font-size: 0.9em;">${message}</span>
        `;
        
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('prevBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('results').style.display = 'block';
    }

    setupResetButton() {
        if (!document.getElementById('resetQuizBtn')) {
            const resetBtn = document.createElement('button');
            resetBtn.id = 'resetQuizBtn';
            resetBtn.className = 'reset-quiz-btn';
            resetBtn.innerHTML = '<i class="fas fa-rotate-right"></i> Reiniciar Cuestionario';
            resetBtn.title = 'Reiniciar cuestionario';
            resetBtn.addEventListener('click', () => this.resetQuiz());
            document.body.appendChild(resetBtn);
        }
    }

    setupEventListeners() {
        document.getElementById('prevBtn').addEventListener('click', () => this.previousQuestion());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextQuestion());
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.resetQuiz());
        }
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});