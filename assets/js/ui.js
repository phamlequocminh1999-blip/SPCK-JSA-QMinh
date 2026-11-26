"use strict";

function formatMoney(value, currency = "USD") {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(value);
}

// Chỉ cho ảnh HTTP(S) hoặc ảnh trong thư mục dự án.
function safeImage(value) {
    if (typeof value !== "string") return SHOP_CONFIG.placeholder;
    if (value.startsWith("assets/images/")) return value;
    // Ảnh trong giỏ cũ từng để ngoài thư mục gốc: đổi sang vị trí mới.
    if (/^[a-zA-Z0-9_-]+\.(png|jpe?g|webp)$/i.test(value)) return `assets/images/${value}`;
    try { const url = new URL(value); if (["https:", "http:"].includes(url.protocol)) return url.href; } catch {}
    return SHOP_CONFIG.placeholder;
}

function setProductImage(image, url, title) {
    image.src = safeImage(url);
    image.alt = title;
    image.onerror = () => { image.onerror = null; image.src = SHOP_CONFIG.placeholder; };
}

function showError(container, error, retry) {
    container.replaceChildren();
    const message = document.createElement("p");
    message.className = "alert alert-danger w-100";
    message.setAttribute("role", "alert");
    message.textContent = error.message || "Không tải được dữ liệu. Kiểm tra mạng và thử lại.";
    container.append(message);
    if (retry) {
        const button = document.createElement("button");
        button.className = "btn btn-outline-danger";
        button.textContent = "Thử lại";
        button.addEventListener("click", retry);
        container.append(button);
    }
}

// BƯỚC 3: Dữ liệu API đi vào textContent, không ghép title/description vào innerHTML.
function createProductCard(product) {
    const column = document.createElement("div");
    column.className = "col-sm-6 col-lg-4 col-xl-3";
    const card = document.createElement("article");
    card.className = "card product-card h-100";
    const link = document.createElement("a");
    link.className = "product-img-wrap";
    link.href = `detail.html?id=${product.id}`;
    const image = document.createElement("img");
    image.loading = "lazy";
    setProductImage(image, product.thumbnail, product.title);
    link.append(image);
    const body = document.createElement("div");
    body.className = "card-body d-flex flex-column";
    const category = document.createElement("p");
    category.className = "small text-secondary mb-2";
    category.textContent = SHOP_CONFIG.categories[product.category];
    const title = document.createElement("h3");
    title.className = "product-title h6";
    title.textContent = product.title;
    const price = document.createElement("p");
    price.className = "product-price text-danger fw-bold mt-auto";
    price.textContent = formatMoney(product.price);
    const detail = document.createElement("a");
    detail.className = "btn btn-outline-dark w-100";
    detail.href = link.href;
    detail.textContent = "Xem chi tiết";
    body.append(category, title, price, detail);
    card.append(link, body);
    column.append(card);
    return column;
}
