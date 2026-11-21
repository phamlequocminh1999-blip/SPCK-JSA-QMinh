// ==========================================
// QUOC MINH COMPUTER - CORE APPLICATION JS
// ==========================================

const CART_STORAGE_KEY = 'qmc_cart_items';
const USER_STORAGE_KEY = 'qmc_current_user';

// Định dạng tiền tệ VND
function formatVND(amount) {
    return Number(amount).toLocaleString('vi-VN') + ' đ';
}

// Trích xuất số tiền từ chuỗi (VD: "9.500.000 đ" -> 9500000)
function parsePrice(priceText) {
    const digits = String(priceText).replace(/[^\d]/g, '');
    return parseInt(digits, 10) || 0;
}

// ==========================================
// 1. QUẢN LÝ GIỎ HÀNG (LOCALSTORAGE)
// ==========================================
function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(name, price, image) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.name === name);

    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            image: image || 'rtx5060.png',
            qty: 1
        });
    }

    saveCart(cart);
    showToast(`Đã thêm "${name}" vào giỏ hàng!`);
}

function updateItemQty(index, delta) {
    const cart = getCart();
    if (!cart[index]) return;

    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    saveCart(cart);
    renderCartModal();
}

function removeCartItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCartModal();
}

function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartBadge();
    renderCartModal();
}

function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(badge => {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
    });
}

