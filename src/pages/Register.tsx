import React from 'react';
import { useNavigate } from 'react-router-dom';
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
    Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
// @ts-ignore
import LoginImage from '../assets/login.jpeg';

const schema = yup.object({
    firstName: yup.string().required('First Name is required'),
    lastName: yup.string().required('Last Name is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Confirm Password is required'),
}).required();

type FormData = yup.InferType<typeof schema>;

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = React.useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data: FormData) => {
        try {
            setError(null);
            // Send confirmPassword as it is required by backend schema
            const response = await api.post('/auth/register', data);

            // Backend returns { success: true, data: { token, ...user }, message }
            const { token, ...user } = response.data.data;

            login(token, user);

            if (user.role === 'Agent') {
                navigate('/agent/dashboard');
            } else {
                navigate('/requester/dashboard');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Registration failed.';
            setError(msg);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    height: '90vh',
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
                        p: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ bgcolor: '#F2994A', color: 'white', p: 0.5, borderRadius: 1, mr: 1, fontWeight: 'bold' }}>⌘</Box>
                            <Typography variant="h6" fontWeight="bold">IT Helpdesk Portal</Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Button
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigate('/login')}
                                sx={{ color: '#000', textTransform: 'none', p: 0, '&:hover': { bgcolor: 'transparent' } }}
                            >
                                Go Back
                            </Button>
                        </Box>

                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                            Sign Up to Access your Account
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ mb: 2, flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>First Name</Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="John"
                                        {...register('firstName')}
                                        error={!!errors.firstName}
                                        helperText={errors.firstName?.message}
                                        size="small"
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB' } }}
                                    />
                                </Box>
                                <Box sx={{ mb: 2, flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Last Name</Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Doe"
                                        {...register('lastName')}
                                        error={!!errors.lastName}
                                        helperText={errors.lastName?.message}
                                        size="small"
                                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB' } }}
                                    />
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Email Address</Typography>
                                <TextField
                                    fullWidth
                                    placeholder="your.email@company.com"
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB' } }}
                                    autoComplete="email"
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Password</Typography>
                                <TextField
                                    fullWidth
                                    type="password"
                                    placeholder="Create password"
                                    {...register('password')}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB' } }}
                                    autoComplete="new-password"
                                />
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>Confirm Password</Typography>
                                <TextField
                                    fullWidth
                                    type="password"
                                    placeholder="Confirm password"
                                    {...register('confirmPassword')}
                                    error={!!errors.confirmPassword}
                                    helperText={errors.confirmPassword?.message}
                                    size="small"
                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F9FAFB' } }}
                                    autoComplete="new-password"
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
                            src={LoginImage}
                            alt="Register Illustration"
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

export default Register;
