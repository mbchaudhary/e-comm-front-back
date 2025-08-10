// pages/ProductDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container, Box, Typography, Card, CardMedia, Button,
  Alert, CircularProgress, TextField, Divider, Paper, Snackbar
} from "@mui/material";
import { Product } from "../types";
import apiService from "../services/api";
import { useCart } from "../contexts/CartContext";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await apiService.getProductById(parseInt(id!, 10));
      setProduct(data);
    } catch {
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (quantity < 1 || quantity > product.stock_quantity) {
      setError("Invalid quantity");
      return;
    }
    try {
      await addToCart(product, quantity);
      setSuccess(`${product.name} added to cart`);
      setError(null);
    } catch {
      setError("Failed to add to cart");
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error && !product) return <Container><Alert severity="error" sx={{ mt: 2 }}>{error}</Alert></Container>;

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }} elevation={3}>
        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={4}>
          <Box flex="1 1 50%">
            <Card>
              <CardMedia component="img" height="400" image={product?.images?.[0] || "https://via.placeholder.com/400"} alt={product?.name} />
            </Card>
          </Box>
          <Box flex="1 1 50%">
            <Typography variant="h4">{product?.name}</Typography>
            <Typography variant="h5" color="primary">${product?.price}</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>{product?.description}</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color={(product?.stock_quantity ?? 0) > 0 ? "success.main" : "error.main"}>
              {(product?.stock_quantity ?? 0) > 0 ? `In Stock: ${product?.stock_quantity}` : "Out of Stock"}
            </Typography>
            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
            {(product?.stock_quantity ?? 0) > 0 && (
              <Box mt={2} display="flex" gap={2}>
                <TextField type="number" size="small" label="Quantity" value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value), product!.stock_quantity)))}
                  inputProps={{ min: 1, max: product?.stock_quantity }} sx={{ width: 100 }} />
                <Button variant="contained" onClick={handleAddToCart}>Add to Cart</Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
      <Snackbar open={Boolean(success)} onClose={() => setSuccess(null)} message={success} autoHideDuration={3000} />
    </Container>
  );
};
export default ProductDetail;
