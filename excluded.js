class ExcludedPage {
    constructor() {
        this.originalQuestions = [];
        this.excludedQuestions = new Set();
        this.loadData();
    }

    async loadData() {
        try {
            const response = await fetch('data/questions.json');
            this.originalQuestions = await response.json();
            
            // Cargar preguntas excluidas desde localStorage
            const savedExcluded = localStorage.getItem('excludedQuestions');
            if (savedExcluded) {
                this.excludedQuestions = new Set(JSON.parse(savedExcluded));
            }
            
            this.displayExcludedQuestions();
            this.updateNavExcludedCount();
        } catch (error) {
            console.error('Error cargando datos:', error);
            const container = document.getElementById('excludedContainer');
            if (container) {
                container.innerHTML = `
                    <div class="empty-excluded">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Error al cargar las preguntas</p>
                    </div>
                `;
            }
        }
    }

    displayExcludedQuestions() {
        const container = document.getElementById('excludedContainer');
        const excludedList = Array.from(this.excludedQuestions).sort((a, b) => a - b);
        
        if (excludedList.length === 0) {
            container.innerHTML = `
                <div class="empty-excluded">
                    <i class="fas fa-eye-slash"></i>
                    <p>No tienes preguntas excluidas</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">En el cuestionario, puedes excluir preguntas que no quieras que aparezcan</p>
                </div>
            `;
            return;
        }

        container.innerHTML = excludedList.map(originalIndex => {
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
                <div class="excluded-item" data-index="${originalIndex}">
                    <div class="excluded-question-text">
                        <strong><i class="fas fa-ban"></i> Pregunta excluida:</strong><br>
                        ${questionText}
                    </div>
                    <div class="excluded-answer">
                        <strong><i class="fas fa-check-circle"></i> Respuesta correcta:</strong><br>
                        ${correctLetter}) ${this.escapeHtml(correctText)}
                    </div>
                    <div class="excluded-actions">
                        <button class="restore-excluded-btn" data-index="${originalIndex}">
                            <i class="fas fa-undo-alt"></i> Restaurar pregunta
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Agregar event listeners a los botones de restaurar
        document.querySelectorAll('.restore-excluded-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.dataset.index);
                this.restoreFromExcluded(index);
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

    restoreFromExcluded(originalIndex) {
        this.excludedQuestions.delete(originalIndex);
        localStorage.setItem('excludedQuestions', JSON.stringify(Array.from(this.excludedQuestions)));
        this.displayExcludedQuestions();
        this.updateNavExcludedCount();
        this.showToast('Pregunta restaurada. Aparecerá en los próximos tests', 'success');
    }

    updateNavExcludedCount() {
        const badge = document.getElementById('navExcludedCount');
        if (badge) {
            badge.textContent = this.excludedQuestions.size;
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

document.addEventListener('DOMContentLoaded', () => {
    new ExcludedPage();
});