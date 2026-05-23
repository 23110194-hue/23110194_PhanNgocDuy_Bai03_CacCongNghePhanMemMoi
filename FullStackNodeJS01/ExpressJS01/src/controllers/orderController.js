const {
    createOrderService,
    listOrdersService,
    listAllOrdersService,
    getOrderDetailService,
    cancelOrderService,
    updateOrderStatusService,
} = require('../services/orderService');

const createOrder = async (req, res) => {
    try {
        const { fullName, phone, addressLine, note } = req.body || {};
        if (!fullName || !phone || !addressLine) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin giao hàng.' });
        }

        const data = await createOrderService(req.user.email, {
            fullName,
            phone,
            addressLine,
            note: note || '',
        });
        if (data.error) {
            return res.status(400).json({ message: data.error });
        }
        return res.status(200).json(data);
    } catch (error) {
        console.error('createOrder error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getOrders = async (req, res) => {
    try {
        const data = await listOrdersService(req.user.email);
        return res.status(200).json({ items: data });
    } catch (error) {
        console.error('getOrders error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const data = await listAllOrdersService();
        return res.status(200).json({ items: data });
    } catch (error) {
        console.error('getAllOrders error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const getOrderDetail = async (req, res) => {
    try {
        const data = await getOrderDetailService(req.params.id, req.user);
        if (data.error) {
            return res.status(data.status || 400).json({ message: data.error });
        }
        return res.status(200).json(data);
    } catch (error) {
        console.error('getOrderDetail error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const data = await cancelOrderService(req.params.id, req.user.email);
        if (data.error) {
            return res.status(data.status || 400).json({ message: data.error });
        }
        return res.status(200).json(data);
    } catch (error) {
        console.error('cancelOrder error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body || {};
        const data = await updateOrderStatusService(req.params.id, status, note);
        if (data.error) {
            return res.status(400).json({ message: data.error });
        }
        return res.status(200).json(data);
    } catch (error) {
        console.error('updateOrderStatus error:', error);
        return res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau.' });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getAllOrders,
    getOrderDetail,
    cancelOrder,
    updateOrderStatus,
};
