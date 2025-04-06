import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from "sonner";
import { outfits, Outfit } from '@/data';
import { useCartStore } from '@/store/CartStore';
import { ShoppingCart } from 'lucide-react';

const TryOn = () => {
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { addToCart, loading: cartLoading } = useCartStore();
  
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
    
    const searchParams = new URLSearchParams(location.search);
    const outfitId = searchParams.get('outfitId');
    
    if (outfitId) {
      const outfit = outfits.find(o => o.id === outfitId);
      if (outfit) {
        setSelectedOutfit(outfit);
      }
    }
    
    return () => {
      stopCamera();
    };
  }, [location.search]);
  
  // Automatically start try-on when an outfit is selected
  useEffect(() => {
    if (selectedOutfit && !showWebcam) {
      handleTryOnClick();
    }
  }, [selectedOutfit]);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        
        // Automatically process the try-on after camera starts
        setTimeout(() => {
          processTryOn();
        }, 1000);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera. Please check permissions.");
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      setTryOnResult(null);
    }
  };
  
  const handleTryOnClick = () => {
    if (!selectedOutfit) {
      toast.error("Please select an outfit first");
      return;
    }
    
    setShowWebcam(true);
    setTryOnResult(null);
    
    setTimeout(() => {
      startCamera();
    }, 500);
  };
  
  const handleCloseWebcam = () => {
    stopCamera();
    setShowWebcam(false);
  };
  
  const processTryOn = async () => {
    if (!videoRef.current || !selectedOutfit) return;
    
    try {
      // Show loading state
      toast.info("Processing your try-on...");
      
      // Create a canvas to capture the current video frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }
      
      // Draw the current video frame onto the canvas
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert the canvas to a data URL
      const imageData = canvas.toDataURL('image/jpeg');
      
      // Send to backend API
      const response = await fetch('/api/try-on', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData,
          type: selectedOutfit.category.toLowerCase(), // Use the outfit category (lowercase)
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTryOnResult(result.image);
        toast.success("Virtual try-on complete!");
      } else {
        toast.error("Failed to process try-on: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error in try-on process:", error);
      toast.error("An error occurred during the try-on process");
    }
  };
  
  const handleSelectOutfit = (outfit: Outfit) => {
    setSelectedOutfit(outfit);
    // Try-on will start automatically via the useEffect
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    // Clear selection if category changes
    if (selectedOutfit && selectedOutfit.category.toLowerCase() !== category && category !== 'all') {
      setSelectedOutfit(null);
      if (showWebcam) {
        handleCloseWebcam();
      }
    }
  };

  const handleAddToCart = async (outfit: Outfit, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the product selection
    try {
      await addToCart(outfit.id);
      toast.success(`${outfit.name} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    }
  };
  
  return (
    <div className={`min-h-screen flex flex-col transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar />
      
      <main className="flex-grow pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <header className="mb-12 pt-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Virtual Try-On</h1>
            <p className="text-lg text-gray-600">
              Experience how our products look on you before purchasing.
            </p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold">Select a Product</h2>
                
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredOutfits.length > 0 ? (
                  filteredOutfits.map(outfit => (
                    <div 
                      key={outfit.id}
                      className={`cursor-pointer border rounded-lg overflow-hidden transition-all ${
                        selectedOutfit?.id === outfit.id 
                          ? 'ring-2 ring-black shadow-md transform scale-[1.02]' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleSelectOutfit(outfit)}
                    >
                      <div className="aspect-square relative">
                        <img 
                          src={outfit.image} 
                          alt={outfit.name} 
                          className="object-cover h-full w-full"
                        />
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          {outfit.category}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium truncate">{outfit.name}</h3>
                            <p className="text-sm text-gray-600">{outfit.price}</p>
                          </div>
                          <button 
                            onClick={(e) => handleAddToCart(outfit, e)}
                            disabled={cartLoading}
                            className="flex items-center justify-center h-8 w-8 bg-black text-white rounded-full hover:bg-gray-700 transition-colors"
                            title="Add to Cart"
                          >
                            <ShoppingCart size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 flex items-center justify-center py-12 border border-dashed rounded-lg">
                    <p className="text-gray-500">No products found in this category</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="h-full flex flex-col">
              {!showWebcam ? (
                <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                  <div className="text-center max-w-md">
                    <h3 className="text-xl font-medium mb-2">Virtual Try-On Experience</h3>
                    <p className="text-gray-600 mb-6">
                      Select an item to automatically start the virtual try-on experience using your webcam.
                    </p>
                    
                    {selectedOutfit ? (
                      <div className="p-4 bg-white border rounded-lg mb-6 shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">Selected:</p>
                        <p className="font-medium">{selectedOutfit.name}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                          {selectedOutfit.category}
                        </span>
                        <div className="mt-4">
                          <button
                            onClick={(e) => handleAddToCart(selectedOutfit, e)}
                            disabled={cartLoading}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                          >
                            <ShoppingCart size={16} />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-white border border-dashed rounded-lg mb-6">
                        <p className="text-gray-500">No item selected</p>
                        <p className="text-sm text-gray-400">Choose a product from the left panel</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-grow border rounded-lg overflow-hidden bg-black relative">
                  {tryOnResult ? (
                    <img 
                      src={tryOnResult} 
                      alt="Try-on result" 
                      className="w-full h-auto object-contain max-h-[600px]"
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-auto object-contain max-h-[600px]"
                    />
                  )}
                  
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button
                      onClick={processTryOn}
                      className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mr-2 hover:bg-white/100 transition-colors"
                      title="Retry"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={handleCloseWebcam}
                      className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  {selectedOutfit && (
                    <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg z-10">
                      <div className="flex items-center gap-4">
                        <img 
                          src={selectedOutfit.image}
                          alt={selectedOutfit.name}
                          className="h-16 w-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{selectedOutfit.name}</h3>
                          <p className="text-sm text-gray-600">{selectedOutfit.price}</p>
                          <p className="text-xs bg-black text-white inline-block px-2 py-0.5 rounded mt-1">
                            {selectedOutfit.category}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleAddToCart(selectedOutfit, e)}
                          disabled={cartLoading}
                          className="flex items-center gap-2 py-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                        >
                          <ShoppingCart size={16} />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TryOn;
