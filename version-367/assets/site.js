(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var hero = document.querySelector(".hero-slider");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 6200);
  }

  var pageSearch = document.querySelector("[data-page-search]");
  var sortSelect = document.querySelector("[data-sort-select]");
  var cardsContainer = document.querySelector("[data-card-container]");
  var cards = cardsContainer ? Array.prototype.slice.call(cardsContainer.querySelectorAll(".search-card")) : [];
  var emptyState = document.querySelector("[data-empty-state]");

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(pageSearch ? pageSearch.value : "");
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));

      var visible = !query || haystack.indexOf(query) !== -1;
      card.classList.toggle("is-hidden", !visible);

      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount ? "none" : "block";
    }
  }

  function applySort() {
    if (!cardsContainer || !sortSelect) {
      return;
    }

    var mode = sortSelect.value;
    var sorted = cards.slice().sort(function (a, b) {
      if (mode === "rating") {
        return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
      }

      if (mode === "year") {
        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
      }

      return normalize(a.getAttribute("data-title")).localeCompare(normalize(b.getAttribute("data-title")), "zh-CN");
    });

    sorted.forEach(function (card) {
      cardsContainer.appendChild(card);
    });
  }

  if (pageSearch) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q) {
      pageSearch.value = q;
    }

    pageSearch.addEventListener("input", applyFilters);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      applySort();
      applyFilters();
    });
  }

  applySort();
  applyFilters();
})();
