import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Chip,
  IconButton,
  Paper,
  InputAdornment,
  Fab,
  Tooltip,
} from "@mui/material";
import {
  Search,
  FilterList,
  ShoppingCart,
  Visibility,
  Star,
  FavoriteOutlined,
  GridView,
  ViewList,
  LocalOffer,
  TrendingUp,
  Add,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Product, Category } from "../types";
import apiService from "../services/api";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/wishlistContext";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [page, setPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("name");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const userId = Number(localStorage.getItem("UserID"));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const handleFavorite = async (product: Product) => {
    console.log("UserId - ", userId, " ProductId - ", product.id);

    if (!userId) {
      alert("Please log in to add items to your wishlist");
      return;
    }
    const existing = wishlist.find((w) => w.product_id === product.id);
    if (existing) {
      await removeFromWishlist(existing.id);
    } else {
      console.log("Add To WishList => UserId - ", userId, " ProductId - ", product.id);
      await addToWishlist(userId, product.id);
    }
  };

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "" || product.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (page - 1) * productsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

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

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const ProductCard = ({ product }: { product: Product }) => {
    const isFavorite = favorites.has(product.id);
    const rating = 4 + Math.random();
    const isOnSale = Math.random() > 0.7;
    const isTrending = Math.random() > 0.8;
    const originalPrice = isOnSale ? product.price * 1.2 : null;

    return (
      <Card
        onClick={() => navigate(`/products/${product.id}`)}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
          transition: "all 0.3s ease",
          cursor: "pointer",
          backgroundColor: "#fff",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            transform: "translateY(-6px)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            height: 280,
            borderRadius: "0 0 16px 16px",
            boxShadow: "inset 0 0 30px rgba(0,0,0,0.05)",
          }}
        >
          <CardMedia
            component="img"
            height="280"
            image={
              product.images ||
              "https://via.placeholder.com/400x280/667eea/ffffff?text=Product"
            }
            alt={product.name}
            sx={{
              objectFit: "cover",
              borderRadius: "0 0 16px 16px",
              transition: "transform 0.4s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
              boxShadow: "0 6px 14px rgba(0,0,0,0.1)",
            }}
          />

          {/* Status badges */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              zIndex: 10,
            }}
          >
            {isOnSale && (
              <Chip
                icon={<LocalOffer sx={{ fontSize: 16 }} />}
                label="SALE"
                size="small"
                sx={{
                  bgcolor: "#ff3b3f",
                  color: "white",
                  fontWeight: "700",
                  fontSize: 12,
                  minWidth: 56,
                  height: 28,
                  borderRadius: 14,
                  boxShadow: "0 3px 10px rgba(255,59,63,0.3)",
                  "& .MuiChip-icon": { color: "white" },
                }}
              />
            )}
            {isTrending && (
              <Chip
                icon={<TrendingUp sx={{ fontSize: 16 }} />}
                label="HOT"
                size="small"
                sx={{
                  bgcolor: "#32d74b",
                  color: "white",
                  fontWeight: "700",
                  fontSize: 12,
                  minWidth: 48,
                  height: 28,
                  borderRadius: 14,
                  boxShadow: "0 3px 10px rgba(50,215,75,0.3)",
                  "& .MuiChip-icon": { color: "white" },
                }}
              />
            )}
          </Box>

          {/* Rating Badge */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              bgcolor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              fontWeight: "700",
              color: "#fbc02d",
              zIndex: 10,
              userSelect: "none",
            }}
          >
            <Star sx={{ fontSize: 18 }} />
            <Typography
              variant="caption"
              sx={{
                ml: 0.3,
                color: "black",
                fontWeight: "bold",
                fontSize: 14,
                userSelect: "none",
              }}
            >
              {rating.toFixed(1)}
            </Typography>
          </Box>

          {/* Favorite Icon */}
          <Tooltip
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product.id);
                handleFavorite(product);
              }}
              sx={{
                position: "absolute",
                bottom: 16,
                right: 16,
                bgcolor: isFavorite ? "#ff3b3f" : "rgba(255, 255, 255, 0.95)",
                color: isFavorite ? "white" : "grey.700",
                backdropFilter: "blur(12px)",
                width: 48,
                height: 48,
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: isFavorite ? "#e02b31" : "primary.main",
                  color: "white",
                  transform: "scale(1.2)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                },
                zIndex: 11,
              }}
              color="inherit"
            >
              <FavoriteOutlined sx={{ fontSize: 24 }} />
            </IconButton>
          </Tooltip>

          {/* Quick Action Buttons */}
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: 16,
              display: "flex",
              gap: 1.5,
              zIndex: 11,
            }}
          >
            <Tooltip title="Add to Cart">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  width: 44,
                  height: 44,
                  "&:hover": {
                    bgcolor: "primary.dark",
                    transform: "scale(1.1)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                  },
                }}
              >
                <ShoppingCart sx={{ fontSize: 21 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Details">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products/${product.id}`);
                }}
                sx={{
                  bgcolor: "grey.100",
                  color: "primary.main",
                  width: 44,
                  height: 44,
                  "&:hover": {
                    bgcolor: "grey.300",
                    transform: "scale(1.1)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Visibility sx={{ fontSize: 21 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <CardContent
          sx={{
            flexGrow: 1,
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "primary.main",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                mb: 1,
                fontSize: 11,
              }}
            >
              {categories.find((c) => c.id === product.category_id)?.name ||
                "Category"}
            </Typography>

            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: "700",
                minHeight: 56,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                mb: 1.5,
                lineHeight: 1.3,
                fontSize: "1.2rem",
                color: "text.primary",
              }}
            >
              {product.name}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                minHeight: 44,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                mb: 2,
                lineHeight: 1.5,
                fontSize: "0.9rem",
              }}
            >
              {product.description}
            </Typography>
          </Box>

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Typography
                variant="h5"
                color="primary"
                sx={{ fontWeight: "bold", mr: 1.5, fontSize: "1.5rem" }}
              >
                ${product.price}
              </Typography>
              {originalPrice && (
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: "line-through",
                    color: "text.secondary",
                    mr: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  ${originalPrice.toFixed(2)}
                </Typography>
              )}
              {isOnSale && (
                <Chip
                  label={`${Math.round(
                    (1 - product.price / originalPrice!) * 100
                  )}% OFF`}
                  size="small"
                  sx={{
                    bgcolor: "#ff3b3f",
                    color: "white",
                    fontWeight: "700",
                    fontSize: 11,
                    height: 22,
                    borderRadius: 12,
                  }}
                />
              )}
            </Box>

            <Box sx={{ display: { xs: "flex", sm: "none" }, gap: 1 }}>
              <Button
                fullWidth
                variant="contained"
                size="small"
                onClick={() => handleAddToCart(product)}
                sx={{
                  fontWeight: "700",
                  textTransform: "none",
                  borderRadius: 2,
                  py: 1.2,
                }}
              >
                Add to Cart
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/products/${product.id}`)}
                sx={{
                  fontWeight: "700",
                  textTransform: "none",
                  borderRadius: 2,
                  px: 2,
                }}
              >
                View
              </Button>
            </Box>

            <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1.5 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleAddToCart(product)}
                sx={{
                  py: 1.5,
                  fontWeight: "700",
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "0.9rem",
                  background:
                    "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                  boxShadow: "0 6px 20px rgba(102,126,234,0.3)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(102,126,234,0.4)",
                    background:
                      "linear-gradient(45deg, #764ba2 30%, #667eea 90%)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Add to Cart
              </Button>
              <Tooltip title="View Details">
                <IconButton
                  color="primary"
                  onClick={() => navigate(`/products/${product.id}`)}
                  sx={{
                    border: "2px solid",
                    borderColor: "primary.main",
                    borderRadius: 3,
                    width: 48,
                    height: 48,
                    "&:hover": {
                      bgcolor: "primary.main",
                      color: "white",
                      transform: "scale(1.1)",
                      boxShadow: "0 6px 20px rgba(102,126,234,0.3)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: { xs: 6, sm: 8 },
          mb: { xs: 3, md: 4 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" component="h1" sx={{ fontWeight: "bold" }}>
            Our Products
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
            Discover amazing products tailored just for you
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Filters */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            mb: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)",
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", fontWeight: 700 }}
            >
              <FilterList sx={{ mr: 1 }} />
              Filters & Search
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, md: 4 },
              alignItems: "center",
            }}
          >
            <Box sx={{ flex: 2, minWidth: 0 }}>
              <TextField
                fullWidth
                label="Search products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
              />
            </Box>

            <FormControl sx={{ flex: 1, minWidth: { xs: "100%", md: 140 } }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) =>
                  setSelectedCategory(e.target.value as number | "")
                }
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ flex: 1, minWidth: { xs: "100%", md: 140 } }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="name">Name (A-Z)</MenuItem>
                <MenuItem value="price-low">Price (Low to High)</MenuItem>
                <MenuItem value="price-high">Price (High to Low)</MenuItem>
              </Select>
            </FormControl>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "center",
                mt: { xs: 1, md: 0 },
              }}
            >
              <IconButton
                color={viewMode === "grid" ? "primary" : "default"}
                onClick={() => setViewMode("grid")}
                sx={{
                  border: 2,
                  borderColor: viewMode === "grid" ? "primary.main" : "divider",
                  borderRadius: 2,
                }}
              >
                <GridView />
              </IconButton>

              <IconButton
                color={viewMode === "list" ? "primary" : "default"}
                onClick={() => setViewMode("list")}
                sx={{
                  border: 2,
                  borderColor: viewMode === "list" ? "primary.main" : "divider",
                  borderRadius: 2,
                }}
              >
                <ViewList />
              </IconButton>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
              Showing {paginatedProducts.length} of {filteredProducts.length}{" "}
              products
            </Typography>
            {selectedCategory && (
              <Chip
                label={categories.find((c) => c.id === selectedCategory)?.name}
                onDelete={() => setSelectedCategory("")}
                color="primary"
                variant="outlined"
                sx={{ borderRadius: 3, ml: 1 }}
              />
            )}
          </Box>
        </Paper>

        {/* Product Cards Container */}
        {paginatedProducts.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            {paginatedProducts.map((product) => (
              <Box
                key={product.id}
                sx={{
                  width: { xs: "100%", sm: "48%", md: "31%" },
                  minWidth: 280,
                  maxWidth: { xs: "100%", md: 380 },
                  flex: "1 1 300px",
                }}
              >
                <ProductCard product={product} />
              </Box>
            ))}
          </Box>
        ) : (
          <Paper
            sx={{
              p: 8,
              textAlign: "center",
              background: "linear-gradient(45deg, #f5f7fa 0%, #c3cfe2 100%)",
              borderRadius: 3,
              my: 6,
            }}
          >
            <Typography variant="h5" gutterBottom color="text.secondary">
              No products found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search criteria or browse all categories
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setPage(1);
              }}
              sx={{ borderRadius: 3 }}
            >
              Clear Filters
            </Button>
          </Paper>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6, mb: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Paper>
          </Box>
        )}

        {/* Scroll to top FAB */}
        <Fab
          color="primary"
          aria-label="scroll to top"
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            display: { xs: "flex", md: "none" },
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <FilterList />
        </Fab>
      </Container>
    </Box>
  );
};

export default Products;
