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
                        { type: 'image', src: 'assets/images/models/first try.jpg' },
                        { type: 'image', src: 'assets/images/models/ben_chunky.jpg' }
                    ];
                    break;
                
                default:
                    mediaItems = [{ type: 'image', src: box.querySelector('img').src }];
            }
            
            // Preload all media items when popup opens
            preloadMediaItems(mediaItems);

            // Add detailed text content for each model
            let detailedContent;
            switch (box.querySelector('img').alt) {
                case 'lapis':
                    detailedContent = `
                        <h3>$64 - lapis/cornflower : a juke 32 bluetooth speaker</h3>
                        <p>The cheapest, easiest, best feeling, smallest, longest lasting (that's what she said) jukebox iteration.</p>
                        
                        <h3>features</h3>
                        <ul>
                            <li>Bluetooth 5.4</li>
                            <li>One Full Range Speaker Driver</li>                            
                            <li>400mah - 6 hour battery life at moderate volume (calculated)</li>
                            <li>150mah - 2-3 hour battery life at moderate volume (tested on initial prototypes)</li>
                            <li>USB-C PD supported charging port (if I solder the 5.1k resistors)</li>
                            <li>Elmers Glued Construction Paper for better bass response</li>
                            <li>3.5mm auxiliary input (sadly only input)</li>
                            <li>Stereo pairing capability when you buy 2. They will connect and play bluetooth in stereo :3</li>                         
                        </ul>
                        
                        <h3>notes</h3>
                        <p>I may iterate more to create a better product, but the main focus is a better model jukebox.</p>
                        
                        <h3>more notes</h3>                    
                        <p>Though each box costs just $7 in electronics and requires soldering only 4 wires, this project is no cakewalk. It also requires 2 small resistors that I shouldn't be legally allowed to hand solder.</p>
                        <p>The 0402 resistors are 0.04 inches long and 0.02 inches wide. Picture the tiniest ant you've ever seen scurrying across your desk - that's probably bigger than one of these resistors.</p>
                    `;
                    break;

                case 'dirt':
                    detailedContent = `
                        <h3>dirt : a juke32 mp3 player</h3>
                        <p>The first model that was designated a name since it was suppost to be sold eventually.</p>
                        
                        <h3>features</h3>
                        <ul>
                            <li>Simple control disc for power, volume, and track selection</li>                            
                            <li>USB-c power input</li>
                            <li>3.5mm headphone output</li>
                            <li>FAT32 micro sdcard slot</li>
                        </ul>
                        
                        <h3>notes</h3>
                        <p>The control disc was a great concept but isn't an exact science when you have as many variables as you do when designing a 3d lasercut box with 2d inkscape with parts that have variable dimensions.</p>
                        <p>It quickly turned into guess and check. With that and all of the other parts I had to print on different types of wood I didn't want to do more than one(no 3d printer to make this easier). On top of that, it was so tedious and terrible to have to glue everything precisely, cut and solder wires precisely, and still not have the correct fit and have to iterate again.</p>
                        <p>This led me to wanting a simple, easy to solder and implement bluetooth box. Oh I forgot to mention that quality micro sd cards are cheap, but are too expensive for this project. Both morally and practically I cannot buy cheap memory in bulk.</p>
                    `;
                    break;

                case 'chunky juke':
                    detailedContent = `
                        <h3>mini chunky jukebox</h3>
                        <p>Using the chunky model and a newly calibrated laser engraver I used the thinnest wood I had and printed a few lilguys.</p>
                        
                        <h3>design features</h3>
                        <ul>
                            <li>Custom 12px enlarged border design</li>
                            <li>Doubble wide border</li>
                            <li>Enhanced visual presence</li>
                            <li>Maintains Minecrafy Look and Aesthetic</li>
                            <li>Amazing 0.0007in Precision</li>
                            <li>so cool</li>                    
                        </ul>
                        
                        <h3>notes</h3>
                        <p>mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm small chunky jukebox</p>
                    `;
                    break;

                case 'buttoncontrol':
                    detailedContent = `
                        <h3>button control prototype</h3>
                        <p>I really just wanted to have a working jukebox, so I built this.</p>
                        
                        <h3>features</h3>
                        <ul>
                            <li>Switches</li>
                            <li>Combined Volume and Track Select Sunctions</li>
                            <li>9v rechargable Lipo Battery</li>
                        </ul>
                        
                        <h3>notes</h3>
                        <p>Due to the 3.7v Lithium Ion battery being boosted to 9v and then imediatly bucked down to 5v... The battery life is only 1.5-3 hours. And the knockoff DFplayer mini has a terrible stand-by current draw.</p>
                    `;
                    break;

                case 'paper juke':
                    detailedContent = `
                        <h3>14px paper jukebox</h3>
                        <p>An experiment using 14px textures instead of the 16px default Minecraft texture.</p>
                        
                        <h3>the idea</h3>
                        <p>Changing the texture resolution is unique and makes the border larger allowing for larger thickness wood to be used for a similar sized wooden box.</p>
                    `;
                    break;

                case 'first try':
                    detailedContent = `
                        <h3>initial prototypes</h3>
                        <p>The first experimental boxes that started the entire project.</p>
                        
                        <h3>design process</h3>
                        <ul>
                            <li>MS Paint concept</li>
                            <li>Inkscape design with interlocking edges</li>
                            <li>Lightburn adjustments and text additions</li>
                        </ul>
                        
                        <h3>lessons learned</h3>
                        <p>These initial attempts provided valuable insights into design constraints and design improvements.</p>
                    `;
                    break;

                default:
                    detailedContent = `<p>${box.getAttribute('data-text')}</p>`;
            }

            popup.innerHTML = `
                <div class="popup-content">
                    <span class="close">&times;</span>
                    <div class="media-container">
                        ${mediaItems.length > 1 ? '<button class="nav-btn prev">&#10094;</button>' : ''}
                        <div class="media-display"></div>
                        ${mediaItems.length > 1 ? '<button class="nav-btn next">&#10095;</button>' : ''}
                    </div>
                    <div class="popup-text">${detailedContent}</div>
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

    const toggleFontButton = document.getElementById('toggle-font');
    let isGalacticFontActive = false;

    // Make the toggle button always show in the opposite font of the current page
    toggleFontButton.classList.add('opposite-font');

    toggleFontButton.addEventListener('click', (e) => {
        e.preventDefault();
        isGalacticFontActive = !isGalacticFontActive;  // Toggle the state

        if (isGalacticFontActive) {
            // Switch main text to Galactic
            document.documentElement.style.setProperty('--current-font', 'GalacticAlphabet, sans-serif');
            // Switch button text to Minecraftia (the opposite)
            document.documentElement.style.setProperty('--opposite-font', 'Minecraftia, sans-serif');
            toggleFontButton.textContent = 'sga';  // Show 'sga' in Minecraftia font
        } else {
            // Switch main text back to Minecraftia
            document.documentElement.style.setProperty('--current-font', 'Minecraftia, sans-serif');
            // Switch button text to Galactic (the opposite)
            document.documentElement.style.setProperty('--opposite-font', 'GalacticAlphabet, sans-serif');
            toggleFontButton.textContent = 'sga';  // Show 'sga' in Galactic font
        }
    });
});
