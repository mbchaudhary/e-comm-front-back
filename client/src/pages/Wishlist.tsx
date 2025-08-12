import React, { useEffect, useState } from "react";
import {
  Container, Typography, Box, Card, CardContent, CardMedia, Button,
  IconButton, CircularProgress, Tooltip, Skeleton, Alert, Fade, Chip
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Visibility as ViewIcon,
  DeleteOutline as DeleteIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/wishlistContext";
import { Wishlist } from "../types";

const WishlistPage: React.FC = () => {
  const { wishlist, loading, error, getAllWishlistByUserId, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const userId = Number(localStorage.getItem("UserID"));

  const [removingFromWishlist, setRemovingFromWishlist] = useState<Set<number>>(new Set());
  const [addingToCart, setAddingToCart] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (userId) {
      getAllWishlistByUserId(userId);
    }
  }, [userId, getAllWishlistByUserId]);

  const handleRemoveFromWishlist = async (wishlistId: number, productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRemovingFromWishlist(prev => new Set(prev).add(productId));
    try {
      await removeFromWishlist(wishlistId);
    } finally {
      setRemovingFromWishlist(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddToCart = async (item: Wishlist, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddingToCart(prev => new Set(prev).add(item.product_id));
    try {
      await addToCart(
        {
          id: item.product_id,
          name: item.name ?? "Unknown Product",
          price: item.price ?? 0,
          images: item.images ?? "",
          description: item.description ?? "",
          category_id: 0,
          stock_quantity: 0,
          created_at: "",
        },
        1
      );
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.product_id);
        return newSet;
      });
    }
  };

  const WishlistSkeleton = () => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} sx={{ borderRadius: 3, width: 340 }}>
          <Skeleton variant="rectangular" height={220} sx={{ borderRadius: "12px 12px 0 0" }} />
          <CardContent>
            <Skeleton width="60%" sx={{ mb: 1 }} />
            <Skeleton width="80%" />
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  if (loading) {
    return <Container maxWidth="xl" sx={{ py: 4 }}><WishlistSkeleton /></Container>;
  }

  if (error) {
    return <Container maxWidth="xl" sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Typography variant="h3" fontWeight={700} textAlign="center" sx={{ mb: 1, color: "primary.main" }}>
        My Wishlist
      </Typography>
      <Typography variant="subtitle1" textAlign="center" color="text.secondary" mb={5}>
        {wishlist.length} products saved
      </Typography>

      {wishlist.length === 0 ? (
        <Box textAlign="center" py={8}>
          <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="Empty Wishlist"
            style={{ width: 180, marginBottom: 20, opacity: 0.85 }}
          />
          <Typography variant="h5" gutterBottom>Your wishlist is empty</Typography>
          <Button variant="contained" size="large"
            sx={{ borderRadius: 8, px: 4, background: "linear-gradient(90deg, #667eea, #764ba2)" }}
            onClick={() => navigate("/products")}
          >
            Browse Products
          </Button>
        </Box>
      ) : (
        <Box sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          justifyContent: "center" // ensure center alignment
        }}>
          {wishlist.map((item, idx) => (
            <Fade in key={item.id} style={{ transitionDelay: `${idx * 70}ms` }}>
              <Card
                sx={{
                  borderRadius: 4,
                  position: "relative",
                  width: 340, // increased size
                  boxShadow: "0 8px 25px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.12)"
                  },
                  cursor: "pointer",
                  background: "#fff"
                }}
                onClick={() => navigate(`/products/${item.product_id}`)}
              >
                {/* Product Image */}
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    image={item.images || "https://via.placeholder.com/340x220?text=No+Image"}
                    alt={item.name}
                    sx={{
                      height: 220,
                      objectFit: "cover",
                      transition: "transform 0.3s ease",
                      "&:hover": { transform: "scale(1.05)" }
                    }}
                  />
                  {/* Price Tag */}
                  <Chip
                    label={`$${item.price}`}
                    sx={{
                      position: "absolute",
                      top: 12,
                      left: 12,
                      bgcolor: "primary.main",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      px: 0.5
                    }}
                  />
                  {/* Action Buttons */}
                  <Box sx={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    display: "flex",
                    gap: 1,
                    bgcolor: "rgba(255,255,255,0.88)",
                    borderRadius: "50px",
                    p: "4px 8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                  }}>
                    <Tooltip title="Add to Cart">
                      <span>
                        <IconButton
                          color="success"
                          size="small"
                          sx={{ p: 0.7 }}
                          onClick={e => handleAddToCart(item, e)}
                          disabled={addingToCart.has(item.product_id)}
                        >
                          {addingToCart.has(item.product_id)
                            ? <CircularProgress color="success" size={18} />
                            : <ShoppingCartIcon fontSize="small" />}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <span>
                        <IconButton
                          color="error"
                          size="small"
                          sx={{ p: 0.7 }}
                          onClick={e => handleRemoveFromWishlist(item.id, item.product_id, e)}
                          disabled={removingFromWishlist.has(item.product_id)}
                        >
                          {removingFromWishlist.has(item.product_id)
                            ? <CircularProgress color="error" size={18} />
                            : <DeleteIcon fontSize="small" />}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="View">
                      <span>
                        <IconButton
                          color="primary"
                          size="small"
                          sx={{ p: 0.7 }}
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/products/${item.product_id}`);
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Product Info */}
                <CardContent sx={{ p: 2, textAlign: "center" }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      mb: 0.5,
                      fontSize: "1.05rem",
                      color: "primary.main"
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      fontSize: "0.9rem",
                      lineHeight: 1.4
                    }}
                  >
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default WishlistPage;
