"use strict";

// BƯỚC 2: API chỉ fetch và kiểm tra dữ liệu, chưa thao tác DOM.
const ShopAPI = (() => {
    async function request(path) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            const response = await fetch(new URL(path, SHOP_CONFIG.baseURL), { signal: controller.signal });
            if (!response.ok) throw new Error(`Không tải được sản phẩm (HTTP ${response.status}).`);
            return await response.json();
        } catch (error) {
            if (error.name === "AbortError") throw new Error("Kết nối quá lâu. Hãy thử lại.");
            throw error;
        } finally { clearTimeout(timeout); }
    }

    function validate(product) {
        if (!product || !Number.isInteger(product.id) || typeof product.title !== "string" ||
            !Number.isFinite(product.price) || product.price < 0 ||
            !Object.hasOwn(SHOP_CONFIG.categories, product.category)) {
            throw new Error("Sản phẩm không hợp lệ hoặc nằm ngoài danh mục của trang.");
        }
        return product;
    }

    async function getProducts() {
        // Nguồn không có CPU/VGA riêng. Chỉ lấy đúng hai nhóm đang giới thiệu.
        const groups = await Promise.all(Object.keys(SHOP_CONFIG.categories).map(async category => {
            const data = await request(`category/${category}?limit=0`);
            if (!Array.isArray(data.products)) throw new Error("API không trả về mảng products.");
            return data.products.map(validate);
        }));
        return groups.flat();
    }

    async function getProduct(id) {
        if (!/^[1-9]\d{0,7}$/.test(String(id))) throw new Error("ID không hợp lệ. Hãy chọn sản phẩm từ danh sách.");
        // Tải trực tiếp theo ID để refresh hoặc chia sẻ link chi tiết vẫn hoạt động.
        return validate(await request(String(id)));
    }
    return { getProducts, getProduct };
})();
