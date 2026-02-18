import React, { useState } from 'react';
import { Outlet, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Avatar,
    Menu,
    MenuItem,
    IconButton,
    Divider
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Layout: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Profile Menu State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
        navigate('/login');
    };

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const isActive = (path: string) => location.pathname === path;

    return (
        <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#F5F7FA' }}>
            <AppBar position="static" color="transparent" elevation={0} sx={{ bgcolor: '#FFF', borderBottom: '1px solid #EAEAEA' }}>
                <Toolbar sx={{ height: 70 }}>
                    {/* Logo Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
                        <Box sx={{
                            bgcolor: '#F2994A',
                            color: 'white',
                            borderRadius: 1,
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1.5,
                            fontWeight: 'bold',
                            fontSize: '18px'
                        }}>
                            ⌘
                        </Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: '#1A202C' }}>
                            IT Helpdesk Portal
                        </Typography>
                    </Box>

                    {/* Nav Links */}
                    <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
                        {user?.role === 'Requester' && (
                            <Button
                                component={Link}
                                to="/requester/dashboard"
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    color: isActive('/requester/dashboard') ? '#A05E03' : '#64748B',
                                    bgcolor: isActive('/requester/dashboard') ? '#FFEDD5' : 'transparent',
                                    px: 2,
                                    borderRadius: 2,
                                    '&:hover': { bgcolor: isActive('/requester/dashboard') ? '#FFEDD5' : '#F1F5F9' }
                                }}
                                startIcon={isActive('/requester/dashboard') ? <Box component="span" sx={{ fontSize: 20 }}>🏠</Box> : null}
                            >
                                My Tickets
                            </Button>
                        )}
                        {user?.role === 'Agent' && (
                            <>
                                <Button
                                    component={Link}
                                    to="/agent/dashboard"
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        color: isActive('/agent/dashboard') ? '#A05E03' : '#64748B',
                                        bgcolor: isActive('/agent/dashboard') ? '#FFEDD5' : 'transparent',
                                        px: 2,
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: isActive('/agent/dashboard') ? '#FFEDD5' : '#F1F5F9' }
                                    }}
                                    startIcon={isActive('/agent/dashboard') ? <Box component="span" sx={{ fontSize: 20 }}>🏠</Box> : null}
                                >
                                    Dashboard
                                </Button>
                                <Button
                                    component={Link}
                                    to="/agent/my-tickets"
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        color: isActive('/agent/my-tickets') ? '#A05E03' : '#64748B',
                                        bgcolor: isActive('/agent/my-tickets') ? '#FFEDD5' : 'transparent',
                                        px: 2,
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: isActive('/agent/my-tickets') ? '#FFEDD5' : '#F1F5F9' }
                                    }}
                                    startIcon={isActive('/agent/my-tickets') ? <Box component="span" sx={{ fontSize: 20 }}>🎫</Box> : null}
                                >
                                    My SupportTickets
                                </Button>
                                <Button
                                    component={Link}
                                    to="/requester/dashboard"
                                    sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        color: isActive('/requester/dashboard') ? '#A05E03' : '#64748B',
                                        bgcolor: isActive('/requester/dashboard') ? '#FFEDD5' : 'transparent',
                                        px: 2,
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: isActive('/requester/dashboard') ? '#FFEDD5' : '#F1F5F9' }
                                    }}
                                    startIcon={isActive('/requester/dashboard') ? <Box component="span" sx={{ fontSize: 20 }}>🎟️</Box> : null}
                                >
                                    My Tickets
                                </Button>
                            </>
                        )}
                    </Box>

                    {/* Profile Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ textAlign: 'right', mr: 2, display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1A202C', lineHeight: 1.2 }}>
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                                {user?.role}
                            </Typography>
                        </Box>

                        <IconButton
                            onClick={handleMenuClick}
                            sx={{ p: 0.5, border: '1px solid #E2E8F0', borderRadius: '50%' }}
                            size="small"
                        >
                            <Avatar
                                sx={{ width: 36, height: 36, bgcolor: '#1E293B', fontSize: '1rem' }}
                                alt={user?.firstName}
                                src="/broken-image.jpg"
                            >
                                {user?.firstName?.charAt(0)}
                            </Avatar>
                        </IconButton>

                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleMenuClose}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: 1.5,
                                    minWidth: 180,
                                    '& .MuiAvatar-root': {
                                        width: 32,
                                        height: 32,
                                        ml: -0.5,
                                        mr: 1,
                                    },
                                    '&:before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <Box sx={{ px: 2, py: 1 }}>
                                <Typography variant="subtitle2" noWrap>
                                    {user?.firstName} {user?.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    {user?.email}
                                </Typography>
                            </Box>
                            <Divider />
                            <MenuItem onClick={handleMenuClose}>
                                Profile
                            </MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
