const { products } = require("../data/products");

const formatPrice = (value) => new Intl.NumberFormat("vi-VN").format(value);

const getFinalPrice = (product) => {
    const discount = product.discountPercent || 0;
    const finalPrice = Math.round(product.price * (1 - discount / 100));
    return finalPrice;
};

const decorateProduct = (product) => {
    const finalPrice = getFinalPrice(product);
    return {
        ...product,
        finalPrice,
        hasDiscount: (product.discountPercent || 0) > 0,
    };
};

const parseFilters = (query) => {
    const q = (query.q || "").trim();
    const category = query.category && query.category !== "all" ? query.category : "all";
    const minPrice = query.minPrice || "";
    const maxPrice = query.maxPrice || "";
    const inStock = query.inStock === "true";
    const promo = query.promo === "true";
    const sort = query.sort || "newest";

    const minPriceNumber = minPrice !== "" ? Number(minPrice) : null;
    const maxPriceNumber = maxPrice !== "" ? Number(maxPrice) : null;

    return {
        filters: { q, category, minPrice, maxPrice, inStock, promo, sort },
        numbers: {
            minPrice: minPriceNumber !== null && Number.isFinite(minPriceNumber) ? minPriceNumber : null,
            maxPrice: maxPriceNumber !== null && Number.isFinite(maxPriceNumber) ? maxPriceNumber : null,
        },
    };
};

const applyFilters = (items, filters, numbers) => {
    const keyword = filters.q.toLowerCase();
    return items.filter((product) => {
        if (keyword) {
            const text = `${product.title} ${product.author}`.toLowerCase();
            if (!text.includes(keyword)) return false;
        }

        if (filters.category !== "all" && product.category !== filters.category) return false;
        if (filters.inStock && product.stock <= 0) return false;
        if (filters.promo && !product.hasDiscount) return false;

        if (numbers.minPrice !== null && product.finalPrice < numbers.minPrice) return false;
        if (numbers.maxPrice !== null && product.finalPrice > numbers.maxPrice) return false;

        return true;
    });
};

const sortProducts = (items, sort) => {
    const list = items.slice();
    if (sort === "price-asc") list.sort((a, b) => a.finalPrice - b.finalPrice);
    if (sort === "price-desc") list.sort((a, b) => b.finalPrice - a.finalPrice);
    if (sort === "best") list.sort((a, b) => b.sold - a.sold);
    if (sort === "newest") list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    return list;
};

const getCategories = (items) => {
    return Array.from(new Set(items.map((item) => item.category)));
};

const getHomepage = async (req, res) => {
    const decorated = products.map(decorateProduct);
    const { filters, numbers } = parseFilters(req.query);

    const filtered = sortProducts(applyFilters(decorated, filters, numbers), filters.sort);
    const categories = getCategories(decorated);

    const promoProducts = decorated
        .filter((item) => item.hasDiscount)
        .slice()
        .sort((a, b) => b.discountPercent - a.discountPercent)
        .slice(0, 4);

    const newProducts = decorated
        .slice()
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, 4);

    const bestProducts = decorated
        .slice()
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 4);

    return res.render("index.ejs", {
        products: filtered,
        categories,
        promoProducts,
        newProducts,
        bestProducts,
        filters,
        total: filtered.length,
        formatPrice,
    });
};

const getProductDetail = async (req, res) => {
    const decorated = products.map(decorateProduct);
    const product = decorated.find((item) => item.slug === req.params.slug);
    if (!product) return res.status(404).send("Product not found");

    const similarProducts = decorated
        .filter((item) => item.category === product.category && item.slug !== product.slug)
        .slice()
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 4);

    return res.render("product.ejs", {
        product,
        similarProducts,
        formatPrice,
    });
};

const apiGetProducts = async (req, res) => {
    const decorated = products.map(decorateProduct);
    const { filters, numbers } = parseFilters(req.query);
    const filtered = sortProducts(applyFilters(decorated, filters, numbers), filters.sort);
    return res.status(200).json({
        total: filtered.length,
        items: filtered,
        filters,
    });
};

const apiGetProductDetail = async (req, res) => {
    const decorated = products.map(decorateProduct);
    const product = decorated.find((item) => item.slug === req.params.slug);
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json(product);
};

module.exports = {
    getHomepage,
    getProductDetail,
    apiGetProducts,
    apiGetProductDetail,
};