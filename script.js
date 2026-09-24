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

// Local signature for the social contract.
(() => {
    "use strict";

    const form = document.querySelector("#contract-signature-form");
    const input = document.querySelector("#signature-name");
    const feedback = document.querySelector("#signature-feedback");
    const signedState = document.querySelector("#signature-signed-state");
    if (!form || !input || !feedback || !signedState) return;

    // Keep the existing key so signatures saved by the previous version still count.
    const STORAGE_KEY = "mistelar-contract-signatures-v1";

    const cleanName = (value) => value
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 60);

    const readSignature = () => {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            const candidates = Array.isArray(stored) ? stored : [stored];

            for (const value of candidates) {
                if (typeof value !== "string") continue;
                const name = cleanName(value);
                if (name) return name;
            }

            return "";
        } catch (_) {
            feedback.textContent = "No se pudo leer la firma guardada en este navegador.";
            return "";
        }
    };

    const saveSignature = (name) => {
        try {
            // Preserve the previous array format for backwards compatibility.
            localStorage.setItem(STORAGE_KEY, JSON.stringify([name]));
            return true;
        } catch (_) {
            feedback.textContent = "Este navegador no permite guardar la firma.";
            return false;
        }
    };

    const renderSignatureState = (name) => {
        const hasSigned = Boolean(name);
        form.hidden = hasSigned;
        signedState.hidden = !hasSigned;
    };

    let signature = readSignature();
    renderSignatureState(signature);

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = cleanName(input.value);

        if (!name) {
            feedback.textContent = "Escribe un nombre antes de firmar.";
            input.focus();
            return;
        }

        if (!saveSignature(name)) return;

        signature = name;
        form.reset();
        renderSignatureState(signature);
    });

    window.addEventListener("storage", (event) => {
        if (event.key !== STORAGE_KEY) return;
        signature = readSignature();
        renderSignatureState(signature);

        if (!signature) {
            feedback.textContent = "La firma guardada se ha eliminado en otra pestaña.";
        }
    });
})();

