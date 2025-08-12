import React, { useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Button,
  Tooltip,
  CardHeader,
  Avatar
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useOrder } from "../contexts/OrderContext";

// Status Chip Renderer
const getStatusChip = (status: string) => {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return (
        <Chip
          icon={<HourglassEmptyIcon />}
          label="Pending"
          color="warning"
          sx={{ fontWeight: 500 }}
        />
      );
    case "completed":
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Completed"
          color="success"
          sx={{ fontWeight: 500 }}
        />
      );
    case "cancelled":
      return (
        <Chip
          icon={<CancelIcon />}
          label="Cancelled"
          color="error"
          sx={{ fontWeight: 500 }}
        />
      );
    default:
      return <Chip label="Unknown" color="default" />;
  }
};

// Format Functions
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (amount: number) => `$${amount}`;

const Orders: React.FC = () => {
  const { orders = [], loading, error, fetchOrdersByUser } = useOrder();

  useEffect(() => {
    const userId = Number(localStorage.getItem("UserID"));
    if (userId) fetchOrdersByUser(userId);
  }, [fetchOrdersByUser]);

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={50} thickness={5} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const safeOrders = Array.isArray(orders) ? orders : [];

  // Main UI
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom color="primary" sx={{ mb: 3 }}>
        My Orders
      </Typography>

      {/* If no orders */}
      {safeOrders.length === 0 ? (
        <Box
          textAlign="center"
          py={8}
          sx={{
            bgcolor: "#fafafa",
            borderRadius: 4,
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.03)",
          }}
        >
          <ShoppingBagIcon sx={{ fontSize: 90, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't placed any orders yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Browse our products and start shopping now!
          </Typography>
          <Button variant="contained" color="primary" href="/products">
            Start Shopping
          </Button>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={4}>
          {safeOrders.map((order) => (
            <Card
              key={order.id}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                "&:hover": { boxShadow: "0 8px 28px rgba(0,0,0,0.08)" },
                transition: "0.3s ease",
              }}
            >
              {/* Order Header */}
              <CardHeader
                title={
                  <Typography variant="h6" fontWeight={600}>
                    Order #{order.id}
                  </Typography>
                }
                subheader={`Placed on: ${formatDate(order.ordered_at)}`}
                action={getStatusChip(order.order_status)}
                sx={{
                  bgcolor: "#f7f7f7",
                  borderBottom: "1px solid #e0e0e0",
                }}
              />

              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ mb: 2 }}>
                  Total: {formatPrice(order.order_total ?? 0)} &nbsp;
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    ({order.items?.length || 0} items)
                  </Typography>
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {/* Items */}
                {Array.isArray(order.items) &&
                  order.items.map((item, idx) => (
                    <Box
                      key={item.id || `${order.id}-${idx}`}
                      display="flex"
                      alignItems="center"
                      py={1.5}
                      sx={{
                        borderBottom:
                          idx !== order.items!.length - 1
                            ? "1px solid #eee"
                            : "none",
                      }}
                    >
                      {/* Product Image */}
                      <Avatar
                        variant="rounded"
                        src={item.product?.images}
                        alt={item.product?.name || "Product"}
                        sx={{
                          width: 60,
                          height: 60,
                          mr: 2,
                          bgcolor: "#f0f0f0",
                        }}
                      />

                      {/* Product Details */}
                      <Box flex={1} minWidth={0}>
                        <Tooltip title={item.product?.description || ""} arrow>
                          <Typography
                            variant="body1"
                            fontWeight={600}
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.product?.name || `Product ${item.product_id}`}
                          </Typography>
                        </Tooltip>
                        <Typography variant="body2" color="text.secondary">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </Typography>
                      </Box>

                      {/* Item Total */}
                      <Typography variant="subtitle2" fontWeight={600}>
                        {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  ))}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Orders;