// Tạo tự động Modal Giỏ Hàng & Toast thông báo trên mọi trang
function injectCartModalAndToast() {
    if (!document.getElementById('qmcCartModal')) {
        const modalHTML = `
        <div class="modal fade" id="qmcCartModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-dark text-white">
                        <h5 class="modal-title fw-bold text-uppercase">Giỏ Hàng Của Bạn</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Đóng"></button>
                    </div>
                    <div class="modal-body" id="qmcCartBody"></div>
                    <div class="modal-footer justify-content-between bg-light">
                        <div>
                            <span class="text-muted">Tổng cộng:</span>
                            <span class="fs-5 fw-bold text-danger ms-2" id="qmcCartTotal">0 đ</span>
                        </div>
                        <div class="d-flex gap-2">
                            <button type="button" class="btn btn-outline-secondary btn-sm" id="btnClearCart">Xóa tất cả</button>
                            <button type="button" class="btn btn-danger fw-bold px-4" id="btnCheckout">Đặt Hàng Ngay</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1080;">
            <div id="qmcToast" class="toast align-items-center text-bg-dark border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body" id="qmcToastMessage">Đã cập nhật giỏ hàng</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Đóng"></button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('btnClearCart').addEventListener('click', () => {
            if (getCart().length > 0 && confirm('Bạn muốn xóa toàn bộ sản phẩm trong giỏ hàng?')) {
                clearCart();
            }
        });

        document.getElementById('btnCheckout').addEventListener('click', () => {
            const cart = getCart();
            if (cart.length === 0) {
                showToast('Giỏ hàng đang trống, hãy chọn sản phẩm trước nhé!');
                return;
            }
            const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
            clearCart();
            const modalEl = document.getElementById('qmcCartModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
            showToast(`Đặt hàng thành công! Tổng thanh toán: ${formatVND(total)}. Nhân viên sẽ liên hệ xác nhận.`);
        });
    }
}

function renderCartModal() {
    const bodyEl = document.getElementById('qmcCartBody');
    const totalEl = document.getElementById('qmcCartTotal');
    if (!bodyEl || !totalEl) return;

    const cart = getCart();
    if (cart.length === 0) {
        bodyEl.innerHTML = `
            <div class="text-center py-5">
                <p class="text-muted fs-5 mb-3">Giỏ hàng của bạn đang trống</p>
                <a href="linhkien.html" class="btn btn-danger btn-sm px-4">Xem Linh Kiện PC</a>
            </div>
        `;
        totalEl.textContent = '0 đ';
        return;
    }

    let total = 0;
    const rows = cart.map((item, idx) => {
        const subTotal = item.price * item.qty;
        total += subTotal;
        return `
            <div class="d-flex align-items-center justify-content-between border-bottom py-3 gap-3">
                <img src="${item.image}" alt="${item.name}" style="width: 64px; height: 64px; object-fit: contain;" class="border rounded p-1 bg-white">
                <div class="flex-grow-1">
                    <h6 class="mb-1 fs-6">${item.name}</h6>
                    <span class="text-danger fw-bold small">${formatVND(item.price)}</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button class="btn btn-outline-secondary btn-sm px-2" onclick="updateItemQty(${idx}, -1)">-</button>
                    <span class="fw-bold px-1">${item.qty}</span>
                    <button class="btn btn-outline-secondary btn-sm px-2" onclick="updateItemQty(${idx}, 1)">+</button>
                </div>
                <div class="text-end" style="min-width: 110px;">
                    <div class="fw-bold">${formatVND(subTotal)}</div>
                    <button class="btn btn-link text-danger text-decoration-none p-0 small" onclick="removeCartItem(${idx})">Xóa</button>
                </div>
            </div>
        `;
    }).join('');

    bodyEl.innerHTML = rows;
    totalEl.textContent = formatVND(total);
}

function showToast(message) {
    const toastEl = document.getElementById('qmcToast');
    const msgEl = document.getElementById('qmcToastMessage');
    if (!toastEl || !msgEl || typeof bootstrap === 'undefined') return;

    msgEl.textContent = message;
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 2500 });
    toast.show();
}

// ==========================================
// 2. GẮN SỰ KIỆN CHO NÚT "THÊM VÀO GIỎ"
// ==========================================
function bindAddToCartButtons() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.product-card');
            if (!card) return;

            const name = card.querySelector('.product-title')?.textContent.trim() || 'Sản phẩm PC';
            const priceText = card.querySelector('.product-price')?.textContent.trim() || '0';
            const image = card.querySelector('img')?.getAttribute('src') || '';
            const price = parsePrice(priceText);

            addToCart(name, price, image);
        });
    });
}

// ==========================================
// 3. LỌC & SẮP XẾP SẢN PHẨM (TRANG LINH KIỆN)
// ==========================================
function initProductFilterAndSort() {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const categoryButtons = document.querySelectorAll('.filter-btn');
    const emptyNotice = document.getElementById('emptyProductNotice');

    const originalItems = Array.from(productList.querySelectorAll('.product-item'));
    let activeCategory = 'all';

    function applyFilterAndSort() {
        const keyword = (searchInput?.value || '').toLowerCase().trim();
        const sortValue = sortSelect?.value || 'default';

        let filtered = originalItems.filter(item => {
            const category = item.dataset.category || '';
            const title = (item.querySelector('.product-title')?.textContent || '').toLowerCase();
            const matchCategory = activeCategory === 'all' || category === activeCategory;
            const matchKeyword = !keyword || title.includes(keyword);
            return matchCategory && matchKeyword;
        });

        if (sortValue === 'price-asc') {
            filtered.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
        } else if (sortValue === 'price-desc') {
            filtered.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
        }

        productList.innerHTML = '';
        filtered.forEach(item => productList.appendChild(item));

        if (emptyNotice) {
            emptyNotice.classList.toggle('d-none', filtered.length > 0);
        }
    }

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => {
                b.classList.remove('btn-danger', 'active');
                b.classList.add('btn-outline-dark');
            });
            btn.classList.remove('btn-outline-dark');
            btn.classList.add('btn-danger', 'active');
            activeCategory = btn.dataset.filter;
            applyFilterAndSort();
        });
    });

    searchInput?.addEventListener('input', applyFilterAndSort);
    sortSelect?.addEventListener('change', applyFilterAndSort);
}

// ==========================================
// 4. ĐĂNG NHẬP / ĐĂNG KÝ & TRẠNG THÁI USER
// ==========================================
function initAuthUI() {
    const userJson = localStorage.getItem(USER_STORAGE_KEY);
    const authNavArea = document.getElementById('authNavArea');

    if (userJson && authNavArea) {
        try {
            const user = JSON.parse(userJson);
            authNavArea.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-danger btn-sm dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown">
                        Xin chào, ${user.name}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><button class="dropdown-item text-danger" id="btnLogout">Đăng xuất</button></li>
                    </ul>
                </div>
            `;
            document.getElementById('btnLogout')?.addEventListener('click', () => {
                localStorage.removeItem(USER_STORAGE_KEY);
                window.location.reload();
            });
        } catch {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    }

    // Xử lý form tại login.html
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const displayName = email.split('@')[0] || 'Khách hàng';
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ name: displayName, email }));
            window.location.href = 'index.html';
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ name, email }));
            window.location.href = 'index.html';
        });
    }
}

// ==========================================
// 5. FORM LIÊN HỆ
// ==========================================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Cảm ơn bạn! Yêu cầu hỗ trợ đã được gửi tới Quoc Minh Computer.');
        contactForm.reset();
    });
}

// Khởi chạy toàn bộ khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    injectCartModalAndToast();
    updateCartBadge();
    bindAddToCartButtons();
    initProductFilterAndSort();
    initAuthUI();
    initContactForm();

    const cartTrigger = document.getElementById('openCartBtn');
    cartTrigger?.addEventListener('click', () => {
        renderCartModal();
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('qmcCartModal'));
        modal.show();
    });
});