(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var sourceElement = video ? video.querySelector('source') : null;
        var source = sourceElement ? sourceElement.getAttribute('src') : '';
        var initialized = false;

        var attachSource = function () {
            if (!video || !source || initialized) {
                return;
            }

            initialized = true;

            if (sourceElement && sourceElement.parentNode) {
                sourceElement.parentNode.removeChild(sourceElement);
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                player.hlsInstance = hls;
            } else {
                video.src = source;
            }
        };

        var play = function () {
            attachSource();

            if (button) {
                button.classList.add('is-hidden');
            }

            var playResult = video.play();

            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        };

        if (button && video) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!initialized) {
                    play();
                }
            });
        }
    });
})();
