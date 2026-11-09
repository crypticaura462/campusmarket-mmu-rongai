// app.js - CampusMarket
// catalog page (fetch + filter + gallery + calculator) and the register page

function money(n) {
  return "KSh " + n.toLocaleString("en-KE");
}

// ---------------- catalog page ----------------
const productGrid = document.getElementById("product-grid");

if (productGrid) {
  const searchBox = document.getElementById("search");
  const categoryBox = document.getElementById("category");
  const noResultsMsg = document.getElementById("no-results");
  const statusMsg = document.getElementById("status");

  const galImg = document.getElementById("gal-img");
  const galCaption = document.getElementById("gal-caption");
  const galPrev = document.getElementById("gal-prev");
  const galNext = document.getElementById("gal-next");

  let products = [];      // filled by the fetch below, nothing is typed in by hand
  let galleryItems = [];  // rebuilt every time the filter runs
  let galleryIndex = 0;
  let quantities = {};    // what the user typed for each product, by id

  // ----- 1. get the data -----
  async function loadProducts() {
    statusMsg.hidden = false;
    statusMsg.classList.remove("failed");
    statusMsg.textContent = "Loading products...";

    try {
      const response = await fetch("products.json");
      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }
      products = await response.json();

      statusMsg.hidden = true;
      runFilter();
      recalcTotal();
    } catch (err) {
      console.log("fetch problem:", err);
      products = [];
      statusMsg.hidden = false;
      statusMsg.classList.add("failed");
      statusMsg.textContent = "Sorry, the products couldn't be loaded. Check your connection and refresh the page.";
      runFilter(); // clears the grid and gallery so nothing stale is left
    }
  }

  // ----- 2. filter the fetched array -----
  function runFilter() {
    const q = searchBox.value.toLowerCase().trim();
    const cat = categoryBox.value;

    const matches = products.filter(function (p) {
      const textOk = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const catOk = cat === "all" || p.category === cat;
      return textOk && catOk;
    });

    showProducts(matches);

    // the gallery is built from the same matches, so they always agree
    galleryItems = matches;
    galleryIndex = 0;
    showGalleryImage();

    // only say "nothing matches" if the data actually loaded
    noResultsMsg.hidden = !(products.length > 0 && matches.length === 0);
  }

  // ----- 3. build the cards with DOM methods -----
  function showProducts(list) {
    productGrid.textContent = "";

    list.forEach(function (p) {
      const card = document.createElement("article");
      card.className = "product";
      card.dataset.id = p.id;

      const img = document.createElement("img");
      img.src = p.image;
      img.alt = p.alt;
      img.width = 280;
      img.height = 180;

      const tag = document.createElement("p");
      tag.className = "tag";
      tag.textContent = p.category;

      const title = document.createElement("h3");
      title.textContent = p.name;

      const price = document.createElement("p");
      price.className = "price";
      price.textContent = money(p.price);

      const desc = document.createElement("p");
      desc.className = "description";
      desc.textContent = p.description;

      const row = document.createElement("div");
      row.className = "buy-row";
      const label = document.createElement("label");
      label.htmlFor = "qty-" + p.id;
      label.textContent = "Qty";
      const input = document.createElement("input");
      input.type = "number";
      input.id = "qty-" + p.id;
      input.className = "quantity";
      input.dataset.id = p.id;
      input.value = quantities[p.id] !== undefined ? quantities[p.id] : "0";
      row.append(label, input);

      const err = document.createElement("p");
      err.className = "qty-error";
      err.setAttribute("aria-live", "polite");

      const sub = document.createElement("p");
      sub.className = "line-total";

      card.append(img, tag, title, price, desc, row, err, sub);
      productGrid.appendChild(card);

      updateCard(card, p);
    });
  }

  // ----- quantity validation, shared by the card and the total -----
  function checkQty(raw) {
    raw = String(raw).trim();
    const n = Number(raw);
    if (raw === "") return { ok: false, message: "Enter a quantity, or leave it at 0." };
    if (isNaN(n)) return { ok: false, message: "Quantity must be a number." };
    if (n < 0) return { ok: false, message: "Quantity can't be negative." };
    if (!Number.isInteger(n)) return { ok: false, message: "Whole numbers only." };
    return { ok: true, qty: n };
  }

  function updateCard(card, p) {
    const raw = quantities[p.id] !== undefined ? quantities[p.id] : "0";
    const result = checkQty(raw);
    const errBox = card.querySelector(".qty-error");
    const sub = card.querySelector(".line-total");

    if (result.ok) {
      errBox.textContent = "";
      sub.textContent = "Subtotal: " + money(p.price * result.qty);
    } else {
      errBox.textContent = result.message;
      sub.textContent = "Subtotal: not counted";
    }
  }

  function recalcTotal() {
    let total = 0;
    products.forEach(function (p) {
      const raw = quantities[p.id] !== undefined ? quantities[p.id] : "0";
      const result = checkQty(raw);
      if (result.ok) {
        total += p.price * result.qty;   // invalid quantities are skipped
      }
    });
    document.getElementById("total").textContent = money(total);
  }

  // one listener on the grid instead of one per input
  productGrid.addEventListener("input", function (e) {
    if (!e.target.classList.contains("quantity")) return;
    const id = Number(e.target.dataset.id);
    quantities[id] = e.target.value;

    const p = products.find(function (item) { return item.id === id; });
    updateCard(e.target.closest(".product"), p);
    recalcTotal();
  });

  // ----- gallery -----
  function showGalleryImage() {
    if (galleryItems.length === 0) {
      galImg.removeAttribute("src");
      galImg.alt = "";
      galCaption.textContent = "No images to show.";
      return;
    }
    const item = galleryItems[galleryIndex];
    galImg.src = item.image;
    galImg.alt = item.alt;
    galCaption.textContent = item.name + " (" + (galleryIndex + 1) + " of " + galleryItems.length + ")";
  }

  galPrev.addEventListener("click", function () {
    if (galleryItems.length === 0) return;
    galleryIndex = galleryIndex - 1;
    if (galleryIndex < 0) galleryIndex = galleryItems.length - 1;
    showGalleryImage();
  });

  galNext.addEventListener("click", function () {
    if (galleryItems.length === 0) return;
    galleryIndex = galleryIndex + 1;
    if (galleryIndex > galleryItems.length - 1) galleryIndex = 0;
    showGalleryImage();
  });

  searchBox.addEventListener("input", runFilter);
  categoryBox.addEventListener("change", runFilter);

  loadProducts();
}

