import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Collapse,
  Avatar,
  Typography,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  HomeOutlined,
  PersonOutlined,
  Edit,
  Logout,
  LockReset,
  VpnKey,
} from '@mui/icons-material';
import DoctorsIcon from '@mui/icons-material/Person';
import NurseIcon from '@mui/icons-material/LocalHospital';
import LabIcon from '@mui/icons-material/Science';
import AdminIcon from '@mui/icons-material/Security';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useAuth } from '../../../Pages/AuthPage'; // Adjust as needed

const DrawerHeader = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '0 8px',
  minHeight: '64px',
}));

const sections = {
  dashboard: [
    { text: 'Dashboard', icon: <HomeOutlined />, path: '/admin' },
  ],
  profile: [
    { text: 'Update User Photo', icon: <Edit />, path: '/admin/editProfileForAdmin' },
    { text: 'Forgot Password', icon: <LockReset />, path: '/admin/forgetpasswordadmin' },
    { text: 'Verify OTP Email', icon: <VpnKey />, path: '/admin/verifyotpadmin' },
    { text: 'Logout', icon: <Logout />, action: 'logout' },
  ],
  registration: [
    { text: 'Register Doctor', icon: <DoctorsIcon />, path: '/admin/register-doctor' },
    { text: 'Register Nurse', icon: <NurseIcon />, path: '/admin/register-nurse' },
    { text: 'Register Lab', icon: <LabIcon />, path: '/admin/register-laboratory' },
    { text: 'Register Admin', icon: <AdminIcon />, path: '/admin/register-admin' },
  ],
  services: [
    { text: 'Add Nursings', icon: <LabIcon />, path: '/admin/register-nursings' },
    { text: 'Add City', icon: <LabIcon />, path: '/admin/add-city' },
    { text: 'Add Specification', icon: <LabIcon />, path: '/admin/register-nurses' },
    { text: 'User', icon: <PersonOutlined />, path: '/admin/getUser' },
  ],
  charts: [
    { text: 'Bar Chart', icon: <LabIcon />, path: '/admin/bar' },
    { text: 'Pie Chart', icon: <LabIcon />, path: '/admin/pie' },
  ],
};

