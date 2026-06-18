(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  ready(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    if (navToggle) {
      navToggle.addEventListener('click', function () {
        document.body.classList.toggle('nav-open');
      });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
      var activeIndex = 0;
      var timer = null;

      function showSlide(index) {
        if (!slides.length) {
          return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === activeIndex);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          showSlide(activeIndex + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          var index = Number(dot.getAttribute('data-hero-dot') || '0');
          showSlide(index);
          start();
        });
      });

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      showSlide(0);
      start();
    }

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
      var section = form.closest('main') || document;
      var list = section.querySelector('[data-filter-list]');
      var empty = section.querySelector('[data-filter-empty]');
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];

      function applyFilter() {
        var formData = new FormData(form);
        var keyword = normalize(formData.get('q'));
        var region = normalize(formData.get('region'));
        var year = normalize(formData.get('year'));
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (region && cardRegion.indexOf(region) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        applyFilter();
      });

      form.addEventListener('input', applyFilter);
      form.addEventListener('change', applyFilter);
      form.addEventListener('reset', function () {
        window.setTimeout(applyFilter, 0);
      });
    });

    document.querySelectorAll('[data-video-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('.player-cover');
      if (!video) {
        return;
      }

      var source = video.getAttribute('data-video');
      var hlsInstance = null;

      function attachVideo() {
        if (!source || video.getAttribute('data-ready') === '1') {
          return Promise.resolve();
        }

        video.setAttribute('data-ready', '1');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          return new Promise(function (resolve) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            window.setTimeout(resolve, 1200);
          });
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return Promise.resolve();
        }

        video.src = source;
        return Promise.resolve();
      }

      function playVideo() {
        attachVideo().then(function () {
          shell.classList.add('is-playing');
          var attempt = video.play();
          if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {
              shell.classList.remove('is-playing');
            });
          }
        });
      }

      if (cover) {
        cover.addEventListener('click', playVideo);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          shell.classList.remove('is-playing');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
