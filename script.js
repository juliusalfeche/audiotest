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
        // Only disable buttons that aren't the currently active one
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
        // Create a temporary GainNode for a smooth stop
        const gainNode = audioContext.createGain();
        oscillator.disconnect();
        panner.disconnect();

        // Reconnect for fade out
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const now = audioContext.currentTime;
        // Exponentially ramp the gain to near silent over 0.1 seconds
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

        // Stop the oscillator after the ramp finishes
        oscillator.stop(now + 0.1);

        // Clean up references
        oscillator = null;
        panner = null;

        // Close the context and re-enable controls after the tone stops
        setTimeout(() => {
            if (audioContext) {
                audioContext.close();
                audioContext = null;
            }
            enableAllControls();
        }, 150);
    } else {
        // Ensure controls are re-enabled even if audio wasn't fully running
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
    // Stop the tone if the same channel button is clicked (toggle behavior)
    if (audioContext && currentPanValue === panValue) {
        stopTone();
        return;
    }

    // Stop any currently playing tone (switching channel or preparing new tone)
    stopTone();

    // Set the new pan value tracker
    currentPanValue = panValue;

    // Create a new AudioContext
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // 1. Create OscillatorNode (tone source)
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    // 2. Create StereoPannerNode
    panner = audioContext.createStereoPanner();
    panner.pan.setValueAtTime(panValue, audioContext.currentTime);

    // 3. Connect the nodes: Oscillator -> Panner -> Destination (speakers)
    oscillator.connect(panner).connect(audioContext.destination);

    // 4. Start the tone
    oscillator.start();

    // 5. Update UI state
    targetButton.classList.add('active');
    disableAllControls();

    // The tone will automatically stop after 1 second
    setTimeout(stopTone, 500);
}


/* --- Event Listeners --- */

document.addEventListener('DOMContentLoaded', () => {
    const controls = document.querySelector('.controls');

    // Use event delegation for all test buttons
    controls.addEventListener('click', (event) => {
        const target = event.target;

        if (target.hasAttribute('data-pan')) {
            const panValue = parseFloat(target.getAttribute('data-pan'));
            startTone(panValue, target);
        }
    });
});