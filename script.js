/* --- Global Variables and Constants --- */
let audioContext = null;
let oscillator = null;
let panner = null;
let currentPanValue = null;
const frequency = 440;

/* --- UI Control Functions --- */

function deactivateAllButtons() {
    document.querySelectorAll('.controls button').forEach(btn => {
        btn.classList.remove('active');
    });
}

function enableAllControls() {
    document.querySelectorAll('.controls button').forEach(btn => {
        btn.disabled = false;
    });
}

function disableAllControls() {
    document.querySelectorAll('.controls button').forEach(btn => {
        if (!btn.classList.contains('active')) {
            btn.disabled = true;
        }
    });
}

/* --- Audio Core Logic --- */

function stopTone() {
    deactivateAllButtons();
    currentPanValue = null;

    if (oscillator && audioContext) {
        const gainNode = audioContext.createGain();
        oscillator.disconnect();
        panner.disconnect();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

        oscillator.stop(now + 0.1);

        oscillator = null;
        panner = null;

        setTimeout(() => {
            if (audioContext) {
                audioContext.close();
                audioContext = null;
            }
            enableAllControls();
        }, 150);
    } else {
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
        enableAllControls();
    }
}

/**
 * Starts a tone with the specified stereo panning value.
 * @param {number} panValue - The panning value: -1 (Left), 0 (Center/Both), 1 (Right).
 * @param {HTMLElement} targetButton - The button element that was clicked.
 */
function startTone(panValue, targetButton) {
    if (audioContext && currentPanValue === panValue) {
        stopTone();
        return;
    }

    stopTone();

    currentPanValue = panValue;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    panner = audioContext.createStereoPanner();
    panner.pan.setValueAtTime(panValue, audioContext.currentTime);

    oscillator.connect(panner).connect(audioContext.destination);

    oscillator.start();

    targetButton.classList.add('active');
    disableAllControls();

    setTimeout(stopTone, 500);
}


/* --- Event Listeners --- */

document.addEventListener('DOMContentLoaded', () => {
    const controls = document.querySelector('.controls');

    controls.addEventListener('click', (event) => {
        const target = event.target;

        if (target.hasAttribute('data-pan')) {
            const panValue = parseFloat(target.getAttribute('data-pan'));
            startTone(panValue, target);
        }
    });
});