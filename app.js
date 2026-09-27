// app.js - CampusMarket
// handles the catalog page (filter + gallery + calculator) and the register page

function money(n) {
  return "KSh " + n.toLocaleString("en-KE");
}

// ---------------- catalog page ----------------
// only runs the catalog stuff if we're actually on that page
const productGrid = document.getElementById("product-grid");

if (productGrid) {
  const searchBox = document.getElementById("search");
  const categoryBox = document.getElementById("category");
  const noResultsMsg = document.getElementById("no-results");
  const allProducts = document.querySelectorAll(".product");

  const galImg = document.getElementById("gal-img");
  const galCaption = document.getElementById("gal-caption");
  const galPrev = document.getElementById("gal-prev");
  const galNext = document.getElementById("gal-next");

  let galleryItems = []; // this gets rebuilt every time the filter runs
  let galleryIndex = 0;

  function runFilter() {
    const q = searchBox.value.toLowerCase().trim();
    const cat = categoryBox.value;
    let visible = 0;

    // this is the same loop that feeds both the product grid AND the gallery below
    galleryItems = [];

    allProducts.forEach(function (p) {
      const name = p.querySelector("h3").textContent.toLowerCase();
      const desc = p.querySelector(".description").textContent.toLowerCase();
      const matchesText = name.includes(q) || desc.includes(q);
      const matchesCat = cat === "all" || p.dataset.category === cat;

      if (matchesText && matchesCat) {
        p.hidden = false;
        visible++;
        galleryItems.push({
          src: p.dataset.img,
          alt: p.querySelector("img").alt,
          name: p.querySelector("h3").textContent
        });
      } else {
        p.hidden = true;
      }
    });

    noResultsMsg.hidden = visible !== 0;

    galleryIndex = 0;
    showGalleryImage();
  }

  function showGalleryImage() {
    if (galleryItems.length === 0) {
      galImg.src = "";
      galImg.alt = "";
      galCaption.textContent = "No images to show for this filter.";
      return;
    }
    const item = galleryItems[galleryIndex];
    galImg.src = item.src;
    galImg.alt = item.alt;
    galCaption.textContent = item.name + " (" + (galleryIndex + 1) + " of " + galleryItems.length + ")";
  }

  galPrev.addEventListener("click", function () {
    if (galleryItems.length === 0) return;
    galleryIndex = galleryIndex - 1;
    if (galleryIndex < 0) galleryIndex = galleryItems.length - 1; // wrap to the end
    showGalleryImage();
  });

  galNext.addEventListener("click", function () {
    if (galleryItems.length === 0) return;
    galleryIndex = galleryIndex + 1;
    if (galleryIndex > galleryItems.length - 1) galleryIndex = 0; // wrap to the start
    showGalleryImage();
  });

  searchBox.addEventListener("input", runFilter);
  categoryBox.addEventListener("change", runFilter);

  // ----- calculator, only counts quantities that pass validation -----
  function recalcTotal() {
    let total = 0;

    allProducts.forEach(function (p) {
      const qtyInput = p.querySelector(".quantity");
      const errorBox = p.querySelector(".qty-error");
      const price = Number(p.dataset.price);
      const raw = qtyInput.value.trim();
      const qty = Number(raw);

      let problem = "";
      if (raw === "") {
        problem = "Enter a quantity, or leave it at 0.";
      } else if (isNaN(qty)) {
        problem = "Quantity must be a number.";
      } else if (qty < 0) {
        problem = "Quantity can't be negative.";
      } else if (!Number.isInteger(qty)) {
        problem = "Whole numbers only.";
      }

      if (problem) {
        errorBox.textContent = problem;
        p.querySelector(".line-total").textContent = "Subtotal: not counted";
        // invalid quantity does not add to the total at all
        return;
      }

      errorBox.textContent = "";
      const subtotal = price * qty;
      p.querySelector(".line-total").textContent = "Subtotal: " + money(subtotal);
      total += subtotal;
    });

    document.getElementById("total").textContent = money(total);
  }

  allProducts.forEach(function (p) {
    p.querySelector(".quantity").addEventListener("input", recalcTotal);
  });

  runFilter();
  recalcTotal();
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
