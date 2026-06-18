(function () {
  window.setupPlayer = function (config) {
    const video = document.getElementById(config.videoId);
    const trigger = document.getElementById(config.triggerId);
    const source = config.source;
    const Hls = window.Hls;
    let loaded = false;
    let hls = null;

    if (!video || !trigger || !source) {
      return;
    }

    const load = () => {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    const start = () => {
      load();
      trigger.classList.add("is-hidden");
      video.controls = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    trigger.addEventListener("click", start);
    video.addEventListener("play", () => {
      trigger.classList.add("is-hidden");
    });
    video.addEventListener("error", () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      loaded = false;
    });
  };
})();
