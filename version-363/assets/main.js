(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navButton && navMenu) {
    navButton.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  var sliderTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === activeSlide);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === activeSlide);
    });
  }

  function startSlider() {
    if (sliderTimer || slides.length < 2) {
      return;
    }

    sliderTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      window.clearInterval(sliderTimer);
      sliderTimer = null;
      startSlider();
    });
  });

  startSlider();

  var cardGrids = Array.prototype.slice.call(document.querySelectorAll('[data-card-grid]'));
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var regionSelect = document.querySelector('[data-region-filter]');
  var yearSelect = document.querySelector('[data-year-filter]');

  function allCards() {
    var cards = [];
    cardGrids.forEach(function (grid) {
      cards = cards.concat(Array.prototype.slice.call(grid.querySelectorAll('.movie-card')));
    });
    return cards;
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    var first = select.querySelector('option');
    select.innerHTML = '';
    select.appendChild(first);

    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function prepareFilters() {
    var cards = allCards();
    var regions = [];
    var years = [];

    cards.forEach(function (card) {
      var region = card.getAttribute('data-region') || '';
      var year = card.getAttribute('data-year') || '';

      if (region && regions.indexOf(region) === -1) {
        regions.push(region);
      }

      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
    });

    regions.sort();
    years.sort().reverse();
    fillSelect(regionSelect, regions);
    fillSelect(yearSelect, years);
  }

  function filterCards() {
    var query = searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean).join(' ');
    var region = regionSelect ? regionSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';

    allCards().forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var passQuery = !query || haystack.indexOf(query) !== -1;
      var passRegion = !region || card.getAttribute('data-region') === region;
      var passYear = !year || card.getAttribute('data-year') === year;

      card.classList.toggle('is-hidden', !(passQuery && passRegion && passYear));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', filterCards);
  });

  if (regionSelect) {
    regionSelect.addEventListener('change', filterCards);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', filterCards);
  }

  prepareFilters();
})();
