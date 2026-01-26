import React, { useState } from 'react';

interface SizeSelectorModalProps {
    isOpen: boolean;
    onConfirm: (size: string, price: number) => void;
    onCancel: () => void;
    existingSizes: string[];
    category: 'kids' | 'men' | 'women' | string;
    basePrice: string;
}

const SIZE_GROUPS = {
    standard: {
        name: 'Standard Clothing',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    },
    kids: {
        name: 'Kids & Junior',
        sizes: ['0-3M', '3-6M', '6-12M', '1-2Y', '3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y']
    },
    footwear: {
        name: 'Footwear (EU/Universal)',
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
    }
};

export default function SizeSelectorModal({ isOpen, onConfirm, onCancel, existingSizes, category, basePrice }: SizeSelectorModalProps) {
    const [sizeType, setSizeType] = useState<'clothing' | 'footwear'>('clothing');
    const [customSize, setCustomSize] = useState('');
    const [selectedFromList, setSelectedFromList] = useState('');
    const [price, setPrice] = useState(basePrice);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const sizeToAdd = customSize.trim() || selectedFromList;
        if (sizeToAdd) {
            onConfirm(sizeToAdd, parseFloat(price) || 0);
            setCustomSize('');
            setSelectedFromList('');
            setPrice(basePrice);
        }
    };

    // Get group based on type
    const getActiveGroup = () => {
        if (sizeType === 'footwear') return SIZE_GROUPS.footwear;
        return (category === 'kids') ? SIZE_GROUPS.kids : SIZE_GROUPS.standard;
    };

    const activeGroup = getActiveGroup();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-foreground">Add {category.charAt(0).toUpperCase() + category.slice(1)} Size</h3>
                        </div>
                        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-full transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-secondary p-1 rounded-xl mb-6">
                        <button
                            onClick={() => { setSizeType('clothing'); setSelectedFromList(''); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${sizeType === 'clothing' ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Clothing Sizes
                        </button>
                        <button
                            onClick={() => { setSizeType('footwear'); setSelectedFromList(''); }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${sizeType === 'footwear' ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Footwear Sizes
                        </button>
                    </div>

                    <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {/* Selected Group Rendering */}
                        <div className="animate-in slide-in-from-bottom-2 duration-300">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">{activeGroup.name}</h4>
                            <div className="grid grid-cols-4 gap-2">
                                {activeGroup.sizes.map((size) => {
                                    const isDisabled = existingSizes.includes(size);
                                    const isSelected = selectedFromList === size;
                                    return (
                                        <button
                                            key={size}
                                            disabled={isDisabled}
                                            onClick={() => {
                                                setSelectedFromList(size);
                                                setCustomSize('');
                                            }}
                                            className={`py-2 px-1 text-sm font-medium rounded-lg border transition-all duration-200 ${isSelected
                                                    ? 'bg-primary border-primary text-primary-foreground shadow-md transform scale-105'
                                                    : isDisabled
                                                        ? 'bg-secondary/50 border-border text-muted-foreground/30 cursor-not-allowed'
                                                        : 'bg-input border-border text-foreground hover:border-primary hover:text-primary'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Custom Input */}
                        <div className="pt-4 border-t border-border">
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Or Enter Custom Size</label>
                            <input
                                type="text"
                                placeholder="e.g. XL, 42, Free Size"
                                value={customSize}
                                onChange={(e) => {
                                    setCustomSize(e.target.value);
                                    setSelectedFromList('');
                                }}
                                className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {/* Price Input */}
                        <div className="pt-4 border-t border-border">
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Price for this Size (₹)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-input border border-border rounded-xl pl-8 pr-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-8">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2.5 rounded-xl bg-secondary text-secondary-foreground hover:bg-muted transition-all font-semibold text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedFromList && !customSize.trim()}
                            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm shadow-lg shadow-primary/25"
                        >
                            Confirm Size & Price
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
