import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  Divider,
  ListItemIcon,
  Tooltip,
  useScrollTrigger,
  Slide,
  InputBase,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
  Zoom,
  Collapse,
  SwipeableDrawer,
} from "@mui/material";

import {
  ShoppingCart,
  Person,
  Favorite,
  Menu as MenuIcon,
  Home,
  Store,
  AccountCircle,
  ExitToApp,
  Receipt,
  Close,
  Search,
  Notifications,
  KeyboardArrowDown,
  StarBorder,
  LocalOffer,
  Inventory,
  TrendingUp,
  FlashOn,
  LocationOn,
  Phone,
  Email,
  Facebook,
  Twitter,
  Instagram,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";

import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/wishlistContext";

interface HideOnScrollProps {
  children: React.ReactElement;
}

function HideOnScroll(props: HideOnScrollProps) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Enhanced responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "lg"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const { user, logout } = useAuth();
  const { getCartTotal, getTotalLengthOfCart } = useCart();
  const { getTotalLengthOfWishlist } = useWishlist();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsMenuAnchor, setProductsMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] =
    useState<null | HTMLElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);


  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when screen size changes
  useEffect(() => {
    if (!isMobile && !isTablet && mobileOpen) {
      setMobileOpen(false);
    }
    if (isDesktop && searchOpen) {
      setSearchOpen(false);
    }
  }, [isMobile, isTablet, isDesktop, mobileOpen, searchOpen]);

  // Helper function to get user display name
  const getUserDisplayName = () => {
    return (
      (user as any)?.full_name ||
      (user as any)?.name ||
      (user as any)?.firstName ||
      (user as any)?.username ||
      "User"
    );
  };

  // Helper function to get user initials
  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    return (
      displayName
        .split(" ")
        .map((word: string) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProductsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProductsMenuAnchor(event.currentTarget);
  };

  const handleProductsMenuClose = () => {
    setProductsMenuAnchor(null);
  };

  const handleNotificationMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    localStorage.setItem("IsLogin", "false");
    navigate("/");
  };

  const toggleDrawer = (open: boolean) => () => {
    setMobileOpen(open);
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue)}`);
      setSearchValue("");
      setSearchOpen(false);
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const login = localStorage.getItem("IsLogin");

  const menuItems = [
    { label: "Home", path: "/home", icon: <Home /> },
    { label: "Products", path: "/products", icon: <Store /> },
    {
      label: "Cart",
      path: "/cart",
      icon: <ShoppingCart />,
      badge: getTotalLengthOfCart(),
    },
    ...(user
      ? [
          { label: "Wishlist", path: "/wishlist", badge: getTotalLengthOfWishlist(), icon: <Favorite /> },
          { label: "Profile", path: "/profile", icon: <Person /> },
          { label: "Orders", path: "/orders", icon: <Receipt /> },
        ]
      : [
          { label: "Login", path: "/login", icon: <AccountCircle /> },
          { label: "Register", path: "/register", icon: <Person /> },
        ]),
  ];

  const productCategories = [
    { name: "Electronics", icon: "📱", popular: true },
    { name: "Fashion", icon: "👕", popular: true },
    { name: "Home & Garden", icon: "🏠", popular: false },
    { name: "Sports & Fitness", icon: "⚽", popular: true },
    { name: "Books & Media", icon: "📚", popular: false },
    { name: "Beauty & Health", icon: "💄", popular: true },
    { name: "Toys & Games", icon: "🎮", popular: false },
    { name: "Automotive", icon: "🚗", popular: false },
  ];

  const notifications = [
    {
      id: 1,
      title: "Welcome Offer!",
      message: "Get 20% off on your first order",
      type: "offer",
      time: "2m ago",
    },
    {
      id: 2,
      title: "Order Shipped",
      message: "Your order #12345 is on the way",
      type: "update",
      time: "1h ago",
    },
    {
      id: 3,
      title: "New Arrivals",
      message: "Check out the latest collection",
      type: "info",
      time: "3h ago",
    },
  ];

  return (
    <>
      {/* Top Bar - Hidden on mobile for space */}
      <Box
        sx={{
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: { xs: 0, sm: 0.5 },
          display: { xs: "none", sm: "block" },
          fontSize: { sm: "0.75rem", md: "0.85rem" },
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 1, md: 0 },
              py: { xs: 1, md: 0 },
            }}
          >
            {/* Contact Info */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 2, md: 3 },
                flexDirection: { xs: "column", sm: "row" },
                fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.85rem" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone sx={{ fontSize: { xs: 14, md: 16 } }} />
                <Typography variant="caption" sx={{ fontSize: "inherit" }}>
                  {isSmallScreen ? "+1-555-123-4567" : "+1 (555) 123-4567"}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Email sx={{ fontSize: { xs: 14, md: 16 } }} />
                <Typography variant="caption" sx={{ fontSize: "inherit" }}>
                  support@shopzone.com
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOn sx={{ fontSize: { xs: 14, md: 16 } }} />
                <Typography variant="caption" sx={{ fontSize: "inherit" }}>
                  {isSmallScreen ? "Free shipping" : "Free shipping worldwide"}
                </Typography>
              </Box>
            </Box>

            {/* Promo and Social */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, md: 2 },
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FlashOn sx={{ fontSize: { xs: 14, md: 16 } }} />
                <Typography
                  variant="caption"
                  sx={{ fontSize: { xs: "0.7rem", md: "inherit" } }}
                >
                  {isSmallScreen
                    ? "Flash Sale: 50% off!"
                    : "Flash Sale: Up to 50% off!"}
                </Typography>
              </Box>
              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
                <IconButton
                  size="small"
                  sx={{
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <Facebook sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <Twitter sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <Instagram sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <HideOnScroll>
        <AppBar
          position="sticky"
          elevation={scrolled ? 8 : 0}
          sx={{
            background: scrolled
              ? "rgba(255,255,255,0.98)"
              : "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,255,0.95) 100%)",
            backdropFilter: "blur(20px)",
            borderBottom: scrolled
              ? "1px solid rgba(102,126,234,0.2)"
              : "1px solid rgba(102,126,234,0.1)",
            color: "#2c3e50",
            transition: "all 0.3s ease",
          }}
        >
          <Container maxWidth="xl">
            <Toolbar
              sx={{
                py: { xs: 0.5, sm: 1, md: 1.5 },
                minHeight: { xs: "56px", sm: "64px", md: "72px" },
                px: { xs: 1, sm: 2 },
              }}
              disableGutters={isMobile}
            >
              {/* Logo / Title - Responsive sizing */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: isDesktop ? "scale(1.05)" : "none",
                  },
                  mr: { xs: 1, sm: 2 },
                }}
                onClick={() => navigate("/home")}
              >
                <Box
                  sx={{
                    background:
                      "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                    borderRadius: { xs: 2, md: 3 },
                    p: { xs: 1, sm: 1.2, md: 1.5 },
                    mr: { xs: 1, sm: 1.5, md: 2 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: scrolled
                      ? "0 6px 20px rgba(102,126,234,0.4)"
                      : "0 4px 12px rgba(102,126,234,0.3)",
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
                        "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
                      transform: "translateX(-100%)",
                      animation: "shine 3s infinite",
                    },
                    "@keyframes shine": {
                      "0%": { transform: "translateX(-100%)" },
                      "50%": { transform: "translateX(100%)" },
                      "100%": { transform: "translateX(100%)" },
                    },
                  }}
                >
                  <ShoppingCart
                    sx={{
                      color: "white",
                      fontSize: { xs: 20, sm: 24, md: 32 },
                    }}
                  />
                </Box>
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <Typography
                    variant={isMobile ? "h6" : isTablet ? "h5" : "h4"}
                    component="div"
                    sx={{
                      fontWeight: "900",
                      background:
                        "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      letterSpacing: 1,
                      lineHeight: 1,
                    }}
                  >
                    ShopZone
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      letterSpacing: { xs: 1, md: 2 },
                      textTransform: "uppercase",
                      display: { xs: "none", md: "block" },
                      fontSize: { sm: "0.65rem", md: "0.75rem" },
                    }}
                  >
                    Premium Shopping
                  </Typography>
                </Box>
                {/* Mobile logo text */}
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: "900",
                    background:
                      "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: 0.5,
                    display: { xs: "block", sm: "none" },
                    fontSize: "1.1rem",
                  }}
                >
                  ShopZone
                </Typography>
              </Box>

              <Box sx={{ flexGrow: 1 }} />

              {/* Enhanced Search Bar - Responsive */}
              <Box
                sx={{
                  display: {
                    xs: searchOpen ? "flex" : "none",
                    sm: searchOpen ? "flex" : "none",
                    lg: "flex",
                  },
                  alignItems: "center",
                  mx: { xs: 0, sm: 2, lg: 4 },
                  width: { xs: "100%", sm: "100%", lg: "auto" },
                  maxWidth: { xs: "none", lg: 400 },
                  position: { xs: "absolute", sm: "absolute", lg: "relative" },
                  top: { xs: "100%", sm: "100%", lg: "auto" },
                  left: { xs: 0, sm: 0, lg: "auto" },
                  right: { xs: 0, sm: 0, lg: "auto" },
                  zIndex: { xs: 1000, lg: "auto" },
                  p: { xs: 1, sm: 2, lg: 0 },
                  bgcolor: {
                    xs: "background.paper",
                    sm: "background.paper",
                    lg: "transparent",
                  },
                  boxShadow: {
                    xs: "0 4px 8px rgba(0,0,0,0.1)",
                    sm: "0 4px 8px rgba(0,0,0,0.1)",
                    lg: "none",
                  },
                  borderRadius: {
                    xs: "0 0 8px 8px",
                    sm: "0 0 12px 12px",
                    lg: 0,
                  },
                }}
              >
                <Paper
                  component="form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    borderRadius: { xs: 4, md: 6 },
                    background:
                      "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)",
                    border: "2px solid transparent",
                    boxShadow: "0 4px 20px rgba(102,126,234,0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "rgba(102,126,234,0.3)",
                      boxShadow: "0 6px 25px rgba(102,126,234,0.15)",
                    },
                    "&:focus-within": {
                      borderColor: "primary.main",
                      boxShadow: "0 8px 30px rgba(102,126,234,0.2)",
                      transform: { xs: "none", lg: "translateY(-1px)" },
                    },
                  }}
                >
                  <IconButton sx={{ p: { xs: 1, md: 1.5 } }} type="submit">
                    <Search sx={{ fontSize: { xs: 20, md: 24 } }} />
                  </IconButton>
                  <InputBase
                    sx={{
                      ml: 1,
                      flex: 1,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      fontWeight: 500,
                      "& input::placeholder": {
                        color: "text.secondary",
                        opacity: 0.7,
                      },
                    }}
                    placeholder={
                      isMobile
                        ? "Search products..."
                        : "Search for products, brands, categories..."
                    }
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  {searchValue && !isMobile && (
                    <Chip
                      label="Press Enter"
                      size="small"
                      sx={{
                        mr: 1,
                        background:
                          "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {(isMobile || isTablet) && (
                    <IconButton
                      sx={{ p: 1 }}
                      onClick={() => setSearchOpen(false)}
                    >
                      <Close sx={{ fontSize: 20 }} />
                    </IconButton>
                  )}
                </Paper>
              </Box>

              {/* Desktop Menu */}
              <Box
                sx={{
                  display: { xs: "none", lg: "flex" },
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                {/* Home Button */}
                <Button
                  color="inherit"
                  onClick={() => navigate("/home")}
                  sx={{
                    borderRadius: 4,
                    px: 3,
                    py: 1.5,
                    fontWeight: "bold",
                    textTransform: "none",
                    fontSize: "1rem",
                    position: "relative",
                    background: isActiveRoute("/home")
                      ? "rgba(102,126,234,0.1)"
                      : "transparent",
                    "&:hover": {
                      bgcolor: "rgba(102,126,234,0.1)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(102,126,234,0.2)",
                    },
                    "&:after": isActiveRoute("/home")
                      ? {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 20,
                          height: 3,
                          borderRadius: 2,
                          background:
                            "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                        }
                      : {},
                    transition: "all 0.3s ease",
                  }}
                  startIcon={<Home />}
                >
                  Home
                </Button>

                {/* Products Dropdown */}
                <Button
                  color="inherit"
                  onClick={handleProductsMenu}
                  endIcon={
                    <KeyboardArrowDown
                      sx={{
                        transform: Boolean(productsMenuAnchor)
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  }
                  sx={{
                    borderRadius: 4,
                    px: 3,
                    py: 1.5,
                    fontWeight: "bold",
                    textTransform: "none",
                    fontSize: "1rem",
                    position: "relative",
                    background: isActiveRoute("/products")
                      ? "rgba(102,126,234,0.1)"
                      : "transparent",
                    "&:hover": {
                      bgcolor: "rgba(102,126,234,0.1)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(102,126,234,0.2)",
                    },
                    "&:after": isActiveRoute("/products")
                      ? {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 20,
                          height: 3,
                          borderRadius: 2,
                          background:
                            "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                        }
                      : {},
                    transition: "all 0.3s ease",
                  }}
                  startIcon={<Store />}
                >
                  Products
                </Button>

                {/* Products Menu */}
                <Menu
                  anchorEl={productsMenuAnchor}
                  open={Boolean(productsMenuAnchor)}
                  onClose={handleProductsMenuClose}
                  PaperProps={{
                    sx: {
                      borderRadius: 4,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                      border: "1px solid rgba(102,126,234,0.1)",
                      mt: 1,
                      minWidth: 480,
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
                    },
                  }}
                  transformOrigin={{ horizontal: "center", vertical: "top" }}
                  anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
                >
                  <Box
                    sx={{
                      px: 3,
                      py: 2,
                      borderBottom: "1px solid rgba(102,126,234,0.1)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "primary.main" }}
                    >
                      Shop by Category
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Discover our wide range of products
                    </Typography>
                  </Box>

                  <MenuItem
                    onClick={() => {
                      handleProductsMenuClose();
                      navigate("/products");
                    }}
                    sx={{
                      px: 3,
                      py: 2,
                      fontWeight: "bold",
                      borderBottom: "1px solid rgba(102,126,234,0.1)",
                      "&:hover": {
                        background:
                          "linear-gradient(45deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
                      },
                    }}
                  >
                    <ListItemIcon>
                      <TrendingUp sx={{ color: "primary.main" }} />
                    </ListItemIcon>
                    <Box>
                      <Typography fontWeight="bold">All Products</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Browse our complete collection
                      </Typography>
                    </Box>
                  </MenuItem>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 1,
                      p: 2,
                    }}
                  >
                    {productCategories.map((category) => (
                      <MenuItem
                        key={category.name}
                        onClick={() => {
                          handleProductsMenuClose();
                          navigate("/products");
                        }}
                        sx={{
                          borderRadius: 2,
                          px: 2,
                          py: 1.5,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background:
                              "linear-gradient(45deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            width: "100%",
                          }}
                        >
                          <Box sx={{ fontSize: "1.5rem" }}>{category.icon}</Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {category.name}
                            </Typography>
                            {category.popular && (
                              <Chip
                                label="Popular"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.7rem",
                                  background:
                                    "linear-gradient(45deg, #ff6b6b, #ffd700)",
                                  color: "white",
                                  fontWeight: "bold",
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Box>
                </Menu>

                {/* Action Icons */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    ml: 2,
                  }}
                >
                  {/* Cart Button */}
                  
                  {(login === "true") ? <Tooltip title="Shopping Cart">
                    <IconButton
                      color="inherit"
                      onClick={() => navigate("/cart")}
                      sx={{
                        borderRadius: 3,
                        p: 1.5,
                        "&:hover": {
                          bgcolor: "rgba(102,126,234,0.1)",
                          transform: "scale(1.1)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Badge
                        badgeContent={getTotalLengthOfCart()}
                        color="error"
                        sx={{
                          "& .MuiBadge-badge": {
                            background:
                              "linear-gradient(45deg, #ff4757 30%, #ff3742 90%)",
                            fontWeight: "bold",
                            fontSize: "0.75rem",
                            minWidth: 20,
                            height: 20,
                            boxShadow: "0 2px 8px rgba(255, 71, 87, 0.3)",
                          },
                        }}
                      >
                        <ShoppingCart />
                      </Badge>
                    </IconButton>
                  </Tooltip> : ""}

                  {user ? (
                    <>
                      {/* Wishlist Button */}
                      <Tooltip title="Wishlist">
                        <IconButton
                          color="inherit"
                          onClick={() => navigate("/wishlist")}
                          sx={{
                            borderRadius: 3,
                            p: 1.5,
                            "&:hover": {
                              bgcolor: "rgba(102,126,234,0.1)",
                              transform: "scale(1.1)",
                              "& .MuiSvgIcon-root": {
                                color: "#ff4757",
                              },
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Badge
                            badgeContent={getTotalLengthOfWishlist()}
                            color="error"
                            sx={{
                              "& .MuiBadge-badge": {
                                background:
                                  "linear-gradient(45deg, #ff4757 30%, #ff3742 90%)",
                                fontWeight: "bold",
                                fontSize: "0.75rem",
                                minWidth: 20,
                                height: 20,
                                boxShadow: "0 2px 8px rgba(255, 71, 87, 0.3)",
                              },
                            }}
                          >
                            <Favorite />
                          </Badge>
                        </IconButton>
                      </Tooltip>

                      {/* Notifications */}
                      <Tooltip title="Notifications">
                        <IconButton
                          color="inherit"
                          onClick={handleNotificationMenu}
                          sx={{
                            borderRadius: 3,
                            p: 1.5,
                            "&:hover": {
                              bgcolor: "rgba(102,126,234,0.1)",
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Badge
                            badgeContent={notifications.length}
                            color="error"
                          >
                            <Notifications />
                          </Badge>
                        </IconButton>
                      </Tooltip>

                      {/* User Menu */}
                      <Box sx={{ ml: 1 }}>
                        <Button
                          onClick={handleMenu}
                          sx={{
                            borderRadius: 4,
                            px: 2,
                            py: 1,
                            textTransform: "none",
                            color: "inherit",
                            background: Boolean(anchorEl)
                              ? "rgba(102,126,234,0.1)"
                              : "transparent",
                            "&:hover": {
                              bgcolor: "rgba(102,126,234,0.1)",
                              transform: "translateY(-1px)",
                            },
                            transition: "all 0.3s ease",
                          }}
                          startIcon={
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                background:
                                  "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                                fontSize: 14,
                                fontWeight: "bold",
                                boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
                              }}
                            >
                              {getUserInitials()}
                            </Avatar>
                          }
                          endIcon={
                            <KeyboardArrowDown
                              sx={{
                                transform: Boolean(anchorEl)
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                                transition: "transform 0.3s ease",
                              }}
                            />
                          }
                        >
                          <Box
                            sx={{
                              textAlign: "left",
                              ml: 1,
                              display: { xs: "none", xl: "block" },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: "bold", lineHeight: 1.2 }}
                            >
                              {getUserDisplayName()}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ opacity: 0.7, lineHeight: 1 }}
                            >
                              Welcome back
                            </Typography>
                          </Box>
                        </Button>

                        {/* User Menu Dropdown */}
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={handleClose}
                          PaperProps={{
                            sx: {
                              borderRadius: 4,
                              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                              border: "1px solid rgba(102,126,234,0.1)",
                              mt: 1,
                              minWidth: 220,
                              background:
                                "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              px: 3,
                              py: 2,
                              borderBottom: "1px solid rgba(102,126,234,0.1)",
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              {getUserDisplayName()}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {user.email}
                            </Typography>
                          </Box>
                          <MenuItem
                            onClick={() => {
                              handleClose();
                              navigate("/profile");
                            }}
                            sx={{
                              px: 3,
                              py: 2,
                              "&:hover": { bgcolor: "rgba(102,126,234,0.05)" },
                            }}
                          >
                            <ListItemIcon>
                              <Person sx={{ color: "primary.main" }} />
                            </ListItemIcon>
                            <Typography fontWeight="medium">Profile</Typography>
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              handleClose();
                              navigate("/orders");
                            }}
                            sx={{
                              px: 3,
                              py: 2,
                              "&:hover": { bgcolor: "rgba(102,126,234,0.05)" },
                            }}
                          >
                            <ListItemIcon>
                              <Receipt sx={{ color: "primary.main" }} />
                            </ListItemIcon>
                            <Typography fontWeight="medium">Orders</Typography>
                          </MenuItem>
                          <Divider />
                          <MenuItem
                            onClick={handleLogout}
                            sx={{
                              px: 3,
                              py: 2,
                              color: "#ff4757",
                              "&:hover": { bgcolor: "rgba(255,71,87,0.05)" },
                            }}
                          >
                            <ListItemIcon>
                              <ExitToApp sx={{ color: "#ff4757" }} />
                            </ListItemIcon>
                            <Typography fontWeight="medium">Logout</Typography>
                          </MenuItem>
                        </Menu>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate("/login")}
                        sx={{
                          borderRadius: 4,
                          px: 4,
                          py: 1.5,
                          fontWeight: "bold",
                          textTransform: "none",
                          borderColor: "primary.main",
                          borderWidth: 2,
                          "&:hover": {
                            borderColor: "primary.dark",
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 20px rgba(102,126,234,0.3)",
                            borderWidth: 2,
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        Login
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => navigate("/register")}
                        sx={{
                          borderRadius: 4,
                          px: 4,
                          py: 1.5,
                          fontWeight: "bold",
                          textTransform: "none",
                          background:
                            "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                          boxShadow: "0 6px 20px rgba(102,126,234,0.4)",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 8px 25px rgba(102,126,234,0.5)",
                            background:
                              "linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        Register
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Mobile/Tablet Action Bar */}
              <Box
                sx={{
                  display: { xs: "flex", lg: "none" },
                  alignItems: "center",
                  gap: { xs: 0.5, sm: 1 },
                }}
              >
                {/* Search Toggle */}
                <IconButton
                  color="inherit"
                  onClick={() => setSearchOpen(!searchOpen)}
                  sx={{
                    borderRadius: 3,
                    p: { xs: 1, sm: 1.5 },
                    "&:hover": {
                      bgcolor: "rgba(102,126,234,0.1)",
                    },
                  }}
                >
                  <Search sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </IconButton>

                {/* Cart */}
                
                {(login === "true") ? <IconButton
                  color="inherit"
                  onClick={() => navigate("/cart")}
                  sx={{
                    borderRadius: 3,
                    p: { xs: 1, sm: 1.5 },
                    "&:hover": {
                      bgcolor: "rgba(102,126,234,0.1)",
                    },
                  }}
                >
                  <Badge
                    badgeContent={getTotalLengthOfCart()}
                    color="error"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: { xs: "0.6rem", sm: "0.75rem" },
                        minWidth: { xs: 16, sm: 20 },
                        height: { xs: 16, sm: 20 },
                      },
                    }}
                  >
                    <ShoppingCart sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </Badge>
                </IconButton> : ""}

                {/* User Avatar (Mobile) */}
                {user && (
                  <IconButton
                    color="inherit"
                    onClick={() => navigate("/profile")}
                    sx={{
                      borderRadius: 3,
                      p: { xs: 0.5, sm: 1 },
                      "&:hover": {
                        bgcolor: "rgba(102,126,234,0.1)",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        background:
                          "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                        fontSize: { xs: "0.8rem", sm: "1rem" },
                        fontWeight: "bold",
                      }}
                    >
                      {getUserInitials()}
                    </Avatar>
                  </IconButton>
                )}

                {/* Menu Button */}
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={toggleDrawer(true)}
                  sx={{
                    borderRadius: 3,
                    p: { xs: 1, sm: 1.5 },
                    "&:hover": {
                      bgcolor: "rgba(102,126,234,0.1)",
                    },
                  }}
                >
                  <MenuIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </IconButton>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </HideOnScroll>

      {/* Enhanced Responsive Mobile Drawer */}
      <SwipeableDrawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        PaperProps={{
          sx: {
            background: "linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)",
            borderLeft: "1px solid rgba(102,126,234,0.1)",
            width: { xs: "85vw", sm: 400 },
            maxWidth: 400,
          },
        }}
        disableBackdropTransition={!isMobile}
        disableDiscovery={isMobile}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Drawer Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              p: { xs: 2, sm: 3 },
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                ShopZone
              </Typography>
              <Typography
                variant="caption"
                sx={{ opacity: 0.9, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                Your Shopping Destination
              </Typography>
            </Box>
            <IconButton
              onClick={toggleDrawer(false)}
              sx={{
                color: "white",
                p: { xs: 1, sm: 1.5 },
              }}
            >
              <Close sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          </Box>

          {/* User Info (if logged in) */}
          {user && (
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderBottom: "1px solid rgba(102,126,234,0.1)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    background:
                      "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
                    fontWeight: "bold",
                    fontSize: { xs: "1.2rem", sm: "1.5rem" },
                    boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
                  }}
                >
                  {getUserInitials()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getUserDisplayName()}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.email}
                  </Typography>
                  <Chip
                    label="Premium Member"
                    size="small"
                    sx={{
                      mt: 0.5,
                      background: "linear-gradient(45deg, #ffd700, #ff6b6b)",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: { xs: "0.6rem", sm: "0.75rem" },
                      height: { xs: 20, sm: 24 },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {/* Quick Stats */}
          {user && (
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderBottom: "1px solid rgba(102,126,234,0.1)",
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: { xs: 1, sm: 2 },
                  textAlign: "center",
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                    }}
                  >
                    {getCartTotal()}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Cart Items
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                    }}
                  >
                    {getTotalLengthOfWishlist()}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Wishlist
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                    sx={{
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                    }}
                  >
                    12
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    }}
                  >
                    Orders
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Menu Items */}
          <List sx={{ px: { xs: 1, sm: 2 }, py: 2, flex: 1, overflow: "auto" }}>
            {menuItems.map((item, index) => (
              <Zoom
                in={mobileOpen}
                timeout={300 + index * 100}
                key={item.label}
              >
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                      toggleDrawer(false)();
                    }}
                    sx={{
                      borderRadius: 4,
                      py: { xs: 1.5, sm: 2 },
                      px: { xs: 2, sm: 3 },
                      background: isActiveRoute(item.path)
                        ? "rgba(102,126,234,0.1)"
                        : "transparent",
                      "&:hover": {
                        bgcolor: "rgba(102,126,234,0.1)",
                        transform: "translateX(5px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: { xs: 40, sm: 48 },
                        color: isActiveRoute(item.path)
                          ? "primary.main"
                          : "inherit",
                      }}
                    >
                      {item.badge ? (
                        <Badge
                          badgeContent={item.badge}
                          color="error"
                          sx={{
                            "& .MuiBadge-badge": {
                              fontSize: { xs: "0.6rem", sm: "0.75rem" },
                              minWidth: { xs: 16, sm: 20 },
                              height: { xs: 16, sm: 20 },
                            },
                          }}
                        >
                          {React.cloneElement(item.icon, {
                            sx: { fontSize: { xs: 20, sm: 24 } },
                          })}
                        </Badge>
                      ) : (
                        React.cloneElement(item.icon, {
                          sx: { fontSize: { xs: 20, sm: 24 } },
                        })
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActiveRoute(item.path)
                          ? "bold"
                          : "medium",
                        fontSize: { xs: "0.95rem", sm: "1.1rem" },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Zoom>
            ))}

            {/* Categories Section for Mobile */}
            <ListItem disablePadding sx={{ mt: 2 }}>
              <ListItemButton
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                sx={{
                  borderRadius: 4,
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 2, sm: 3 },
                  "&:hover": {
                    bgcolor: "rgba(102,126,234,0.1)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <ListItemIcon sx={{ minWidth: { xs: 40, sm: 48 } }}>
                  <Store sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </ListItemIcon>
                <ListItemText
                  primary="Categories"
                  primaryTypographyProps={{
                    fontWeight: "medium",
                    fontSize: { xs: "0.95rem", sm: "1.1rem" },
                  }}
                />
                {categoriesExpanded ? (
                  <ExpandLess sx={{ fontSize: { xs: 20, sm: 24 } }} />
                ) : (
                  <ExpandMore sx={{ fontSize: { xs: 20, sm: 24 } }} />
                )}
              </ListItemButton>
            </ListItem>

            <Collapse in={categoriesExpanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {productCategories.map((category) => (
                  <ListItem key={category.name} disablePadding sx={{ pl: 2 }}>
                    <ListItemButton
                      onClick={() => {
                        navigate("/products");
                        toggleDrawer(false)();
                      }}
                      sx={{
                        borderRadius: 3,
                        py: 1,
                        px: 2,
                        "&:hover": {
                          bgcolor: "rgba(102,126,234,0.05)",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Box sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }}>
                          {category.icon}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={category.name}
                        primaryTypographyProps={{
                          fontSize: { xs: "0.85rem", sm: "0.95rem" },
                        }}
                      />
                      {category.popular && (
                        <Chip
                          label="Popular"
                          size="small"
                          sx={{
                            height: { xs: 16, sm: 18 },
                            fontSize: { xs: "0.6rem", sm: "0.7rem" },
                            background:
                              "linear-gradient(45deg, #ff6b6b, #ffd700)",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>

            {user && (
              <Zoom in={mobileOpen} timeout={300 + menuItems.length * 100}>
                <ListItem
                  disablePadding
                  sx={{
                    mt: 3,
                    pt: 2,
                    borderTop: "1px solid rgba(102,126,234,0.1)",
                  }}
                >
                  <ListItemButton
                    onClick={() => {
                      handleLogout();
                      toggleDrawer(false)();
                    }}
                    sx={{
                      borderRadius: 4,
                      py: { xs: 1.5, sm: 2 },
                      px: { xs: 2, sm: 3 },
                      color: "#ff4757",
                      "&:hover": {
                        bgcolor: "rgba(255,71,87,0.1)",
                        transform: "translateX(5px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <ListItemIcon
                      sx={{ minWidth: { xs: 40, sm: 48 }, color: "#ff4757" }}
                    >
                      <ExitToApp sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Logout"
                      primaryTypographyProps={{
                        fontWeight: "bold",
                        fontSize: { xs: "0.95rem", sm: "1.1rem" },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Zoom>
            )}
          </List>

          {/* Footer */}
          <Box
            sx={{
              mt: "auto",
              p: { xs: 2, sm: 3 },
              borderTop: "1px solid rgba(102,126,234,0.1)",
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mb: 2,
                display: "block",
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
              }}
            >
              Follow us on social media
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
              <IconButton
                size="small"
                sx={{
                  bgcolor: "rgba(102,126,234,0.1)",
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                }}
              >
                <Facebook
                  sx={{ color: "primary.main", fontSize: { xs: 16, sm: 20 } }}
                />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  bgcolor: "rgba(102,126,234,0.1)",
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                }}
              >
                <Twitter
                  sx={{ color: "primary.main", fontSize: { xs: 16, sm: 20 } }}
                />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  bgcolor: "rgba(102,126,234,0.1)",
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                }}
              >
                <Instagram
                  sx={{ color: "primary.main", fontSize: { xs: 16, sm: 20 } }}
                />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </SwipeableDrawer>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            border: "1px solid rgba(102,126,234,0.1)",
            mt: 1,
            minWidth: { xs: 300, sm: 350 },
            maxHeight: 400,
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
          },
        }}
      >
        <Box
          sx={{ px: 3, py: 2, borderBottom: "1px solid rgba(102,126,234,0.1)" }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Notifications
          </Typography>
        </Box>
        {notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            sx={{ px: 3, py: 2, borderBottom: "1px solid rgba(0,0,0,0.05)" }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "100%",
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  background:
                    notification.type === "offer"
                      ? "linear-gradient(45deg, #ff6b6b, #ffd700)"
                      : notification.type === "update"
                      ? "linear-gradient(45deg, #667eea, #764ba2)"
                      : "linear-gradient(45deg, #4caf50, #81c784)",
                }}
              >
                {notification.type === "offer" ? (
                  <LocalOffer />
                ) : notification.type === "update" ? (
                  <Inventory />
                ) : (
                  <StarBorder />
                )}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {notification.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.message}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: "block", color: "primary.main", mt: 0.5 }}
                >
                  {notification.time}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Navbar;
