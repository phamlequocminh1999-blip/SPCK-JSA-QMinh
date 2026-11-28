"use strict";

// Tài khoản chỉ phục vụ bài học localStorage. Không dùng mật khẩu thật.
// Bản cũ chỉ lấy email rồi cho đăng nhập, không hề kiểm tra mật khẩu.
function readDemoUsers() {
    const value = JSON.parse(localStorage.getItem(SHOP_CONFIG.usersKey) || "[]");
    if (!Array.isArray(value)) throw new Error("Dữ liệu tài khoản lỗi. Hãy kiểm tra key qmc_users.");
    return value.filter(user => user && typeof user.email === "string" && typeof user.password === "string");
}

function initAuth() {
    const nav = document.getElementById("authNavArea");
    try {
        const user = JSON.parse(localStorage.getItem(SHOP_CONFIG.userKey) || "null");
        if (user && typeof user.name === "string" && nav) {
            const name = document.createElement("span");
            name.className = "small text-light me-2";
            name.textContent = `Chào ${user.name}`;
            const logout = document.createElement("button");
            logout.className = "btn btn-outline-light btn-sm";
            logout.textContent = "Đăng xuất";
            logout.addEventListener("click", () => {
                try { localStorage.removeItem(SHOP_CONFIG.userKey); location.reload(); }
                catch { showToast("Không lưu được thay đổi."); }
            });
            nav.replaceChildren(name, logout);
        }
    } catch { /* Storage lỗi không được làm vỡ trang sản phẩm. */ }

    const feedback = document.getElementById("auth-feedback");
    for (const mode of ["login", "register"]) {
        const form = document.getElementById(`${mode}Form`);
        if (!form) continue;
        form.addEventListener("submit", event => {
            event.preventDefault();
            try {
                if (!form.reportValidity()) return;
                const prefix = mode === "login" ? "login" : "reg";
                const email = document.getElementById(`${prefix}Email`).value.trim().toLowerCase();
                const password = document.getElementById(`${prefix}Password`).value;
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email không hợp lệ.");
                if (password.trim().length < 6) throw new Error("Mật khẩu cần ít nhất 6 ký tự, không chỉ khoảng trắng.");
                const users = readDemoUsers();
                if (mode === "register") {
                    const name = document.getElementById("regName").value.trim();
                    if (name.length < 2 || name.length > 60) throw new Error("Tên cần từ 2 đến 60 ký tự.");
                    if (users.some(user => user.email.toLowerCase() === email)) throw new Error("Email đã được đăng ký.");
                    users.push({ name, email, password });
                    localStorage.setItem(SHOP_CONFIG.usersKey, JSON.stringify(users));
                    feedback.textContent = "Đã tạo tài khoản demo. Chuyển sang tab Đăng nhập để thử.";
                    return;
                }
                const user = users.find(user => user.email.toLowerCase() === email && user.password === password);
                if (!user) throw new Error("Email hoặc mật khẩu không đúng. Hãy đăng ký tài khoản demo trước.");
                localStorage.setItem(SHOP_CONFIG.userKey, JSON.stringify({ name: user.name, email: user.email }));
                location.href = "index.html";
            } catch (error) { feedback.textContent = error.message; }
        });
    }
}
