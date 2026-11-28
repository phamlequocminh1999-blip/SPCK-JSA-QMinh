"use strict";

// Khung giỏ giữ Bootstrap đã có; chức năng giỏ chuyển sang cart.js.
function showToast(message) {
    document.getElementById('qmcToastMessage').textContent = message;
    if (typeof bootstrap !== 'undefined') bootstrap.Toast.getOrCreateInstance(document.getElementById('qmcToast')).show();
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', `
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
        `);
    Cart.updateBadge();
    document.getElementById('openCartBtn')?.addEventListener('click', () => {
        Cart.render();
        bootstrap.Modal.getOrCreateInstance(document.getElementById('qmcCartModal')).show();
    });
    document.getElementById('btnClearCart').addEventListener('click', () => {
        if (!confirm('Xóa toàn bộ giỏ demo?')) return;
        try { Cart.save([]); Cart.render(); } catch { showToast('Không lưu được thay đổi.'); }
    });
    // Chưa có backend nhận đơn: không báo đặt thành công hoặc xóa giỏ.
    document.getElementById('btnCheckout').textContent = 'Đặt hàng (demo)';
    document.getElementById('btnCheckout').addEventListener('click', () => {
        showToast(Cart.read().length ? 'Giỏ demo chưa gửi đơn. Checkout là bài tập tiếp theo.' : 'Giỏ hàng đang trống.');
    });
    document.querySelectorAll('.btn-add-cart').forEach(button => button.addEventListener('click', () => {
        const card = button.closest('.product-card');
        try {
            Cart.add({ name: card.querySelector('.product-title').textContent.trim(),
                price: Number(card.querySelector('.product-price').textContent.replace(/[^\d]/g, '')),
                image: card.querySelector('img').getAttribute('src'), currency: 'VND' }, 1);
            showToast('Đã thêm cấu hình mẫu vào giỏ.');
        } catch (error) { showToast(error.message); }
    }));
    const activePage = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link-item').forEach(link => {
        const active = link.getAttribute('href') === (activePage === 'detail.html' ? 'linhkien.html' : activePage);
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
    });
    initAuth();
    const contact = document.getElementById('contactForm');
    contact?.addEventListener('submit', event => {
        event.preventDefault();
        if (!contact.reportValidity()) return;
        if ([...contact.querySelectorAll('input,textarea')].some(input => !input.value.trim())) {
            showToast('Vui lòng nhập đủ nội dung, không chỉ khoảng trắng.'); return;
        }
        showToast('Form hợp lệ. Bài demo chưa gửi tin nhắn đến cửa hàng.');
    });
});
