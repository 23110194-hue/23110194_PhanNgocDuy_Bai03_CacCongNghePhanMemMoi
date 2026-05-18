import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
    return (
        <div className="card group flex flex-col h-full relative">
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.isNew && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        MỚI
                    </span>
                )}
                {product.hasDiscount && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        -{product.discountPercent}%
                    </span>
                )}
            </div>

            <Link to={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-slate-100">
                <img
                    src={product.images && product.images.length > 0 ? product.images[0] : "https://placehold.co/400x600?text=No+Image"}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </Link>

            <div className="p-5 flex flex-col flex-grow">
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    {product.category}
                </div>

                <Link to={`/product/${product.slug}`} className="block">
                    <h3 className="font-display text-lg font-semibold text-slate-900 leading-tight mt-2">
                        {product.title}
                    </h3>
                </Link>

                <div className="text-sm text-slate-500 mt-1">
                    {product.author}
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                    <div>
                        <div className="text-lg font-bold text-slate-900">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.finalPrice)}
                        </div>
                        {product.hasDiscount && (
                            <div className="text-xs text-slate-400 line-through">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                            </div>
                        )}
                    </div>

                    <button className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-slate-400 hover:text-slate-900 transition">
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;