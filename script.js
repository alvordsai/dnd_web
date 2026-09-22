(() => {
    "use strict";

    const header = document.querySelector(".site-header");
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll("[data-year]").forEach((element) => {
        element.textContent = new Date().getFullYear();
    });

    const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (navToggle && navLinks) {
        const closeMenu = () => {
            navToggle.setAttribute("aria-expanded", "false");
            navLinks.classList.remove("is-open");
            document.body.style.overflow = "";
        };

        navToggle.addEventListener("click", () => {
            const willOpen = navToggle.getAttribute("aria-expanded") !== "true";
            navToggle.setAttribute("aria-expanded", String(willOpen));
            navLinks.classList.toggle("is-open", willOpen);
            document.body.style.overflow = willOpen ? "hidden" : "";
        });

        navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeMenu();
        });
    }

    const revealElements = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => element.classList.add("is-visible"));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.13 });
        revealElements.forEach((element) => revealObserver.observe(element));
    }

    document.querySelectorAll(".boton").forEach((button) => {
        button.addEventListener("pointermove", (event) => {
            const bounds = button.getBoundingClientRect();
            button.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
            button.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
        });
    });

    const canvas = document.querySelector(".starfield");
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let stars = [];
    let animationFrame = 0;
    let lastTime = 0;

    const createStars = () => {
        const starCount = Math.min(180, Math.floor((width * height) / 9000));
        stars = Array.from({ length: starCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.35 + 0.2,
            alpha: Math.random() * 0.65 + 0.2,
            speed: Math.random() * 0.012 + 0.003,
            phase: Math.random() * Math.PI * 2,
            tint: Math.random() > 0.82 ? "182, 147, 255" : "180, 236, 244"
        }));
    };

    const resizeCanvas = () => {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * pixelRatio);
        canvas.height = Math.floor(height * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        createStars();
    };

    const drawStars = (time = 0) => {
        context.clearRect(0, 0, width, height);
        const elapsed = Math.min(time - lastTime, 40);
        lastTime = time;
        stars.forEach((star) => {
            const pulse = reduceMotion ? 1 : 0.66 + Math.sin(time * star.speed + star.phase) * 0.34;
            context.beginPath();
            context.fillStyle = `rgba(${star.tint}, ${star.alpha * pulse})`;
            context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            context.fill();
            if (!reduceMotion) {
                star.y += elapsed * star.speed * 0.025;
                if (star.y > height + 2) star.y = -2;
            }
        });
        if (!reduceMotion) animationFrame = requestAnimationFrame(drawStars);
    };

    resizeCanvas();
    drawStars();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("pagehide", () => cancelAnimationFrame(animationFrame), { once: true });
})();

// Original ambient loop: generated in the browser, so it needs no audio download.
(() => {
    "use strict";

    const toggle = document.querySelector("#music-toggle");
    const volume = document.querySelector("#music-volume");
    const status = document.querySelector("#music-status");
    if (!toggle || !volume || !status) return;

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

    const note = (midi, time, duration, gain) => {
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
    };

    const schedule = () => {
        nextNote = Math.max(nextNote, context.currentTime);
        while (nextNote < context.currentTime + 0.2) {
            note(melody[step % melody.length], nextNote, 1.8, 0.35);
            if (step % 4 === 0) note(step % 16 < 8 ? 48 : 45, nextNote, 3.8, 0.3);
            step += 1;
            nextNote += 0.75;
        }
    };

    const pause = () => {
        clearInterval(timer);
        voices.forEach((voice) => voice.stop());
        playing = false;
        toggle.setAttribute("aria-pressed", "false");
        toggle.textContent = "Reproducir";
        status.textContent = "Música en pausa.";
    };

    toggle.disabled = false;
    volume.disabled = false;
    status.textContent = "Melodía ambiental";

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
            toggle.textContent = "Pausar";
            status.textContent = "Reproduciendo";
        } catch (_) {
            pause();
            status.textContent = "No se pudo iniciar la música.";
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
