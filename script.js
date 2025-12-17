document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initMobileMenu();
    initSmoothScroll();
    initParallax();
    loadGitHubProjects();
});

// ===== CURSOR PERSONALIZADO =====
function initCursor() {
    const cursorDot = document.createElement('div');
    const cursorOutline = document.createElement('div');
    
    cursorDot.className = 'cursor-dot';
    cursorOutline.className = 'cursor-outline';
    
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorOutline);
    
    // Posições
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;
    
    // Atualiza coordenadas do mouse
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Dot segue instantaneamente
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    function animateOutline() {
        
        outlineX += (mouseX - outlineX) * 0.15; 
        outlineY += (mouseY - outlineY) * 0.15;
        
        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;
        
        requestAnimationFrame(animateOutline);
    }
    requestAnimationFrame(animateOutline);
    
    // Efeitos Hover e Click
    const interactables = 'a, button, .btn, input, textarea, select, .project-card, .stat, .contact-item, .skill-tag, .nav-links a';
    
    document.body.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactables)) {
            document.body.classList.add('hovering');
        } else {
            document.body.classList.remove('hovering');
        }
    });
    
    document.addEventListener('mousedown', () => document.body.classList.add('clicking'));
    document.addEventListener('mouseup', () => document.body.classList.remove('clicking'));
}

// ===== MENU MOBILE =====
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (!hamburger) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Fecha ao clicar em link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// ===== GITHUB API + CACHE =====
async function loadGitHubProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    const CACHE_KEY = 'github_repos_v1';
    const CACHE_TIME = 3600000; // 1 hora em ms

    try {
        let repos = [];
        const cachedData = localStorage.getItem(CACHE_KEY);
        
        // Verifica Cache
        if (cachedData) {
            const { timestamp, data } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_TIME) {
                repos = data;
                console.log('Carregado do cache');
            }
        }

        // Se não houver cache válido, faz o fetch
        if (repos.length === 0) {
            const response = await fetch('https://api.github.com/users/DevADOBAN/repos?sort=updated&per_page=100');
            if (!response.ok) throw new Error('Erro na API');
            repos = await response.json();
            
            // Salva no cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: repos
            }));
        }

        renderProjects(repos, projectsGrid);

    } catch (error) {
        console.error('Falha ao carregar projetos:', error);
        projectsGrid.innerHTML = `
            <div class="project-card">
                <div class="project-content">
                    <p>Não foi possível carregar os projetos no momento.</p>
                    <a href="https://github.com/DevADOBAN" target="_blank" class="btn btn-secondary">Ver no GitHub</a>
                </div>
            </div>`;
    }
}

function renderProjects(repos, container) {
    container.innerHTML = '';
    
    // Lista dos projetos 
    const preferred = ['fortal', 'taskhub', 'linktree'];
    
    // Filtra apenas os projetos da lista
    let displayList = repos.filter(repo => 
        preferred.some(p => repo.name.toLowerCase().includes(p))
    );
    
    // Ordem
    displayList.sort((a, b) => {
        const indexA = preferred.findIndex(p => a.name.toLowerCase().includes(p));
        const indexB = preferred.findIndex(p => b.name.toLowerCase().includes(p));
        return indexA - indexB;
    });

    displayList.forEach(repo => {
        const name = repo.name.toLowerCase();
        let imageUrl = ''; // Variável para guardar o caminho da imagem

        if (name.includes('fortal')) {
            imageUrl = './img/fortal.png';   
        } 
        else if (name.includes('taskhub')) {
            imageUrl = './img/taskhub.png';  
        } 
        else if (name.includes('linktree')) {
            imageUrl = './img/linktree.png'; 
        } 
        else {
            // Caso apareça algum outro projeto não previsto, usa uma imagem genérica
            imageUrl = `https://picsum.photos/seed/${repo.id}/400/200`;
        }

        const isHighlight = true; 
        
        const topicsHtml = (repo.topics || []).slice(0, 3)
            .map(t => `<span class="project-tag">${t}</span>`).join('');
            
        const card = document.createElement('div');
        card.className = `project-card ${isHighlight ? 'highlight' : ''}`;
        
        card.innerHTML = `
            <img src="${imageUrl}" loading="lazy" class="project-image" alt="${repo.name}">
            <div class="project-content">
                <div class="project-header">
                    <i class="fas fa-code"></i>
                    <h3>${repo.name}</h3>
                </div>
                <p>${repo.description || 'Projeto desenvolvido com foco em performance e qualidade.'}</p>
                <div class="project-meta">${topicsHtml}</div>
                <div class="project-footer">
                    <div class="project-stats">
                        <span><i class="fas fa-star" style="color:#e3b341"></i> ${repo.stargazers_count}</span>
                        ${repo.language ? `<span><i class="fas fa-circle" style="font-size:10px"></i> ${repo.language}</span>` : ''}
                    </div>
                    <a href="${repo.html_url}" target="_blank" class="project-link">
                        Ver Código <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Se não encontrar nenhum
    if (displayList.length === 0) {
        console.warn('Nenhum dos projetos preferidos foi encontrado. Verifique se os nomes na lista "preferred" batem com os nomes no GitHub.');
    }
}

// ===== COR DO AVATAR =====
function extractAvatarColors() {
    const avatar = document.getElementById('userAvatar');
    if (!avatar) return;

    // Função interna para aplicar
    const applyColor = () => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 50; 
            canvas.height = 50;
            
            ctx.drawImage(avatar, 0, 0, 50, 50);
            
            // Pega dados do centro da imagem 
            const data = ctx.getImageData(25, 25, 1, 1).data; 
            const [r, g, b] = data;

            // Se for preto ou muito escuro, ignora para manter o tema visível
            if (r < 20 && g < 20 && b < 20) return;

            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            const lighterHex = adjustBrightness(hex, 20);

            document.documentElement.style.setProperty('--accent', hex);
            document.documentElement.style.setProperty('--accent-light', lighterHex);
            document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
            
        } catch (e) {
            console.log('Não foi possível extrair a cor da imagem (CORS restriction). Usando padrão.');
        }
    };

    if (avatar.complete) {
        applyColor();
    } else {
        avatar.addEventListener('load', applyColor);
    }
}

//  para clarear cor
function adjustBrightness(col, amt) {
    let usePound = false;
    if (col[0] == "#") { col = col.slice(1); usePound = true; }
    let num = parseInt(col,16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

// ===== SCROLL SUAVE & PARALLAX =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;


    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if(window.scrollY < 800) { // Só anima se estiver visível
                    hero.style.backgroundPosition = `center ${window.scrollY * 0.5}px`;
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}