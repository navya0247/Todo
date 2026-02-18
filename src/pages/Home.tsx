import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
// @ts-ignore
import HomeImage from '../assets/Home.jpeg';

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    height: '80vh',
                    borderRadius: 4,
                    overflow: 'hidden',
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', height: '100%' }}>
                    {/* Left Content */}
                    <Box sx={{
                        flex: 1,
                        p: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start'
                    }}>
                        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                            <Box sx={{
                                bgcolor: '#F2994A',
                                color: 'white',
                                p: 0.5,
                                borderRadius: 1,
                                mr: 1,
                                fontWeight: 'bold',
                                fontSize: '1.2rem'
                            }}>
                                ⌘
                            </Box>
                            <Typography variant="h6" fontWeight="bold">IT Helpdesk Portal</Typography>
                        </Box>

                        <Typography variant="overline" sx={{ letterSpacing: 2, color: '#666', fontWeight: 'bold' }}>
                            MADE IT SIMPLE
                        </Typography>

                        <Typography variant="h2" component="h1" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.2 }}>
                            Modern <span style={{ color: '#E67E22' }}>IT Support</span>
                        </Typography>

                        <Typography variant="body1" sx={{ color: '#666', mb: 6, maxWidth: '400px' }}>
                            Streamline your IT support operations with our powerful ticketing system.
                            Track issues, manage requests, and deliver exceptional support.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={() => navigate('/login')}
                                sx={{
                                    bgcolor: '#E67E22',
                                    padding: '10px 40px',
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    '&:hover': { bgcolor: '#D35400' }
                                }}
                            >
                                Sign In
                            </Button>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate('/register')}
                                sx={{
                                    borderColor: '#E67E22',
                                    color: '#E67E22',
                                    padding: '10px 40px',
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    '&:hover': { borderColor: '#D35400', color: '#D35400', bgcolor: 'transparent' }
                                }}
                            >
                                Signup
                            </Button>
                        </Box>
                    </Box>

                    {/* Right Image */}
                    <Box sx={{
                        flex: 1,
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#FFF0E6',
                        position: 'relative'
                    }}>
                        <Box
                            component="img"
                            src={HomeImage}
                            alt="IT Support"
                            sx={{
                                maxWidth: '80%',
                                maxHeight: '80%',
                                objectFit: 'contain',
                                zIndex: 1
                            }}
                        />
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Home;
