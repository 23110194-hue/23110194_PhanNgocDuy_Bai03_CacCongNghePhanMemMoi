const {
    formatPrice,
    getHomepageData,
    getProductDetailData,
    getFilteredProductsData,
    getDecoratedProductBySlug,
} = require('../services/productService');
const Product = require('../models/product');

const getHomepage = async (req, res) => {
    try {
        const data = await getHomepageData(req.query);
        return res.render("index.ejs", {
            ...data,
            formatPrice,
        });
    } catch (error) {
        console.error('getHomepage error:', error);
        return res.status(500).send('Lỗi server, vui lòng thử lại sau.');
    }
};

const getProductDetail = async (req, res) => {
    try {
        const { product, similarProducts } = await getProductDetailData(req.params.slug);
        if (!product) return res.status(404).send("Product not found");
        return res.render("product.ejs", {
            product,
            similarProducts,
            formatPrice,
        });
    } catch (error) {
        console.error('getProductDetail error:', error);
        return res.status(500).send('Lỗi server, vui lòng thử lại sau.');
    }
};

const apiGetProducts = async (req, res) => {
    try {
        const { items, filters, total } = await getFilteredProductsData(req.query);
        
        const page = Number.parseInt(req.query.page, 10) || 1;
        const limitParam = Number.parseInt(req.query.limit, 10);
        const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : (total > 0 ? total : 1);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedItems = items.slice(startIndex, endIndex);

        return res.status(200).json({
            total,
            page,
            limit,
            totalPages: total > 0 ? Math.ceil(total / limit) : 0,
            items: paginatedItems,
            filters,
        });
    } catch (error) {
        console.error('apiGetProducts error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const apiGetProductDetail = async (req, res) => {
    try {
        const product = await getDecoratedProductBySlug(req.params.slug);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Tăng lượt xem (fire-and-forget, không block response)
        Product.updateOne({ slug: req.params.slug }, { $inc: { views: 1 } }).catch(() => {});

        return res.status(200).json(product);
    } catch (error) {
        console.error('apiGetProductDetail error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

module.exports = {
    getHomepage,
    getProductDetail,
    apiGetProducts,
    apiGetProductDetail,
};