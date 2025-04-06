import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Outfit } from '@/data';
import { useCartStore } from '@/store/CartStore';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface OutfitCardProps {
  outfit: Outfit;
}

const OutfitCard = ({ outfit }: OutfitCardProps) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart, loading: cartLoading } = useCartStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to try-on page
    try {
      await addToCart(outfit.id);
      toast.success(`${outfit.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white hover-lift"
      onClick={() => navigate(`/try-on?outfitId=${outfit.id}`)}
    >
      <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
        <img
          src={outfit.image}
          alt={outfit.name}
          className={`object-cover transition-all duration-300 ${
            imageLoaded ? 'image-loaded' : 'image-loading'
          }`}
          style={{ height: '100%', width: '100%' }}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              className="flex-1 bg-white font-medium text-sm py-2 rounded-md transition-all hover:bg-gray-100"
            >
              Try On
            </button>
            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className="bg-black text-white p-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4">
        <div className="flex flex-col space-y-1">
          <h3 className="text-sm font-medium text-gray-900">{outfit.name}</h3>
          <p className="text-xs text-gray-500">{outfit.category}</p>
          <p className="text-sm font-medium text-gray-900">{outfit.price}</p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={cartLoading}
          className="flex items-center justify-center h-8 w-8 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          <ShoppingCart size={16} />
        </button>
      </div>
    </div>
  );
};

export default OutfitCard;
