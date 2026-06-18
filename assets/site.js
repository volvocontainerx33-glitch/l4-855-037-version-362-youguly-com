const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

ready(() => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      menu.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const thumbs = Array.from(document.querySelectorAll("[data-hero-thumb]"));
  let heroIndex = 0;

  const setHero = (index) => {
    if (!slides.length) return;
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === heroIndex);
    });
    thumbs.forEach((thumb, thumbIndex) => {
      thumb.classList.toggle("is-active", thumbIndex === heroIndex);
    });
  };

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const index = Number(thumb.dataset.heroThumb || 0);
      setHero(index);
    });
  });

  if (slides.length > 1) {
    setInterval(() => setHero(heroIndex + 1), 5200);
  }

  const query = new URLSearchParams(window.location.search).get("q") || "";
  const searchInputs = Array.from(document.querySelectorAll("[data-search-input]"));
  searchInputs.forEach((input) => {
    if (query) input.value = query;
  });

  const normalize = (value) => String(value || "").trim().toLowerCase();

  document.querySelectorAll("[data-local-filter]").forEach((zone) => {
    const cards = Array.from(zone.querySelectorAll(".movie-card"));
    const buttons = Array.from(zone.querySelectorAll("[data-filter-value]"));
    const empty = zone.querySelector("[data-empty-state]");
    let activeValue = "all";
    let keyword = normalize(query);

    const apply = () => {
      let visible = 0;
      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.tags,
          card.dataset.category
        ].join(" "));
        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesFilter = activeValue === "all" || haystack.includes(normalize(activeValue));
        const show = matchesKeyword && matchesFilter;
        card.classList.toggle("is-hidden", !show);
        if (show) visible += 1;
      });
      if (empty) empty.classList.toggle("is-visible", visible === 0);
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        activeValue = button.dataset.filterValue || "all";
        buttons.forEach((item) => item.classList.toggle("is-active", item === button));
        apply();
      });
    });

    searchInputs.forEach((input) => {
      input.addEventListener("input", () => {
        keyword = normalize(input.value);
        apply();
      });
    });

    apply();
  });

  const startPlayer = async (shell) => {
    const video = shell.querySelector("video");
    const source = shell.dataset.stream;
    if (!video || !source) return;

    shell.classList.add("is-playing");

    if (!video.dataset.ready) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        const Hls = window.Hls;
        if (Hls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          shell._hls = hls;
        } else {
          video.src = source;
        }
      }
      video.dataset.ready = "1";
    }

    try {
      await video.play();
    } catch (error) {
      shell.classList.remove("is-playing");
    }
  };

  document.querySelectorAll(".player-shell").forEach((shell) => {
    const cover = shell.querySelector(".player-cover");
    const video = shell.querySelector("video");

    if (cover) {
      cover.addEventListener("click", () => startPlayer(shell));
    }

    if (video) {
      video.addEventListener("click", () => {
        if (!video.dataset.ready || video.paused) {
          startPlayer(shell);
        }
      });
      video.addEventListener("pause", () => {
        if (!video.seeking && video.currentTime === 0) {
          shell.classList.remove("is-playing");
        }
      });
      video.addEventListener("play", () => {
        shell.classList.add("is-playing");
      });
    }
  });
});
