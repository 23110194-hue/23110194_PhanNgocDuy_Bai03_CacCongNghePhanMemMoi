const Cart = require('../models/cart');
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const Shop = require('../models/shop');
const { getProductById, decorateProduct } = require('./productService');

const ORDER_STATUS = {
    NEW: 'NEW',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    SHIPPING: 'SHIPPING',
    DELIVERED: 'DELIVERED',
    CANCELED: 'CANCELED',
};

const STATUS_LABELS = {
    NEW: 'Đơn hàng mới',
    CONFIRMED: 'Đã xác nhận đơn hàng',
    PREPARING: 'Shop đang chuẩn bị hàng',
    SHIPPING: 'Đang giao hàng',
    DELIVERED: 'Đã giao thành công',
    CANCELED: 'Hủy đơn hàng',
    CANCEL_REQUESTED: 'Gửi yêu cầu hủy đơn',
};

const AUTO_CONFIRM_MINUTES = 30;
const AUTO_CONFIRM_MS = AUTO_CONFIRM_MINUTES * 60 * 1000;

const generateOrderNumber = () => {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
    const randomPart = Math.floor(100 + Math.random() * 900);
    return `OD${timestamp}${randomPart}`;
};

const buildSummary = (items) => {
    const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
    return {
        totalQuantity,
        subtotal,
        shippingFee: 0,
        total: subtotal,
    };
};

const buildOrderActions = (order) => {
    const createdAt = new Date(order.createdAt).getTime();
    const minutesSince = Math.floor((Date.now() - createdAt) / 60000);
    const minutesLeft = Math.max(0, AUTO_CONFIRM_MINUTES - minutesSince);

    const canCancel =
        (order.status === ORDER_STATUS.NEW || order.status === ORDER_STATUS.CONFIRMED) && minutesLeft > 0;
    const canRequestCancel = order.status === ORDER_STATUS.PREPARING && !order.cancelRequested;

    return {
        canCancel,
        canRequestCancel,
        minutesLeftToCancel: minutesLeft,
    };
};

const serializeOrder = (order) => {
    const raw = order.toObject({ getters: true });
    return {
        ...raw,
        statusLabel: STATUS_LABELS[raw.status] || raw.status,
        actions: buildOrderActions(raw),
        timeline: raw.timeline.map((entry) => ({
            ...entry,
            label: STATUS_LABELS[entry.status] || entry.status,
        })),
    };
};

const autoConfirmIfNeeded = (order) => {
    if (order.status !== ORDER_STATUS.NEW) return false;
    const createdAt = new Date(order.createdAt).getTime();
    if (Date.now() - createdAt < AUTO_CONFIRM_MS) return false;

    order.status = ORDER_STATUS.CONFIRMED;
    order.confirmedAt = new Date();
    order.timeline.push({
        status: ORDER_STATUS.CONFIRMED,
        at: new Date(),
        note: 'Đơn hàng được xác nhận tự động sau 30 phút.',
    });
    return true;
};

const createOrderService = async (userEmail, shippingAddress) => {
    const cart = await Cart.findOne({ userEmail });
    if (!cart || cart.items.length === 0) {
        return { error: 'Giỏ hàng đang trống.' };
    }

    const orderItems = [];
    for (const item of cart.items) {
        const product = await getProductById(item.productId);
        if (!product) {
            return { error: 'Có sản phẩm trong giỏ hàng không còn tồn tại.' };
        }
        if (item.quantity > product.stock) {
            return { error: `Sản phẩm ${product.title} không đủ tồn kho.` };
        }

        const decorated = decorateProduct(product);
        orderItems.push({
            productId: decorated.id,
            shopId: decorated.shopId || null,
            slug: decorated.slug,
            title: decorated.title,
            image: decorated.images?.[0] || '',
            price: decorated.price,
            finalPrice: decorated.finalPrice,
            discountPercent: decorated.discountPercent || 0,
            quantity: item.quantity,
            lineTotal: decorated.finalPrice * item.quantity,
        });
    }

    const summary = buildSummary(orderItems);
    const user = await User.findOne({ email: userEmail }).select('name email');

    const order = await Order.create({
        orderNumber: generateOrderNumber(),
        userEmail,
        userName: user?.name || '',
        items: orderItems,
        summary,
        paymentMethod: 'COD',
        shippingAddress,
        status: ORDER_STATUS.NEW,
        timeline: [
            {
                status: ORDER_STATUS.NEW,
                at: new Date(),
                note: 'Đặt hàng COD',
            },
        ],
    });

    cart.items = [];
    await cart.save();

    return serializeOrder(order);
};

