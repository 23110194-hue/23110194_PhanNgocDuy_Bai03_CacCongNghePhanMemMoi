import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { notification } from 'antd';
import {
    addToCartApi,
    clearCartApi,
    getCartApi,
    removeCartItemApi,
    updateCartItemApi,
} from '../../util/api';
import { AuthContext } from './auth.context';

const emptyCart = {
    items: [],
    summary: {
        totalQuantity: 0,
        subtotal: 0,
        shippingFee: 0,
        total: 0,
    },
};

export const CartContext = createContext({
    cart: emptyCart,
    cartLoading: false,
    refreshCart: async () => {},
    addToCart: async () => {},
    updateCartItem: async () => {},
    removeCartItem: async () => {},
    clearCart: async () => {},
});

export const CartWrapper = ({ children }) => {
    const { auth } = useContext(AuthContext);
    const [cart, setCart] = useState(emptyCart);
    const [cartLoading, setCartLoading] = useState(false);

    const refreshCart = useCallback(async (silent = true) => {
        if (!auth.isAuthenticated) {
            setCart(emptyCart);
            return emptyCart;
        }
        if (!silent) setCartLoading(true);
        const res = await getCartApi();
        if (res && !res.message) {
            setCart(res);
            if (!silent) setCartLoading(false);
            return res;
        }
        if (!silent && res?.message) {
            notification.error({
                message: 'Không thể tải giỏ hàng',
                description: res.message,
            });
        }
        setCartLoading(false);
        return emptyCart;
    }, [auth.isAuthenticated]);

    // Reset giỏ hàng ngay khi logout
    useEffect(() => {
        if (!auth.isAuthenticated) {
            setCart(emptyCart);
        }
    }, [auth.isAuthenticated]);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const addToCart = async (productId, quantity = 1) => {
        if (!auth.isAuthenticated) return { error: 'NOT_AUTH' };
        setCartLoading(true);
        const res = await addToCartApi(productId, quantity);
        setCartLoading(false);
        if (res && !res.message) {
            setCart(res);
            notification.success({ message: 'Đã thêm vào giỏ hàng' });
            return res;
        }
        if (res?.message) {
            notification.error({ message: 'Không thể thêm vào giỏ hàng', description: res.message });
        }
        return res;
    };

    const updateCartItem = async (productId, quantity) => {
        if (!auth.isAuthenticated) return { error: 'NOT_AUTH' };
        setCartLoading(true);
        const res = await updateCartItemApi(productId, quantity);
        setCartLoading(false);
        if (res && !res.message) {
            setCart(res);
            return res;
        }
        if (res?.message) {
            notification.error({ message: 'Cập nhật giỏ hàng thất bại', description: res.message });
        }
        return res;
    };

    const removeCartItem = async (productId) => {
        if (!auth.isAuthenticated) return { error: 'NOT_AUTH' };
        setCartLoading(true);
        const res = await removeCartItemApi(productId);
        setCartLoading(false);
        if (res && !res.message) {
            setCart(res);
            return res;
        }
        if (res?.message) {
            notification.error({ message: 'Cập nhật giỏ hàng thất bại', description: res.message });
        }
        return res;
    };

    const clearCart = async () => {
        if (!auth.isAuthenticated) return { error: 'NOT_AUTH' };
        setCartLoading(true);
        const res = await clearCartApi();
        setCartLoading(false);
        if (res && !res.message) {
            setCart(res);
            return res;
        }
        if (res?.message) {
            notification.error({ message: 'Xóa giỏ hàng thất bại', description: res.message });
        }
        return res;
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                cartLoading,
                refreshCart,
                addToCart,
                updateCartItem,
                removeCartItem,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
