// Кнопка "Наверх" – адаптивный порог (20% прокрутки) + резервное создание
document.addEventListener('DOMContentLoaded', function() {
    let backToTopButton = document.getElementById('back-to-top');

    // Функция создания кнопки, если её нет
    function createButton() {
        const btn = document.createElement('button');
        btn.id = 'back-to-top';
        btn.innerHTML = '↑';
        btn.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: cyan;
            color: #0a0a0a;
            border: none;
            font-size: 24px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s, transform 0.3s;
            transform: translateY(20px);
            pointer-events: none;
            box-shadow: 0 0 20px cyan;
            z-index: 150;
        `;
        document.body.appendChild(btn);
        return btn;
    }

    if (!backToTopButton) {
        backToTopButton = createButton();
    }

    // Функция обновления видимости по проценту прокрутки
    function updateButtonVisibility() {
        if (!backToTopButton) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

        if (scrollPercent > 0.2) { // 20% прокрутки
            backToTopButton.classList.add('visible');
            // Для надёжности также меняем inline-стили, если класс не сработал
            backToTopButton.style.opacity = '1';
            backToTopButton.style.transform = 'translateY(0)';
            backToTopButton.style.pointerEvents = 'all';
        } else {
            backToTopButton.classList.remove('visible');
            backToTopButton.style.opacity = '0';
            backToTopButton.style.transform = 'translateY(20px)';
            backToTopButton.style.pointerEvents = 'none';
        }
    }

    // Обработчики событий
    window.addEventListener('scroll', updateButtonVisibility);
    window.addEventListener('resize', updateButtonVisibility);
    updateButtonVisibility();

    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Данные для маленьких квадратов (14 изображений)
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
    'images/mirel.png',
    'images/sharkula.png',
    'images/elf-halloween.png',
    'images/firefly.png',
    'images/man.png'
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
    const topCenterImages = ['elf', 'elf-halloween', 'sharkula', 'firefly', 'man'];
    
    for (let i = 0; i < smallSquareImages.length; i++) {
        const square = document.createElement('div');
        square.className = 'square';
        const imgUrl = shuffled[i];
        square.style.backgroundImage = `url(${imgUrl})`;
        
        let bgPos = 'center';
        if (topCenterImages.some(name => imgUrl.includes(name))) {
            bgPos = 'top center';
        }
        square.style.backgroundPosition = bgPos;
        
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

// Обработка формы обратной связи (на странице contact.html)
const feedbackForm = document.getElementById('feedback-form');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Спасибо! Сообщение отправлено (демо-режим).');
        feedbackForm.reset();
    });
}

// ===== БУРГЕР-МЕНЮ =====
const burger = document.querySelector('.burger-icon');
const menuTrigger = document.querySelector('.menu-trigger-area');
const menuEl = document.querySelector('.menu');
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
if (menuEl) {
    menuEl.addEventListener('mouseenter', openMenu);
    menuEl.addEventListener('mouseleave', closeMenu);
}

/// Логика для главной страницы и страницы "Обо мне": открыто при загрузке, закрывается при скролле вниз, открывается при скролле наверх
// НО ТОЛЬКО НА УСТРОЙСТВАХ ШИРЕ 768px (не на мобильных)
const isSpecialPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('about.html');
if (isSpecialPage && window.innerWidth > 768) {
    if (!menuOpenByClick) {
        body.classList.add('menu-open');
    }
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > lastScrollTop && currentScroll > 0) {
            if (!menuOpenByClick) {
                body.classList.remove('menu-open');
            }
        } else if (currentScroll === 0) {
            if (!menuOpenByClick) {
                body.classList.add('menu-open');
            }
        }
        lastScrollTop = currentScroll;
    });
}

// При изменении размера окна (поворот устройства) проверяем, нужно ли скорректировать состояние меню
window.addEventListener('resize', function onResize() {
    if (window.innerWidth <= 768) {
        // На мобильных устройствах гарантированно закрываем меню, если оно было открыто автоматически
        if (!menuOpenByClick && body.classList.contains('menu-open')) {
            body.classList.remove('menu-open');
        }
    } else {
        // На широких экранах, если мы на главной или about и меню не открыто кликом, открываем его
        if (isSpecialPage && !menuOpenByClick && !body.classList.contains('menu-open')) {
            body.classList.add('menu-open');
        }
    }
});
// Скролл к секции категорий при клике на стрелку
const scrollIndicator = document.getElementById('scrollIndicator');
const categoriesSection = document.querySelector('.categories-section');

if (scrollIndicator && categoriesSection) {
    scrollIndicator.addEventListener('click', () => {
        scrollIndicator.classList.add('hidden');
        categoriesSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    });
}

// Восстановление стрелки при скролле наверх
let lastScrollTopForArrow = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollIndicator && currentScroll < 100 && scrollIndicator.classList.contains('hidden')) {
        scrollIndicator.classList.remove('hidden');
    }
    lastScrollTopForArrow = currentScroll <= 0 ? 0 : currentScroll;
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

// ===== БОЛЬШИЕ КАРТОЧКИ ПРОЕКТОВ =====
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
        description: 'Сумка в фентези стиле, созданная в Blender и Substance Painter.',
        link: 'projects/project1.html',
        fullImage: 'images/bag.png',
        objectPosition: 'center'
    },
    'images/compass.png': {
        title: 'Compass',
        description: 'Стилизованный магический компас.',
        link: 'projects/project2.html',
        fullImage: 'images/compass.png',
        objectPosition: 'center'
    },
    'images/car.png': {
        title: 'Car',
        description: 'Ретро Volkswagen T1 Samba Bus.',
        link: 'projects/project3.html',
        fullImage: 'images/car.png',
        objectPosition: 'center'
    },
    'images/lex.png': {
        title: 'Lex',
        description: 'Персонаж-робот Lex, вдохновленный вселенной Warhammer.',
        link: 'projects/project4.html',
        fullImage: 'images/lex.png',
        objectPosition: 'center'
    },
    'images/spider.png': {
        title: 'Spider',
        description: 'Жуткий паучок с рудой и драгоценными камнями на спинке.',
        link: 'projects/project5.html',
        fullImage: 'images/spider.png',
        objectPosition: 'center'
    },
    'images/mirel.png': {
        title: 'Mirel',
        description: 'Персонаж для дипломной работы.',
        link: 'projects/project6.html',
        fullImage: 'images/mirel.png',
        objectPosition: 'top center'
    },
    'images/tower.png': {
        title: 'Tower',
        description: 'Фэнтезийная сцена с башней.',
        link: 'projects/project7.html',
        fullImage: 'images/tower.png',
        objectPosition: 'center'
    },
    'images/ded.png': {
        title: 'Zombie Animation',
        description: 'Анимация про зомби и больницу.',
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
        description: 'Жуткий Драг-монстр, скульпт созданный для портфолио.',
        link: 'projects/project10.html',
        fullImage: 'images/drag.png',
        objectPosition: 'center'
    },
    'images/sharkula.png': {
        title: 'Sharkula',
        description: 'Цифровой рисунок персонажа Sharkula.',
        link: 'projects/project11.html',
        fullImage: 'images/sharkula.png',
        objectPosition: 'top center'
    },
    'images/elf-halloween.png': {
        title: 'Elf Halloween',
        description: 'Фэнтези-эльф в хэллоуинском стиле.',
        link: 'projects/project12.html',
        fullImage: 'images/elf-halloween.png',
        objectPosition: 'top center'
    },
    'images/firefly.png': {
        title: 'Firefly',
        description: 'Атмосферный 2D арт со светлячками.',
        link: 'projects/project13.html',
        fullImage: 'images/firefly.png',
        objectPosition: 'top center'
    },
    'images/man.png': {
        title: 'Man',
        description: 'Портрет мужчины, цифровой рисунок.',
        link: 'projects/project14.html',
        fullImage: 'images/man.png',
        objectPosition: 'top center'
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
        const clickHandler = () => { window.location.href = projectData.link; };
        container.removeEventListener('click', clickHandler);
        container.addEventListener('click', clickHandler);
    }
    let left = rect.right + 15;
    let top = rect.top - 50;
    if (left + 340 > window.innerWidth) left = rect.left - 340;
    if (top < 10) top = 10;
    if (top + 380 > window.innerHeight) top = window.innerHeight - 390;
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
    if (bigCardContainer) bigCardContainer.style.display = 'none';
    currentActiveSquare = null;
    isHoveringCard = false;
}

const allSquares = document.querySelectorAll('.square');
allSquares.forEach(square => {
    const bgImage = square.style.backgroundImage;
    const imageUrl = bgImage.slice(5, -2).replace(/['"]/g, '');
    
    // Наведение – большая карточка
    square.removeEventListener('mouseenter', square._mouseEnterHandler);
    square.removeEventListener('mouseleave', square._mouseLeaveHandler);
    square._mouseEnterHandler = (e) => {
        e.stopPropagation();
        showBigCard(square, imageUrl);
    };
    square._mouseLeaveHandler = () => hideBigCardWithDelay();
    square.addEventListener('mouseenter', square._mouseEnterHandler);
    square.addEventListener('mouseleave', square._mouseLeaveHandler);
    
    // КЛИК ПО КВАДРАТУ – переход на страницу проекта
    square.removeEventListener('click', square._clickHandler);
    square._clickHandler = () => {
        const projectData = bigProjectData[imageUrl];
        if (projectData && projectData.link) {
            window.location.href = projectData.link;
        }
    };
    square.addEventListener('click', square._clickHandler);
});

window.addEventListener('scroll', hideBigCard);
window.addEventListener('resize', hideBigCard);

// ===== НАВИГАЦИЯ МЕЖДУ ПРОЕКТАМИ (с учётом источника перехода) =====

// Порядок проектов в категориях (14 проектов)
const categoryOrder = [1,2,7,3,8,9,6,4,5,10,11,12,13,14];
// Порядок проектов в "Последних проектах" (4 проекта)
const featuredOrder = [2,6,8,11];

// Функция для получения следующего/предыдущего ID в заданном порядке
function getAdjacentId(currentId, order, direction) {
    const index = order.indexOf(currentId);
    if (index === -1) return currentId;
    if (direction === 'next') {
        return order[(index + 1) % order.length];
    } else {
        return order[(index - 1 + order.length) % order.length];
    }
}

// Определяем, откуда пришли на страницу проекта
const returnFrom = localStorage.getItem('returnFrom');
let navigationOrder = categoryOrder; // по умолчанию порядок категорий
if (returnFrom === 'featured') {
    navigationOrder = featuredOrder;
}

// Для страниц проектов обновляем ссылки prev/next
const currentPage = window.location.pathname;
const projectMatch = currentPage.match(/project(\d+)\.html/);
const currentProjectId = projectMatch ? parseInt(projectMatch[1]) : null;

if (currentProjectId) {
    const prevLink = document.querySelector('.project-navigation .prev');
    const nextLink = document.querySelector('.project-navigation .next');
    if (prevLink) {
        const prevId = getAdjacentId(currentProjectId, navigationOrder, 'prev');
        prevLink.href = `project${prevId}.html`;
    }
    if (nextLink) {
        const nextId = getAdjacentId(currentProjectId, navigationOrder, 'next');
        nextLink.href = `project${nextId}.html`;
    }
}

// ===== СОХРАНЕНИЕ ИСТОЧНИКА ПЕРЕХОДА ДЛЯ КНОПКИ ВОЗВРАТА =====
document.querySelectorAll('.project-item').forEach(project => {
    project.addEventListener('click', () => localStorage.setItem('returnFrom', 'featured'));
});
document.querySelectorAll('.category-project-item').forEach(project => {
    project.addEventListener('click', () => localStorage.setItem('returnFrom', 'categories'));
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
    setTimeout(() => localStorage.removeItem('returnFrom'), 500);
}

// ===== ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ (без анимации подсветки) =====
document.querySelectorAll('a[href="index.html#contact"], a[href="../index.html#contact"], a[href="#contact"]').forEach(link => {
    link.addEventListener('click', function(e) {
        const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
        if (isIndex) {
            e.preventDefault();
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            e.preventDefault();
            sessionStorage.setItem('scrollToContact', 'true');
            window.location.href = 'index.html';
        }
    });
});

if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    const shouldScroll = sessionStorage.getItem('scrollToContact');
    if (shouldScroll === 'true') {
        sessionStorage.removeItem('scrollToContact');
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            setTimeout(() => {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    }
    if (window.location.hash === '#contact') {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            setTimeout(() => {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    }
}

document.querySelectorAll('a[href^="#"]:not([href="#contact"]):not([href="index.html#contact"]):not([href="../index.html#contact"])').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== ПОДСВЕТКА АКТИВНОГО ПУНКТА МЕНЮ ПРИ СКРОЛЛЕ (ГЛАВНАЯ) =====
function updateActiveMenuItem() {
    const homeLink = document.querySelector('.menu a[href="index.html"]');
    const contactsLinkActive = document.querySelector('.menu a[href="index.html#contact"]');
    if (!homeLink || !contactsLinkActive) return;
    const contactSection = document.getElementById('contact');
    if (!contactSection) return;
    const contactRect = contactSection.getBoundingClientRect();
    const isContactVisible = contactRect.top <= 150 && contactRect.bottom >= 150;
    if (isContactVisible) {
        homeLink.classList.remove('active');
        contactsLinkActive.classList.add('active');
    } else {
        contactsLinkActive.classList.remove('active');
        homeLink.classList.add('active');
    }
}

if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    updateActiveMenuItem();
    window.addEventListener('scroll', updateActiveMenuItem);
}

// ===== АНИМИРОВАННЫЙ ФОН ДЛЯ ГЕРОЙ-СЕКЦИИ =====
const canvas = document.getElementById('hero-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
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
                    ctx.strokeStyle = `rgba(138, 43, 226, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(138, 43, 226, ${p.opacity})`;
            ctx.fill();
            p.x += p.speedX;
            p.y += p.speedY;
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

// ===== ОБНОВЛЁННЫЕ ССЫЛКИ ДЛЯ КАТЕГОРИЙ (14 проектов) =====
const categoryProjectLinks = {
    bag: 'projects/project1.html',
    compass: 'projects/project2.html',
    car: 'projects/project3.html',
    lex: 'projects/project4.html',
    spider: 'projects/project5.html',
    mirel: 'projects/project6.html',
    tower: 'projects/project7.html',
    zombie: 'projects/project8.html',
    elf: 'projects/project9.html',
    drag: 'projects/project10.html',
    sharkula: 'projects/project11.html',
    'elf-halloween': 'projects/project12.html',
    firefly: 'projects/project13.html',
    man: 'projects/project14.html'
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

/// ===== ПОДКЛЮЧЕНИЕ EMAILJS ДЛЯ ФОРМЫ ОБРАТНОЙ СВЯЗИ =====

// Инициализация EmailJS с вашим Public Key
emailjs.init('1kFBq6X43eQWqwxpZ');

// Функция показа toast-уведомлений в стиле сайта
function showToast(message, isError = false) {
    // Удаляем старый тост, если есть
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.classList.add(isError ? 'error' : 'success');
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Анимация появления
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Валидация имени
function validateName(name) {
    if (!name || name.trim().length < 2) {
        return 'Имя должно содержать минимум 2 символа';
    }
    return '';
}

// Валидация email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return 'Введите корректный email (например, name@domain.com)';
    }
    return '';
}

// Получаем форму на главной странице (id="home-feedback-form")
const homeFeedbackForm = document.getElementById('home-feedback-form');

if (homeFeedbackForm) {
    homeFeedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Получаем значения полей
        const nameInput = this.querySelector('input[placeholder="Ваше имя"]');
        const emailInput = this.querySelector('input[placeholder="Email"]');
        const messageInput = this.querySelector('textarea[placeholder="Сообщение"]');
        
        const name = nameInput ? nameInput.value : '';
        const email = emailInput ? emailInput.value : '';
        const message = messageInput ? messageInput.value : '';
        
        // Валидация
        const nameError = validateName(name);
        if (nameError) {
            showToast(nameError, true);
            return;
        }
        
        const emailError = validateEmail(email);
        if (emailError) {
            showToast(emailError, true);
            return;
        }
        
        if (!message.trim()) {
            showToast('Пожалуйста, напишите сообщение.', true);
            return;
        }
        
        // Отправляем данные через EmailJS
        emailjs.send('service_2kugu6m', 'template_jvbt49s', {
            from_name: name,
            from_email: email,
            message: message
        })
        .then(function(response) {
            console.log('Успешно отправлено!', response);
            showToast('Сообщение отправлено! Я свяжусь с вами в ближайшее время.', false);
            homeFeedbackForm.reset();
        })
        .catch(function(error) {
            console.error('Ошибка при отправке:', error);
            showToast('Ошибка отправки. Попробуйте позже или напишите мне напрямую на почту.', true);
        });
    });
}

// ===== ИСПРАВЛЕНИЕ ССЫЛОК СОЦИАЛЬНЫХ СЕТЕЙ =====

// Ссылки на соцсети на главной странице
const vkLink = document.querySelector('.home-social-link[href="#"]:nth-child(2)'); // обычно VK второй
const artstationLink = document.querySelector('.home-social-link[href="#"]:first-child'); // ArtStation первый

if (vkLink) {
    vkLink.href = 'https://vk.com/devi_club7';
    vkLink.target = '_blank';
    vkLink.rel = 'noopener noreferrer';
}
if (artstationLink) {
    artstationLink.href = 'https://www.artstation.com/';
    artstationLink.target = '_blank';
    artstationLink.rel = 'noopener noreferrer';
}

// Также исправляем ссылки на странице contact.html (если она существует)
const contactVk = document.querySelector('.contact .social-link[href="#"]:nth-child(2)');
const contactArtstation = document.querySelector('.contact .social-link[href="#"]:first-child');

if (contactVk) {
    contactVk.href = 'https://vk.com/devi_club7';
    contactVk.target = '_blank';
    contactVk.rel = 'noopener noreferrer';
}
if (contactArtstation) {
    contactArtstation.href = 'https://www.artstation.com/';
    contactArtstation.target = '_blank';
    contactArtstation.rel = 'noopener noreferrer';
}