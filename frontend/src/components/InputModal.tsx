import React, { useState, useEffect } from 'react';

interface InputModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    placeholder?: string;
    initialValue?: string;
    onConfirm: (value: string) => void;
    onCancel: () => void;
}

export default function InputModal({ isOpen, title, message, placeholder, initialValue = '', onConfirm, onCancel }: InputModalProps) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue);
        }
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(value);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-card rounded-2xl shadow-2xl max-w-sm w-full mx-4 border border-border overflow-hidden transform animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{message}</p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <input
                                autoFocus
                                type="text"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={placeholder}
                                className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-muted transition-all font-semibold text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-orange-600 transition-all font-semibold text-sm shadow-lg shadow-primary/25"
                            >
                                Add Property
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
