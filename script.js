document.addEventListener('DOMContentLoaded', () => {
    const h1 = document.querySelector('h1');
    const audio = new Audio('assets/sound/PrettyDecent - Juke.mp3');
    audio.loop = true;

    const particlesConfig = {
        particles: {
            number: { value: 2 },  // Reduced from 4 to 2 for better performance
            shape: {
                type: "image",
                image: { src: "assets/images/favicon-64x64.png", width: 64, height: 64 }
            },
            size: { value: 20, random: true, anim: { enable: true, speed: 2, size_min: 10, sync: false } },
            move: { enable: true, speed: 2, direction: "bottom-right", out_mode: "out" },
            line_linked: { enable: true, distance: 300, color: "#b2b2b2", opacity: 0.4, width: 1 },
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
        toggleParticles(10);
        audio.play();
        updateCurrentTrack('PrettyDecent - Juke.mp3');
    });

    h1.addEventListener('mouseleave', () => {
        h1.classList.remove('hovered');
        toggleParticles(2);
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
        'steelguitar', 'vibraphone', 'violin', 'cat'
    ].map(file => `assets/note/${file}.mp3`);

    // Throttle function to limit click event frequency
    function throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function() {
            const context = this;
            const args = arguments;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }

    document.addEventListener('click', throttle((event) => {
        if (!event.target.closest('button, a, input, select, textarea')) {
            const randomMp3 = mp3Files[Math.floor(Math.random() * mp3Files.length)];
            new Audio(randomMp3).play();
            showCurrentTrack(randomMp3);
        }
    }, 240)); // Throttle clicks to every 300ms

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
        const currentTrackElement = document.getElementById('current-track');
        const trackNameElement = document.getElementById('track-name');

        clearTimeout(currentTrackElement.fadeOutTimeout);
        trackNameElement.textContent = fileName;
        currentTrackElement.style.transition = 'opacity 0.32s ease-in';
        currentTrackElement.style.opacity = '1';

        currentTrackElement.fadeOutTimeout = setTimeout(() => {
            currentTrackElement.style.transition = 'opacity 1.2s ease-out';
            currentTrackElement.style.opacity = '0';
        }, 3200);
    }

    const boxes = document.querySelectorAll('.model-box');
    const popup = document.getElementById('popup');
    const popupContent = document.querySelector('.popup-content');
    const header = document.querySelector('h1');
    let lastScrollTop = 0;

    // Handle header scroll
    document.querySelector('.scroll-container').addEventListener('scroll', (e) => {
        const scrollTop = e.target.scrollTop;
        if (scrollTop > lastScrollTop && scrollTop > 50) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;
    });

    // Handle popup functionality
    boxes.forEach(box => {
        box.addEventListener('click', () => {
            const text = box.getAttribute('data-text');
            let mediaItems;

            // Define media items for each model
            switch (box.querySelector('img').alt) {
                case 'cornflower?':
                    mediaItems = [
                        { type: 'image', src: 'assets/images/models/image.jpg' },
                        { type: 'image', src: 'assets/images/models/image_2.jpg' },
                        { type: 'video', src: 'assets/videos/image_demo.mp4' }
                    ];
                    break;

                case 'lapis':
                    mediaItems = [
                        { type: 'image', src: 'assets/images/models/cornflower.jpg' },
                        { type: 'image', src: 'assets/images/models/cornflower_internal.jpg' },
                        { type: 'image', src: 'assets/images/models/corn-pig_stain.jpg'},
                        { type: 'image', src: 'assets/images/models/lapis_ble.jpg' },
                        { type: 'image', src: 'assets/images/models/lapis_table.jpg' },
                        { type: 'video', src: 'assets/videos/lapis_ble_demo.mp4' }
                    ];
                    break;

                case 'dirt':
                    mediaItems = [
                        { type: 'image', src: 'assets/images/models/dirt_mp3.jpg' },
                        { type: 'image', src: 'assets/images/models/dirt_meets_steve.jpg' },
                        { type: 'image', src: 'assets/images/models/dirt_stain.jpg' },
                        { type: 'image', src: 'assets/images/models/dirt_naked.jpg' }
                    ];
                    break;

                case 'chunky juke':
                    mediaItems = [
                        { type: 'image', src: 'assets/images/models/minichunkyjuke.jpg' },
                        { type: 'image', src: 'assets/images/models/tiny juke32.png' },
                        { type: 'image', src: 'assets/images/models/chunkychunk.jpg' }
                    ];
                    break;

                case 'buttoncontrol':
                    mediaItems = [
                        { type: 'image', src: 'assets/images/models/buttoncontroljuke.jpg' },
                        { type: 'image', src: 'assets/images/models/buttoncontrolchunky.jpg' },
                        { type: 'image', src: 'assets/images/models/buttoncontrolproto.jpg' }
                    ];
                    break;

                case 'paper juke':
                    mediaItems = [
                        { type: 'image', src: 'assets/images/models/paperjuke.jpg' },
                        { type: 'image', src: 'assets/images/models/paperjukebox.jpg' },
                        { type: 'image', src: 'assets/images/models/14px mini jukebox cutout (enlarged).png' }
                    ];
                    break;

                case 'first try':
                    mediaItems = [
                        { type: 'image', src: 'assets/images/models/ben_chunky.jpg' },
                        { type: 'image', src: 'assets/images/models/first try.jpg' }
                    ];
                    break;
                
                default:
                    mediaItems = [{ type: 'image', src: box.querySelector('img').src }];
            }
            
            // Preload all media items when popup opens
            preloadMediaItems(mediaItems);

            popup.innerHTML = `
                <div class="popup-content">
                    <span class="close">&times;</span>
                    <div class="media-container">
                        ${mediaItems.length > 1 ? '<button class="nav-btn prev">&#10094;</button>' : ''}
                        <div class="media-display"></div>
                        ${mediaItems.length > 1 ? '<button class="nav-btn next">&#10095;</button>' : ''}
                    </div>
                    <div class="popup-text">${text}</div> <!-- Ensure this is below the media display -->
                </div>
            `;

            let currentIndex = 0;
            const mediaDisplay = popup.querySelector('.media-display');
            
            function showMedia(index) {
                const item = mediaItems[index];
                if (item.type === 'image') {
                    mediaDisplay.innerHTML = `<img src="${item.src}" class="popup-image" alt="View">`;
                } else if (item.type === 'video') {
                    mediaDisplay.innerHTML = `
                        <video class="popup-video" controls>
                            <source src="${item.src}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>`;
                }

                // Preload next image if it exists
                if (mediaItems[index + 1] && mediaItems[index + 1].type === 'image') {
                    const preloadImage = new Image();
                    preloadImage.src = mediaItems[index + 1].src;
                }
            }

            // Initial media display
            showMedia(currentIndex);

            // Only set up navigation if there are multiple items
            if (mediaItems.length > 1) {
                const prevBtn = popup.querySelector('.prev');
                const nextBtn = popup.querySelector('.next');

                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
                    showMedia(currentIndex);
                });

                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = (currentIndex + 1) % mediaItems.length;
                    showMedia(currentIndex);
                });
            }

            // Show popup
            popup.style.display = 'flex';

            // Close button functionality
            const closeBtn = popup.querySelector('.close');
            closeBtn.addEventListener('click', () => {
                popup.style.display = 'none';
            });
        });
    });

    // Close popup when clicking outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.style.display = 'none';
        }
    });

    // Add preload function for all media items
    function preloadMediaItems(items) {
        items.forEach(item => {
            if (item.type === 'image') {
                const img = new Image();
                img.src = item.src;
            }
        });
    }
});
