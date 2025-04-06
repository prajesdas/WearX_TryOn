
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const heroElement = heroRef.current;
    const textElement = textRef.current;
    
    if (heroElement && textElement) {
      heroElement.classList.add('animate-blur-in');
      
      const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const opacity = 1 - (scrollPosition * 0.002);
        const translateY = scrollPosition * 0.5;
        
        textElement.style.opacity = Math.max(opacity, 0).toString();
        textElement.style.transform = `translateY(${translateY}px)`;
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  return (
    <div 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center py-32 px-6 overflow-hidden"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1771&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/50"></div>
      
      <div 
        ref={textRef}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <div className="inline-block mb-3 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full">
          <span className="text-white text-sm font-medium">AI-Powered Virtual Try-On</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          The Future of Fashion is Here
        </h1>
        
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Experience clothes virtually before you buy. Our AI technology lets you see how outfits look on you in real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/try-on')}
            className="px-8 py-3 bg-white text-black font-medium rounded-md transition-all hover:bg-opacity-90 hover:shadow-lg"
          >
            Try Now
          </button>
          
          <button 
            onClick={() => navigate('/try-on')}
            className="px-8 py-3 bg-transparent border border-white text-white font-medium rounded-md transition-all hover:bg-white/10"
          >
            View More
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <div className="animate-bounce">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-white" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Hero;
