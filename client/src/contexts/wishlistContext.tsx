// src/context/WishlistContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { Wishlist } from "../types";
import apiService from "../services/api";

interface WishlistContextType {
  wishlist: Wishlist[];
  loading: boolean;
  error: string | null;
  getAllWishlistByUserId: (userId: number) => Promise<void>;
  getTotalLengthOfWishlist: () => number;
  addToWishlist: (userId: number, productId: number) => Promise<void>;
  removeFromWishlist: (wishlistId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllWishlistByUserId = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token || !userId) {
        setWishlist([]);
        return;
      }

      const data = await apiService.getWishlistByUser(userId);
      setWishlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch wishlist failed", err);
      setError("Failed to load wishlist");
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWishlist = useCallback(async (userId: number, productId: number) => {
    if (!userId) {
      console.error("No valid userId supplied");
      return;
    }

    const alreadyInWishlist = wishlist.some(item => item.product_id === productId);
    if (alreadyInWishlist) {
      console.warn("Product already in wishlist");
      return;
    }

    try {
      const newItem = await apiService.addToWishlist({
        user_id: userId,
        product_id: productId
      });
      setWishlist(prev => [...prev, newItem]);
    } catch (err: any) {
      console.error("Add to wishlist failed", err.response?.data || err.message);
    }
  }, [wishlist]);

  const removeFromWishlist = useCallback(async (wishlistId: number) => {
    try {
      await apiService.removeFromWishlist(wishlistId);
      setWishlist(prev => prev.filter(i => i.id !== wishlistId));
    } catch (err) {
      console.error("Remove from wishlist failed", err);
    }
  }, []);

  const getTotalLengthOfWishlist = useCallback(() => wishlist.length, [wishlist]);

  const isInWishlist = useCallback(
    (productId: number) => wishlist.some((item) => item.product_id === productId),
    [wishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        error,
        getAllWishlistByUserId,
        getTotalLengthOfWishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
};
