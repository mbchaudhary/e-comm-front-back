import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  CardMedia,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Snackbar,
  IconButton,
  Chip,
  Rating,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ShoppingCart,
  FavoriteOutlined,
  Add,
  Remove,
  Inventory,
  LocalOffer,
  Close,
} from "@mui/icons-material";
import { Product } from "../types";
import apiService from "../services/api";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/wishlistContext";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const { addToCart } = useCart();

  const userId = Number(localStorage.getItem("UserID"));

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProductById(parseInt(id!, 10));
      setProduct(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (quantity < 1 || quantity > (product.stock_quantity || 1)) {
      setError("Invalid quantity selected");
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(product, quantity);
      setSuccess(`${product.name} (${quantity}) added to cart successfully!`);
      setQuantity(1);
    } catch (err: any) {
      setError(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (quantity < 1 || quantity > (product.stock_quantity || 1)) {
      setError("Invalid quantity selected");
      return;
    }
    try {
      setBuyingNow(true);
      const orderPayload = {
        order_total: (product.price || 0) * quantity,
        payment_method: "cod",
        shipping_address: JSON.stringify({
          address: "Default Address",
          city: "City",
          postal_code: "000000",
          country: "Country",
        }),
        order_items: [
          {
            product_id: product.id,
            quantity,
            price: product.price,
          },
        ],
      };
      await apiService.createOrder(orderPayload);
      navigate("/orders");
    } catch (err: any) {
      console.error("Buy Now error:", err);
      setError(err.message || "Failed to process Buy Now");
    } finally {
      setBuyingNow(false);
    }
  };

  const handleQuantityChange = (change: number) => {
    if (!product) return;
    const newQty = quantity + change;
    if (newQty >= 1 && newQty <= (product.stock_quantity || 1)) {
      setQuantity(newQty);
      setError(null);
    }
  };

  const handleFavorite = async (product: Product) => {
    const existing = wishlist.find((w) => w.product_id === product.id);
    if (existing) {
      await removeFromWishlist(existing.id);
    } else {
      await addToWishlist(userId, product.id);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleImageClick = () => {
    setImageModalOpen(true);
  };
  const handleCloseModal = () => {
    setImageModalOpen(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && !product) {
    return (
      <Container>
        <Alert
          severity="error"
          sx={{ mt: 2, borderRadius: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        <Paper
          elevation={2}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0px 8px 30px rgba(0,0,0,0.08)",
            background: "#fff",
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: "column", lg: "row" }}
            gap={{ xs: 3, lg: 6 }}
            p={{ xs: 2, md: 5 }}
          >
            {/* Product Image */}
            <Box
              sx={{
                flex: 1,
                position: "relative",
                borderRadius: 4,
                overflow: "hidden",
                cursor: "pointer",
              }}
              onClick={handleImageClick}
            >
              <CardMedia
                component="img"
                image={
                  product?.images ||
                  "https://via.placeholder.com/600x600?text=No+Image"
                }
                alt={product?.name}
                sx={{
                  width: "100%",
                  height: { xs: 260, sm: 360, md: 500 },
                  objectFit: "cover",
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              />
              <Chip
                icon={<LocalOffer sx={{ fontSize: 16 }} />}
                label="SALE"
                size="small"
                sx={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  bgcolor: "error.main",
                  color: "#fff",
                  fontWeight: "bold",
                  px: 1,
                  borderRadius: 1.5,
                  fontSize: { xs: "0.7rem", sm: "0.8rem" },
                }}
              />
              <Tooltip
                title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(product!);
                    toggleFavorite();
                  }}
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    bgcolor: "rgba(255,255,255,0.95)",
                    "&:hover": {
                      bgcolor: isFavorite ? "error.main" : "primary.main",
                      color: "#fff",
                    },
                  }}
                >
                  <FavoriteOutlined />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Product Details */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Typography
                variant="h4"
                fontWeight={700}
                gutterBottom
                color="primary.dark"
                sx={{ fontSize: { xs: "1.6rem", sm: "2rem" } }}
              >
                {product?.name}
              </Typography>

              <Box
                display="flex"
                alignItems="center"
                gap={1.5}
                mb={3}
                flexWrap="wrap"
              >
                <Rating value={4.5} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  (124 reviews)
                </Typography>
              </Box>

              {/* Price Section - Responsive */}
              <Box
                mb={2}
                display="flex"
                alignItems={{ xs: "flex-start", sm: "center" }}
                flexDirection={{ xs: "column", sm: "row" }}
                gap={1}
              >
                <Typography
                  variant="h3"
                  color="primary"
                  fontWeight={700}
                  sx={{ fontSize: { xs: "1.8rem", sm: "2.4rem" } }}
                >
                  ${product?.price}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: "line-through",
                    color: "text.disabled",
                    fontSize: { xs: "1rem", sm: "1.2rem" },
                  }}
                >
                  ${(product?.price || 0) * 1.25}
                </Typography>
                <Chip
                  label="20% OFF"
                  size="small"
                  sx={{
                    bgcolor: "success.main",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                  }}
                />
              </Box>

              {/* Description */}
              <Typography
                variant="body1"
                color="text.secondary"
                paragraph
                sx={{
                  mb: 3,
                  lineHeight: 1.7,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                {product?.description}
              </Typography>

              {/* Stock Status */}
              <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                <Inventory
                  color={product?.stock_quantity! > 0 ? "success" : "error"}
                />
                <Typography
                  fontWeight={600}
                  color={
                    product?.stock_quantity! > 0 ? "success.main" : "error.main"
                  }
                  sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                >
                  {product?.stock_quantity! > 0
                    ? `${product?.stock_quantity} in stock`
                    : "Out of stock"}
                </Typography>
              </Box>

              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 3 }}
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              {product?.stock_quantity! > 0 && (
                <>
                  {/* Quantity Selector */}
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>
                    Quantity
                  </Typography>
                  <Box display="flex" alignItems="center" gap={3} mb={4}>
                    <IconButton
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      sx={{ border: "1px solid", borderColor: "divider" }}
                    >
                      <Remove />
                    </IconButton>
                    <Typography fontWeight={600} fontSize="1.2rem">
                      {quantity}
                    </Typography>
                    <IconButton
                      onClick={() => handleQuantityChange(1)}
                      disabled={!product || quantity >= product.stock_quantity!}
                      sx={{ border: "1px solid", borderColor: "divider" }}
                    >
                      <Add />
                    </IconButton>
                  </Box>

                  {/* Buttons */}
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={2}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={
                        addingToCart ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <ShoppingCart />
                        )
                      }
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      fullWidth
                      sx={{
                        fontWeight: 600,
                        bgcolor: "primary.main",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      {addingToCart ? "Adding..." : "Add to Cart"}
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={
                        buyingNow ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <ShoppingCart />
                        )
                      }
                      onClick={handleBuyNow}
                      disabled={buyingNow}
                      fullWidth
                      sx={{
                        fontWeight: 600,
                        bgcolor: "success.main",
                        "&:hover": { bgcolor: "success.dark" },
                      }}
                    >
                      {buyingNow ? "Processing..." : "Buy Now"}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        message={success}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            bgcolor: "success.main",
            color: "#fff",
            fontWeight: 600,
          },
        }}
      />

      {/* Image Modal */}
      <Dialog
        open={imageModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogActions sx={{ justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={handleCloseModal} aria-label="close">
            <Close />
          </IconButton>
        </DialogActions>
        <DialogContent sx={{ p: 0, backgroundColor: "#000" }}>
          <Box
            component="img"
            src={
              product?.images ||
              "https://via.placeholder.com/600x600?text=No+Image"
            }
            alt={product?.name}
            sx={{ width: "100%", objectFit: "contain", maxHeight: "80vh" }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ProductDetail;
