"use strict";

// BƯỚC 4: Fetch một lần, tìm/lọc/sắp xếp mảng đã tải ở phía trình duyệt.
const productList = document.getElementById("product-list");
const productStatus = document.getElementById("product-status");
let products = [];
let activeCategory = "all";

function renderProducts() {
    const keyword = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
    const sort = document.getElementById("sortSelect")?.value;
    let result = products.filter(product =>
        (activeCategory === "all" || product.category === activeCategory) && product.title.toLowerCase().includes(keyword));
    if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
    if (productList.dataset.featured === "true") result = result.slice(0, 4);
    productList.replaceChildren(...result.map(createProductCard));
    productStatus.textContent = result.length ? `${result.length} sản phẩm` : "Không tìm thấy sản phẩm phù hợp.";
}

async function loadProducts() {
    productList.setAttribute("aria-busy", "true");
    productStatus.textContent = "Đang tải sản phẩm...";
    try { products = await ShopAPI.getProducts(); renderProducts(); }
    catch (error) { productStatus.textContent = "Chưa tải được sản phẩm."; showError(productList, error, loadProducts); }
    finally { productList.setAttribute("aria-busy", "false"); }
}

document.getElementById("searchInput")?.addEventListener("input", renderProducts);
document.getElementById("sortSelect")?.addEventListener("change", renderProducts);
document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
    activeCategory = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(item => {
        const active = item === button;
        item.classList.toggle("btn-danger", active);
        item.classList.toggle("btn-outline-dark", !active);
        item.setAttribute("aria-pressed", String(active));
    });
    renderProducts();
}));
loadProducts();
