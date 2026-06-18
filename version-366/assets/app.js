(function () {
  function closest(root, selector) {
    return root ? root.querySelector(selector) : null;
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var backdrop = root.querySelector('[data-hero-backdrop]');
    var next = root.querySelector('[data-hero-next]');
    var prev = root.querySelector('[data-hero-prev]');
    var current = 0;

    function imageOf(slide) {
      var image = slide ? slide.querySelector('.hero-poster img') : null;
      return image ? image.getAttribute('src') : '';
    }

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
      if (backdrop) {
        backdrop.style.backgroundImage = "url('" + imageOf(slides[current]) + "')";
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }
    window.setInterval(function () {
      show(current + 1);
    }, 6000);
  }

  function initFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
    roots.forEach(function (root) {
      var input = closest(root, '[data-search-input]');
      var buttons = Array.prototype.slice.call(root.querySelectorAll('[data-filter-button]'));
      var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
      var empty = closest(root, '[data-no-results]');
      var active = 'all';

      function matchesFilter(card) {
        if (active === 'all') {
          return true;
        }
        var parts = active.split(':');
        var key = parts[0];
        var value = parts.slice(1).join(':');
        if (key === 'category') {
          return card.getAttribute('data-category') === value;
        }
        if (key === 'region') {
          return card.getAttribute('data-region') === value;
        }
        if (key === 'type') {
          return card.getAttribute('data-type') === value;
        }
        return true;
      }

      function update() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var shown = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var ok = (!q || text.indexOf(q) !== -1) && matchesFilter(card);
          card.style.display = ok ? '' : 'none';
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', shown === 0);
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          active = button.getAttribute('data-filter') || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          update();
        });
      });
      if (input) {
        input.addEventListener('input', update);
      }
      update();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var trigger = player.querySelector('[data-play]');
      var src = player.getAttribute('data-video') || (video ? video.getAttribute('data-video') : '');
      var hls = null;

      if (!video || !src) {
        return;
      }

      function attach() {
        if (video.getAttribute('data-ready') === '1') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
        video.setAttribute('data-ready', '1');
      }

      function play() {
        attach();
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (trigger) {
        trigger.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
