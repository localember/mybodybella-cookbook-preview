(function () {
  "use strict";

  var CATEGORY_ORDER = [
    "fish",
    "chicken",
    "turkey",
    "beef",
    "pork",
    "eggs",
    "soup",
    "salad",
    "dressing",
    "condiment",
    "sides",
    "dessert",
    "shakes",
    "meatless"
  ];

  var header = document.getElementById("site-header");
  var toggle = document.getElementById("menu-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    header.querySelectorAll(".nav__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.parentElement;
        var open = item.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  var params = new URLSearchParams(window.location.search);
  var slug = (params.get("book") || "sample-cookbook").replace(/[^a-z0-9-]/gi, "");
  if (!slug) slug = "sample-cookbook";

  var cookbookRoot = document.getElementById("cookbook-header");
  var catsEl = document.getElementById("recipe-cats");
  var gridEl = document.getElementById("recipe-grid");
  var countEl = document.getElementById("recipe-count");
  var emptyEl = document.getElementById("recipe-empty");
  var clearEl = document.getElementById("recipe-clear");
  var searchForm = document.getElementById("recipe-search");
  var searchInput = document.getElementById("bb-recipe-q");
  var currentCat = "all";
  var recipes = [];
  var categoryLabels = {};

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderHeader(data) {
    if (!cookbookRoot) return;
    var cover = data.cover || {};
    var src = cover.src || "assets/sample-cookbook-cover.svg";
    var alt = cover.alt || "Placeholder cookbook cover";
    cookbookRoot.innerHTML =
      '<figure class="cookbook-header__cover">' +
      '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(alt) + '" width="900" height="1200">' +
      "</figure>" +
      '<div class="cookbook-header__text">' +
      '<p class="cookbook-header__eyebrow">' + escapeHtml(data.eyebrow || "Cookbook") + "</p>" +
      "<h1>" + escapeHtml(data.title || "Cookbook") + "</h1>" +
      '<p class="cookbook-header__intro">' + escapeHtml(data.intro || "") + "</p>" +
      "</div>";
  }

  function usedCategories(list) {
    var counts = {};
    var labels = {};
    list.forEach(function (r) {
      var slug = r.category;
      if (!slug) return;
      counts[slug] = (counts[slug] || 0) + 1;
      labels[slug] = r.categoryLabel || slug;
    });
    var order = CATEGORY_ORDER.filter(function (s) { return counts[s]; });
    Object.keys(counts).forEach(function (s) {
      if (order.indexOf(s) === -1) order.push(s);
    });
    return order.map(function (s) {
      return { slug: s, label: labels[s], count: counts[s] };
    });
  }

  function renderChips(list) {
    var cats = usedCategories(list);
    var html = '<button type="button" class="bb-index__cat is-current" data-cat="all">All</button>';
    cats.forEach(function (c) {
      categoryLabels[c.slug] = c.label;
      html +=
        '<button type="button" class="bb-index__cat" data-cat="' +
        escapeHtml(c.slug) +
        '">' +
        escapeHtml(c.label) +
        ' <span class="bb-index__cat-n">' +
        c.count +
        "</span></button>";
    });
    catsEl.innerHTML = html;
  }

  function thumbHtml(recipe) {
    if (recipe.image) {
      return (
        '<img class="bb-index__thumb-img" src="' +
        escapeHtml(recipe.image) +
        '" alt="">'
      );
    }
    return '<div class="bb-index__thumb" aria-hidden="true">Placeholder photo</div>';
  }

  function renderGrid(list) {
    gridEl.innerHTML = list
      .map(function (r) {
        return (
          '<li class="bb-index__item" data-cat="' +
          escapeHtml(r.category || "") +
          '" data-name="' +
          escapeHtml((r.title || "").toLowerCase()) +
          '">' +
          '<article class="bb-index__card">' +
          thumbHtml(r) +
          '<div class="bb-index__body">' +
          '<p class="bb-index__badge">Sample recipe</p>' +
          '<h2 class="bb-index__title">' +
          escapeHtml(r.title || "Sample recipe") +
          "</h2>" +
          (r.servings ? '<p class="bb-index__servings">' + escapeHtml(r.servings) + "</p>" : "") +
          '<p class="bb-index__tagline">' +
          escapeHtml(r.tagline || "") +
          "</p>" +
          '<a class="bb-index__out" href="#" data-preview-link>View recipe</a>' +
          "</div></article></li>"
        );
      })
      .join("");

    gridEl.querySelectorAll("[data-preview-link]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
      });
    });
  }

  function apply() {
    var items = Array.prototype.slice.call(gridEl.querySelectorAll(".bb-index__item"));
    var q = (searchInput.value || "").trim().toLowerCase();
    var shown = 0;
    items.forEach(function (li) {
      var okCat = currentCat === "all" || li.getAttribute("data-cat") === currentCat;
      var hay = (li.getAttribute("data-name") + " " + li.textContent).toLowerCase();
      var okSearch = !q || hay.indexOf(q) !== -1;
      var show = okCat && okSearch;
      li.hidden = !show;
      if (show) shown += 1;
    });
    var qualifier = "";
    if (currentCat !== "all") qualifier += " in " + (categoryLabels[currentCat] || currentCat);
    if (q) qualifier += " matching “" + q + "”";
    countEl.textContent = shown + (shown === 1 ? " recipe" : " recipes") + qualifier;
    emptyEl.hidden = shown !== 0;
    clearEl.hidden = currentCat === "all" && !q;
  }

  catsEl.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-cat]");
    if (!btn) return;
    currentCat = btn.getAttribute("data-cat");
    catsEl.querySelectorAll(".bb-index__cat").forEach(function (c) {
      c.classList.toggle("is-current", c === btn);
    });
    apply();
  });

  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    apply();
  });
  searchInput.addEventListener("input", apply);
  clearEl.addEventListener("click", function (e) {
    e.preventDefault();
    currentCat = "all";
    searchInput.value = "";
    catsEl.querySelectorAll(".bb-index__cat").forEach(function (c) {
      c.classList.toggle("is-current", c.getAttribute("data-cat") === "all");
    });
    apply();
  });

  fetch("data/" + slug + ".json")
    .then(function (res) {
      if (!res.ok) throw new Error("missing cookbook data");
      return res.json();
    })
    .then(function (data) {
      document.title = (data.title || "Cookbook") + " (design preview) | Body Bella";
      renderHeader(data);
      recipes = data.recipes || [];
      renderChips(recipes);
      renderGrid(recipes);
      apply();
    })
    .catch(function () {
      if (cookbookRoot) {
        cookbookRoot.innerHTML =
          "<h1>Cookbook preview</h1>" +
          "<p class=\"cookbook-header__intro\">The cookbook data file could not be loaded. Check the book name in the address bar.</p>";
      }
      countEl.textContent = "0 recipes";
    });
})();
