(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function() {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var show = function(index) {
        current = index;
        slides.forEach(function(slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      };
      dots.forEach(function(dot, index) {
        dot.addEventListener("click", function() {
          show(index);
        });
      });
      if (slides.length > 1) {
        setInterval(function() {
          show((current + 1) % slides.length);
        }, 5200);
      }
    }

    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";
    var keywordInput = document.querySelector("[data-filter-keyword]");
    if (keywordInput && queryValue) {
      keywordInput.value = queryValue;
    }

    var scope = document.querySelector("[data-filter-scope]");
    if (scope) {
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .list-card"));
      var yearInput = document.querySelector("[data-filter-year]");
      var typeInput = document.querySelector("[data-filter-type]");
      var regionInput = document.querySelector("[data-filter-region]");
      var apply = function() {
        var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
        var year = yearInput ? yearInput.value : "";
        var type = typeInput ? typeInput.value : "";
        var region = regionInput ? regionInput.value : "";
        cards.forEach(function(card) {
          var text = card.textContent.toLowerCase();
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (year && card.getAttribute("data-year") !== year) {
            matched = false;
          }
          if (type && card.getAttribute("data-type") !== type) {
            matched = false;
          }
          if (region && card.getAttribute("data-region") !== region) {
            matched = false;
          }
          card.classList.toggle("is-hidden", !matched);
        });
      };
      [keywordInput, yearInput, typeInput, regionInput].forEach(function(input) {
        if (input) {
          input.addEventListener("input", apply);
          input.addEventListener("change", apply);
        }
      });
      apply();
    }
  });

  window.setupMoviePlayer = function(videoId, overlayId, url) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !url) {
      return;
    }

    var started = false;
    var bind = function() {
      if (started) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      started = true;
    };

    var play = function() {
      bind();
      overlay.classList.add("is-hidden");
      video.controls = true;
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function() {
          overlay.classList.remove("is-hidden");
        });
      }
    };

    overlay.addEventListener("click", play);
    video.addEventListener("click", function() {
      if (!started || video.paused) {
        play();
      }
    });
    video.addEventListener("play", function() {
      overlay.classList.add("is-hidden");
    });
  };
})();
