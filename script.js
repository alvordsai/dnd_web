// Original ambient loop, generated locally: no audio downloads required.
(() => {
    const toggle = document.querySelector("#music-toggle");
    const volume = document.querySelector("#music-volume");
    const status = document.querySelector("#music-status");
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
        status.textContent = "Tu navegador no admite esta música.";
        return;
    }

    let context;
    let master;
    let timer;
    let nextNote = 0;
    let step = 0;
    let playing = false;
    const voices = new Set();
    const melody = [60, 64, 67, 71, 69, 67, 64, 62, 57, 60, 64, 67, 65, 64, 62, 59];
    try {
        const saved = localStorage.getItem("mistelar-music-volume");
        if (saved !== null && Number.isFinite(Number(saved))) {
            volume.value = String(Math.max(0, Math.min(100, Number(saved))));
        }
    } catch (_) { /* Music still works when storage is unavailable. */ }

    const level = () => Number(volume.value) / 100 * 0.25;
    function note(midi, time, duration, gain) {
        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
        envelope.gain.setValueAtTime(0, time);
        envelope.gain.linearRampToValueAtTime(gain, time + 0.08);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + duration);
        oscillator.connect(envelope);
        envelope.connect(master);
        voices.add(oscillator);
        oscillator.onended = () => {
            voices.delete(oscillator);
            oscillator.disconnect();
            envelope.disconnect();
        };
        oscillator.start(time);
        oscillator.stop(time + duration + 0.02);
    }

    function schedule() {
        // Skip missed time after a throttled tab instead of queuing a burst.
        nextNote = Math.max(nextNote, context.currentTime);
        while (nextNote < context.currentTime + 0.2) {
            note(melody[step % melody.length], nextNote, 1.8, 0.35);
            if (step % 4 === 0) {
                note(step % 16 < 8 ? 48 : 45, nextNote, 3.8, 0.3);
            }
            step += 1;
            nextNote += 0.75;
        }
    }

    function pause() {
        clearInterval(timer);
        for (const voice of voices) voice.stop();
        playing = false;
        toggle.setAttribute("aria-pressed", "false");
        toggle.textContent = "Reproducir música";
        status.textContent = "Música en pausa.";
    }

    toggle.disabled = false;
    volume.disabled = false;
    status.textContent = "Un mismo cielo · melodía ambiental";
    toggle.addEventListener("click", async () => {
        if (playing) {
            pause();
            return;
        }
        toggle.disabled = true;
        try {
            if (!context) {
                context = new AudioContext();
                master = context.createGain();
                master.connect(context.destination);
                context.addEventListener("statechange", () => {
                    if (playing && context.state !== "running") pause();
                });
            }
            await context.resume();
            if (context.state !== "running") throw new Error("Audio unavailable");
            master.gain.setValueAtTime(level(), context.currentTime);
            nextNote = context.currentTime + 0.05;
            schedule();
            timer = setInterval(schedule, 100);
            playing = true;
            toggle.setAttribute("aria-pressed", "true");
            toggle.textContent = "Pausar música";
            status.textContent = "Reproduciendo: Un mismo cielo";
        } catch (_) {
            pause();
            status.textContent = "No se pudo iniciar la música. Inténtalo de nuevo.";
        } finally {
            toggle.disabled = false;
        }
    });
    volume.addEventListener("input", () => {
        if (master) master.gain.setTargetAtTime(level(), context.currentTime, 0.05);
        try {
            localStorage.setItem("mistelar-music-volume", volume.value);
        } catch (_) { /* Saving preferences is optional. */ }
    });
    window.addEventListener("pagehide", pause);
})();
