(function () {
    "use strict";

    var video = document.getElementById("background");
    var slider = document.getElementById("volume-slider");
    var box = document.getElementById("volume");
    var btn = document.getElementById("mute-toggle");
    var brand = document.getElementById("brand");
    var lastVolume = 0.5;

    // Phones only autoplay muted, inline video; retry on first touch if blocked.
    function tryPlay() {
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
    }
    video.muted = true;
    tryPlay();
    document.addEventListener("touchstart", tryPlay, { once: true, passive: true });
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) tryPlay();
    });

    function setVolume(v) {
        v = Math.max(0, Math.min(1, v));
        slider.value = v;
        slider.style.setProperty("--fill", v * 100 + "%");
        video.volume = v;
        video.muted = v === 0;
        box.classList.toggle("muted", v === 0);
        btn.setAttribute("aria-label", v === 0 ? "Unmute" : "Mute");
        if (v > 0) { lastVolume = v; tryPlay(); }
    }

    slider.addEventListener("input", function () { setVolume(parseFloat(this.value)); });
    btn.addEventListener("click", function () { setVolume(video.muted ? lastVolume : 0); });
    setVolume(0);

    // Typing tagline
    var lines = ["yarnserene", "♪ diegointhedark - 500pts", "$ yarnserene.com"];
    var li = 0, ci = lines[0].length, deleting = true;
    function tick() {
        var text = lines[li];
        if (deleting) {
            ci--;
            if (ci <= 0) { deleting = false; li = (li + 1) % lines.length; }
        } else {
            ci++;
            if (ci >= lines[li].length) { deleting = true; brand.textContent = lines[li]; return setTimeout(tick, 2200); }
        }
        brand.textContent = lines[li].slice(0, Math.max(ci, 0)) || " ";
        setTimeout(tick, deleting ? 35 : 70);
    }
    setTimeout(tick, 2200);
})();
