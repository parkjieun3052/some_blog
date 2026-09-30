document.addEventListener("DOMContentLoaded", () => {
  // Theme Toggle
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (storedTheme) {
    document.documentElement.setAttribute("data-theme", storedTheme);
  } else if (prefersDark) {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const targetTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", targetTheme);
      localStorage.setItem("theme", targetTheme);
      updateThemeIcon(targetTheme);
    });

    const currentTheme = document.documentElement.getAttribute("data-theme") || (prefersDark ? "dark" : "light");
    updateThemeIcon(currentTheme);
  }

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    themeToggleBtn.innerHTML = theme === "dark" ? "☀️" : "🌙";
    themeToggleBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }

  // Category Filter Chips
  const filterChips = document.querySelectorAll(".filter-chip");
  const postCards = document.querySelectorAll(".post-card");

  if (filterChips.length > 0 && postCards.length > 0) {
    filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const category = chip.getAttribute("data-category");

        filterChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");

        postCards.forEach((card) => {
          const cardCategory = card.getAttribute("data-category");
          if (category === "all" || cardCategory === category) {
            card.style.display = "flex";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

  // Search Modal
  const searchOpenBtn = document.getElementById("search-open-btn");
  const searchModal = document.getElementById("search-modal");
  const searchCloseBtn = document.getElementById("search-close-btn");
  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");

  let searchData = null;

  async function fetchSearchData() {
    if (searchData) return;
    try {
      const response = await fetch("/search.json");
      if (response.ok) {
        searchData = await response.json();
      }
    } catch (e) {
      console.error("Failed to load search data", e);
    }
  }

  function openSearch() {
    if (searchModal) {
      searchModal.classList.add("active");
      if (searchInput) searchInput.focus();
      fetchSearchData();
    }
  }

  function closeSearch() {
    if (searchModal) {
      searchModal.classList.remove("active");
      if (searchInput) searchInput.value = "";
      if (searchResults) searchResults.innerHTML = "";
    }
  }

  if (searchOpenBtn) {
    searchOpenBtn.addEventListener("click", openSearch);
  }

  if (searchCloseBtn) {
    searchCloseBtn.addEventListener("click", closeSearch);
  }

  if (searchModal) {
    searchModal.addEventListener("click", (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      openSearch();
    }
    if (e.key === "Escape") {
      closeSearch();
    }
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query || !searchData) {
        searchResults.innerHTML = "";
        return;
      }

      const matches = searchData.filter((item) => {
        return (
          item.title.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          (item.tags && item.tags.toLowerCase().includes(query)) ||
          (item.type && item.type.toLowerCase().includes(query))
        );
      });

      if (matches.length === 0) {
        searchResults.innerHTML = `<div style="padding: 1.25rem; text-align: center; color: var(--text-muted);">검색 결과가 없습니다.</div>`;
        return;
      }

      searchResults.innerHTML = matches
        .slice(0, 8)
        .map(
          (item) => `
        <a href="${item.url}" class="search-result-item">
          <div class="search-result-title">${item.title}</div>
          <div class="search-result-snippet">${item.snippet || item.type}</div>
        </a>
      `
        )
        .join("");
    });
  }
});
