(function() {
  var currentScript = document.currentScript;
  var scriptUrl = currentScript && currentScript.src ? currentScript.src : "";
  var assetBaseUrl = scriptUrl ? new URL("./", scriptUrl).href : new URL("assets/", document.baseURI).href;
  var localHlsPromise = null;

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function rootPrefix() {
    return document.body ? document.body.getAttribute("data-root") || "" : "";
  }

  function initNavigation() {
    var button = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function() {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var backdrop = slider.querySelector("[data-hero-bg]");
    var title = slider.querySelector("[data-hero-title]");
    var desc = slider.querySelector("[data-hero-desc]");
    var meta = slider.querySelector("[data-hero-meta]");
    var link = slider.querySelector("[data-hero-link]");
    var posterLink = slider.querySelector("[data-hero-poster-link]");
    var poster = slider.querySelector("[data-hero-poster]");
    var captionTitle = slider.querySelector("[data-hero-caption-title]");
    var captionMeta = slider.querySelector("[data-hero-caption-meta]");
    var thumbs = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-thumb]"));
    var active = 0;
    var timer = null;

    function apply(index) {
      var thumb = thumbs[index];
      if (!thumb) {
        return;
      }

      active = index;
      thumbs.forEach(function(item, itemIndex) {
        item.classList.toggle("is-active", itemIndex === index);
      });

      var image = thumb.getAttribute("data-image");
      var url = thumb.getAttribute("data-url");
      var nextTitle = thumb.getAttribute("data-title");
      var nextDesc = thumb.getAttribute("data-desc");
      var nextMeta = thumb.getAttribute("data-meta");

      if (backdrop) {
        backdrop.style.backgroundImage = "url('" + image + "')";
      }

      if (poster) {
        poster.src = image;
        poster.alt = nextTitle + "海报";
      }

      if (title) {
        title.textContent = nextTitle;
      }

      if (desc) {
        desc.textContent = nextDesc;
      }

      if (meta) {
        meta.innerHTML = nextMeta
          .split("|")
          .filter(Boolean)
          .map(function(item) {
            return "<span>" + escapeHtml(item) + "</span>";
          })
          .join("");
      }

      if (link) {
        link.href = url;
      }

      if (posterLink) {
        posterLink.href = url;
      }

      if (captionTitle) {
        captionTitle.textContent = nextTitle;
      }

      if (captionMeta) {
        captionMeta.textContent = nextMeta.replace(/\|/g, " · ");
      }
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        apply((active + 1) % thumbs.length);
      }, 5200);
    }

    thumbs.forEach(function(thumb, index) {
      thumb.addEventListener("click", function() {
        apply(index);
        play();
      });
    });

    apply(0);
    play();
  }

  function buildCard(movie, prefix) {
    var tags = (movie.tags || []).slice(0, 3).map(function(tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      '<article class="movie-card">',
        '<a class="movie-poster" href="' + prefix + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
          '<img src="' + prefix + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '海报" loading="lazy">',
          '<span class="poster-shade"></span>',
          '<span class="play-hover">▶</span>',
          '<span class="card-region">' + escapeHtml(movie.region) + '</span>',
          '<span class="card-year">' + escapeHtml(movie.year) + '</span>',
        '</a>',
        '<div class="movie-card-body">',
          '<h3><a href="' + prefix + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
          '<p>' + escapeHtml(movie.oneLine) + '</p>',
          '<div class="card-tags">' + tags + '</div>',
        '</div>',
      '</article>'
    ].join("");
  }

  function initSearchIndex() {
    var form = document.querySelector("[data-search-form]");
    var results = document.querySelector("[data-search-results]");
    var count = document.querySelector("[data-search-count]");
    var list = window.MOVIE_SEARCH_INDEX || [];

    if (!form || !results || !count || !list.length) {
      return;
    }

    var input = form.querySelector("[data-search-input]");
    var region = form.querySelector("[data-region-filter]");
    var type = form.querySelector("[data-type-filter]");
    var year = form.querySelector("[data-year-filter]");
    var prefix = rootPrefix();

    function match(movie) {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value : "";
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(" ")
      ].join(" ").toLowerCase();

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }

      if (regionValue && movie.region !== regionValue) {
        return false;
      }

      if (typeValue && movie.type !== typeValue) {
        return false;
      }

      if (yearValue && movie.year !== yearValue) {
        return false;
      }

      return true;
    }

    function render() {
      var filtered = list.filter(match);
      var visible = filtered.slice(0, 60);
      count.textContent = "找到 " + filtered.length + " 部影片，当前显示 " + visible.length + " 部";
      results.innerHTML = visible.map(function(movie) {
        return buildCard(movie, prefix);
      }).join("");

      if (!visible.length) {
        results.innerHTML = '<div class="empty-state">没有找到符合条件的影片</div>';
      }
    }

    form.addEventListener("input", render);
    form.addEventListener("change", render);
    render();
  }

  function initLocalFilters() {
    var filterRoot = document.querySelector("[data-local-filter]");
    if (!filterRoot) {
      return;
    }

    var input = filterRoot.querySelector("[data-local-search]");
    var select = filterRoot.querySelector("[data-local-select]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filterable-card]"));
    var count = document.querySelector("[data-local-count]");

    function render() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var value = select ? select.value : "";
      var visibleCount = 0;

      cards.forEach(function(card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();

        var ok = true;

        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }

        if (value && text.indexOf(value.toLowerCase()) === -1) {
          ok = false;
        }

        card.style.display = ok ? "" : "none";

        if (ok) {
          visibleCount += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visibleCount + " 部影片";
      }
    }

    if (input) {
      input.addEventListener("input", render);
    }

    if (select) {
      select.addEventListener("change", render);
    }

    render();
  }

  function getHlsClass() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!localHlsPromise) {
      localHlsPromise = import(new URL("hls-engine.js", assetBaseUrl).href)
        .then(function(module) {
          return module.H || module.default || null;
        })
        .catch(function() {
          return null;
        });
    }

    return localHlsPromise;
  }

  function bindStream(video, stream) {
    if (video.getAttribute("data-bound") === "1") {
      return Promise.resolve();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.setAttribute("data-bound", "1");
      return Promise.resolve();
    }

    return getHlsClass().then(function(Hls) {
      if (Hls && Hls.isSupported && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        video.__hlsInstance = hls;
        video.setAttribute("data-bound", "1");
        return;
      }

      video.src = stream;
      video.setAttribute("data-bound", "1");
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function(shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");

      if (!video || !button) {
        return;
      }

      function start() {
        var stream = video.getAttribute("data-stream");

        if (!stream) {
          return;
        }

        shell.classList.add("is-loading");

        bindStream(video, stream).then(function() {
          return video.play();
        }).then(function() {
          shell.classList.add("is-playing");
          shell.classList.remove("is-loading");
        }).catch(function() {
          shell.classList.remove("is-loading");
          video.setAttribute("controls", "controls");
        });
      }

      button.addEventListener("click", function(event) {
        event.preventDefault();
        start();
      });

      video.addEventListener("play", function() {
        shell.classList.add("is-playing");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    initNavigation();
    initHero();
    initSearchIndex();
    initLocalFilters();
    initPlayers();
  });
})();
