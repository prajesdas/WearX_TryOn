import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OutfitCard from '@/components/OutfitCard';
import { outfits } from '@/data';

const Collection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Group outfits by category - Convert all categories to lowercase for consistency
  const categories = ['all', ...Array.from(new Set(outfits.map(outfit => 
    outfit.category.toLowerCase())))];
  
  const filteredOutfits = activeCategory === 'all' 
    ? outfits 
    : outfits.filter(outfit => outfit.category.toLowerCase() === activeCategory);
  
  useEffect(() => {
    // Set visible with a small delay to ensure animations work
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };
  
  return (
    <div className={`min-h-screen flex flex-col transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar />
      
      <main className="flex-grow pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-12 pt-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Collections</h1>
            <p className="text-lg text-gray-600">
              Explore our full range of products available for virtual try-on.
            </p>
          </header>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h2 className="text-xl font-semibold">Products</h2>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    activeCategory === category
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {filteredOutfits.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredOutfits.map(outfit => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 border border-dashed rounded-lg">
              <p className="text-gray-500">No products found in this category</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Collection;
