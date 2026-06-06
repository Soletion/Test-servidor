// Sidebar minimalista solo con iconos de Font Awesome - compartido para todas las páginas
(function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const sidebarHTML = `
        <aside class="sidebar-nav">
            <nav class="sidebar-menu">
                <a href="index.html" class="sidebar-item ${currentPage === 'index.html' ? 'active' : ''}" title="Cuestionario">
                    <span class="sidebar-icon"><i class="fas fa-question-circle"></i></span>
                </a>
                <a href="glossary.html" class="sidebar-item ${currentPage === 'glossary.html' ? 'active' : ''}" title="Glosario">
                    <span class="sidebar-icon"><i class="fas fa-book"></i></span>
                </a>
            </nav>
        </aside>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        /* Sidebar Minimalista solo con iconos */
        .sidebar-nav {
            position: fixed;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(30, 41, 59, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 60px;
            padding: 16px 12px;
            z-index: 1000;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
        }
        
        .sidebar-nav:hover {
            background: rgba(30, 41, 59, 0.95);
            border-color: rgba(111, 168, 220, 0.3);
        }
        
        .sidebar-menu {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        .sidebar-item {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            text-decoration: none;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .sidebar-icon {
            font-size: 1.5em;
            transition: all 0.3s ease;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .sidebar-item:hover {
            background: rgba(111, 168, 220, 0.2);
            transform: scale(1.1);
            border-color: rgba(111, 168, 220, 0.5);
        }
        
        .sidebar-item:hover .sidebar-icon {
            color: white;
        }
        
        .sidebar-item.active {
            background: #6fa8dc;
            box-shadow: 0 4px 12px rgba(111, 114, 220, 0.4);
            border-color: transparent;
        }
        
        .sidebar-item.active .sidebar-icon {
            color: white;
        }
        
        /* Tooltip al hacer hover */
        .sidebar-item {
            position: relative;
        }
        
        .sidebar-item::after {
            content: attr(title);
            position: absolute;
            left: 60px;
            background: rgba(30, 41, 59, 0.95);
            backdrop-filter: blur(10px);
            color: white;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 0.8em;
            font-weight: 500;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            pointer-events: none;
            border: 1px solid rgba(255, 255, 255, 0.1);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .sidebar-item:hover::after {
            opacity: 1;
            visibility: visible;
            left: 70px;
        }
        
        /* Ajustar el contenido principal */
        .container {
            margin-left: 100px;
            max-width: calc(100% - 120px);
        }
        
        /* Responsive: en móviles se adapta */
        @media (max-width: 768px) {
            .sidebar-nav {
                left: 10px;
                padding: 12px 8px;
            }
            
            .sidebar-item {
                width: 40px;
                height: 40px;
            }
            
            .sidebar-icon {
                font-size: 1.2em;
            }
            
            .container {
                margin-left: 70px;
                max-width: calc(100% - 80px);
                padding: 16px;
            }
            
            .sidebar-item::after {
                left: 50px;
                font-size: 0.75em;
                padding: 4px 10px;
            }
            
            .sidebar-item:hover::after {
                left: 55px;
            }
        }
        
        /* Para pantallas muy pequeñas */
        @media (max-width: 480px) {
            .sidebar-nav {
                left: 8px;
                padding: 10px 6px;
            }
            
            .sidebar-item {
                width: 36px;
                height: 36px;
            }
            
            .sidebar-icon {
                font-size: 1.1em;
            }
            
            .container {
                margin-left: 60px;
                max-width: calc(100% - 70px);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Insertar el sidebar en el body
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);
    
    // Ajustar el container para que no se solape
    const container = document.querySelector('.container');
    if (container) {
        if (window.innerWidth > 768) {
            container.style.marginLeft = '100px';
            container.style.maxWidth = 'calc(100% - 120px)';
        } else if (window.innerWidth > 480) {
            container.style.marginLeft = '70px';
            container.style.maxWidth = 'calc(100% - 80px)';
        } else {
            container.style.marginLeft = '60px';
            container.style.maxWidth = 'calc(100% - 70px)';
        }
    }
    
    // Reajustar al cambiar tamaño de ventana
    window.addEventListener('resize', () => {
        const container = document.querySelector('.container');
        if (container) {
            if (window.innerWidth > 768) {
                container.style.marginLeft = '100px';
                container.style.maxWidth = 'calc(100% - 120px)';
            } else if (window.innerWidth > 480) {
                container.style.marginLeft = '70px';
                container.style.maxWidth = 'calc(100% - 80px)';
            } else {
                container.style.marginLeft = '60px';
                container.style.maxWidth = 'calc(100% - 70px)';
            }
        }
    });
})();