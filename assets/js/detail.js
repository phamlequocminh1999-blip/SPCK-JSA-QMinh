"use strict";

const detailContainer = document.getElementById("product-detail");

async function loadDetail() {
    detailContainer.setAttribute("aria-busy", "true");
    detailContainer.textContent = "Đang tải chi tiết...";
    try {
        // BƯỚC 5: URL -> ID -> GET /products/{id} -> template -> DOM.
        const id = new URLSearchParams(location.search).get("id");
        const product = await ShopAPI.getProduct(id);
        const view = document.getElementById("detail-template").content.cloneNode(true);
        view.querySelector("h1").textContent = product.title;
        view.querySelector(".detail-category").textContent = SHOP_CONFIG.categories[product.category];
        view.querySelector(".detail-description").textContent = product.description || "Chưa có mô tả.";
        view.querySelector(".detail-price").textContent = formatMoney(product.price);
        view.querySelector(".detail-stock").textContent = `Tồn kho mẫu: ${product.stock ?? "Chưa có thông tin"}`;
        view.querySelector(".detail-brand").textContent = product.brand || "Chưa có thông tin";
        view.querySelector(".detail-sku").textContent = product.sku || "Chưa có thông tin";
        view.querySelector(".detail-warranty").textContent = product.warrantyInformation || "Chưa có thông tin";
        const image = view.querySelector(".detail-image");
        setProductImage(image, product.images?.[0] || product.thumbnail, product.title);
        const gallery = view.querySelector(".detail-gallery");
        (Array.isArray(product.images) ? product.images : []).forEach((url, index) => {
            const button = document.createElement("button");
            button.className = "gallery-button";
            button.setAttribute("aria-label", `Xem ảnh ${index + 1}`);
            const thumb = document.createElement("img");
            setProductImage(thumb, url, product.title);
            button.append(thumb);
            button.addEventListener("click", () => setProductImage(image, url, product.title));
            gallery.append(button);
        });
        const stock = Number.isInteger(product.stock) ? Math.max(0, product.stock) : 0;
        const quantity = view.querySelector("#quantity");
        quantity.max = String(Math.min(stock, 99));
        const addButton = view.querySelector("#add-product");
        addButton.disabled = stock === 0;
        if (!stock) addButton.textContent = "Hết hàng";
        const feedback = view.querySelector("#detail-feedback");
        addButton.addEventListener("click", () => {
            const count = Number(quantity.value);
            if (!Number.isInteger(count) || count < 1 || count > Math.min(stock, 99)) {
                feedback.textContent = `Chọn số lượng nguyên từ 1 đến ${Math.min(stock, 99)}.`;
                return;
            }
            try {
                Cart.add({ id: product.id, name: product.title, price: product.price, image: product.thumbnail,
                    currency: "USD", maxQty: Math.min(stock, 99) }, count);
                feedback.textContent = "Đã thêm vào giỏ demo.";
            } catch (error) { feedback.textContent = error.message; }
        });
        const reviews = view.querySelector(".detail-reviews");
        const items = Array.isArray(product.reviews) ? product.reviews : [];
        if (!items.length) reviews.textContent = "Nguồn chưa có đánh giá.";
        items.forEach(review => {
            const item = document.createElement("p");
            item.className = "border-bottom py-3 mb-0";
            item.textContent = `${review.reviewerName || "Khách"} · ${review.rating}/5 — ${review.comment || ""}`;
            reviews.append(item);
        });
        document.title = `${product.title} - Quoc Minh Computer`;
        detailContainer.replaceChildren(view);
    } catch (error) { showError(detailContainer, error, loadDetail); }
    finally { detailContainer.setAttribute("aria-busy", "false"); }
}
loadDetail();
