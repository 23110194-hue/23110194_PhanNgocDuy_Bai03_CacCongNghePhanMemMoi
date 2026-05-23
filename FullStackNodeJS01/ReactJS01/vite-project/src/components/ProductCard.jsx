import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { AuthContext } from './context/auth.context';
import { CartContext } from './context/cart.context';
import { formatCurrency } from '../util/format';
import { useContext } from 'react';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const { addToCart, cartLoading } = useContext(CartContext);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        if (!auth.isAuthenticated) { navigate('/login'); return; }
        await addToCart(product.id, 1);
    };

    return (
        <Link to={`/product/${product.slug}`} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none', color: 'inherit' }}>
            {/* Image */}
            <div style={{ position: 'relative', paddingTop: '140%', background: '#f9fafb', overflow: 'hidden' }}>
                <img
                    src={product.images?.length > 0 ? product.images[0] : 'https://placehold.co/300x420?text=No+Image'}
                    alt={product.title}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                {/* Badges */}
                <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {product.isNew && (
                        <span style={{ background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>MỚI</span>
                    )}
                    {product.hasDiscount && (
                        <span style={{ background: '#f97316', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>
                            -{product.discountPercent}%
                        </span>
                    )}
                </div>
            </div>

            {/* Info */}
            <div style={{ padding: '10px 10px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{product.category}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4, flex: 1,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                    {product.title}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{product.author}</div>

                {/* Price + cart */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#f97316' }}>
                            {formatCurrency(product.finalPrice)}
                        </div>
                        {product.hasDiscount && (
                            <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>
                                {formatCurrency(product.price)}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={cartLoading || product.stock <= 0}
                        style={{
                            width: 32, height: 32, borderRadius: 6,
                            border: '1px solid #e5e7eb', background: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
                            opacity: product.stock <= 0 ? 0.4 : 1,
                            transition: 'border-color 0.15s, background 0.15s'
                        }}
                        onMouseEnter={e => { if (product.stock > 0) { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.background = '#fff7ed'; }}}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
                    >
                        <ShoppingCart style={{ width: 14, height: 14, color: '#f97316' }} />
                    </button>
                </div>

                {/* Sold count */}
                {product.sold > 0 && (
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>
                        🔥 Đã bán: {product.sold}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ProductCard;