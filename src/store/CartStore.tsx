import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Outfit, outfits } from '@/data';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    image_url: string;
  };
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearError: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  
  clearError: () => set({ error: null }),
  
  fetchCart: async () => {
    try {
      set({ loading: true, error: null });
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (!sessionData.session?.user) {
        set({ items: [], loading: false });
        return;
      }
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            name,
            price,
            image_url
          )
        `)
        .eq('user_id', sessionData.session.user.id);
        
      if (error) throw error;
      set({ items: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching cart:', error);
      set({ error: error.message || 'Failed to fetch cart', loading: false });
    }
  },
  
  addToCart: async (productId) => {
    try {
      set({ loading: true, error: null });
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (!sessionData.session?.user) {
        throw new Error('User must be logged in to add items to cart');
      }
      
      // Find the product in our demo outfits array
      const demoProduct = outfits.find(outfit => outfit.id === productId);
      
      if (!demoProduct) {
        throw new Error('Product not found');
      }
      
      // Check if the product already exists in the database
      const { data: existingProduct, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('name', demoProduct.name)
        .maybeSingle();
        
      if (productError) {
        throw productError;
      }
      
      let dbProductId;
      
      // If the product doesn't exist in the database, create it
      if (!existingProduct) {
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert([{
            name: demoProduct.name,
            description: demoProduct.description,
            price: demoProduct.priceValue,
            image_url: demoProduct.image,
          }])
          .select('id')
          .single();
          
        if (insertError) {
          throw insertError;
        }
        
        dbProductId = newProduct.id;
      } else {
        dbProductId = existingProduct.id;
      }
      
      // Check if product already exists in cart
      const { data: existingItems } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', sessionData.session.user.id)
        .eq('product_id', dbProductId)
        .maybeSingle();
      
      if (existingItems) {
        // If item already exists, increment quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItems.quantity + 1 })
          .eq('id', existingItems.id);
          
        if (error) throw error;
      } else {
        // Otherwise, insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert([{ 
            product_id: dbProductId,
            user_id: sessionData.session.user.id,
            quantity: 1
          }]);
          
        if (error) throw error;
      }
      
      await get().fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      set({ error: error.message || 'Failed to add to cart', loading: false });
    }
  },
  
  removeFromCart: async (itemId) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
      await get().fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      set({ error: error.message || 'Failed to remove from cart', loading: false });
    }
  },
  
  updateQuantity: async (itemId, quantity) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);
        
      if (error) throw error;
      await get().fetchCart();
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      set({ error: error.message || 'Failed to update quantity', loading: false });
    }
  },
}));