document.addEventListener('DOMContentLoaded', (event) => {
    const h1 = document.querySelector('h1');
    
    h1.addEventListener('mousemove', (e) => {
        const rect = h1.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const radius = window.innerWidth * 0.2; // Increased for a wider, more subtle effect

        const gradient = `radial-gradient(circle ${radius}px at ${x}px ${y}px, 
                          rgba(255, 255, 255, 0.1) 0%, 
                          rgba(255, 255, 255, 0.05) 25%,
                          rgba(255, 255, 255, 0.02) 50%,
                          rgba(0, 0, 0, 0) 75%)`;

        h1.style.webkitBackgroundClip = 'text';
        h1.style.webkitTextFillColor = 'transparent';
        h1.style.backgroundClip = 'text';
        h1.style.backgroundImage = gradient;
        
        h1.classList.add('hovered');
    });

    h1.addEventListener('mouseleave', () => {
        h1.style.webkitBackgroundClip = 'initial';
        h1.style.webkitTextFillColor = 'initial';
        h1.style.backgroundClip = 'initial';
        h1.style.backgroundImage = 'none';
        h1.style.color = '#000';
        
        h1.classList.remove('hovered');
    });

    // Easter egg: Konami code (kept from previous version)
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    // New: Particle effect
    createParticles();
});

function activateEasterEgg() {
    document.body.style.animation = 'rainbow 5s linear infinite';
    setTimeout(() => {
        document.body.style.animation = 'none';
    }, 5000);
}

function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.setProperty('--x', Math.random());
        particle.style.setProperty('--y', Math.random());
        particlesContainer.appendChild(particle);
    }
}