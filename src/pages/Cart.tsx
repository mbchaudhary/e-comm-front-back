import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  IconButton,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Tooltip,
  Grid,
  Skeleton,
  Snackbar,
} from '@mui/material';
import { 
  Add, 
  Remove, 
  Delete, 
  ShoppingCartOutlined,
  Store,
  LocalOffer,
  Security,
  LocalShipping,
  ArrowForward,
  Refresh,
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
    error,
    fetchCart,
    clearError
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
      } catch (error: any) {
        console.error('Failed to load cart:', error);
      } finally {
        setLocalLoading(false);
      }
    };

    loadCartData();
  }, [fetchCart, clearError]);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateCartItem(itemId, newQuantity);
      setSuccessMessage('Item quantity updated successfully');
    } catch (error: any) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await removeFromCart(itemId);
      setSuccessMessage('Item removed from cart successfully');
    } catch (error: any) {
      console.error('Failed to remove item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRefreshCart = async () => {
    try {
      setLocalLoading(true);
      clearError();
      await fetchCart();
    } catch (error: any) {
      console.error('Failed to refresh cart:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const getImageUrl = (images: string | string[] | undefined): string => {
    if (!images) return 'https://via.placeholder.com/120x120/667eea/ffffff?text=Product';
    
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
    
    return 'https://via.placeholder.com/120x120/667eea/ffffff?text=Product';
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <Box sx={{ bgcolor: '#f8f9ff', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={60} />
          <Skeleton variant="text" width={200} height={30} />
        </Box>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 8 }}>
            {[1, 2, 3].map((item) => (
              <Card key={item} sx={{ mb: 2, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Skeleton variant="rectangular" width={120} height={120} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width={200} height={30} />
                      <Skeleton variant="text" width={100} height={20} />
                      <Skeleton variant="text" width={80} height={25} />
                    </Box>
                    <Skeleton variant="rectangular" width={120} height={40} />
                    <Skeleton variant="text" width={80} height={30} />
                    <Skeleton variant="circular" width={40} height={40} />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Skeleton variant="text" width={150} height={40} />
                <Box sx={{ mt: 3 }}>
                  {[1, 2, 3, 4].map((item) => (
                    <Box key={item} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Skeleton variant="text" width={100} height={20} />
                      <Skeleton variant="text" width={60} height={20} />
                    </Box>
                  ))}
                </Box>
                <Skeleton variant="rectangular" width="100%" height={50} sx={{ mt: 3, borderRadius: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  // Empty cart component
  const EmptyCart = () => (
    <Box sx={{ bgcolor: '#f8f9ff', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Paper 
          sx={{ 
            p: 8, 
            textAlign: 'center',
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              bgcolor: 'primary.light',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            }}
          >
            <ShoppingCartOutlined sx={{ fontSize: 60, color: 'white' }} />
          </Box>

          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}
          >
            Your Cart is Empty
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            gutterBottom
            sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}
          >
            Looks like you haven't added any items to your cart yet. 
            Start shopping to fill it up!
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 3, maxWidth: 500, mx: 'auto' }}
              action={
                <Button color="inherit" size="small" onClick={handleRefreshCart}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Store />}
              endIcon={<ArrowForward />}
              onClick={() => navigate('/products')}
              sx={{
                py: 2,
                px: 6,
                borderRadius: 4,
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1.1rem',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                boxShadow: '0 6px 20px rgba(102,126,234,0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102,126,234,0.4)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Start Shopping
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/home')}
              sx={{ 
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold'
              }}
            >
              Back to Home
            </Button>

            <Button
              variant="text"
              startIcon={<Refresh />}
              onClick={handleRefreshCart}
              sx={{ 
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 'bold',
                mt: 2
              }}
            >
              Refresh Cart
            </Button>
          </Box>

          {/* Features */}
          <Grid container spacing={3} sx={{ mt: 6 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <LocalShipping sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Free Shipping
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  On orders over $50
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Security sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Secure Payment
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  100% secure checkout
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <LocalOffer sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Best Deals
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Great prices daily
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );

  // Show loading state
  if (loading || localLoading) {
    return <LoadingSkeleton />;
  }

  // Show empty cart when no items
  if (!cartItems || cartItems.length === 0) {
    return <EmptyCart />;
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <Box sx={{ bgcolor: '#f8f9ff', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSuccessMessage(null)} 
            severity="success" 
            sx={{ width: '100%' }}
            icon={<CheckCircle />}
          >
            {successMessage}
          </Alert>
        </Snackbar>

        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ fontWeight: 'bold', color: 'text.primary' }}
            >
              Shopping Cart
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefreshCart}
            disabled={localLoading}
            sx={{ 
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 'bold'
            }}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 3 }}
            onClose={clearError}
            action={
              <Button color="inherit" size="small" onClick={handleRefreshCart}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {cartItems.map((item) => {
                const isUpdating = updatingItems.has(item.id);
                
                return (
                  <Card 
                    key={`cart-item-${item.id}`}
                    sx={{ 
                      borderRadius: 3,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      border: '1px solid rgba(102,126,234,0.1)',
                      transition: 'all 0.3s ease',
                      opacity: isUpdating ? 0.7 : 1,
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        transform: isUpdating ? 'none' : 'translateY(-2px)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', md: 'row' }, 
                        alignItems: { xs: 'stretch', md: 'center' }, 
                        gap: 3 
                      }}>
                        {/* Product Image */}
                        <Box 
                          sx={{ 
                            flex: '0 0 auto',
                            alignSelf: { xs: 'center', md: 'flex-start' }
                          }}
                        >
                          <Card sx={{ width: 120, height: 120, borderRadius: 2 }}>
                            <CardMedia
                              component="img"
                              height="120"
                              image={getImageUrl(item.images)}
                              alt={item.name || 'Product'}
                              sx={{ 
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                }
                              }}
                              onError={(e: any) => {
                                e.target.src = 'https://via.placeholder.com/120x120/667eea/ffffff?text=Product';
                              }}
                            />
                          </Card>
                        </Box>

                        {/* Product Info */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="h6" 
                            component="h3"
                            gutterBottom
                            sx={{ fontWeight: 'bold', mb: 1 }}
                          >
                            {item.name || 'Product Name'}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip 
                              label="In Stock" 
                              size="small" 
                              color="success"
                            />
                            {item.brand && (
                              <Chip 
                                label={item.brand} 
                                size="small" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                          
                          <Typography 
                            variant="h6" 
                            color="primary"
                            sx={{ fontWeight: 'bold' }}
                          >
                            ${Number(item.price || 0).toFixed(2)}
                          </Typography>
                          
                          {item.stock_quantity && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              {item.stock_quantity} available in stock
                            </Typography>
                          )}
                        </Box>

                        {/* Quantity Controls */}
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: { xs: 'row', md: 'column' },
                          alignItems: 'center', 
                          gap: 2 
                        }}>
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary"
                            sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'block' } }}
                          >
                            Quantity
                          </Typography>
                          <Paper 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              border: '2px solid',
                              borderColor: 'primary.light',
                              borderRadius: 3,
                              overflow: 'hidden',
                              position: 'relative'
                            }}
                          >
                            {isUpdating && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: 'rgba(255,255,255,0.8)',
                                  zIndex: 1
                                }}
                              >
                                <CircularProgress size={20} />
                              </Box>
                            )}
                            
                            <Tooltip title="Decrease quantity">
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                                disabled={(item.quantity || 1) <= 1 || isUpdating}
                                sx={{ 
                                  borderRadius: 0,
                                  '&:hover': { bgcolor: 'primary.light' }
                                }}
                              >
                                <Remove />
                              </IconButton>
                            </Tooltip>
                            
                            <TextField
                              size="small"
                              type="number"
                              value={item.quantity || 1}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value > 0 && !isUpdating) {
                                  handleQuantityChange(item.id, value);
                                }
                              }}
                              disabled={isUpdating}
                              sx={{ 
                                width: 60,
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': { border: 'none' },
                                  '& input': { 
                                    textAlign: 'center', 
                                    fontWeight: 'bold',
                                    py: 1
                                  }
                                }
                              }}
                              inputProps={{ min: 1, max: item.stock_quantity || 999 }}
                            />
                            
                            <Tooltip title="Increase quantity">
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                                disabled={isUpdating || Boolean(item.stock_quantity && (item.quantity || 1) >= item.stock_quantity)}
                                sx={{ 
                                  borderRadius: 0,
                                  '&:hover': { bgcolor: 'primary.light' }
                                }}
                              >
                                <Add />
                              </IconButton>
                            </Tooltip>
                          </Paper>
                        </Box>

                        {/* Subtotal */}
                        <Box sx={{ textAlign: { xs: 'center', md: 'right' }, minWidth: '100px' }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Subtotal
                          </Typography>
                          <Typography 
                            variant="h5" 
                            color="primary"
                            sx={{ fontWeight: 'bold' }}
                          >
                            ${(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </Typography>
                        </Box>

                        {/* Remove Button */}
                        <Tooltip title="Remove item">
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdating}
                            sx={{
                              border: '2px solid',
                              borderColor: 'error.light',
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: 'error.main',
                                color: 'white',
                                transform: 'scale(1.05)',
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {isUpdating ? <CircularProgress size={20} color="inherit" /> : <Delete />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Grid>

          {/* Order Summary */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <Card 
                sx={{ 
                  borderRadius: 4,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(102,126,234,0.1)'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ fontWeight: 'bold', mb: 3 }}
                  >
                    Order Summary
                  </Typography>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">
                      Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}):
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      ${subtotal.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">Shipping:</Typography>
                    <Typography variant="body1" color="success.main" sx={{ fontWeight: 'bold' }}>
                      Free
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">Estimated Tax:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      ${tax.toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Total:
                    </Typography>
                    <Typography 
                      variant="h5" 
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    >
                      ${total.toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Savings Info */}
                  {subtotal >= 50 && (
                    <Paper
                      sx={{
                        p: 2,
                        mb: 3,
                        bgcolor: 'success.light',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'success.main'
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        color="success.dark"
                        sx={{ fontWeight: 'bold', textAlign: 'center' }}
                      >
                        🎉 You qualify for free shipping!
                      </Typography>
                    </Paper>
                  )}
                  
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => navigate('/checkout')}
                    disabled={cartItems.length === 0}
                    sx={{
                      py: 2,
                      mb: 2,
                      borderRadius: 4,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      boxShadow: '0 6px 20px rgba(102,126,234,0.3)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(102,126,234,0.4)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    startIcon={<Store />}
                    onClick={() => navigate('/products')}
                    sx={{ 
                      borderRadius: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Continue Shopping
                  </Button>
                </CardContent>
              </Card>

              {/* Security Features */}
              <Paper
                sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #f0f2ff 0%, #ffffff 100%)',
                  border: '1px solid rgba(102,126,234,0.1)'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Secure Checkout
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security color="primary" sx={{ fontSize: 18 }} />
                    SSL encrypted payment
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShipping color="primary" sx={{ fontSize: 18 }} />
                    Free shipping over $50
                  </Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOffer color="primary" sx={{ fontSize: 18 }} />
                    30-day money back guarantee
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Cart;
