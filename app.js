// CampusMarket: app.js (Part 2)

// Turns a number into text like "KSh 1,800"
function formatPrice(amount) {
  return "KSh " + amount.toLocaleString("en-KE");
}

// Shows only the products that match the search box and the category menu
function filterProducts() {
  const searchText = document.getElementById("search").value.toLowerCase().trim();
  const selectedCategory = document.getElementById("category").value;
  const products = document.querySelectorAll(".product");
  let visibleCount = 0;

  // Loop through every product card on the page
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const name = product.querySelector("h3").textContent.toLowerCase();
    const description = product.querySelector(".description").textContent.toLowerCase();
    const productCategory = product.dataset.category;

    const matchesSearch = name.includes(searchText) || description.includes(searchText);
    const matchesCategory = selectedCategory === "all" || productCategory === selectedCategory;

    // Decide: show the product only if it matches both
    if (matchesSearch && matchesCategory) {
      product.hidden = false;
      visibleCount++;
    } else {
      product.hidden = true;
    }
  }

  // Show a message when nothing matches
  const noResults = document.getElementById("no-results");
  if (visibleCount === 0) {
    noResults.hidden = false;
  } else {
    noResults.hidden = true;
  }
}

// Works out each subtotal (price x quantity) and the running total
function updateTotal() {
  const products = document.querySelectorAll(".product");
  let total = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const price = Number(product.dataset.price);
    let quantity = parseInt(product.querySelector(".quantity").value, 10);

    // An empty or negative quantity counts as zero
    if (isNaN(quantity) || quantity < 0) {
      quantity = 0;
    }

    const subtotal = price * quantity;
    product.querySelector(".line-total").textContent = "Subtotal: " + formatPrice(subtotal);
    total = total + subtotal;
  }

  document.getElementById("total").textContent = formatPrice(total);
}
