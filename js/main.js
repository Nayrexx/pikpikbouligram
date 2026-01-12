// Navigation mobile
document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    
    if (burger) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('active');
            burger.classList.toggle('toggle');
        });
    }

    // Fermer le menu quand on clique sur un lien
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            burger.classList.remove('toggle');
        });
    });

    // Auto-play slider avis
    if (document.querySelector('.reviews-slider')) {
        setInterval(() => {
            moveSlide(1);
        }, 15000);
    }
});

// Slider Avis
let currentSlide = 0;
const totalSlides = 3;

function moveSlide(direction) {
    const cards = document.querySelectorAll('.review-card');
    const dots = document.querySelectorAll('.dot');
    const track = document.querySelector('.reviews-track');
    
    if (!cards.length) return;
    
    cards[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide += direction;
    
    if (currentSlide >= totalSlides) currentSlide = 0;
    if (currentSlide < 0) currentSlide = totalSlides - 1;
    
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    cards[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function goToSlide(index) {
    const cards = document.querySelectorAll('.review-card');
    const dots = document.querySelectorAll('.dot');
    const track = document.querySelector('.reviews-track');
    
    if (!cards.length) return;
    
    cards[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    cards[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}
