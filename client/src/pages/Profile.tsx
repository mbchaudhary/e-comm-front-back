import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  // Card,
  // CardContent,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const Profile: React.FC = () => {
  const { user } = useAuth();
  // Local loading for API calls
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // submitting state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    address: '',
    phone_number: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch fresh profile from API
  useEffect(() => {
    if (user?.id) {
      const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
          // Get user profile via API
          const result = await apiService.getUserProfile(user.id);

          setFormData({
            full_name: result.full_name ?? '',
            email: result.email ?? '',
            address: result.address ?? '',
            phone_number: result.phone_number ?? '',
          });
        } catch (err: any) {
          setError('Failed to load profile');
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateFields = () => {
    if (!formData.full_name.trim()) return 'Name is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.phone_number.trim() || !/^\d{10,}$/.test(formData.phone_number.trim()))
      return 'Enter valid phone number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      // Update profile via API
      await apiService.updateUserProfile(user!.id, {
        full_name: formData.full_name,
        address: formData.address,
        phone_number: formData.phone_number,
      });
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          Please login to view your profile.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ mt: 6 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ borderRadius: 3, py: 3, px: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" gutterBottom align="center" fontWeight={600}>
          Profile Settings
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            margin="normal"
            required
            autoComplete="name"
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            margin="normal"
            required
            disabled // email can't be changed
          />

          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            margin="normal"
            required
            multiline
            rows={3}
            autoComplete="street-address"
          />

          <TextField
            fullWidth
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            margin="normal"
            required
            type="tel"
            inputProps={{ maxLength: 15 }}
            placeholder="Enter phone number"
          />

          <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Profile'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
