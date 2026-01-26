import { Product } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { user, openModal } = useAuth();
    const router = useRouter();

    const handleProductClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            openModal('LOGIN');
        } else {
            router.push(`/product/${product.id}`);
        }
    };

    return (
        <div className="group relative bg-card border border-border rounded-lg flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-w-3 aspect-h-4 bg-muted group-hover:opacity-75 sm:aspect-none sm:h-96">
                <img
                    src={product.imageUrl || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-full object-center object-cover sm:w-full sm:h-full cursor-pointer"
                    onClick={handleProductClick}
                />
            </div>
            <div className="flex-1 p-4 space-y-2 flex flex-col">
                <h3 className="text-sm font-medium text-foreground">
                    <a href={`/product/${product.id}`} onClick={handleProductClick}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                    </a>
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="flex-1 flex items-end justify-between">
                    <p className="text-base font-medium text-foreground">₹{product.price}</p>
                    <p className="text-sm text-muted-foreground">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
                </div>
                {product.sizes && (
                    <div className="mt-2 text-xs text-muted-foreground">
                        Sizes: <span className="text-foreground">{product.sizes}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
