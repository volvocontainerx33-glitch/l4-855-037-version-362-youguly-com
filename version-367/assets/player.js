(function () {
  var cover = document.querySelector("[data-player-cover]");
  var video = document.querySelector("[data-player-video]");

  if (!cover || !video) {
    return;
  }

  var url = video.getAttribute("data-url");
  var started = false;
  var hlsInstance = null;

  function start() {
    if (started) {
      video.play();
      return;
    }

    started = true;
    cover.classList.add("hidden");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", function () {
        video.play();
      }, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
          return;
        }

        hlsInstance.destroy();
      });
      return;
    }

    video.src = url;
    video.play();
  }

  cover.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!started) {
      start();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
