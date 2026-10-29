document.addEventListener("DOMContentLoaded", () => {
  /* --------------------------------------------------------
     0. FIX BFCACHE & DRAWER LEAK
     -------------------------------------------------------- */
  const quickDrawer = document.getElementById("quickDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");

  function forceCloseDrawer() {
    if (quickDrawer) {
      quickDrawer.classList.remove("open");
      quickDrawer.setAttribute("aria-hidden", "true");
    }
    if (drawerBackdrop) {
      drawerBackdrop.classList.remove("active");
    }
  }

  forceCloseDrawer();

  window.addEventListener("pageshow", (event) => {
    forceCloseDrawer();
    document.body.classList.remove("page-fade-out");
  });

  /* --------------------------------------------------------
     1. MARQUEE TICKER TAPE
     -------------------------------------------------------- */
  const tickerEl = document.getElementById("tk");
  if (tickerEl) {
    const s = "BRAND NEW ✦ 100% AUTHENTIC ✦ HANDLE WITH CARE ✦ KEEP DRY ✦ THIS WAY UP ✦ KEB_SASOM STUDIO ✦ BKK.TH ✦ ";
    tickerEl.textContent = s.repeat(8);
  }

  /* --------------------------------------------------------
     2. SMOOTH PAGE TRANSITION & ANCHOR SCROLL FIX
     -------------------------------------------------------- */
  // คัดกรองไม่ให้ดักจับลิงก์ที่มีแฮชแท็กข้ามหน้า เช่น collection.html#toy-01
  const internalLinks = document.querySelectorAll(
    'a[href]:not([href^="#"]):not([href*="#"]):not([href^="mailto:"]):not([href^="tel:"]):not([target="_blank"])'
  );

  internalLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const destination = link.getAttribute("href");
      if (destination === window.location.pathname.split("/").pop() || destination === "") {
        return;
      }
      e.preventDefault();
      document.body.classList.add("page-fade-out");
      setTimeout(() => {
        window.location.href = destination;
      }, 200);
    });
  });

  // จัดการกรณีเปิดเข้ามาด้วย URL ที่มี Hash (#toy-xx) ให้ Scroll เลื่อนลงอย่างนุ่มนวล
  if (window.location.hash) {
    const targetEl = document.querySelector(window.location.hash);
    if (targetEl) {
      setTimeout(() => {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
    }
  }

  /* --------------------------------------------------------
     3. QUICK DRAWER (ปุ่ม 3 จุด •••)
     -------------------------------------------------------- */
  const menuToggle = document.getElementById("menuToggle");
  const drawerClose = document.getElementById("drawerClose");

  function openDrawer() {
    if (quickDrawer && drawerBackdrop) {
      quickDrawer.classList.add("open");
      drawerBackdrop.classList.add("active");
      quickDrawer.setAttribute("aria-hidden", "false");
    }
  }

  function closeDrawer() {
    forceCloseDrawer();
  }

  if (menuToggle) menuToggle.addEventListener("click", openDrawer);
  if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

  /* --------------------------------------------------------
     4. SEARCH SYSTEM
     -------------------------------------------------------- */
  const searchWrapper = document.getElementById("searchWrapper");
  const searchTrigger = document.getElementById("searchTrigger");
  const searchInput = document.getElementById("searchInput");
  const searchClose = document.getElementById("searchClose");
  const cards = document.querySelectorAll(".grid-card");
  const noResultsMsg = document.getElementById("noResultsMsg");
  const statCount = document.getElementById("statCount");

  if (searchTrigger && searchInput && searchClose) {
    searchTrigger.addEventListener("click", () => {
      searchWrapper.classList.add("active");
      searchInput.focus();
    });

    searchClose.addEventListener("click", () => {
      searchInput.value = "";
      searchWrapper.classList.remove("active");
      if (typeof applyCombinedFilters === "function") applyCombinedFilters();
    });

    searchInput.addEventListener("input", () => {
      if (typeof applyCombinedFilters === "function") applyCombinedFilters();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && searchWrapper.classList.contains("active")) {
        searchInput.value = "";
        searchWrapper.classList.remove("active");
        if (typeof applyCombinedFilters === "function") applyCombinedFilters();
      }
    });
  }

  /* --------------------------------------------------------
     5. FILTER BAR
     -------------------------------------------------------- */
  const filterItems = document.querySelectorAll(".filter-item");
  const filterStatus = document.getElementById("filterStatus");
  const filterStatusText = document.getElementById("filterStatusText");
  const resetFilterBtn = document.getElementById("resetFilterBtn");

  if (filterItems.length > 0 && cards.length > 0) {
    let currentFilters = {
      category: "all",
      series: "all",
      edition: "all",
      year: "all"
    };

    filterItems.forEach((item) => {
      const trigger = item.querySelector(".filter-trigger");
      const type = item.getAttribute("data-filter-type");

      if (trigger) {
        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = item.classList.contains("open");
          filterItems.forEach((el) => el.classList.remove("open"));
          if (!isOpen) item.classList.add("open");
        });
      }

      const options = item.querySelectorAll(".dropdown-opt");
      options.forEach((opt) => {
        opt.addEventListener("click", (e) => {
          e.stopPropagation();
          options.forEach((o) => o.classList.remove("active"));
          opt.classList.add("active");

          const selectedVal = opt.getAttribute("data-filter");
          currentFilters[type] = selectedVal;

          const labelSpan = item.querySelector(".filter-label");
          if (labelSpan) {
            labelSpan.textContent = selectedVal === "all" ? type.toUpperCase() : opt.textContent;
          }

          item.classList.remove("open");
          applyCombinedFilters();
        });
      });
    });

    document.addEventListener("click", () => {
      filterItems.forEach((el) => el.classList.remove("open"));
    });

    if (resetFilterBtn) {
      resetFilterBtn.addEventListener("click", () => {
        currentFilters = { category: "all", series: "all", edition: "all", year: "all" };
        filterItems.forEach((item) => {
          const type = item.getAttribute("data-filter-type");
          const labelSpan = item.querySelector(".filter-label");
          if (labelSpan) labelSpan.textContent = type.toUpperCase();

          const options = item.querySelectorAll(".dropdown-opt");
          options.forEach((opt) => {
            opt.classList.toggle("active", opt.getAttribute("data-filter") === "all");
          });
        });
        if (searchInput) searchInput.value = "";
        applyCombinedFilters();
      });
    }

    function applyCombinedFilters() {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      let visibleCount = 0;
      const activeCriteria = [];

      Object.entries(currentFilters).forEach(([key, val]) => {
        if (val !== "all") activeCriteria.push(`${key.toUpperCase()}: ${val.toUpperCase()}`);
      });
      if (query) activeCriteria.push(`QUERY: "${query}"`);

      if (filterStatus && filterStatusText) {
        if (activeCriteria.length > 0) {
          filterStatus.style.display = "flex";
          filterStatusText.textContent = activeCriteria.join(" | ");
        } else {
          filterStatus.style.display = "none";
        }
      }

      cards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category");
        const cardSeries = card.getAttribute("data-series");
        const cardEdition = card.getAttribute("data-edition");
        const cardYear = card.getAttribute("data-year");
        const cardText = card.innerText.toLowerCase();

        const matchCategory = currentFilters.category === "all" || cardCategory === currentFilters.category;
        const matchSeries = currentFilters.series === "all" || cardSeries === currentFilters.series;
        const matchEdition = currentFilters.edition === "all" || cardEdition === currentFilters.edition;
        const matchYear = currentFilters.year === "all" || cardYear === currentFilters.year;
        const matchQuery = !query || cardText.includes(query);

        if (matchCategory && matchSeries && matchEdition && matchYear && matchQuery) {
          card.classList.remove("hidden");
          visibleCount++;
        } else {
          card.classList.add("hidden");
        }
      });

      if (noResultsMsg) {
        noResultsMsg.style.display = visibleCount === 0 ? "block" : "none";
      }

      if (statCount) {
        statCount.textContent = `${visibleCount} ITEMS`;
      }
    }
  }
});