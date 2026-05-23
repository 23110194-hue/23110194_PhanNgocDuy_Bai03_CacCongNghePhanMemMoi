const Shop = require('../models/shop');
const User = require('../models/user');

const slugify = (value) => {
    return value
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

const buildUniqueSlug = async (name) => {
    const base = slugify(name) || `shop-${Date.now()}`;
    let slug = base;
    let counter = 1;

    while (await Shop.exists({ slug })) {
        slug = `${base}-${counter}`;
        counter += 1;
    }

    return slug;
};

const createShopForOwner = async (ownerId, ownerEmail, payload) => {
    const existing = await Shop.findOne({ ownerId });
    if (existing) {
        return { error: 'Shop đã tồn tại.' };
    }

    if (!payload?.name) {
        return { error: 'Vui lòng nhập tên shop.' };
    }

    const slug = await buildUniqueSlug(payload.name);

    const shop = await Shop.create({
        ownerId,
        ownerEmail,
        name: payload.name,
        slug,
        description: payload.description || '',
        address: payload.address || '',
        phone: payload.phone || '',
        isActive: true,
        walletBalance: 0,
    });

    await User.findByIdAndUpdate(ownerId, { role: 'vendor' });

    return shop;
};

const getShopByOwner = async (ownerId) => Shop.findOne({ ownerId });

const updateShopByOwner = async (ownerId, payload) => {
    const shop = await Shop.findOne({ ownerId });
    if (!shop) {
        return { error: 'Shop chưa tồn tại.' };
    }

    if (payload?.name && payload.name !== shop.name) {
        shop.name = payload.name;
        shop.slug = await buildUniqueSlug(payload.name);
    }

    shop.description = payload?.description ?? shop.description;
    shop.address = payload?.address ?? shop.address;
    shop.phone = payload?.phone ?? shop.phone;

    await shop.save();
    return shop;
};

const listShops = async (filter = {}) => Shop.find(filter).sort({ createdAt: -1 });

const updateShopStatus = async (shopId, isActive) => {
    const shop = await Shop.findByIdAndUpdate(
        shopId,
        { isActive: Boolean(isActive) },
        { new: true }
    );
    if (!shop) {
        return { error: 'Shop không tồn tại.' };
    }
    return shop;
};

module.exports = {
    createShopForOwner,
    getShopByOwner,
    updateShopByOwner,
    listShops,
    updateShopStatus,
};
