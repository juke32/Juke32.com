document.addEventListener('DOMContentLoaded', () => {
    const h1 = document.querySelector('h1');
    const audio = new Audio('assets/sound/PrettyDecent - Juke.mp3');
    audio.loop = true;

    const particlesConfig = {
        particles: {
            number: { value: 10 },
            shape: {
                type: "image",
                image: { src: "assets/images/favicon-64x64.png", width: 64, height: 64 }
            },
            size: { value: 20, random: true, anim: { enable: true, speed: 2, size_min: 10, sync: false } },
            move: { enable: true, speed: 2, direction: "bottom-right", out_mode: "out" },
            line_linked: { enable: true, distance: 200, color: "#b2b2b2", opacity: 0.4, width: 1 },
        },
        interactivity: { events: { onclick: { enable: true } }, modes: { push: { particles_nb: 1 } } },
        retina_detect: true
    };

    particlesJS('particles-js', particlesConfig);

    function toggleParticles(speed) {
        const pJS = window.pJSDom[0].pJS;
        const currentSpeed = pJS.particles.move.speed;
        const speedFactor = speed / currentSpeed;

        pJS.particles.move.speed = speed;
        pJS.particles.array.forEach(particle => {
            particle.vx *= speedFactor;
            particle.vy *= speedFactor;
        });
    }

    h1.addEventListener('mouseenter', () => {
        h1.classList.add('hovered');
        toggleParticles(10); // Increase speed to 10
        audio.play();
        updateCurrentTrack('PrettyDecent - Juke.mp3');
    });

    h1.addEventListener('mouseleave', () => {
        h1.classList.remove('hovered');
        toggleParticles(2); // Decrease speed to 2
        audio.pause();
        updateCurrentTrack(null);
    });

    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    const soundMap = {
        'ArrowUp': 'up.wav',
        'ArrowDown': 'down.wav',
        'ArrowLeft': 'left.wav',
        'ArrowRight': 'right.wav',
        'a': 'a.wav',
        'b': 'b.wav'
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            // Play the specific sound for the key
            const soundFile = soundMap[e.key];
            if (soundFile) {
                const keySound = new Audio(`assets/sound/${soundFile}`);
                keySound.play();
            }

            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateRainbowMode();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    function activateRainbowMode() {
        new Audio('assets/sound/Wilhelm.wav').play();
        document.body.classList.add('rainbow');
        setTimeout(() => document.body.classList.remove('rainbow'), 32000);
    }

    const mp3Files = [
        'banjo', 'bass', 'bassb', 'bongo', 'bowl', 'bugle', 'chair', 'glass', 'guitar', 'hat',
        'hit', 'kalimba', 'melodian', 'piano', 'pluckp', 'recorder', 'steeldrum',
        'steelguitar', 'vibraphone', 'violin'
    ].map(file => `assets/note/${file}.mp3`);

    document.addEventListener('click', (event) => {
        if (!event.target.closest('button, a, input, select, textarea')) {
            const randomMp3 = mp3Files[Math.floor(Math.random() * mp3Files.length)];
            new Audio(randomMp3).play();
            showCurrentTrack(randomMp3);
        }
    });

    let trackDisplayTimeout;
    function updateCurrentTrack(trackName) {
        const trackElement = document.getElementById('current-track');
        const trackNameElement = document.getElementById('track-name');
        
        clearTimeout(trackDisplayTimeout);
        if (trackName) {
            trackNameElement.textContent = trackName.replace(/\.(wav|mp3)$/, '');
            trackElement.style.opacity = '1';
            trackDisplayTimeout = setTimeout(() => trackElement.style.opacity = '0', 3000);
        } else {
            trackElement.style.opacity = '0';
        }
    }

    function showCurrentTrack(trackPath) {
        const fileName = trackPath.split('/').pop().replace(/\.(wav|mp3)$/, '');
        document.getElementById('track-name').textContent = fileName;
        const currentTrackElement = document.getElementById('current-track');
        currentTrackElement.style.transition = 'opacity 0.32s ease-in';
        currentTrackElement.style.opacity = '1';
        setTimeout(() => {
            currentTrackElement.style.transition = 'opacity 1.2s ease-out';
            currentTrackElement.style.opacity = '0';
        }, 3200);
    }
});