// Background music player.
(() => {
    "use strict";

    const toggle = document.querySelector("#music-toggle");
    const volume = document.querySelector("#music-volume");
    const status = document.querySelector("#music-status");
    const audio = document.querySelector("#background-music");
    if (!toggle || !volume || !status || !audio) return;

    const FADE_DURATION = 1500;
    let fadeFrame = 0;
    let scrollStartPending = false;
    let scrollStartDone = false;

    try {
        const saved = localStorage.getItem("mistelar-music-volume");
        if (saved !== null && Number.isFinite(Number(saved))) {
            volume.value = String(Math.max(0, Math.min(100, Number(saved))));
        }
    } catch (_) { /* Music still works when storage is unavailable. */ }

    const targetVolume = () => Number(volume.value) / 100;

    const cancelFade = () => {
        if (fadeFrame) cancelAnimationFrame(fadeFrame);
        fadeFrame = 0;
    };

    const fadeTo = (target, duration = FADE_DURATION) => new Promise((resolve) => {
        cancelFade();

        const from = audio.volume;
        const startedAt = performance.now();

        const step = (now) => {
            const progress = Math.min(1, (now - startedAt) / duration);
            const eased = progress * (2 - progress);
            audio.volume = Math.max(0, Math.min(1, from + (target - from) * eased));

            if (progress < 1) {
                fadeFrame = requestAnimationFrame(step);
            } else {
                fadeFrame = 0;
                resolve();
            }
        };

        fadeFrame = requestAnimationFrame(step);
    });

    const syncPlayingState = () => {
        const playing = !audio.paused;
        toggle.setAttribute("aria-pressed", String(playing));
        toggle.textContent = playing ? "Pausar" : "Reproducir";
        status.textContent = playing ? "Reproduciendo Dawntrail" : "Música en pausa.";
    };

    const removeStartListeners = () => {
        window.removeEventListener("scroll", startOnScroll);
        window.removeEventListener("wheel", startOnScroll);
        window.removeEventListener("touchmove", startOnScroll);
        document.removeEventListener("click", startOnFirstClick);
    };

    const fadeInAndPlay = async () => {
        cancelFade();
        audio.volume = 0;
        await audio.play();
        syncPlayingState();
        await fadeTo(targetVolume());
    };

    const fadeOutAndPause = async () => {
        if (audio.paused) return;
        await fadeTo(0);
        audio.pause();
        syncPlayingState();
    };

    const startAudioFromInteraction = async () => {
        if (scrollStartDone || scrollStartPending || !audio.paused) return;

        scrollStartPending = true;
        try {
            await fadeInAndPlay();
            scrollStartDone = true;
            removeStartListeners();
        } catch (_) {
            status.textContent = "El navegador bloqueó el inicio automático. Pulsa Reproducir.";
        } finally {
            scrollStartPending = false;
        }
    };

    const startOnScroll = async () => {
        await startAudioFromInteraction();
    };

    const startOnFirstClick = async (event) => {
        if (event.target.closest(".music-player")) return;
        await startAudioFromInteraction();
    };

    audio.volume = 0;
    toggle.disabled = false;
    volume.disabled = false;
    status.textContent = "Dawntrail · LoFi · Interactúa para iniciar";

    window.addEventListener("scroll", startOnScroll, { passive: true });
    window.addEventListener("wheel", startOnScroll, { passive: true });
    window.addEventListener("touchmove", startOnScroll, { passive: true });
    document.addEventListener("click", startOnFirstClick);

    toggle.addEventListener("click", async () => {
        toggle.disabled = true;
        try {
            if (audio.paused) {
                await fadeInAndPlay();
            } else {
                await fadeOutAndPause();
            }
        } catch (_) {
            status.textContent = "No se pudo iniciar la música.";
        } finally {
            toggle.disabled = false;
        }
    });

    volume.addEventListener("input", () => {
        cancelFade();
        if (!audio.paused) audio.volume = targetVolume();
        try {
            localStorage.setItem("mistelar-music-volume", volume.value);
        } catch (_) { /* Saving preferences is optional. */ }
    });

    audio.addEventListener("play", () => {
        scrollStartDone = true;
        removeStartListeners();
        syncPlayingState();
    });

    audio.addEventListener("pause", syncPlayingState);

    audio.addEventListener("error", () => {
        cancelFade();
        toggle.disabled = true;
        status.textContent = "No se pudo cargar Dawntrail.";
    });

    window.addEventListener("pagehide", () => {
        removeStartListeners();
        cancelFade();
        audio.pause();
    });
})();

// Introduction image showcase.
(() => {
    "use strict";

    const showcase = document.querySelector("[data-showcase]");
    if (!showcase) return;

    const slides = Array.from(showcase.querySelectorAll("[data-showcase-slide]"));
    const indicators = Array.from(showcase.querySelectorAll(".showcase-indicators span"));
    const toggle = showcase.querySelector("[data-showcase-toggle]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (slides.length < 2 || !toggle) return;

    const INTERVAL = 1000;
    let currentSlide = 0;
    let intervalId = 0;
    let paused = reduceMotion;

    const renderSlide = (nextSlide) => {
        currentSlide = nextSlide;

        slides.forEach((slide, index) => {
            const isActive = index === currentSlide;
            slide.classList.toggle("is-active", isActive);
            slide.setAttribute("aria-hidden", String(!isActive));
            indicators[index]?.classList.toggle("is-active", isActive);
        });
    };

    const stopRotation = () => {
        if (!intervalId) return;
        window.clearInterval(intervalId);
        intervalId = 0;
    };

    const startRotation = () => {
        if (paused || document.hidden || intervalId) return;
        intervalId = window.setInterval(() => {
            renderSlide((currentSlide + 1) % slides.length);
        }, INTERVAL);
    };

    const syncToggle = () => {
        toggle.textContent = paused ? "Reanudar galería" : "Pausar galería";
        toggle.setAttribute("aria-pressed", String(paused));
    };

    if (reduceMotion) {
        toggle.hidden = true;
    } else {
        syncToggle();
        startRotation();

        toggle.addEventListener("click", () => {
            paused = !paused;
            syncToggle();
            if (paused) stopRotation();
            else startRotation();
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) stopRotation();
            else startRotation();
        });

        window.addEventListener("pagehide", stopRotation, { once: true });
    }
})();
