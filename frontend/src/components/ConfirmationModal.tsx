import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
            <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 border border-border">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                    <p className="text-muted-foreground mb-6">{message}</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-muted transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
