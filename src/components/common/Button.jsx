import React from 'react';

/**
 * Reusable Accessible Button Component
 * Strictly styled with solid colors, subtle borders, and zero gradients.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  title,
  ariaLabel
}) {
  const baseClass = 'ui-btn';
  const variantClass = variant === 'secondary' ? 'ui-btn-secondary' : 'ui-btn-primary';
  const sizeClass = size === 'sm' ? 'ui-btn-sm' : size === 'icon' ? 'ui-btn-icon' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`.trim()}
    >
      {children}
    </button>
  );
}
