import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Fade,
  Slide,
} from "@mui/material";
import {
  ShoppingCart,
  Visibility,
  Star,
  LocalShipping,
  Security,
  SupportAgent,
  TrendingUp,
  Favorite,
  ArrowForward,
  ShoppingBag,
  Verified,
  FlashOn,
  WorkspacePremium,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Product } from "../types";
import apiService from "../services/api";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/wishlistContext";

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const userId = Number(localStorage.getItem("UserID"));

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await apiService.getProducts();
      setProducts(productsData.slice(0, 8));
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      setAddingToCart((prev) => new Set(prev).add(product.id));
      await addToCart(product, 1);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setAddingToCart((prev) => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
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

  const ProductSkeleton = () => (
    <Box sx={{ width: { xs: "100%", sm: "48%", md: "31%", lg: "23%" }, mb: 4 }}>
      <Card sx={{ borderRadius: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ height: { xs: 160, md: 200 } }} />
        <CardContent>
          <Skeleton variant="text" height={28} width="80%" />
          <Skeleton variant="text" height={20} width="100%" />
          <Skeleton variant="text" height={20} width="60%" />
          <Skeleton variant="text" height={32} width="40%" />
        </CardContent>
      </Card>
    </Box>
  );

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(244, 67, 54, 0.15)",
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  const features = [
    {
      icon: <LocalShipping sx={{ fontSize: { xs: 36, md: 48 } }} />,
      title: "Free Shipping",
      description: "Free shipping on orders over $50",
      color: "#4caf50",
      gradient: "linear-gradient(135deg, #4caf50 0%, #81c784 100%)",
    },
    {
      icon: <Security sx={{ fontSize: { xs: 36, md: 48 } }} />,
      title: "Secure Payment",
      description: "100% secure payment guaranteed",
      color: "#2196f3",
      gradient: "linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)",
    },
    {
      icon: <SupportAgent sx={{ fontSize: { xs: 36, md: 48 } }} />,
      title: "24/7 Support",
      description: "Dedicated customer support",
      color: "#ff9800",
      gradient: "linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)",
    },
    {
      icon: <WorkspacePremium sx={{ fontSize: { xs: 36, md: 48 } }} />,
      title: "Premium Quality",
      description: "Top-notch products guaranteed",
      color: "#9c27b0",
      gradient: "linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)",
    },
  ];

  const stats = [
    { number: "10K+", label: "Happy Customers", icon: <Verified sx={{ fontSize: { xs: 28, md: 36 } }} /> },
    { number: "5K+", label: "Products", icon: <ShoppingBag sx={{ fontSize: { xs: 28, md: 36 } }} /> },
    { number: "99%", label: "Satisfaction Rate", icon: <Star sx={{ fontSize: { xs: 28, md: 36 } }} /> },
    { number: "24/7", label: "Support", icon: <SupportAgent sx={{ fontSize: { xs: 28, md: 36 } }} /> },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          position: "relative",
          overflow: "hidden",
          minHeight: { xs: "48vh", sm: "60vh", md: "80vh" },
          display: "flex",
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)",
            zIndex: 1,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            background:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.03'%3E%3Cpolygon fill='%23fff' points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E\") repeat",
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, py: { xs: 4, md: 8 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: { xs: 4, md: 6 },
            }}
          >
            <Box sx={{ flex: 1, maxWidth: { xs: "100%", md: "50%" } }}>
              <Slide direction="right" in={true} timeout={800}>
                <Box>
                  <Chip
                    label="🚀 New Collection Available"
                    sx={{
                      mb: 2,
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                      fontWeight: 600,
                      backdropFilter: "blur(10px)",
                      fontSize: { xs: "1rem", md: "1.15rem" },
                    }}
                  />
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: "2.2rem", sm: "2.8rem", md: "4rem", lg: "5rem" },
                      color: "white",
                      mb: 1,
                      lineHeight: 1.1,
                    }}
                  >
                    Discover Your
                    <Box
                      component="span"
                      sx={{
                        background: "linear-gradient(45deg, #ffd700, #ff6b6b)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        display: "block",
                      }}
                    >
                      Perfect Style
                    </Box>
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: "rgba(255,255,255,0.9)",
                      mb: 3,
                      fontWeight: 400,
                      maxWidth: 450,
                      fontSize: { xs: "1rem", md: "1.25rem" },
                    }}
                  >
                    Shop the latest trends with unbeatable prices and
                    exceptional quality. Your satisfaction is our priority.
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate("/products")}
                      sx={{
                        background: "linear-gradient(45deg, #ffd700, #ff6b6b)",
                        color: "white",
                        px: { xs: 3, sm: 6 },
                        py: { xs: 1, sm: 2 },
                        fontSize: { xs: "1rem", sm: "1.15rem" },
                        fontWeight: 700,
                        borderRadius: 3,
                        boxShadow: "0 8px 24px rgba(255, 215, 0, 0.4)",
                        "&:hover": {
                          background: "linear-gradient(45deg, #ffed4a, #ff5722)",
                          transform: "translateY(-3px)",
                          boxShadow: "0 12px 32px rgba(255, 215, 0, 0.5)",
                        },
                        transition: "all 0.3s ease",
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Shop Now
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: "white",
                        color: "white",
                        px: { xs: 3, sm: 6 },
                        py: { xs: 1, sm: 2 },
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        fontWeight: 600,
                        borderRadius: 3,
                        borderWidth: 2,
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.1)",
                          borderColor: "white",
                          transform: "translateY(-3px)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Learn More
                    </Button>
                  </Box>
                </Box>
              </Slide>
            </Box>
            <Box sx={{ flex: 1, maxWidth: { xs: "100%", md: "50%" }, mt: { xs: 3, md: 0 } }}>
              <Slide direction="left" in={true} timeout={1000}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 180, sm: 280, md: 400 },
                      height: { xs: 180, sm: 280, md: 400 },
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.07) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      backdropFilter: "blur(20px)",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "80%",
                        height: "80%",
                        borderRadius: "50%",
                        background: "linear-gradient(45deg, #ffd700, #ff6b6b)",
                        opacity: 0.3,
                        animation: "pulse 2s ease-in-out infinite",
                      },
                      "@keyframes pulse": {
                        "0%": { transform: "translate(-50%, -50%) scale(1)" },
                        "50%": {
                          transform: "translate(-50%, -50%) scale(1.09)",
                        },
                        "100%": { transform: "translate(-50%, -50%) scale(1)" },
                      },
                    }}
                  >
                    <ShoppingBag
                      sx={{
                        fontSize: { xs: 90, sm: 150 },
                        color: "white",
                        zIndex: 2,
                      }}
                    />
                  </Box>
                </Box>
              </Slide>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Stats Section */}
        <Box sx={{ py: { xs: 4, md: 8 } }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, md: 4 },
              justifyContent: "center",
            }}
          >
            {stats.map((stat, index) => (
              <Box
                key={index}
                sx={{
                  width: { xs: "45%", sm: "22%" },
                  minWidth: { xs: 140, sm: 175, md: 200 },
                }}
              >
                <Fade in={true} timeout={600 + index * 200}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 3, md: 4 },
                      textAlign: "center",
                      borderRadius: 4,
                      background:
                        "linear-gradient(145deg, #f8f9ff 0%, #e3f2fd 100%)",
                      border: "1px solid rgba(0,0,0,0.05)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-10px)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.09)",
                      },
                    }}
                  >
                    <Box sx={{ color: "primary.main", mb: 1 }}>{stat.icon}</Box>
                    <Typography
                      variant="h3"
                      fontWeight={900}
                      color="primary.main"
                      gutterBottom
                      sx={{ fontSize: { xs: "1.5rem", md: "2.3rem" } }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ fontSize: { xs: "1rem", sm: "1.07rem", md: "1.12rem" } }}
                    >
                      {stat.label}
                    </Typography>
                  </Paper>
                </Fade>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: { xs: 4, md: 8 } }}>
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Typography
              variant="h2"
              fontWeight={900}
              sx={{
                background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: { xs: 1, md: 2 },
                fontSize: { xs: "1.65rem", sm: "2.1rem", md: "2.7rem" },
              }}
            >
              Why Choose Us?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 500, mx: "auto", fontSize: { xs: ".85rem", md: "1.05rem" } }}
            >
              We provide exceptional service and quality that sets us apart from the competition
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, md: 4 },
              justifyContent: "center",
            }}
          >
            {features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  width: { xs: "100%", sm: "45%", md: "45%", lg: "22%" },
                  minWidth: 215,
                }}
              >
                <Fade in={true} timeout={800 + index * 200}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 4,
                      border: "none",
                      background: feature.gradient,
                      color: "white",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-10px) scale(1.02)",
                        boxShadow: `0 20px 30px ${feature.color}38`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
                      <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.1rem", md: "1.3rem" } }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.93, fontSize: { xs: ".99rem", md: "1.1rem" } }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Featured Products Section */}
        <Box sx={{ py: { xs: 4, md: 8 } }}>
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                mb: 2,
              }}
            >
              <FlashOn sx={{ color: "#ffd700", fontSize: { xs: 32, md: 40 } }} />
              <Typography
                variant="h2"
                fontWeight={900}
                sx={{
                  background:
                    "linear-gradient(45deg, #ff6b6b 30%, #ffd700 90%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontSize: { xs: "1.45rem", sm: "2rem", md: "2.7rem" },
                }}
              >
                Featured Products
              </Typography>
            </Box>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 500, mx: "auto", fontSize: { xs: ".88rem", md: "1.08rem" } }}
            >
              Handpicked items just for you with the best deals and quality
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, md: 4 },
              justifyContent: "center",
            }}
          >
            {loading
              ? [...Array(8)].map((_, index) => <ProductSkeleton key={index} />)
              : products.map((product, index) => (
                  <Box
                    key={product.id}
                    sx={{
                      width: { xs: "100%", sm: "48%", md: "31%", lg: "23%" },
                      minWidth: 240,
                    }}
                  >
                    <Fade in={true} timeout={600 + index * 100}>
                      <Card
                        onClick={() => navigate(`/products/${product.id}`)}
                        sx={{
                          height: "100%",
                          borderRadius: 4,
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                          border: "1px solid rgba(0,0,0,0.05)",
                          "&:hover": {
                            transform: "translateY(-10px)",
                            boxShadow: "0 20px 40px rgba(0,0,0,0.11)",
                          },
                        }}
                      >
                        <Box sx={{ position: "relative", overflow: "hidden" }}>
                          <CardMedia
                            component="img"
                            height={160}
                            image={
                              product.images ||
                              "https://via.placeholder.com/400x280?text=No+Image"
                            }
                            alt={product.name}
                            sx={{
                              transition: "transform 0.3s ease",
                              objectFit: "cover",
                              "&:hover": {
                                transform: "scale(1.10)",
                              },
                            }}
                          />

                          {/* Overlay Featured */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: 12,
                              left: 12,
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                            }}
                          >
                            <Chip
                              label="Featured"
                              sx={{
                                background: "linear-gradient(45deg, #ff6b6b, #ffd700)",
                                color: "white",
                                fontWeight: 700,
                                boxShadow: "0 4px 12px rgba(255, 107, 107, 0.37)",
                                fontSize: { xs: ".79rem", md: ".99rem" },
                              }}
                            />
                          </Box>

                          {/* Overlay Rating */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              display: "flex",
                              alignItems: "center",
                              bgcolor: "rgba(0,0,0,0.8)",
                              borderRadius: 2,
                              px: 1,
                              py: 0.5,
                              zIndex: 11,
                            }}
                          >
                            <Star
                              sx={{ fontSize: 15, color: "#ffd700", mr: 0.5 }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: "bold", color: "white" }}
                            >
                              4.{Math.floor(Math.random() * 5) + 3}
                            </Typography>
                          </Box>

                          {/* Overlay Quick Actions */}
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: 10,
                              right: 10,
                              display: "flex",
                              gap: 1,
                              opacity: 0,
                              transform: "translateY(18px)",
                              transition: "all 0.3s ease",
                              pointerEvents: "none",
                              ".MuiCard-root:hover &": {
                                opacity: 1,
                                transform: "translateY(0)",
                                pointerEvents: "auto",
                              },
                              "@media (max-width:600px)": {
                                opacity: 1, // Always visible on mobile
                                transform: "translateY(0)",
                                pointerEvents: "auto",
                              },
                            }}
                          >
                            <IconButton
                              size="small"
                              sx={{
                                bgcolor: "rgba(255,255,255,.93)",
                                "&:hover": {
                                  bgcolor: "white",
                                  color: "error.main",
                                },
                                p: 1,
                              }}
                            >
                              <Favorite
                                sx={{
                                  color: wishlist.find((w) => w.product_id === product.id)
                                    ? "error.main"
                                    : "inherit",
                                  fontSize: { xs: 20, sm: 24 },
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFavorite(product);
                                }}
                              />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/products/${product.id}`);
                              }}
                              sx={{
                                bgcolor: "rgba(255,255,255,.92)",
                                "&:hover": {
                                  bgcolor: "white",
                                  color: "primary.main",
                                },
                                p: 1,
                                ml: 0.5,
                              }}
                            >
                              <Visibility sx={{ fontSize: { xs: 20, sm: 24 } }} />
                            </IconButton>
                          </Box>
                        </Box>

                        <CardContent
                          sx={{
                            p: { xs: 2, md: 3 },
                            flexGrow: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                              mb: 0.5,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              fontSize: { xs: "1.1rem", sm: "1.23rem" },
                            }}
                          >
                            {product.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 1.5,
                              flexGrow: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              fontSize: { xs: ".94rem", md: "1.03rem" },
                            }}
                          >
                            {product.description}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 2,
                              fontSize: { xs: "1rem", md: "1.20rem" },
                            }}
                          >
                            <Typography
                              variant="h5"
                              fontWeight={900}
                              sx={{
                                background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontSize: { xs: "1.1rem", sm: "1.28rem" },
                              }}
                            >
                              ${product.price}
                            </Typography>
                            <Chip
                              label="In Stock"
                              color="success"
                              size="small"
                              sx={{ fontWeight: 600, fontSize: { xs: ".85rem", md: "1rem" } }}
                            />
                          </Box>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={
                              addingToCart.has(product.id) ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <ShoppingCart />
                              )
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            disabled={addingToCart.has(product.id)}
                            sx={{
                              py: { xs: 1, sm: 1.5 },
                              borderRadius: 3,
                              fontWeight: 700,
                              background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                              boxShadow: "0 8px 24px rgba(102, 126, 234, 0.13)",
                              fontSize: { xs: "1rem", sm: "1.05rem" },
                              "&:hover": {
                                background: "linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 12px 32px rgba(102, 126, 234, 0.18)",
                              },
                              "&:disabled": {
                                background: "grey.400",
                              },
                              transition: "all 0.3s ease",
                            }}
                          >
                            {addingToCart.has(product.id)
                              ? "Adding..."
                              : "Add to Cart"}
                          </Button>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Box>
                ))}
          </Box>
        </Box>

        {/* Call to Action Section */}
        <Box sx={{ py: { xs: 4, md: 8 } }}>
          <Paper
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 6,
              p: { xs: 3, sm: 5, md: 8 },
              textAlign: "center",
              color: "white",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.13) 0%, transparent 70%)",
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 2 }}>
              <TrendingUp sx={{ fontSize: { xs: 44, md: 80 }, mb: 2, opacity: 0.8 }} />
              <Typography
                variant="h3"
                fontWeight={900}
                gutterBottom
                sx={{ mb: 2, fontSize: { xs: "1.5rem", md: "2.4rem" } }}
              >
                Ready to Explore More?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  maxWidth: 700,
                  mx: "auto",
                  opacity: 0.92,
                  fontSize: { xs: ".98rem", md: "1.17rem" },
                }}
              >
                Discover thousands of products across multiple categories. Find
                exactly what you're looking for with our advanced search and
                filtering options.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/products")}
                  sx={{
                    px: { xs: 5, sm: 9 },
                    py: { xs: 1.2, sm: 2 },
                    fontSize: { xs: "1rem", sm: "1.15rem" },
                    fontWeight: 700,
                    borderRadius: 3,
                    bgcolor: "white",
                    color: "primary.main",
                    boxShadow: "0 8px 24px rgba(255,255,255,0.25)",
                    "&:hover": {
                      bgcolor: "#f5f5f5",
                      transform: "translateY(-3px)",
                      boxShadow: "0 12px 32px rgba(255,255,255,0.3)",
                    },
                    transition: "all 0.3s ease",
                  }}
                  endIcon={<ArrowForward />}
                >
                  View All Products
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: { xs: 5, sm: 9 },
                    py: { xs: 1.2, sm: 2 },
                    fontSize: { xs: ".98rem", sm: "1.13rem" },
                    fontWeight: 700,
                    borderRadius: 3,
                    borderColor: "white",
                    color: "white",
                    borderWidth: 2,
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.1)",
                      borderColor: "white",
                      transform: "translateY(-3px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Contact Us
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
