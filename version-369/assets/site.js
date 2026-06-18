(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5500);
        };

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        restart();
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    var filterLists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
    var filterValue = '';

    var normalize = function (value) {
        return (value || '').toString().trim().toLowerCase();
    };

    var searchableText = function (element) {
        return normalize([
            element.getAttribute('data-title'),
            element.getAttribute('data-region'),
            element.getAttribute('data-type'),
            element.getAttribute('data-year'),
            element.getAttribute('data-category'),
            element.getAttribute('data-genre'),
            element.getAttribute('data-tags'),
            element.textContent
        ].join(' '));
    };

    var applyFilter = function () {
        var text = normalize(filterInputs.map(function (input) {
            return input.value;
        }).find(Boolean) || query);
        var chip = normalize(filterValue);

        filterLists.forEach(function (list) {
            Array.prototype.slice.call(list.children).forEach(function (item) {
                var haystack = searchableText(item);
                var matchedText = !text || haystack.indexOf(text) !== -1;
                var matchedChip = !chip || haystack.indexOf(chip) !== -1;
                item.classList.toggle('is-hidden', !(matchedText && matchedChip));
            });
        });
    };

    if (query && filterInputs.length) {
        filterInputs.forEach(function (input) {
            input.value = query;
        });
    }

    filterInputs.forEach(function (input) {
        input.addEventListener('input', applyFilter);
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-chips]')).forEach(function (group) {
        Array.prototype.slice.call(group.querySelectorAll('[data-filter-value]')).forEach(function (button) {
            button.addEventListener('click', function () {
                Array.prototype.slice.call(group.querySelectorAll('[data-filter-value]')).forEach(function (item) {
                    item.classList.remove('is-active');
                });

                button.classList.add('is-active');
                filterValue = button.getAttribute('data-filter-value') || '';
                applyFilter();
            });
        });
    });

    if (filterLists.length) {
        applyFilter();
    }
})();
