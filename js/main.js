// Кнопка "Наверх"
const backToTopButton = document.getElementById('back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Данные для маленьких квадратов (10 уникальных изображений)
const smallSquareImages = [
    'images/elf.png',
    'images/lex.png',
    'images/compass.png',
    'images/bag.png',
    'images/spider.png',
    'images/car.png',
    'images/drag.png',
    'images/ded.png',
    'images/tower.png',
    'images/mirel.png'
];

// Массив для хранения всех квадратов
let squares = [];
let animationId = null;

// Генерация маленьких плавающих квадратов
const squaresContainer = document.querySelector('.floating-squares');
if (squaresContainer) {
    squaresContainer.innerHTML = '';
    squares = [];
    
    const shuffled = [...smallSquareImages].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < 10; i++) {
        const square = document.createElement('div');
        square.className = 'square';
        square.style.backgroundImage = `url(${shuffled[i]})`;
        
        const startX = 50 + Math.random() * (window.innerWidth - 200);
        const startY = 50 + Math.random() * (window.innerHeight - 200);
        square.style.left = startX + 'px';
        square.style.top = startY + 'px';
        
        square.vx = (Math.random() - 0.5) * 0.8;
        square.vy = (Math.random() - 0.5) * 0.8;
        square.mass = 4;
        
        squares.push(square);
        squaresContainer.appendChild(square);
    }
}

// Функция проверки столкновений и отталкивания
function handleCollisions() {
    for (let i = 0; i < squares.length; i++) {
        const square1 = squares[i];
        const rect1 = square1.getBoundingClientRect();
        
        for (let j = i + 1; j < squares.length; j++) {
            const square2 = squares[j];
            const rect2 = square2.getBoundingClientRect();
            
            if (rect1.right > rect2.left && 
                rect1.left < rect2.right && 
                rect1.bottom > rect2.top && 
                rect1.top < rect2.bottom) {
                
                const dx = (rect1.left + rect1.width / 2) - (rect2.left + rect2.width / 2);
                const dy = (rect1.top + rect1.height / 2) - (rect2.top + rect2.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance === 0) continue;
                
                const nx = dx / distance;
                const ny = dy / distance;
                
                const vx = square1.vx - square2.vx;
                const vy = square1.vy - square2.vy;
                const vn = vx * nx + vy * ny;
                
                if (vn > 0) continue;
                
                const e = 0.7;
                const m1 = square1.mass;
                const m2 = square2.mass;
                const impulse = (1 + e) * vn / (m1 + m2);
                
                square1.vx -= impulse * m2 * nx;
                square1.vy -= impulse * m2 * ny;
                square2.vx += impulse * m1 * nx;
                square2.vy += impulse * m1 * ny;
                
                const overlap = (rect1.width / 2 + rect2.width / 2) - distance;
                if (overlap > 0) {
                    const correctionX = nx * overlap * 0.5;
                    const correctionY = ny * overlap * 0.5;
                    
                    const left1 = parseFloat(square1.style.left);
                    const top1 = parseFloat(square1.style.top);
                    const left2 = parseFloat(square2.style.left);
                    const top2 = parseFloat(square2.style.top);
                    
                    square1.style.left = (left1 + correctionX) + 'px';
                    square1.style.top = (top1 + correctionY) + 'px';
                    square2.style.left = (left2 - correctionX) + 'px';
                    square2.style.top = (top2 - correctionY) + 'px';
                }
            }
        }
    }
}

// Функция обновления позиций квадратов
function updateSquarePositions() {
    if (!squares.length) return;
    
    squares.forEach(square => {
        let left = parseFloat(square.style.left);
        let top = parseFloat(square.style.top);
        
        left += square.vx;
        top += square.vy;
        
        const squareSize = 120;
        const maxX = window.innerWidth - squareSize;
        const maxY = window.innerHeight - squareSize;
        
        if (left <= 0) {
            left = 0;
            square.vx = Math.abs(square.vx) * 0.8;
        }
        if (left >= maxX) {
            left = maxX;
            square.vx = -Math.abs(square.vx) * 0.8;
        }
        if (top <= 0) {
            top = 0;
            square.vy = Math.abs(square.vy) * 0.8;
        }
        if (top >= maxY) {
            top = maxY;
            square.vy = -Math.abs(square.vy) * 0.8;
        }
        
        const maxSpeed = 1.5;
        square.vx = Math.min(Math.max(square.vx, -maxSpeed), maxSpeed);
        square.vy = Math.min(Math.max(square.vy, -maxSpeed), maxSpeed);
        
        square.style.left = left + 'px';
        square.style.top = top + 'px';
    });
    
    handleCollisions();
    animationId = requestAnimationFrame(updateSquarePositions);
}

