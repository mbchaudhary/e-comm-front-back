import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Card,
  CardContent,
  IconButton,
  Chip,
  Fade,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    address: '',
    phone_number: '',
  });
  const [originalData, setOriginalData] = useState({
    full_name: '',
    email: '',
    address: '',
    phone_number: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
          const result = await apiService.getUserProfile(user.id);
          const profileData = {
            full_name: result.full_name ?? '',
            email: result.email ?? '',
            address: result.address ?? '',
            phone_number: result.phone_number ?? '',
          };
          setFormData(profileData);
          setOriginalData(profileData);
        } catch (err: any) {
          console.error('Failed to fetch profile:', err);
          setError('Failed to load profile');
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
    
    // Clear any previous errors when user starts typing
    if (error) {
      setError(null);
    }
  };

  const validateFields = () => {
    const trimmedName = formData.full_name.trim();
    const trimmedAddress = formData.address.trim();
    const trimmedPhone = formData.phone_number.trim();

    if (!trimmedName) return 'Full name is required';
    if (trimmedName.length < 2) return 'Full name must be at least 2 characters';
    if (!trimmedAddress) return 'Address is required';
    if (!trimmedPhone) return 'Phone number is required';
    if (!/^\d{10,15}$/.test(trimmedPhone)) {
      return 'Phone number must be 10-15 digits only';
    }
    return null;
  };

  const handleEdit = () => {
    setEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setFormData({ ...originalData });
    setEditing(false);
    setError(null);
    setSuccess(null);
  };

  // Separate function for save logic
  const saveProfile = async () => {
    setError(null);
    setSuccess(null);

    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      return false;
    }

    setSaving(true);
    try {
      const updateData = {
        full_name: formData.full_name.trim(),
        address: formData.address.trim(),
        phone_number: formData.phone_number.trim(),
      };

      console.log('Updating profile with data:', updateData);
      
      await apiService.updateUserProfile(user!.id, updateData);
      
      // Update original data to reflect the changes
      const newOriginalData = { ...formData };
      setOriginalData(newOriginalData);
      
      setSuccess('Profile updated successfully!');
      setEditing(false);
      return true;
    } catch (err: any) {
      console.error('Profile update failed:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Failed to update profile';
      setError(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile();
  };

  const handleIconSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await saveProfile();
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Card sx={{ textAlign: 'center', py: 6, borderRadius: 3 }}>
          <CardContent>
            <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Authentication Required
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please login to view your profile.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h5" color="text.secondary">
            Loading your profile...
          </Typography>
          <Box sx={{ width: 200, height: 4, bgcolor: 'grey.200', borderRadius: 2 }}>
            <Box
              sx={{
                width: '60%',
                height: '100%',
                bgcolor: 'primary.main',
                borderRadius: 2,
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%': { width: '30%' },
                  '50%': { width: '80%' },
                  '100%': { width: '30%' },
                },
              }}
            />
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 4,
          py: 6,
          px: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white' }}>
          <Typography variant="h2" fontWeight={800} gutterBottom>
            My Profile
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Manage your personal information and settings
          </Typography>
        </Box>
      </Box>

      {/* Alert Messages */}
      <Fade in={!!error || !!success}>
        <Box sx={{ mb: 3 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.15)' 
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)' 
              }}
              onClose={() => setSuccess(null)}
            >
              {success}
            </Alert>
          )}
        </Box>
      </Fade>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
        {/* Profile Card */}
        <Card 
          elevation={8}
          sx={{ 
            minWidth: 350,
            height: 'fit-content',
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            border: '1px solid rgba(103, 58, 183, 0.1)',
          }}
        >
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            {/* Avatar Section */}
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 32px rgba(103, 58, 183, 0.3)',
                }}
              >
                {getInitials(formData.full_name)}
              </Avatar>
              <Tooltip title="Change Profile Picture">
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    '&:hover': { bgcolor: 'primary.dark' },
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                  }}
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* User Info */}
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {formData.full_name || 'User Name'}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {formData.email}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2, mb: 3 }}>
              <Chip
                icon={<VerifiedIcon />}
                label="Verified User"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
              <Chip
                label="Active"
                color="success"
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Quick Stats */}
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600} color="primary.main">
                  2+
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Years Active
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600} color="primary.main">
                  100%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Profile Complete
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card 
          elevation={8}
          sx={{ 
            flex: 1,
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            border: '1px solid rgba(103, 58, 183, 0.1)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" fontWeight={700}>
                Personal Information
              </Typography>
              {!editing ? (
                <Tooltip title="Edit Profile">
                  <IconButton
                    onClick={handleEdit}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 48,
                      height: 48,
                      '&:hover': { 
                        bgcolor: 'primary.dark',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Save Changes">
                    <IconButton
                      onClick={handleIconSave}
                      disabled={saving}
                      sx={{
                        bgcolor: 'success.main',
                        color: 'white',
                        width: 48,
                        height: 48,
                        '&:hover': { bgcolor: 'success.dark' },
                        '&:disabled': { bgcolor: 'grey.400' },
                      }}
                    >
                      {saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton
                      onClick={handleCancel}
                      disabled={saving}
                      sx={{
                        bgcolor: 'grey.500',
                        color: 'white',
                        width: 48,
                        height: 48,
                        '&:hover': { bgcolor: 'grey.600' },
                        '&:disabled': { bgcolor: 'grey.400' },
                      }}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Form Fields */}
            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Full Name */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Full Name
                    </Typography>
                    {editing && <Typography variant="caption" color="error">*</Typography>}
                  </Box>
                  <TextField
                    fullWidth
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={!editing}
                    variant="outlined"
                    placeholder="Enter your full name"
                    required={editing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: editing ? 'white' : 'grey.50',
                        '& fieldset': {
                          borderColor: editing ? 'primary.main' : 'grey.300',
                        },
                      },
                    }}
                  />
                </Box>

                {/* Email */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <EmailIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Email Address
                    </Typography>
                    <Chip label="Cannot be changed" size="small" color="warning" />
                  </Box>
                  <TextField
                    fullWidth
                    name="email"
                    value={formData.email}
                    disabled
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'grey.100',
                      },
                    }}
                  />
                </Box>

                {/* Phone Number */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <PhoneIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Phone Number
                    </Typography>
                    {editing && <Typography variant="caption" color="error">*</Typography>}
                  </Box>
                  <TextField
                    fullWidth
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    disabled={!editing}
                    variant="outlined"
                    placeholder="Enter your phone number (10-15 digits)"
                    inputProps={{ maxLength: 15 }}
                    required={editing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: editing ? 'white' : 'grey.50',
                        '& fieldset': {
                          borderColor: editing ? 'primary.main' : 'grey.300',
                        },
                      },
                    }}
                  />
                </Box>

                {/* Address */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <HomeIcon color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      Address
                    </Typography>
                    {editing && <Typography variant="caption" color="error">*</Typography>}
                  </Box>
                  <TextField
                    fullWidth
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!editing}
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="Enter your address"
                    required={editing}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: editing ? 'white' : 'grey.50',
                        '& fieldset': {
                          borderColor: editing ? 'primary.main' : 'grey.300',
                        },
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Submit Button (only show when editing) */}
              {editing && (
                <Box sx={{ mt: 6, textAlign: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={saving}
                    sx={{
                      borderRadius: 3,
                      px: 6,
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 8px 24px rgba(103, 58, 183, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 32px rgba(103, 58, 183, 0.5)',
                      },
                      '&:disabled': {
                        background: 'grey.400',
                        transform: 'none',
                        boxShadow: 'none',
                      },
                      transition: 'all 0.3s ease',
                    }}
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  >
                    {saving ? 'Saving Changes...' : 'Save Profile'}
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Profile;
