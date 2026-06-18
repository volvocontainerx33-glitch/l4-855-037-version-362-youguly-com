function normalizeText(value) {
  return (value || "").toString().trim().toLowerCase();
}

function setupMobileMenu() {
  const button = document.querySelector("[data-menu-button]");
  const panel = document.querySelector("[data-mobile-panel]");
  if (!button || !panel) {
    return;
  }

  button.addEventListener("click", () => {
    const open = panel.classList.toggle("is-open");
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function setupHero() {
  const root = document.querySelector("[data-hero-carousel]");
  if (!root) {
    return;
  }

  const slides = Array.from(root.querySelectorAll(".hero-slide"));
  const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
  if (slides.length < 2) {
    return;
  }

  let index = 0;
  let timer = null;

  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) =>
      slide.classList.toggle("is-active", i === index),
    );
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  start();
}

function setupSearchScopes() {
  const scopes = Array.from(document.querySelectorAll("[data-search-scope]"));
  scopes.forEach((scope) => {
    const input = scope.querySelector("[data-search-input]");
    const selects = Array.from(scope.querySelectorAll("[data-filter-select]"));
    const cards = Array.from(scope.querySelectorAll(".searchable-card"));
    const empty = scope.querySelector("[data-empty-state]");

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (input && query && !input.value) {
      input.value = query;
    }

    const apply = () => {
      const keyword = normalizeText(input ? input.value : "");
      let shown = 0;

      cards.forEach((card) => {
        const haystack = normalizeText(
          [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags,
            card.textContent,
          ].join(" "),
        );

        const keywordMatch = !keyword || haystack.includes(keyword);
        const selectMatch = selects.every((select) => {
          const key = select.dataset.filterSelect;
          const value = normalizeText(select.value);
          return !value || normalizeText(card.dataset[key]).includes(value);
        });
        const visible = keywordMatch && selectMatch;
        card.classList.toggle("is-filtered-out", !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    };

    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach((select) => select.addEventListener("change", apply));
    apply();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupHero();
  setupSearchScopes();
});
