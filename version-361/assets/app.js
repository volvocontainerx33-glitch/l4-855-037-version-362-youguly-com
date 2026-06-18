(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-genre') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupSearch() {
    var inputs = document.querySelectorAll('[data-search-input]');
    if (!inputs.length) return;
    inputs.forEach(function (input) {
      var scope = input.closest('section') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
      }
      var activeFilter = 'all';
      var row = scope.querySelector('[data-filter-row]');
      function apply() {
        var q = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var hay = textOf(card);
          var matchText = !q || hay.indexOf(q) !== -1;
          var matchFilter = activeFilter === 'all' || hay.indexOf(activeFilter.toLowerCase()) !== -1;
          card.classList.toggle('is-hidden', !(matchText && matchFilter));
        });
      }
      input.addEventListener('input', apply);
      if (row) {
        row.querySelectorAll('[data-filter]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            row.querySelectorAll('[data-filter]').forEach(function (item) {
              item.classList.remove('active');
            });
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter') || 'all';
            apply();
          });
        });
      }
      var form = input.closest('form');
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          apply();
          var first = document.querySelector('[data-card]:not(.is-hidden)');
          if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    });
  }

  function setupPlayers() {
    document.querySelectorAll('.movie-player').forEach(function (box) {
      var video = box.querySelector('video[data-stream]');
      var overlay = box.querySelector('.play-overlay');
      if (!video || !overlay) return;
      var stream = video.getAttribute('data-stream');
      var attached = false;
      function attach() {
        if (attached) return;
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          box.hlsPlayer = hls;
          return;
        }
        video.src = stream;
      }
      function play(event) {
        if (event) event.preventDefault();
        attach();
        overlay.classList.add('is-hidden');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      }
      overlay.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) play();
      });
      video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
      });
      video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
      });
    });
  }

  ready(function () {
    setupMenu();
    setupSearch();
    setupPlayers();
  });
})();
