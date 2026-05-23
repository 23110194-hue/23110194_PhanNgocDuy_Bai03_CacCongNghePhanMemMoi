import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Reusable Pagination component
 * Props: page, totalPages, onChange(newPage)
 */
const Pagination = ({ page, totalPages, onChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    if (left > 1) { pages.push(1); if (left > 2) pages.push('...'); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) { if (right < totalPages - 1) pages.push('...'); pages.push(totalPages); }

    const btn = (content, onClick, active = false, disabled = false) => (
        <button
            key={typeof content === 'number' ? content : Math.random()}
            onClick={onClick}
            disabled={disabled}
            style={{
                minWidth: 34, height: 34, padding: '0 6px',
                border: `1px solid ${active ? '#f97316' : '#e5e7eb'}`,
                borderRadius: 7, fontSize: 13, fontWeight: active ? 700 : 400,
                background: active ? '#f97316' : '#fff',
                color: active ? '#fff' : disabled ? '#d1d5db' : '#374151',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!active && !disabled) { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316'; }}}
            onMouseLeave={e => { if (!active && !disabled) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}}
        >
            {content}
        </button>
    );

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 24 }}>
            {btn(<ChevronLeft style={{ width: 15, height: 15 }} />, () => onChange(page - 1), false, page === 1)}
            {pages.map((p, i) =>
                p === '...'
                    ? <span key={`ellipsis-${i}`} style={{ padding: '0 6px', color: '#9ca3af', fontSize: 13 }}>…</span>
                    : btn(p, () => onChange(p), p === page)
            )}
            {btn(<ChevronRight style={{ width: 15, height: 15 }} />, () => onChange(page + 1), false, page === totalPages)}
        </div>
    );
};

export default Pagination;
