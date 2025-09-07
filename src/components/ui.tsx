import React, { PropsWithChildren } from 'react';

export const Card: React.FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={`bg-surface rounded-lg shadow p-6 ${className}`}>
    {children}
  </div>
);

export const Button: React.FC<PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>> = ({ children, className, ...props }) => (
  <button className={`bg-primary hover:bg-primary-focus disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${className}`} {...props}>
    {children}
  </button>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input className={`shadow appearance-none border rounded w-full py-2 px-3 bg-white text-text-primary leading-tight focus:outline-none focus:shadow-outline border-border ${className}`} {...props} />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
  <textarea className={`shadow appearance-none border rounded w-full py-2 px-3 bg-white text-text-primary leading-tight focus:outline-none focus:shadow-outline border-border ${className}`} {...props} />
);

export const Label: React.FC<PropsWithChildren<React.LabelHTMLAttributes<HTMLLabelElement>>> = ({ children, className, ...props }) => (
  <label className={`block text-text-secondary text-sm font-bold mb-2 ${className}`} {...props}>
    {children}
  </label>
);

export const Modal: React.FC<PropsWithChildren<{ isOpen: boolean; onClose: () => void; title: string }>> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl leading-none">&times;</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export const Stepper: React.FC<{ steps: string[], currentStep: number, className?: string }> = ({ steps, currentStep, className }) => {
    return (
        <div className={`flex items-center justify-between ${className}`}>
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {index < currentStep ? '✓' : index + 1}
                        </div>
                        <span className={`ml-2 ${index === currentStep ? 'font-bold text-primary' : 'text-text-secondary'}`}>{step}</span>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 ${index < currentStep ? 'bg-primary' : 'bg-gray-200'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};