const AdminSideBar = ({ open, handleDrawerClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [expand, setExpand] = useState({ profile: false, registration: false, services: false, charts: false });
  const [photo, setPhoto] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  const API_BASE = 'https://physiocareapp.runasp.net/api/v1';
  const ENDPOINT = `${API_BASE}/Upload/GetPhotoByUserIdAsync`;

  const handleToggle = (section) => {
    setExpand((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAction = async (action) => {
    if (action === 'logout') {
      await logout();
      navigate('/login');
    }
  };

  useEffect(() => {
    const fetchPhoto = async () => {
      if (!isAuthenticated || !user?.id || !user?.accessToken) {
        setPhotoError('User not authenticated');
        return;
      }

      setPhotoLoading(true);
      setPhotoError(null);

      const maxRetries = 2;
      let retries = 0;

      while (retries < maxRetries) {
        try {
          const response = await axios.get(ENDPOINT, {
            params: {
              userId: user.id,
              path: 'actors/SuperAdmin',
            },
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
              Accept: '*/*',
            },
            responseType: 'blob',
            timeout: 10000, // 10 second timeout
          });

          // Check if response is successful and has data
          if (response.status === 200 && response.data) {
            // Check if it's actually an image blob
            const contentType = response.headers['content-type'] || response.data.type;
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
            
            if (contentType && validImageTypes.some(type => contentType.includes(type))) {
              const imageUrl = URL.createObjectURL(response.data);
              setPhoto(imageUrl);
              setPhotoLoading(false);
              return; // Success, exit the function
            } else {
              console.warn('Response is not a valid image type:', contentType);
              throw new Error('Invalid image format received');
            }
          }
        } catch (err) {
          retries++;
          console.error(`Fetch photo error (attempt ${retries}):`, {
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText,
            headers: err.response?.headers,
            url: err.config?.url,
            params: err.config?.params
          });

          // Handle different error scenarios
          if (err.response?.status === 401) {
            setPhotoError('Session expired. Please log in again.');
            await logout();
            navigate('/login');
            return;
          } else if (err.response?.status === 404) {
            setPhotoError('Profile photo not found.');
            break; // Don't retry for 404
          } else if (err.response?.status === 500) {
            // Server error - check if response contains blob data
            if (err.response?.data instanceof Blob) {
              try {
                // Try to read the blob as text to see if it contains error info
                const text = await err.response.data.text();
                console.error('Server error response:', text);
                
                // Check if the blob is actually an image despite the 500 status
                const contentType = err.response.headers['content-type'];
                if (contentType && contentType.startsWith('image/')) {
                  console.warn('Received image with 500 status, attempting to use it');
                  const imageUrl = URL.createObjectURL(err.response.data);
                  setPhoto(imageUrl);
                  setPhotoLoading(false);
                  return;
                }
              } catch (blobError) {
                console.error('Error reading blob:', blobError);
              }
            }
            
            if (retries < maxRetries) {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1000 * retries));
              continue;
            } else {
            }
          } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            setPhotoError('Request timeout. Please check your connection.');
          } else if (err.message === 'Invalid image format received') {
            setPhotoError('Invalid image format received.');
            break; // Don't retry for invalid format
          } else {
            setPhotoError('Failed to load profile photo.');
          }

          // If we've exhausted retries, break the loop
          if (retries >= maxRetries) {
            break;
          }
        }
      }

      setPhotoLoading(false);
    };

    fetchPhoto();

    // Cleanup function to revoke object URLs
    return () => {
      if (photo) {
        URL.revokeObjectURL(photo);
      }
    };
  }, [user?.id, user?.accessToken, isAuthenticated, navigate, logout]);

  const renderList = (items, sectionKey) => {
    // Handle non-expandable Dashboard item separately
    if (sectionKey === 'dashboard') {
      return (
        <>
          <List>
            {items.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
                <Tooltip title={open ? '' : item.text} placement="left">
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                      bgcolor: location.pathname === item.path ? '#e6f7f8' : null,
                      '&:hover': { bgcolor: '#f1f5f9' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: '#009DA5' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{ opacity: open ? 1 : 0, color: '#2d3748', fontWeight: 500 }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ bgcolor: 'rgba(0,0,0,0.08)' }} />
        </>
      );
    }

    // Handle expandable sections
    return (
      <>
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <Tooltip title={open ? '' : sectionKey} placement="left">
              <ListItemButton
                onClick={() => handleToggle(sectionKey)}
                sx={{ minHeight: 48, justifyContent: open ? 'initial' : 'center', px: 2.5 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: '#009DA5' }}>
                  <PersonOutlined />
                </ListItemIcon>
                <ListItemText
                  primary={sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}
                  sx={{ opacity: open ? 1 : 0, color: '#2d3748', fontWeight: 500 }}
                />
                {open ? expand[sectionKey] ? <ExpandLess /> : <ExpandMore /> : null}
              </ListItemButton>
            </Tooltip>
          </ListItem>
          <Collapse in={expand[sectionKey]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {items.map((item) => (
                <ListItem key={item.path || item.action} disablePadding sx={{ display: 'block' }}>
                  <Tooltip title={open ? '' : item.text} placement="left">
                    <ListItemButton
                      component={item.path ? Link : 'button'}
                      to={item.path}
                      onClick={() => item.action && handleAction(item.action)}
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        pl: open ? 4 : 2.5,
                        bgcolor: location.pathname === item.path ? '#e6f7f8' : null,
                        '&:hover': { bgcolor: '#f1f5f9' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto', justifyContent: 'center', color: '#009DA5' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        sx={{ opacity: open ? 1 : 0, color: '#2d3748', fontWeight: 500 }}
                      />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </List>
        <Divider sx={{ bgcolor: 'rgba(0,0,0,0.08)' }} />
      </>
    );
  };

  return (
    <>
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose} sx={{ color: '#2d3748' }}>
          <ChevronLeftIcon />
        </IconButton>
      </DrawerHeader>
      <Divider sx={{ bgcolor: 'rgba(0,0,0,0.08)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
        {photoLoading ? (
          <div style={{ width: open ? 88 : 44, height: open ? 88 : 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={open ? 40 : 24} sx={{ color: '#009DA5' }} />
          </div>
        ) : photo ? (
          <Avatar
            src={photo}
            alt={user?.email || 'Admin'}
            sx={{
              width: open ? 88 : 44,
              height: open ? 88 : 44,
              border: '2px solid #009DA5',
              transition: '0.25s',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Avatar
            sx={{
              width: open ? 88 : 44,
              height: open ? 88 : 44,
              border: '2px solid #009DA5',
              transition: '0.25s',
              bgcolor: '#e2e8f0',
              color: '#718096',
            }}
          >
            <PersonOutlined fontSize={open ? 'large' : 'medium'} />
          </Avatar>
        )}
        {photoError && open && (
          <Typography sx={{ color: '#dc3545', fontSize: '0.75rem', mt: 1, textAlign: 'center' }}>
            {photoError}
          </Typography>
        )}
      </div>
      <Typography
        align="center"
        sx={{
          fontSize: open ? 17 : 0,
          transition: '0.25s',
          color: '#2d3748',
          fontWeight: 600,
        }}
      >
        {user?.email?.split('@')[0] || 'Admin'}
      </Typography>
      <Typography
        align="center"
        sx={{
          fontSize: open ? 15 : 0,
          transition: '0.25s',
          color: '#009DA5',
          fontWeight: 500,
        }}
      >
        Admin
      </Typography>
      <Divider sx={{ bgcolor: 'rgba(0,0,0,0.08)' }} />

      {/* Render Dashboard first, then expandable sections */}
      {renderList(sections.dashboard, 'dashboard')}
      {renderList(sections.profile, 'profile')}
      {renderList(sections.registration, 'registration')}
      {renderList(sections.services, 'services')}
      {renderList(sections.charts, 'charts')}
    </>
  );
};

export default AdminSideBar;