// ---------------- register page ----------------
const regForm = document.getElementById("reg-form");

if (regForm) {
  const fullnameInput = document.getElementById("fullname");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm");
  const successBox = document.getElementById("success-box");
  const togglePassBtn = document.getElementById("toggle-pass");

  togglePassBtn.addEventListener("click", function () {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassBtn.textContent = "Hide";
    } else {
      passwordInput.type = "password";
      togglePassBtn.textContent = "Show";
    }
  });

  function showError(fieldId, message) {
    const box = document.getElementById(fieldId + "-error");
    box.textContent = message;
    box.classList.add("show"); // css transition handles the fade in
  }

  function clearError(fieldId) {
    const box = document.getElementById(fieldId + "-error");
    box.textContent = "";
    box.classList.remove("show");
  }

  regForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let ok = true;

    // required field
    if (fullname_blank()) {
      showError("fullname", "Full name can't be empty.");
      ok = false;
    } else {
      clearError("fullname");
    }

    // format check on email
    if (!emailInput.value.includes("@") || !emailInput.value.includes(".")) {
      showError("email", "Email must contain an @ and a domain, like name@example.com.");
      ok = false;
    } else {
      clearError("email");
    }

    // password required + a minimum length
    if (passwordInput.value.length < 6) {
      showError("password", "Password needs to be at least 6 characters.");
      ok = false;
    } else {
      clearError("password");
    }

    // custom rule: the two passwords have to match
    if (passwordInput.value !== confirmInput.value || confirmInput.value === "") {
      showError("confirm", "This doesn't match the password above.");
      ok = false;
    } else {
      clearError("confirm");
    }

    if (ok) {
      successBox.hidden = false;
      successBox.classList.remove("pop"); // reset in case they submit twice
      void successBox.offsetWidth; // forces the browser to notice the class was removed
      successBox.classList.add("pop");
      regForm.reset();
    }
  });

  function fullname_blank() {
    return fullnameInput.value.trim() === "";
  }
}
