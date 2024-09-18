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

    // Konami Code sequence
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    // Add event listener for keydown
    document.addEventListener('keydown', function(e) {
        // Check if the key pressed matches the next key in the Konami Code
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            
            // If the full Konami Code has been entered
            if (konamiIndex === konamiCode.length) {
                activateRainbowMode();
                konamiIndex = 0; // Reset the index
            }
        } else {
            konamiIndex = 0; // Reset if wrong key is pressed
        }
    });

    function activateRainbowMode() {
        console.log('Rainbow mode activated!'); // For debugging
        
        // Play Wilhelm scream
        const wilhelmScream = new Audio('assets/sound/Wilhelm.wav');
        wilhelmScream.play();
        
        // Add rainbow class to body
        document.body.classList.add('rainbow');
        
        // Remove rainbow class after 32 seconds
        setTimeout(() => {
            document.body.classList.remove('rainbow');
        }, 32000); // 32 seconds in milliseconds
    }

    // New feature: Play sound on specific key presses
    document.addEventListener('keydown', (e) => {
        let soundFile = '';

        switch (e.key) {
            case 'ArrowUp':
                soundFile = 'assets/sound/up.wav'; // Update the path as necessary
                break;
            case 'ArrowDown':
                soundFile = 'assets/sound/down.wav'; // Update the path as necessary
                break;
            case 'ArrowLeft':
                soundFile = 'assets/sound/left.wav'; // Update the path as necessary
                break;
            case 'ArrowRight':
                soundFile = 'assets/sound/right.wav'; // Update the path as necessary
                break;
            case 'a':
                soundFile = 'assets/sound/a.wav'; // Update the path as necessary
                break;
            case 'b':
                soundFile = 'assets/sound/b.wav'; // Update the path as necessary
                break;
        }

        // Play the sound if a valid key was pressed
        if (soundFile) {
            const sound = new Audio(soundFile);
            sound.play();
            showCurrentTrack(soundFile);
            
            sound.onended = function() {
                updateCurrentTrack(audio.paused ? null : 'PrettyDecent - Juke.mp3');
            };
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
                    "src": "assets/images/favicon-64x64.png",
                    "width": 64,
                    "height": 64
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
                    "enable": true,  // Prevent default spawning of particles on click
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
            particle.vx *= 6;
            particle.vy *= 6;
        });
    }

    function slowDownParticles() {
        const pJS = window.pJSDom[0].pJS;
        pJS.particles.move.speed = 2;  // Return to original speed
        pJS.particles.array.forEach(particle => {
            particle.vx /= 6;
            particle.vy /= 6;
        });
    }

    var mainText = document.querySelector('h1');
    var audio = new Audio('assets/sound/PrettyDecent - Juke.mp3');
    audio.loop = true;

    mainText.addEventListener('mouseenter', function() {
        audio.play();
        updateCurrentTrack('PrettyDecent - Juke.mp3');
    });

    mainText.addEventListener('mouseleave', function() {
        audio.pause();
        updateCurrentTrack(null);
    });

    // New feature: Play random WAV file on click
    const wavFiles = [
        'assets/note/banjo.wav',
        'assets/note/bass.wav',
        'assets/note/bassattack.wav',
		'assets/note/bd.wav',
		'assets/note/bell.wav',
		'assets/note/bit.wav',
		'assets/note/cow_bell.wav',
		'assets/note/didgeridoo.wav',
		'assets/note/flute.wav',
		'assets/note/guitar.wav',
		'assets/note/harp.wav',
		'assets/note/harp2.wav',
		'assets/note/hat.wav',
		'assets/note/icechime.wav',
		'assets/note/iron_xylophone.wav',
		'assets/note/pling.wav',
		'assets/note/snare.wav',
		'assets/note/xylobone.wav',
		
        // Add more WAV files as needed
    ];

    document.addEventListener('click', function(event) {
        // Check if the clicked element is not a button, link, or other interactive element
        if (!event.target.closest('button, a, input, select, textarea')) {
            const randomWav = wavFiles[Math.floor(Math.random() * wavFiles.length)];
            const clickSound = new Audio(randomWav);
            clickSound.play();
            showCurrentTrack(randomWav);
        }
    });

    function updateCurrentTrack(trackName) {
        const trackElement = document.getElementById('current-track');
        const trackNameElement = document.getElementById('track-name');
        
        if (trackName) {
            trackNameElement.textContent = trackName;
            trackElement.style.opacity = '1';
            
            // Clear any existing timeout
            clearTimeout(trackDisplayTimeout);
            
            // Set a new timeout to fade out the track name after 3 seconds
            trackDisplayTimeout = setTimeout(() => {
                trackElement.style.opacity = '0';
            }, 3000);
        } else {
            trackElement.style.opacity = '0';
        }
    }

    // 9/17/2024 edits past this point
    // working on the about 


//this is needed	
});

const currentTrackElement = document.getElementById('current-track');
let fadeTimeout;

function showCurrentTrack(trackPath) {
    // Extract just the file name from the path
    const fileName = trackPath.split('/').pop();
    
    // Clear any existing timeout
    clearTimeout(fadeTimeout);
    
    // Set the file name
    document.getElementById('track-name').textContent = fileName;
    
    // Fade in
    currentTrackElement.style.transition = 'opacity 0.32s ease-in';
    currentTrackElement.style.opacity = '1';
    
    // Wait 2 seconds, then start fade out
    fadeTimeout = setTimeout(() => {
        fadeOutCurrentTrack();
    }, 3200); // 2 seconds
}

function fadeOutCurrentTrack() {
    // Set transition for fade out
    currentTrackElement.style.transition = 'opacity 1.2s ease-out';
    currentTrackElement.style.opacity = '0';
}

function playAudio(trackPath) {
    // Your existing audio play logic here
    // ...

    showCurrentTrack(trackPath);
}