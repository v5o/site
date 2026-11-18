(function () {
    "use strict";

    var video = document.getElementById("background");
    var slider = document.getElementById("volume-slider");
    var box = document.getElementById("volume");
    var btn = document.getElementById("mute-toggle");
    var brand = document.getElementById("brand");
    var lastVolume = 0.5;

    var DEFAULT_VOLUME = 0.4;
    var waitingForGesture = false;

    function tryPlay() {
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
        return p;
    }

    function setVolume(v) {
        v = Math.max(0, Math.min(1, v));
        waitingForGesture = false;
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

    // Start with sound on. Browsers that block unmuted autoplay get a muted
    // start instead, and the sound comes on with the visitor's first tap/click/key.
    setVolume(DEFAULT_VOLUME);
    var first = video.play();
    if (first && first.catch) {
        first.catch(function () {
            video.muted = true;
            waitingForGesture = true;
            box.classList.add("muted");
            btn.setAttribute("aria-label", "Unmute");
            tryPlay();
        });
    }
    function unlock(e) {
        if (!waitingForGesture) return;
        if (e && e.target && box.contains(e.target)) return; // the volume controls handle themselves
        video.muted = false;
        var p = video.play();
        if (p && p.then) {
            p.then(function () { if (waitingForGesture) setVolume(lastVolume); })
             .catch(function () { if (waitingForGesture) video.muted = true; });
        } else {
            setVolume(lastVolume);
        }
    }
    ["pointerdown", "touchstart", "keydown", "click"].forEach(function (t) {
        document.addEventListener(t, unlock, { capture: true, passive: true });
    });
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) tryPlay();
    });

    // Discord: copy username instead of opening a link
    var toast = document.getElementById("toast");
    var toastTimer;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1800);
    }
    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text).catch(function () { return fallbackCopy(text); });
        }
        return Promise.resolve(fallbackCopy(text));
    }
    function fallbackCopy(text) {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, text.length);
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
    }
    var discord = document.getElementById("discord-copy");
    if (discord) {
        discord.addEventListener("click", function () {
            var name = discord.getAttribute("data-copy");
            copyText(name).then(function () {
                showToast("copied “" + name + "” to clipboard");
                discord.classList.add("copied");
                setTimeout(function () { discord.classList.remove("copied"); }, 1200);
            });
        });
    }

    // Right-click: block the menu and pop the lock icon at the cursor
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        var img = document.createElement("img");
        img.src = "assets/icons/favicon.ico";
        img.alt = "";
        img.className = "lock-pop";
        img.style.left = e.pageX + "px";
        img.style.top = e.pageY + "px";
        document.body.appendChild(img);
        setTimeout(function () { img.remove(); }, 650);
    });

    // Typing tagline
    var song = (window.currentVideo && window.currentVideo.title) || "diegointhedark - 500pts";
    var lines = ["$ yarnserene.com", "♪ " + song];
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
