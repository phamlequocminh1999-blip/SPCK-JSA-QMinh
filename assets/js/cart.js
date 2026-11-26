"use strict";

// Giữ key giỏ cũ. Món cũ chưa có currency được hiểu là VND.
// USD từ API và VND của PC mẫu phải tính riêng, không cộng hai đơn vị tiền.
const Cart = {
    read() {
        try {
            const value = JSON.parse(localStorage.getItem(SHOP_CONFIG.cartKey) || "[]");
            if (!Array.isArray(value)) return [];
            return value.filter(item => item && typeof item.name === "string" && Number.isFinite(item.price) && item.price >= 0 && Number.isInteger(item.qty) && item.qty > 0)
                .map(item => ({ ...item, image: safeImage(item.image), currency: item.currency === "USD" ? "USD" : "VND",
                    maxQty: Number.isInteger(item.maxQty) && item.maxQty > 0 ? Math.min(item.maxQty, 99) : 99,
                    qty: Math.min(item.qty, Number.isInteger(item.maxQty) && item.maxQty > 0 ? item.maxQty : 99, 99) }));
        } catch { return []; }
    },
    save(items) {
        localStorage.setItem(SHOP_CONFIG.cartKey, JSON.stringify(items));
        this.updateBadge();
    },
    add(product, quantity) {
        const max = product.maxQty || 99;
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > max) throw new Error("Số lượng không hợp lệ.");
        const cart = this.read();
        const existing = cart.find(item => product.id ? item.id === product.id && item.currency === product.currency : item.name === product.name && item.currency === product.currency);
        if ((existing?.qty || 0) + quantity > max) throw new Error(`Tối đa ${max} sản phẩm cho mục này.`);
        if (existing) Object.assign(existing, product, { qty: existing.qty + quantity });
        else cart.push({ ...product, qty: quantity });
        // Chỉ báo đã thêm nếu ghi storage thành công.
        this.save(cart);
    },
    updateBadge() {
        const count = this.read().reduce((sum, item) => sum + item.qty, 0);
        document.querySelectorAll(".cart-count-badge").forEach(badge => {
            badge.textContent = count;
            badge.style.display = count ? "inline-block" : "none";
        });
    },
    change(index, delta) {
        const cart = this.read();
        if (!cart[index]) return;
        const next = cart[index].qty + delta;
        if (next > cart[index].maxQty) { showToast("Đã đạt số lượng tối đa."); return; }
        if (next <= 0) cart.splice(index, 1);
        else cart[index].qty = next;
        try { this.save(cart); this.render(); } catch { showToast("Không lưu được giỏ."); }
    },
    render() {
        const body = document.getElementById("qmcCartBody");
        const total = document.getElementById("qmcCartTotal");
        if (!body || !total) return;
        const cart = this.read();
        body.replaceChildren();
        const totals = {};
        if (!cart.length) body.textContent = "Giỏ hàng đang trống.";
        cart.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "cart-row";
            const image = document.createElement("img");
            setProductImage(image, item.image, item.name);
            const info = document.createElement("div");
            const title = document.createElement("strong");
            title.textContent = item.name;
            const price = document.createElement("p");
            price.className = "mb-0 small text-secondary";
            price.textContent = formatMoney(item.price * item.qty, item.currency);
            info.append(title, price);
            const controls = document.createElement("div");
            controls.className = "d-flex align-items-center gap-2";
            const quantity = document.createElement("span");
            quantity.textContent = item.qty;
            const minus = document.createElement("button");
            const plus = document.createElement("button");
            minus.textContent = "−";
            plus.textContent = "+";
            [minus, plus].forEach(button => { button.className = "btn btn-sm btn-outline-secondary"; button.type = "button"; });
            minus.setAttribute("aria-label", `Giảm số lượng ${item.name}`);
            plus.setAttribute("aria-label", `Tăng số lượng ${item.name}`);
            minus.addEventListener("click", () => this.change(index, -1));
            plus.addEventListener("click", () => this.change(index, 1));
            controls.append(minus, quantity, plus);
            row.append(image, info, controls);
            body.append(row);
            totals[item.currency] = (totals[item.currency] || 0) + item.price * item.qty;
        });
        total.textContent = Object.entries(totals).map(([currency, value]) => formatMoney(value, currency)).join(" + ") || "0";
    }
};

window.addEventListener("storage", event => {
    if (event.key === SHOP_CONFIG.cartKey) { Cart.updateBadge(); Cart.render(); }
});