// Запускаем анимацию квадратов
if (squares.length > 0) {
    if (animationId) cancelAnimationFrame(animationId);
    updateSquarePositions();
}

// Обработка формы обратной связи
const feedbackForm = document.getElementById('feedback-form');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Спасибо! Сообщение отправлено (демо-режим).');
        feedbackForm.reset();
    });
}

// ===== Бургер-меню с кликом и ховером =====
const burger = document.querySelector('.burger-icon');
const menuTrigger = document.querySelector('.menu-trigger-area');
const menu = document.querySelector('.menu');
const body = document.body;

let menuOpenByClick = false;

function openMenu() {
    body.classList.add('menu-open');
}

function closeMenu() {
    if (!menuOpenByClick) {
        body.classList.remove('menu-open');
    }
}

if (burger) {
    burger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (body.classList.contains('menu-open')) {
            body.classList.remove('menu-open');
            menuOpenByClick = false;
        } else {
            body.classList.add('menu-open');
            menuOpenByClick = true;
        }
    });
}

if (menuTrigger) {
    menuTrigger.addEventListener('mouseenter', openMenu);
    menuTrigger.addEventListener('mouseleave', closeMenu);
}

if (menu) {
    menu.addEventListener('mouseenter', openMenu);
    menu.addEventListener('mouseleave', closeMenu);
}

// Скролл к секции проектов при клике на стрелку
const scrollIndicator = document.getElementById('scrollIndicator');
const projectsGrid = document.querySelector('.projects-grid');

if (scrollIndicator && projectsGrid) {
    scrollIndicator.addEventListener('click', () => {
        scrollIndicator.classList.add('hidden');
        projectsGrid.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    });
}

