(function () {
  function setupVideoPlayer(sourceUrl) {
    var video = document.querySelector('[data-video-player]');
    var layer = document.querySelector('[data-play-layer]');
    var prepared = false;
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);

        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          window.setTimeout(resolve, 1400);
        });
      }

      video.src = sourceUrl;
      return Promise.resolve();
    }

    function start() {
      prepare().then(function () {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      });

      if (layer) {
        layer.classList.add('is-hidden');
      }
    }

    if (layer) {
      layer.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!prepared || video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.setupVideoPlayer = setupVideoPlayer;
})();
