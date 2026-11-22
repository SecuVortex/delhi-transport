import React from 'react';

/**
 * Reusable Accessible Form Input Component
 */
export function Input({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  required = false
}) {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="form-input"
      />
    </div>
  );
}
