import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  // CardContent,
  CardMedia,
  Button,
  Box,
  IconButton,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  // Paper,
  Tooltip,
  Skeleton,
  Snackbar,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCartOutlined,
  Store,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateCartItem,
    getCartTotal,
    loading,
    // error,
    fetchCart,
    clearError,
  } = useCart();

  const [localLoading, setLocalLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadCartData = async () => {
      try {
        setLocalLoading(true);
        clearError();
        await fetchCart();
      } catch (err) {
        console.error('Failed to load cart:', err);
      } finally {
        setLocalLoading(false);
      }
    };
    loadCartData();
  }, [fetchCart, clearError]);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await updateCartItem(itemId, newQuantity);
      setSuccessMessage('Item quantity updated successfully');
    } catch (err) {
      console.error('Failed to update quantity:', err);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await removeFromCart(itemId);
      setSuccessMessage('Item removed from cart successfully');
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const getImageUrl = (images: string | string[] | undefined): string => {
    if (!images) return 'https://via.placeholder.com/120x120?text=Product';
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : images;
      } catch {
        return images;
      }
    }
    if (Array.isArray(images) && images.length > 0) {
      return images[0];
    }
    return 'https://via.placeholder.com/120x120?text=Product';
  };

  const EmptyCart = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f7fa',
        p: 4,
        textAlign: 'center',
      }}
    >
      <ShoppingCartOutlined sx={{ fontSize: 100, color: '#ccc', mb: 2 }} />
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Your cart is empty
      </Typography>
      <Typography sx={{ mb: 4, color: 'text.secondary' }}>
        Looks like you haven’t added anything yet. Start exploring our collection.
      </Typography>
      <Button
        variant="contained"
        size="large"
        startIcon={<Store />}
        onClick={() => navigate('/products')}
        sx={{ borderRadius: 30, px: 4, fontWeight: 'bold' }}
      >
        Browse Products
      </Button>
    </Box>
  );

  if (loading || localLoading) {
    return (
      <Box sx={{ bgcolor: '#f8f9ff', minHeight: '100vh', p: 4 }}>
        <Skeleton variant="text" width={300} height={50} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 4 }} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 4, mt: 2 }} />
      </Box>
    );
  }

  if (!cartItems || cartItems.length === 0) return <EmptyCart />;

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="lg">
        <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage(null)}>
          <Alert severity="success" icon={<CheckCircle />}>
            {successMessage}
          </Alert>
        </Snackbar>

        <Typography variant="h4" fontWeight="bold" mb={4}>
          🛒 Your Shopping Cart
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          {/* Left - Cart Items */}
          <Box flex="1">
            {cartItems.map((item) => {
              const isUpdating = updatingItems.has(item.id);
              return (
                <Card
                  key={item.id}
                  sx={{
                    borderRadius: 3,
                    mb: 3,
                    display: 'flex',
                    p: 2,
                    alignItems: 'center',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
                  }}
                >
                  <CardMedia
                    component="img"
                    image={getImageUrl(item.images)}
                    alt={item.name}
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: 2,
                      objectFit: 'cover',
                      border: '1px solid #eee',
                    }}
                  />
                  <Box flex="1" textAlign={{ xs: 'center', md: 'left' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {item.name}
                    </Typography>
                    <Typography color="primary" fontWeight="bold" fontSize="1.1rem">
                      ${Number(item.price).toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Quantity Controls */}
                  <Box display="flex" alignItems="center" sx={{ border: '1px solid #ddd', borderRadius: 5, px: 1 }}>
                    <IconButton
                      size="small"
                      disabled={(item.quantity || 1) <= 1}
                      onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                    >
                      <Remove />
                    </IconButton>
                    <TextField
                      size="small"
                      type="number"
                      value={item.quantity || 1}
                      sx={{ width: 50, textAlign: 'center' }}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val > 0) handleQuantityChange(item.id, val);
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                    >
                      <Add />
                    </IconButton>
                  </Box>

                  {/* Remove */}
                  <Tooltip title="Remove item">
                    <IconButton color="error" onClick={() => handleRemoveItem(item.id)}>
                      {isUpdating ? <CircularProgress size={20} /> : <Delete />}
                    </IconButton>
                  </Tooltip>
                </Card>
              );
            })}
          </Box>

          {/* Right - Order Summary */}
          <Box flex={{ xs: '1 1 100%', lg: '0 0 320px' }} sx={{ position: 'sticky', top: 20 }}>
            <Card sx={{ borderRadius: 3, p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" justifyContent="space-between" mb={1}>
                <span>Subtotal</span> <b>${subtotal.toFixed(2)}</b>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <span>Tax (10%)</span> <b>${tax.toFixed(2)}</b>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary">
                  ${total.toFixed(2)}
                </Typography>
              </Box>
              <Button fullWidth variant="contained" sx={{ mb: 2, fontWeight: 'bold', py: 1.5 }} onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>
              <Button fullWidth variant="outlined" startIcon={<Store />} sx={{ fontWeight: 'bold', py: 1.5 }} onClick={() => navigate('/products')}>
                Continue Shopping
              </Button>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Cart;
