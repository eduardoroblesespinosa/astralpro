document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.app-section');
    const navButtons = document.querySelectorAll('.nav-btn');
    const nextStepButtons = document.querySelectorAll('.next-step-btn');
    
    const warningScreen = document.getElementById('safety-warning');
    const acceptWarningBtn = document.getElementById('accept-warning-btn');
    const mainContent = document.getElementById('main-content');
    const mainNav = document.getElementById('main-nav');

    let audioContext;
    let binauralSource;
    let isBinauralPlaying = false;
    const logbook = [];

    // --- Initial Setup ---

    acceptWarningBtn.addEventListener('click', () => {
        warningScreen.style.opacity = '0';
        setTimeout(() => {
            warningScreen.style.display = 'none';
            mainContent.style.display = 'block';
            mainNav.style.display = 'block';
        }, 500);
    });

    // --- Navigation ---
    
    function navigateTo(sectionId) {
        // Stop any ongoing processes from the previous section
        if (isBinauralPlaying) {
            stopBinauralBeats();
        }

        sections.forEach(section => {
            section.classList.remove('active');
        });
        const newSection = document.getElementById(sectionId);
        if (newSection) {
            newSection.classList.add('active');
        } else {
            document.getElementById('home-section').classList.add('active'); // Fallback
        }

        // Run setup for the new section
        if (sectionId === 'breathing-section') {
            const breathingText = document.querySelector('.breathing-text');
            updateBreathingText(breathingText);
        }
    }

    document.getElementById('start-journey-btn').addEventListener('click', () => {
        navigateTo('preparation-section');
    });

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            navigateTo(sectionId);
        });
    });

    nextStepButtons.forEach(button => {
        button.addEventListener('click', () => {
            const nextSectionId = button.getAttribute('data-next');
            navigateTo(nextSectionId);
        });
    });

    // --- Section-specific Logic ---

    // 2. Preparation Section
    const checklistItems = document.querySelectorAll('#preparation-section .checklist input[type="checkbox"]');
    const prepNextBtn = document.querySelector('#preparation-section .next-step-btn');

    checklistItems.forEach(item => {
        item.addEventListener('change', () => {
            const allChecked = Array.from(checklistItems).every(i => i.checked);
            prepNextBtn.disabled = !allChecked;
        });
    });
    
    // 3. Breathing Section
    function updateBreathingText(element) {
        let state = 0;
        const states = ['Inhale', 'Hold', 'Exhale', 'Hold'];
        element.textContent = states[state];
        setInterval(() => {
            state = (state + 1) % 4;
            element.textContent = states[state];
        }, 4000); // 4 seconds per state
    }


    // 4. Separation Section
    const playBinauralBtn = document.getElementById('play-binaural-btn');
    const binauralStatus = document.getElementById('binaural-status');
    const emergencyReturnBtn = document.getElementById('emergency-return-btn');

    function createBinauralBeats() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (binauralSource) {
            binauralSource.stop();
        }

        const baseFreq = 100; // Carrier frequency in Hz
        const beatFreq = 4; // Target brainwave frequency (Theta)

        // Create two oscillators
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq - (beatFreq / 2), audioContext.currentTime);
        osc2.frequency.setValueAtTime(baseFreq + (beatFreq / 2), audioContext.currentTime);

        // Pan one to the left, one to the right
        const panner1 = audioContext.createStereoPanner();
        const panner2 = audioContext.createStereoPanner();
        panner1.pan.setValueAtTime(-1, audioContext.currentTime);
        panner2.pan.setValueAtTime(1, audioContext.currentTime);

        // Control volume
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Low volume

        // Connect nodes
        osc1.connect(panner1).connect(gainNode);
        osc2.connect(panner2).connect(gainNode);
        gainNode.connect(audioContext.destination);

        binauralSource = { osc1, osc2 };
        osc1.start();
        osc2.start();
        isBinauralPlaying = true;
        
        binauralStatus.textContent = 'Status: Active - 4Hz Theta';
        playBinauralBtn.textContent = 'Stop Binaural Beats';
    }

    function stopBinauralBeats() {
        if (binauralSource) {
            binauralSource.osc1.stop();
            binauralSource.osc2.stop();
            binauralSource = null;
        }
        isBinauralPlaying = false;
        binauralStatus.textContent = 'Status: Inactive';
        playBinauralBtn.textContent = 'Play 4Hz Theta Waves';
    }

    playBinauralBtn.addEventListener('click', () => {
        if (isBinauralPlaying) {
            stopBinauralBeats();
        } else {
            createBinauralBeats();
        }
    });

    emergencyReturnBtn.addEventListener('click', () => {
        navigateTo('return-section');
        alert("Returning immediately. Focus on your physical body. You are safe.");
    });
    
    // 6. Safe Return
    const saveLogBtn = document.getElementById('save-log-btn');
    const astralLogTextarea = document.getElementById('astral-log');
    const logbookEntriesDiv = document.getElementById('logbook-entries');

    saveLogBtn.addEventListener('click', () => {
        const entryText = astralLogTextarea.value;
        if (entryText.trim() === '') {
            alert('Please write something about your experience.');
            return;
        }
        
        const now = new Date();
        logbook.push({
            date: now.toLocaleString(),
            text: entryText
        });
        
        alert('Experience saved to logbook.');
        astralLogTextarea.value = '';
        updateLogbookDisplay();
    });

    function updateLogbookDisplay() {
        logbookEntriesDiv.innerHTML = '';
        if (logbook.length === 0) {
            logbookEntriesDiv.innerHTML = '<p>Your saved experiences will appear here.</p>';
            return;
        }
        
        logbook.forEach(entry => {
            const entryEl = document.createElement('div');
            entryEl.className = 'instruction-card';
            entryEl.innerHTML = `
                <h3>${entry.date}</h3>
                <p>${entry.text}</p>
            `;
            logbookEntriesDiv.appendChild(entryEl);
        });
    }

    // Initialize first view
    //navigateTo('home-section'); commented out to allow warning to show first
});