const listOrdersService = async (userEmail) => {
    const orders = await Order.find({ userEmail }).sort({ createdAt: -1 });
    const updates = [];

    for (const order of orders) {
        if (autoConfirmIfNeeded(order)) {
            updates.push(order.save());
        }
    }

    if (updates.length > 0) {
        await Promise.all(updates);
    }

    return orders.map(serializeOrder);
};

const listAllOrdersService = async () => {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    const updates = [];

    for (const order of orders) {
        if (autoConfirmIfNeeded(order)) {
            updates.push(order.save());
        }
    }

    if (updates.length > 0) {
        await Promise.all(updates);
    }

    return orders.map(serializeOrder);
};

const getOrderDetailService = async (orderId, requester) => {
    const order = await Order.findById(orderId);
    if (!order) {
        return { error: 'Đơn hàng không tồn tại.' };
    }

    const isOwner = order.userEmail === requester.email;
    if (requester.role === 'vendor') {
        const shop = await Shop.findOne({ ownerId: requester.id });
        const hasItem = shop && order.items.some((item) => String(item.shopId) === String(shop._id));
        if (!hasItem) {
            return { error: 'Bạn không có quyền xem đơn hàng này.', status: 403 };
        }
    } else if (requester.role !== 'admin' && !isOwner) {
        return { error: 'Bạn không có quyền xem đơn hàng này.', status: 403 };
    }

    if (autoConfirmIfNeeded(order)) {
        await order.save();
    }

    return serializeOrder(order);
};

const cancelOrderService = async (orderId, userEmail) => {
    const order = await Order.findById(orderId);
    if (!order) {
        return { error: 'Đơn hàng không tồn tại.' };
    }

    if (order.userEmail !== userEmail) {
        return { error: 'Bạn không có quyền hủy đơn hàng này.', status: 403 };
    }

    if (autoConfirmIfNeeded(order)) {
        await order.save();
    }

    const actions = buildOrderActions(order);
    if (actions.canCancel) {
        order.status = ORDER_STATUS.CANCELED;
        order.canceledAt = new Date();
        order.cancelRequested = false;
        order.timeline.push({
            status: ORDER_STATUS.CANCELED,
            at: new Date(),
            note: 'Đơn hàng đã được hủy bởi khách hàng.',
        });
        await order.save();
        return serializeOrder(order);
    }

    if (actions.canRequestCancel) {
        order.cancelRequested = true;
        order.timeline.push({
            status: 'CANCEL_REQUESTED',
            at: new Date(),
            note: 'Khách hàng gửi yêu cầu hủy đơn.',
        });
        await order.save();
        return serializeOrder(order);
    }

    return { error: 'Không thể hủy đơn hàng ở trạng thái hiện tại.' };
};

const updateOrderStatusService = async (orderId, status, note) => {
    const order = await Order.findById(orderId);
    if (!order) {
        return { error: 'Đơn hàng không tồn tại.' };
    }

    if (!Object.values(ORDER_STATUS).includes(status)) {
        return { error: 'Trạng thái không hợp lệ.' };
    }

    const allowedTransitions = {
        [ORDER_STATUS.NEW]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELED],
        [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELED],
        [ORDER_STATUS.PREPARING]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELED],
        [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED],
        [ORDER_STATUS.DELIVERED]: [],
        [ORDER_STATUS.CANCELED]: [],
    };

    if (status === order.status) {
        return serializeOrder(order);
    }

    const allowed = allowedTransitions[order.status] || [];
    if (!allowed.includes(status)) {
        return { error: 'Không thể chuyển trạng thái đơn hàng.' };
    }

    order.status = status;
    if (status === ORDER_STATUS.CONFIRMED) {
        order.confirmedAt = new Date();
    }
    if (status === ORDER_STATUS.CANCELED) {
        order.canceledAt = new Date();
        order.cancelRequested = false;
    }
    if (status === ORDER_STATUS.DELIVERED) {
        order.deliveredAt = new Date();
        // Tăng số lượng đã bán và giảm tồn kho cho từng sản phẩm trong đơn
        await Promise.all(
            order.items.map((item) =>
                Product.updateOne(
                    { id: item.productId },
                    {
                        $inc: {
                            sold: item.quantity,
                            stock: -item.quantity,
                        },
                    }
                ).catch(() => {})
            )
        );
    }
    if (status !== ORDER_STATUS.PREPARING) {
        order.cancelRequested = false;
    }

    order.timeline.push({
        status,
        at: new Date(),
        note: note || '',
    });

    await order.save();
    return serializeOrder(order);
};

module.exports = {
    ORDER_STATUS,
    STATUS_LABELS,
    createOrderService,
    listOrdersService,
    listAllOrdersService,
    getOrderDetailService,
    cancelOrderService,
    updateOrderStatusService,
};
