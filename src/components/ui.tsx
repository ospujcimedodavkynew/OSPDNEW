
import React, { PropsWithChildren } from 'react';

export const Card: React.FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={`bg-surface rounded-lg shadow p-6 ${className}`}>
    {children}
  </div>
);

export const Button: React.FC<PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>> = ({ children, className, ...props }) => (
  <button className={`bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 ${className}`} {...props}>
    {children}
  </button>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input className={`shadow appearance-none border rounded w-full py-2 px-3 bg-white text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-primary-focus border-border ${className}`} {...props} />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
  <textarea className={`shadow appearance-none border rounded w-full py-2 px-3 bg-white text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-primary-focus border-border ${className}`} {...props} />
);

export const Label: React.FC<PropsWithChildren<React.LabelHTMLAttributes<HTMLLabelElement>>> = ({ children, className, ...props }) => (
  <label className={`block text-text-secondary text-sm font-bold mb-2 ${className}`} {...props}>
    {children}
  </label>
);

export const Modal: React.FC<PropsWithChildren<{ isOpen: boolean; onClose: () => void; title: string }>> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl font-bold">&times;</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};