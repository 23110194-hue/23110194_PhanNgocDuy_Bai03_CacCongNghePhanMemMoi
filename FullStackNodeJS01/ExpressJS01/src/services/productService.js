const Product = require('../models/product');
const { products: seedProducts } = require('../data/products');

const formatPrice = (value) => new Intl.NumberFormat('vi-VN').format(value);

const getFinalPrice = (product) => {
    const discount = product.discountPercent || 0;
    return Math.round(product.price * (1 - discount / 100));
};

const decorateProduct = (product) => {
    const raw = product.toObject ? product.toObject() : product;
    const finalPrice = getFinalPrice(raw);
    return {
        ...raw,
        finalPrice,
        hasDiscount: (raw.discountPercent || 0) > 0,
    };
};

const seedProductsIfEmpty = async () => {
    const count = await Product.countDocuments();
    if (count > 0) return;

    const seedDocs = seedProducts.map((item) => ({
        ...item,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
        isActive: true,
    }));

    await Product.insertMany(seedDocs);
};

const getDecoratedProducts = async (query = {}) => {
    const items = await Product.find(query).lean();
    return items.map(decorateProduct);
};

const getProductById = async (productId) => {
    const normalizedId = Number(productId);
    if (!Number.isFinite(normalizedId)) return null;
    return Product.findOne({ id: normalizedId, isActive: true }).lean();
};

const getProductBySlug = async (slug) => Product.findOne({ slug, isActive: true }).lean();

const getDecoratedProductById = async (productId) => {
    const product = await getProductById(productId);
    return product ? decorateProduct(product) : null;
};

const getDecoratedProductBySlug = async (slug) => {
    const product = await getProductBySlug(slug);
    return product ? decorateProduct(product) : null;
};

const parseFilters = (query) => {
    const q = (query.q || '').trim();
    const category = query.category && query.category !== 'all' ? query.category : 'all';
    const minPrice = query.minPrice || '';
    const maxPrice = query.maxPrice || '';
    const inStock = query.inStock === 'true';
    const promo = query.promo === 'true';
    const sort = query.sort || 'newest';

    const minPriceNumber = minPrice !== '' ? Number(minPrice) : null;
    const maxPriceNumber = maxPrice !== '' ? Number(maxPrice) : null;

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

        if (filters.category !== 'all' && product.category !== filters.category) return false;
        if (filters.inStock && product.stock <= 0) return false;
        if (filters.promo && !product.hasDiscount) return false;

        if (numbers.minPrice !== null && product.finalPrice < numbers.minPrice) return false;
        if (numbers.maxPrice !== null && product.finalPrice > numbers.maxPrice) return false;

        return true;
    });
};

const sortProducts = (items, sort) => {
    const list = items.slice();
    if (sort === 'price-asc') list.sort((a, b) => a.finalPrice - b.finalPrice);
    if (sort === 'price-desc') list.sort((a, b) => b.finalPrice - a.finalPrice);
    if (sort === 'best') list.sort((a, b) => b.sold - a.sold);
    if (sort === 'newest') list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    if (sort === 'viewed') list.sort((a, b) => (b.views || 0) - (a.views || 0));
    return list;
};

const getCategories = (items) => Array.from(new Set(items.map((item) => item.category)));

const getHomepageData = async (query) => {
    const decorated = await getDecoratedProducts({ isActive: true });
    const { filters, numbers } = parseFilters(query);

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

    return {
        products: filtered,
        categories,
        promoProducts,
        newProducts,
        bestProducts,
        filters,
        total: filtered.length,
    };
};

const getProductDetailData = async (slug) => {
    const decorated = await getDecoratedProducts({ isActive: true });
    const product = decorated.find((item) => item.slug === slug);
    if (!product) {
        return { product: null, similarProducts: [] };
    }

    const similarProducts = decorated
        .filter((item) => item.category === product.category && item.slug !== product.slug)
        .slice()
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 4);

    return { product, similarProducts };
};

const getFilteredProductsData = async (query) => {
    const decorated = await getDecoratedProducts({ isActive: true });
    const { filters, numbers } = parseFilters(query);
    const filtered = sortProducts(applyFilters(decorated, filters, numbers), filters.sort);

    return {
        items: filtered,
        filters,
        total: filtered.length,
    };
};

const getNextProductId = async () => {
    const last = await Product.findOne({}).sort({ id: -1 }).lean();
    return last ? last.id + 1 : 1;
};

module.exports = {
    formatPrice,
    decorateProduct,
    seedProductsIfEmpty,
    getDecoratedProducts,
    getProductById,
    getProductBySlug,
    getDecoratedProductById,
    getDecoratedProductBySlug,
    getHomepageData,
    getProductDetailData,
    getFilteredProductsData,
    getNextProductId,
};
