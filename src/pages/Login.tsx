import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Box,
    Button,
    Typography,
    Container,
    Paper,
    TextField,
    Link,
    Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
// @ts-ignore
import LoginImage from '../assets/login.jpeg';

const schema = yup.object({
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string().required('Password is required'),
}).required();

type FormData = yup.InferType<typeof schema>;

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = React.useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data: FormData) => {
        try {
            setError(null);
            const response = await api.post('/auth/login', data);

            // Backend returns { success: true, data: { token, ...user }, message }
            const { token, ...user } = response.data.data;

            login(token, user);

            if (user.role === 'Agent') {
                navigate('/agent/dashboard');
            } else {
                navigate('/requester/dashboard');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(msg);
        }
    };

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
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, width: '100%', height: '100%' }}>
                    {/* Left Content - Form */}
                    <Box sx={{
                        flex: 1,
                        p: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ bgcolor: '#F2994A', color: 'white', p: 0.5, borderRadius: 1, mr: 1, fontWeight: 'bold' }}>⌘</Box>
                            <Typography variant="h6" fontWeight="bold">IT Helpdesk Portal</Typography>
                        </Box>

                        <Box sx={{ mb: 4 }}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate('/')}
                                sx={{ color: '#000', textTransform: 'none', p: 0, '&:hover': { bgcolor: 'transparent' } }}
                            >
                                Go Back
                            </Button>
                        </Box>

                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                            Sign In to Access your Account
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Email Address</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="your.email@company.com"
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: errors.email ? '#FFF4F4' : '#F9FAFB',
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ mb: 4 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Password</Typography>
                                <TextField
                                    fullWidth
                                    type="password"
                                    placeholder="Enter your password"
                                    {...register('password')}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: '#F9FAFB',
                                        }
                                    }}
                                />
                            </Box>

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                disabled={isSubmitting}
                                sx={{
                                    bgcolor: '#E67E22',
                                    py: 1.5,
                                    borderRadius: 1,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    '&:hover': { bgcolor: '#D35400' }
                                }}
                            >
                                Sign In
                            </Button>

                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Don't have an account?{' '}
                                    <Link component={RouterLink} to="/register" sx={{ color: '#3366FF', fontWeight: 'bold', textDecoration: 'none' }}>
                                        Register here
                                    </Link>
                                </Typography>
                            </Box>
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
                            src={LoginImage}
                            alt="Login Illustration"
                            sx={{
                                maxWidth: '80%',
                                maxHeight: '80%',
                                objectFit: 'contain',
                            }}
                        />
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
