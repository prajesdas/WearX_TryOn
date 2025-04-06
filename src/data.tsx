export interface Outfit {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  price: string;
  priceValue: number;
}

export const outfits: Outfit[] = [
  {
    id: '1',
    name: 'Casual Summer Dress',
    category: 'Dresses',
    description: 'Lightweight summer dress perfect for hot days.',
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    price: '$89.99',
    priceValue: 89.99
  },
  {
    id: '2',
    name: 'Business Suit',
    category: 'Formal',
    description: 'Professional suit for business meetings and formal events.',
    image: 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    price: '$249.99',
    priceValue: 249.99
  },
  {
    id: '3',
    name: 'Casual Jacket',
    category: 'Outerwear',
    description: 'Stylish jacket for casual everyday wear.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80',
    price: '$129.99',
    priceValue: 129.99
  },
  {
    id: '4',
    name: 'Summer T-Shirt',
    category: 'Casual',
    description: 'Lightweight t-shirt for summer days.',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
    price: '$39.99',
    priceValue: 39.99
  },
  {
    id: '5',
    name: 'Evening Gown',
    category: 'Formal',
    description: 'Elegant evening gown for special occasions.',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=830&q=80',
    price: '$299.99',
    priceValue: 299.99
  },
  {
    id: '6',
    name: 'Casual Jeans',
    category: 'Casual',
    description: 'Comfortable jeans for everyday wear.',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    price: '$79.99',
    priceValue: 79.99
  },
  {
    id: '7',
    name: 'Winter Coat',
    category: 'Outerwear',
    description: 'Warm coat for cold winter days.',
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    price: '$199.99',
    priceValue: 199.99
  },
  {
    id: '8',
    name: 'Casual Shirt',
    category: 'Casual',
    description: 'Stylish shirt for casual occasions.',
    image: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    price: '$59.99',
    priceValue: 59.99
  },
  {
    id: '9',
    name: 'Gold Hoop Earrings',
    category: 'earrings',
    description: 'Elegant gold hoop earrings to complement any outfit.',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    price: '$79.99',
    priceValue: 79.99
  },
  {
    id: '10',
    name: 'Pearl Drop Earrings',
    category: 'earrings',
    description: 'Classic pearl drop earrings for formal occasions.',
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    price: '$99.99',
    priceValue: 99.99
  },
  {
    id: '11',
    name: 'Crystal Stud Earrings',
    category: 'earrings',
    description: 'Sparkling crystal stud earrings for everyday glamour.',
    image: 'https://images.unsplash.com/photo-1618403088890-3d9ff6f4c8b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    price: '$59.99',
    priceValue: 59.99
  }
];
