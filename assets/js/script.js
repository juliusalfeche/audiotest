'use strict';

/* --- Settings --- */
const FREQUENCY_HZ = 440;   // pitch of the test tone
const TONE_MS = 500;        // how long the tone plays
const VOLUME = 0.2;         // 0 to 1. Kept low so it is safe on headphones.
const FADE_S = 0.03;        // short fade in/out so there are no clicks

/* --- State --- */
let audioContext = null;
let current = null;         // the tone that is playing right now, or null
let stopTimer = null;

const buttons = Array.from(document.querySelectorAll('.controls button'));
const statusEl = document.getElementById('status');

/* --- UI helpers --- */
function setButtons(activeButton) {
    for (const btn of buttons) {
        const isActive = btn === activeButton;
        btn.classList.toggle('active', isActive);
        btn.disabled = activeButton !== null && !isActive;
        btn.setAttribute('aria-pressed', String(isActive));
    }
}

function say(message) {
    statusEl.textContent = message;
}

/* --- Audio --- */
function getContext() {
    if (!audioContext) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audioContext = new Ctx();
    }
    return audioContext;
}

function stopTone() {
    if (!current) return;

    const { ctx, oscillator, gain, panner } = current;
    current = null;
    clearTimeout(stopTimer);
    setButtons(null);
    say('Stopped.');

    // Fade out BEFORE the panner, so the tone stays in the same ear while it fades.
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + FADE_S);
    oscillator.stop(now + FADE_S + 0.01);

    oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        panner.disconnect();
        // Release the sound device when nothing is playing.
        if (!current && ctx.state === 'running') ctx.suspend();
    };
}

async function startTone(panValue, button) {
    // Clicking the active button again stops the tone early.
    if (current) {
        stopTone();
        return;
    }

    const ctx = getContext();
    if (!ctx || typeof ctx.createStereoPanner !== 'function') {
        say('Sorry, this browser does not support the audio features this page needs.');
        return;
    }

    try {
        if (ctx.state !== 'running') await ctx.resume();
    } catch (err) {
        say('The browser blocked audio. Please press the button again.');
        return;
    }
    if (current) return; // another click won the race while resuming

    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = FREQUENCY_HZ;

    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    panner.pan.value = panValue;

    // oscillator -> gain (volume/fade) -> panner (left/right) -> speakers
    oscillator.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(VOLUME, now + FADE_S);
    oscillator.start(now);

    current = { ctx, oscillator, gain, panner };
    setButtons(button);
    say('Playing ' + button.dataset.label + '.');

    clearTimeout(stopTimer);
    stopTimer = setTimeout(stopTone, TONE_MS);
}

/* --- Wire up the page --- */
document.querySelector('.controls').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-pan]');
    if (!button || button.disabled) return;
    startTone(Number(button.dataset.pan), button);
});

document.getElementById('current-year').textContent = new Date().getFullYear();

/* --- Offline support --- */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((error) => {
            console.warn('Service worker registration failed:', error);
        });
    });
}
