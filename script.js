document.addEventListener('DOMContentLoaded', (event) => {
    const h1 = document.querySelector('h1');
    
    h1.addEventListener('mouseenter', () => {
        h1.classList.add('hovered');
        speedUpParticles();
    });

    h1.addEventListener('mouseleave', () => {
        h1.classList.remove('hovered');
        slowDownParticles();
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

    // Particles.js configuration
    const particlesConfig = {
        "particles": {
            "number": {
                "value": 20,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "shape": {
                "type": "image",
                "image": {
                    "src": "favicon-64x64.png",
                    "width": 100,
                    "height": 100
                }
            },
            "size": {
                "value": 30,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 4,
                    "size_min": 10,
                    "sync": false
                }
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "bottom-right",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
            },
            "line_linked": {
                "enable": true,
                "distance": 260,
                "color": "#b2b2b2",
                "opacity": 0.4,
                "width": 1
            },
        },
        "interactivity": {
            "events": {
                "onclick": {
                    "enable": false,  // Prevent default spawning of particles on click
                }
            },
            "modes": {
                "push": {
                    "particles_nb": 1
                }
            }
        },
        "retina_detect": true
    };

    particlesJS('particles-js', particlesConfig);

    function speedUpParticles() {
        const pJS = window.pJSDom[0].pJS;
        pJS.particles.move.speed = 10;  // Increase speed when hovering
        pJS.particles.array.forEach(particle => {
            particle.vx *= 5;
            particle.vy *= 5;
        });
    }

    function slowDownParticles() {
        const pJS = window.pJSDom[0].pJS;
        pJS.particles.move.speed = 2;  // Return to original speed
        pJS.particles.array.forEach(particle => {
            particle.vx /= 5;
            particle.vy /= 5;
        });
    }

    window.addImageOnClick = function(event) {
        const pJS = window.pJSDom[0].pJS;
        const container = document.getElementById('particles-js');
        const rect = container.getBoundingClientRect();

        // Calculate the position relative to the container
        const pos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

        // Log the position to the console for debugging (optional)
        console.log('Spawn Position:', pos.x, pos.y);

        const newParticle = new pJS.fn.particle(
            pJS.particles.color,
            pJS.particles.opacity.value,
            {
                'x': pos.x,
                'y': pos.y
            }
        );

        pJS.particles.array.push(newParticle);
    }

    document.getElementById('particles-js').addEventListener('click', addImageOnClick);

    function activateEasterEgg() {
        document.body.classList.add('rainbow');
        setTimeout(() => {
            document.body.classList.remove('rainbow');
        }, 5000);
    }
});