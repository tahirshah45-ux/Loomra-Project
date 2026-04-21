import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  type DocumentData 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Product type definition
// Note: Firestore stores images in 'img' field, with optional 'imageUrl' for legacy data
export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  img: string;
  createdAt?: Date;
  [key: string]: unknown;
}

/**
 * Custom hook for fetching real-time products from Firestore
 * Uses 'default' database and 'products' collection
 */
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Real-time listener for products collection
    const productsRef = collection(db, 'products');
    const productsQuery = query(productsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        const productsData: Product[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        
        setProducts(productsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { products, loading, error };
};

export default useProducts;