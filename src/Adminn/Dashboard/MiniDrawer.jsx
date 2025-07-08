import React, { useState } from 'react';
import { Box, CssBaseline, Drawer as MuiDrawer } from '@mui/material';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';          // ✅ Add this
import MenuIcon from '@mui/icons-material/Menu';            // ✅ And this
import AdminSideBar from '../Dashboard/components/SideBar';
import { Outlet } from 'react-router-dom';

const drawerWidth = 240;

const openedMixin = () => ({
  width: drawerWidth,
  transition: 'width 0.2s ease',
  overflowX: 'hidden',
});

const closedMixin = () => ({
  transition: 'width 0.2s ease',
  overflowX: 'hidden',
  width: '57px',
  '@media (min-width: 600px)': {
    width: '65px',
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  zIndex: 1100,
  ...(open && {
    ...openedMixin(),
    '& .MuiDrawer-paper': openedMixin(),
  }),
  ...(!open && {
    ...closedMixin(),
    '& .MuiDrawer-paper': closedMixin(),
  }),
}));

const MiniDrawer = () => {
  const [open, setOpen] = useState(true);

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
  <CssBaseline />

  {/* Show this button when sidebar is collapsed */}
  {!open && (
    <IconButton
      onClick={() => setOpen(true)}
      sx={{
        position: 'fixed',
        top: 16,
        left: 16,
        zIndex: 1300, // above drawer
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        '&:hover': {
          backgroundColor: '#eee',
        },
      }}
    >
      <MenuIcon />
    </IconButton>
  )}

  {/* Sidebar */}
  <Drawer variant="permanent" open={open}>
    <AdminSideBar open={open} handleDrawerClose={() => setOpen(false)} />
  </Drawer>

  {/* Main Content */}
  <Box
    component="main"
    sx={{
      flexGrow: 1,
      p: 3,
      width: `calc(100% - ${open ? drawerWidth : 65}px)`,
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      transition: 'width 0.2s ease',
    }}
  >
    <Outlet />
  </Box>
</Box>
  );
};

export default MiniDrawer;
