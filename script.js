document.addEventListener('DOMContentLoaded', (event) => {
    const h1 = document.querySelector('h1');
    
    h1.addEventListener('mouseenter', () => {
        h1.classList.add('hovered');
    });

    h1.addEventListener('mouseleave', () => {
        h1.classList.remove('hovered');
    });

    // Easter egg: Konami code
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
});

function activateEasterEgg() {
    document.body.classList.add('rainbow');
    setTimeout(() => {
        document.body.classList.remove('rainbow');
    }, 5000);
}