let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollIndicator && currentScroll < 100 && scrollIndicator.classList.contains('hidden')) {
        scrollIndicator.classList.remove('hidden');
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

window.addEventListener('resize', () => {
    if (animationId) cancelAnimationFrame(animationId);
    updateSquarePositions();
});

// ===== УВЕЛИЧЕНИЕ МАЛЕНЬКИХ КВАДРАТОВ ПРИ НАВЕДЕНИИ =====
function handleSquareMouseEnter(e) {
    const square = e.currentTarget;
    square.style.transform = 'scale(1.2)';
    square.style.zIndex = '100';
    square.style.transition = 'transform 0.3s ease';
}

function handleSquareMouseLeave(e) {
    const square = e.currentTarget;
    square.style.transform = 'scale(1)';
    square.style.zIndex = '2';
    square.style.transition = 'transform 0.3s ease';
}

const squaresElements = document.querySelectorAll('.square');
squaresElements.forEach(square => {
    square.removeEventListener('mouseenter', handleSquareMouseEnter);
    square.removeEventListener('mouseleave', handleSquareMouseLeave);
    square.addEventListener('mouseenter', handleSquareMouseEnter);
    square.addEventListener('mouseleave', handleSquareMouseLeave);
});

// ===== БОЛЬШИЕ КАРТОЧКИ ПРОЕКТОВ ПРИ НАВЕДЕНИИ =====
let bigCardContainer = null;
let currentActiveSquare = null;
let isHoveringCard = false;
let hideCardTimeout = null;

function createBigCardContainer() {
    if (bigCardContainer) return bigCardContainer;
    
    const container = document.createElement('div');
    container.className = 'big-project-card';
    container.style.cssText = `
        position: fixed;
        width: 320px;
        background: rgba(10, 10, 10, 0.95);
        border-radius: 15px;
        border: 2px solid cyan;
        box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
        backdrop-filter: blur(10px);
        z-index: 1002;
        display: none;
        flex-direction: column;
        overflow: hidden;
        transition: opacity 0.2s ease;
        cursor: pointer;
        pointer-events: auto;
    `;
    
    container.addEventListener('mouseenter', () => {
        isHoveringCard = true;
        if (hideCardTimeout) {
            clearTimeout(hideCardTimeout);
            hideCardTimeout = null;
        }
    });
    
    container.addEventListener('mouseleave', () => {
        isHoveringCard = false;
        hideBigCardWithDelay();
    });
    
    document.body.appendChild(container);
    bigCardContainer = container;
    return container;
}

const bigProjectData = {
    'images/bag.png': {
        title: 'Bag',
        description: 'Сумка в стиле киберпанк, созданная в Blender и Substance Painter.',
        link: 'projects/project1.html',
        fullImage: 'images/bag.png',
        objectPosition: 'center'
    },
    'images/compass.png': {
        title: 'Compass',
        description: 'Стилизованный компас с элементами стимпанк.',
        link: 'projects/project2.html',
        fullImage: 'images/compass.png',
        objectPosition: 'center'
    },
    'images/car.png': {
        title: 'Car',
        description: 'Футуристический автомобиль, вдохновлённый киберпанком.',
        link: 'projects/project3.html',
        fullImage: 'images/car.png',
        objectPosition: 'center'
    },
    'images/lex.png': {
        title: 'Lex',
        description: 'Персонаж-робот Lex, созданный для концепт-арта.',
        link: 'projects/project4.html',
        fullImage: 'images/lex.png',
        objectPosition: 'center'
    },
    'images/spider.png': {
        title: 'Spider',
        description: 'Механический паук, вдохновлённый вселенной Horizon.',
        link: 'projects/project5.html',
        fullImage: 'images/spider.png',
        objectPosition: 'center'
    },
    'images/mirel.png': {
        title: 'Mirel',
        description: 'Сюрреалистическая сцена с элементами биомеханики.',
        link: 'projects/project6.html',
        fullImage: 'images/mirel.png',
        objectPosition: 'top center'
    },
    'images/tower.png': {
        title: 'Scene',
        description: 'Фэнтезийная сцена с башней и окружением.',
        link: 'projects/project7.html',
        fullImage: 'images/tower.png',
        objectPosition: 'center'
    },
    'images/ded.png': {
        title: 'Zombie Animation',
        description: 'Цикл анимации зомби: ходьба, атака, смерть.',
        link: 'projects/project8.html',
        fullImage: 'images/ded.png',
        objectPosition: 'center'
    },
    'images/elf.png': {
        title: 'Elf',
        description: 'Фэнтези-эльф, детализированный персонаж для игр.',
        link: 'projects/project9.html',
        fullImage: 'images/elf.png',
        objectPosition: 'top center'
    },
    'images/drag.png': {
        title: 'Drag',
        description: 'Мифический дракон, созданный для портфолио.',
        link: 'projects/project10.html',
        fullImage: 'images/drag.png',
        objectPosition: 'center'
    }
};

function showBigCard(square, imageUrl) {
    const container = createBigCardContainer();
    const projectData = bigProjectData[imageUrl];
    
    if (!projectData) return;
    
    currentActiveSquare = square;
    isHoveringCard = false;
    
    if (hideCardTimeout) {
        clearTimeout(hideCardTimeout);
        hideCardTimeout = null;
    }
    
    const rect = square.getBoundingClientRect();
    
    container.innerHTML = `
        <img src="${projectData.fullImage}" alt="${projectData.title}" style="width: 100%; height: 200px; object-fit: cover; object-position: ${projectData.objectPosition};">
        <div style="padding: 15px;">
            <h3 style="color: cyan; margin-bottom: 10px; font-size: 1.3rem;">${projectData.title}</h3>
            <p style="color: #ccc; font-size: 0.85rem; line-height: 1.4;">${projectData.description}</p>
        </div>
    `;
    
    if (projectData.link) {
        container.style.cursor = 'pointer';
        const clickHandler = () => {
            window.location.href = projectData.link;
        };
        container.removeEventListener('click', clickHandler);
        container.addEventListener('click', clickHandler);
    }
    
    let left = rect.right + 15;
    let top = rect.top - 50;
    
    if (left + 340 > window.innerWidth) {
        left = rect.left - 340;
    }
    
    if (top < 10) {
        top = 10;
    }
    if (top + 380 > window.innerHeight) {
        top = window.innerHeight - 390;
    }
    
    container.style.left = left + 'px';
    container.style.top = top + 'px';
    container.style.display = 'flex';
}

function hideBigCardWithDelay() {
    if (hideCardTimeout) clearTimeout(hideCardTimeout);
    hideCardTimeout = setTimeout(() => {
        if (!isHoveringCard && bigCardContainer && bigCardContainer.style.display === 'flex') {
            bigCardContainer.style.display = 'none';
            currentActiveSquare = null;
        }
    }, 200);
}

function hideBigCard() {
    if (hideCardTimeout) clearTimeout(hideCardTimeout);
    if (bigCardContainer) {
        bigCardContainer.style.display = 'none';
        currentActiveSquare = null;
    }
    isHoveringCard = false;
}

const allSquares = document.querySelectorAll('.square');
allSquares.forEach(square => {
    const bgImage = square.style.backgroundImage;
    const imageUrl = bgImage.slice(5, -2).replace(/['"]/g, '');
    
    square.removeEventListener('mouseenter', square._mouseEnterHandler);
    square.removeEventListener('mouseleave', square._mouseLeaveHandler);
    
    square._mouseEnterHandler = (e) => {
        e.stopPropagation();
        showBigCard(square, imageUrl);
    };
    square._mouseLeaveHandler = () => {
        hideBigCardWithDelay();
    };
    
    square.addEventListener('mouseenter', square._mouseEnterHandler);
    square.addEventListener('mouseleave', square._mouseLeaveHandler);
});

window.addEventListener('scroll', hideBigCard);
window.addEventListener('resize', hideBigCard);

// ===== НАВИГАЦИЯ МЕЖДУ ПРОЕКТАМИ (ЗАЦИКЛЕННАЯ ДЛЯ 8 И 10 ПРОЕКТОВ) =====
const currentPage = window.location.pathname;
const projectMatch = currentPage.match(/project(\d+)\.html/);
const currentProjectId = projectMatch ? parseInt(projectMatch[1]) : null;

function getNextProject(currentId, isFeatured = false) {
    if (isFeatured) {
        let next = currentId + 1;
        if (next > 8) next = 1;
        return next;
    } else {
        let next = currentId + 1;
        if (next > 10) next = 1;
        return next;
    }
}

function getPrevProject(currentId, isFeatured = false) {
    if (isFeatured) {
        let prev = currentId - 1;
        if (prev < 1) prev = 8;
        return prev;
    } else {
        let prev = currentId - 1;
        if (prev < 1) prev = 10;
        return prev;
    }
}

const isFeaturedProject = currentProjectId && currentProjectId >= 1 && currentProjectId <= 8;

if (currentProjectId) {
    const prevLink = document.querySelector('.project-navigation .prev');
    const nextLink = document.querySelector('.project-navigation .next');
    
    if (prevLink) {
        const prevId = getPrevProject(currentProjectId, isFeaturedProject);
        prevLink.href = `project${prevId}.html`;
    }
    
    if (nextLink) {
        const nextId = getNextProject(currentProjectId, isFeaturedProject);
        nextLink.href = `project${nextId}.html`;
    }
}

// ===== СОХРАНЕНИЕ ИСТОЧНИКА ПЕРЕХОДА ДЛЯ КНОПКИ ВОЗВРАТА =====
const featuredProjects = document.querySelectorAll('.project-item');
featuredProjects.forEach(project => {
    project.addEventListener('click', () => {
        localStorage.setItem('returnFrom', 'featured');
    });
});

const categoryProjects = document.querySelectorAll('.category-project-item');
categoryProjects.forEach(project => {
    project.addEventListener('click', () => {
        localStorage.setItem('returnFrom', 'categories');
    });
});

const backArrow = document.querySelector('.back-arrow');
if (backArrow) {
    const returnFrom = localStorage.getItem('returnFrom');
    
    if (returnFrom === 'categories') {
        backArrow.href = '../index.html#categories';
        backArrow.title = 'Вернуться к категориям';
    } else {
        backArrow.href = '../index.html#featured';
        backArrow.title = 'Вернуться к избранным';
    }
    
    setTimeout(() => {
        localStorage.removeItem('returnFrom');
    }, 500);
}

// ===== ПЛАВНЫЙ СКРОЛЛ К СЕКЦИЯМ =====
if (window.location.hash === '#featured') {
    const featuredSection = document.querySelector('.projects-grid');
    if (featuredSection) {
        setTimeout(() => {
            featuredSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

if (window.location.hash === '#categories') {
    const categoriesSection = document.querySelector('.categories-section');
    if (categoriesSection) {
        setTimeout(() => {
            categoriesSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

// ===== ОБНОВЛЁННЫЕ ССЫЛКИ ДЛЯ КАТЕГОРИЙ =====
const categoryProjectLinks = {
    bag: 'projects/project1.html',
    compass: 'projects/project2.html',
    car: 'projects/project3.html',
    lex: 'projects/project4.html',
    spider: 'projects/project5.html',
    mirel: 'projects/project6.html',
    scene: 'projects/project7.html',
    zombie: 'projects/project8.html',
    elf: 'projects/project9.html',
    drag: 'projects/project10.html'
};

const categoryItems = document.querySelectorAll('.category-project-item');
categoryItems.forEach(item => {
    const project = item.getAttribute('data-project');
    item.removeEventListener('click', item._clickHandler);
    const clickHandler = (e) => {
        e.stopPropagation();
        if (categoryProjectLinks[project]) {
            localStorage.setItem('returnFrom', 'categories');
            window.location.href = categoryProjectLinks[project];
        }
    };
    item._clickHandler = clickHandler;
    item.addEventListener('click', clickHandler);
});

// ===== ССЫЛКИ ДЛЯ ИЗБРАННЫХ ПРОЕКТОВ =====
const featuredProjectLinks = {
    'Bag': 'projects/project1.html',
    'Compass': 'projects/project2.html',
    'Car': 'projects/project3.html',
    'Lex': 'projects/project4.html',
    'Spider': 'projects/project5.html',
    'Mirel': 'projects/project6.html',
    'Сцена': 'projects/project7.html',
    'Анимация зомби': 'projects/project8.html'
};

const featuredProjectItems = document.querySelectorAll('.project-item');
featuredProjectItems.forEach(project => {
    const title = project.querySelector('.project-title')?.innerText;
    project.addEventListener('click', (e) => {
        e.preventDefault();
        if (title && featuredProjectLinks[title]) {
            localStorage.setItem('returnFrom', 'featured');
            window.location.href = featuredProjectLinks[title];
        }
    });
});

// Анимированный фон для герой-секции (аналог bg-59)
const canvas = document.getElementById('hero-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let hue = 270; // Фиолетовый оттенок
    
    function initCanvas() {
        const hero = document.querySelector('.home .hero');
        if (hero) {
            width = hero.clientWidth;
            height = hero.clientHeight;
            canvas.width = width;
            canvas.height = height;
        }
    }
    
    function createParticles() {
        const particleCount = Math.floor(width * height / 8000);
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    function draw() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        
        // Рисуем линии между близкими частицами
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    const opacity = (1 - distance / 120) * 0.3;
                    ctx.strokeStyle = `rgba(138, 43, 226, ${opacity})`; // Фиолетовый
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        
        // Рисуем частицы
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(138, 43, 226, ${p.opacity})`;
            ctx.fill();
            
            // Движение
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Отскок от границ
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
        }
        
        requestAnimationFrame(draw);
    }
    
    function handleResize() {
        initCanvas();
        createParticles();
    }
    
    window.addEventListener('resize', handleResize);
    initCanvas();
    createParticles();
    draw();
}
