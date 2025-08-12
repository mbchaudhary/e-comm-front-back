import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import apiService from "../services/api";
import { Order } from "../types";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "warning";
    case "completed":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Assuming apiService.getOrders fetches current user's orders correctly
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        color="primary.main"
      >
        My Orders
      </Typography>

      {orders.length === 0 ? (
        <Box textAlign="center" py={6}>
          <ShoppingBagIcon
            sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary">
            You have no orders yet.
          </Typography>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={3}>
          {orders.map((order) => (
            <Card
              key={order.id}
              sx={{
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                "&:hover": { boxShadow: "0 8px 28px rgba(0,0,0,0.08)" },
                transition: "0.3s ease",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Top Row: ID and Status */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Order #{order.id}
                  </Typography>
                  <Chip
                    label={order.order_status}
                    color={getStatusColor(order.order_status) as any}
                    sx={{ fontWeight: 500 }}
                  />
                </Box>

                {/* Date & Total */}
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Placed on: {new Date(order.ordered_at).toLocaleString()}
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="primary"
                >
                  Total: ${order.order_total}
                </Typography>

                {/* Divider */}
                {order.items && order.items.length > 0 && (
                  <Divider sx={{ my: 2 }} />
                )}

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      gutterBottom
                    >
                      Items:
                    </Typography>
                    {order.items.map((item, idx) => (
                      <React.Fragment key={item.id}>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          py={1}
                        >
                          <Typography variant="body2">
                            {item.product?.name || `Product ${item.product_id}`}{" "}
                            × {item.quantity}
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            ${item.price}
                          </Typography>
                        </Box>
                        {idx < order.items!.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Orders;
