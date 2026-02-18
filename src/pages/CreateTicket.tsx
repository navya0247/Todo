import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    MenuItem,
    Alert,
    IconButton,
    InputLabel,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormHelperText,
    Snackbar,
    Stack
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import api from '../services/api';

// --- Validation Consonants ---
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Explicitly define interface to match yup schema and useForm expectations
interface FormData {
    title: string;
    description: string;
    type: string;
    category: string;
    subcategory: string;
    priority: string;
    deviceType: string;
    operatingSystem: string;
    location: string;
}

const schema = yup.object({
    title: yup.string().required('Title is required').min(5, 'Min 5 chars').max(50, 'Max 50 chars'),
    description: yup.string().required('Description is required').min(10, 'Min 10 chars').max(300, 'Max 300 chars'),
    type: yup.string().required('Request Type is required'),
    category: yup.string().required('Category is required'),
    subcategory: yup.string().default('General'),
    priority: yup.string().required('Priority is required'),
    deviceType: yup.string().required('Device Type is required'),
    operatingSystem: yup.string().required('Operating System is required'),
    location: yup.string().required('Location is required'),
}).required();

interface CreateTicketProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateTicket: React.FC<CreateTicketProps> = ({ onClose, onSuccess }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [openSuccessToast, setOpenSuccessToast] = useState(false);

    const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: yupResolver(schema) as any,
        defaultValues: {
            title: '',
            description: '',
            type: 'Incident',
            category: 'General Question',
            subcategory: 'General',
            priority: 'Low',
            deviceType: 'Mobile',
            operatingSystem: 'Mobile',
            location: 'Office'
        }
    });

    const titleValue = watch('title') || '';
    const descriptionValue = watch('description') || '';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileError(null);
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const validFiles: File[] = [];
            let errorMsg = '';

            newFiles.forEach(file => {
                if (file.size > MAX_FILE_SIZE) {
                    errorMsg = `File ${file.name} exceeds 10MB limit.`;
                } else {
                    validFiles.push(file);
                }
            });

            if (errorMsg) setFileError(errorMsg);
            setFiles(prev => [...prev, ...validFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: FormData) => {
        try {
            setSubmitError(null);

            const formData = new FormData();

            // Explicitly append subcategory as it is required by backend but hidden in UI
            formData.append('subcategory', 'General');

            Object.entries(data).forEach(([key, value]) => {
                // Skip subcategory if it's in data to avoid duplicates, though FormData handles multiple same-key appends by creating array (Multer handles this but safer to be single)
                if (key === 'subcategory') return;
                if (value !== undefined && value !== null && value !== '') {
                    formData.append(key, value);
                }
            });

            files.forEach((file) => {
                formData.append('attachments', file);
            });

            // Log payload for debugging
            // for (let pair of formData.entries()) {
            //     console.log(pair[0]+ ', ' + pair[1]); 
            // }

            await api.post('/tickets', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setOpenSuccessToast(true);
            setTimeout(() => {
                onSuccess();
            }, 1000);

        } catch (err: any) {
            console.error("Create Ticket Error:", err);
            const msg = err.response?.data?.message || err.message || 'Failed to create ticket. Please check your connection and try again.';
            setSubmitError(`Error: ${msg}`);
        }
    };

    const handleCloseToast = () => setOpenSuccessToast(false);

    return (
        <Box sx={{ width: { xs: '100vw', sm: 600, md: 700 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', bgcolor: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
                <Box>
                    <Typography variant="h5" fontWeight="800" sx={{ color: '#111827', mb: 0.5 }}>
                        Create New Ticket
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        Submit an incident or service request
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: '#9CA3AF' }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 4, bgcolor: '#F9FAFB' }}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {submitError && <Alert severity="error" sx={{ mb: 3 }}>{submitError}</Alert>}

                    {/* Title */}
                    <Box sx={{ mb: 3 }}>
                        <InputLabel sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>Title <span style={{ color: '#EF4444' }}>*</span></InputLabel>
                        <TextField
                            fullWidth
                            placeholder="Brief summary of your issue or request"
                            {...register('title')}
                            error={!!errors.title}
                            helperText={errors.title?.message}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFF' } }}
                        />
                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, color: titleValue.length > 50 ? 'error.main' : '#9CA3AF' }}>
                            {titleValue.length}/50
                        </Typography>
                    </Box>

                    {/* Description */}
                    <Box sx={{ mb: 3 }}>
                        <InputLabel sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>Description <span style={{ color: '#EF4444' }}>*</span></InputLabel>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Please provide detailed information about your issue or request..."
                            {...register('description')}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                            sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#FFF' } }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <FormHelperText sx={{ mt: 0 }}>Include any error messages, steps to reproduce, or relevant details</FormHelperText>
                            <Typography variant="caption" sx={{ color: descriptionValue.length > 300 ? 'error.main' : '#9CA3AF' }}>
                                {descriptionValue.length}/300
                            </Typography>
                        </Box>
                    </Box>

                    {/* Request Type */}
                    <Box sx={{ mb: 4 }}>
                        <InputLabel sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>Request Type <span style={{ color: '#EF4444' }}>*</span></InputLabel>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup row {...field} sx={{ gap: 2 }}>
                                    {['Incident', 'Service Request'].map((type) => (
                                        <Paper
                                            key={type}
                                            variant="outlined"
                                            sx={{
                                                flex: 1,
                                                p: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                bgcolor: field.value === type ? '#FFF7ED' : 'white',
                                                borderColor: field.value === type ? '#EA580C' : '#E5E7EB',
                                                borderWidth: field.value === type ? 2 : 1,
                                                transition: 'all 0.2s',
                                                '&:hover': { borderColor: '#EA580C' }
                                            }}
                                            onClick={() => field.onChange(type)}
                                        >
                                            <Radio checked={field.value === type} size="small" sx={{ color: '#EA580C', '&.Mui-checked': { color: '#EA580C' } }} />
                                            <Box sx={{ ml: 1 }}>
                                                <Typography fontWeight="700" color="#111827" fontSize="0.9rem">{type}</Typography>
                                                <Typography variant="caption" color="#6B7280" display="block">
                                                    {type === 'Incident' ? 'Something is broken or not working' : 'Request access or new service'}
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                        {errors.type && <FormHelperText error>{errors.type.message}</FormHelperText>}
                    </Box>

                    {/* Category & Priority */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
                        <Box sx={{ flex: 1 }}>
                            <InputLabel sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>Category <span style={{ color: '#EF4444' }}>*</span></InputLabel>
                            <TextField
                                select
                                fullWidth
                                {...register('category')}
                                error={!!errors.category}
                                helperText={errors.category?.message}
                                defaultValue="General Question"
                                sx={{ bgcolor: 'white' }}
                            >
                                {[
                                    'Hardware', 'Software', 'Network/VPN',
                                    'Email/Collaboration', 'Access & Permissions',
                                    'Policy Request', 'Software Development Request',
                                    'Knowledge Base Request', 'General Question', 'Other'
                                ].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                            </TextField>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <InputLabel sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>Priority <span style={{ color: '#EF4444' }}>*</span></InputLabel>
                            <TextField
                                select
                                fullWidth
                                {...register('priority')}
                                error={!!errors.priority}
                                helperText={errors.priority?.message}
                                defaultValue="Low"
                                sx={{ bgcolor: 'white' }}
                            >
                                {['Low', 'High', 'Critical'].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                            </TextField>
                        </Box>
                    </Stack>

                    {/* Device & OS */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
                        <Box sx={{ flex: 1 }}>
                            <InputLabel sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>Device Type <span style={{ color: '#EF4444' }}>*</span></InputLabel>
                            <TextField
                                select
                                fullWidth
                                {...register('deviceType')}
                                error={!!errors.deviceType}
                                helperText={errors.deviceType?.message}
                                defaultValue="Mobile"
                                sx={{ bgcolor: 'white' }}
                            >
                                {['Mobile', 'Laptop', 'Desktop', 'Tablet', 'Other'].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                            </TextField>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <InputLabel sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>OS <span style={{ color: '#EF4444' }}>*</span></InputLabel>
                            <TextField
                                select
                                fullWidth
                                {...register('operatingSystem')}
                                error={!!errors.operatingSystem}
                                helperText={errors.operatingSystem?.message}
                                defaultValue="Mobile"
                                sx={{ bgcolor: 'white' }}
                            >
                                {['Mobile', 'Windows', 'MacOS', 'Linux', 'Other'].map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                            </TextField>
                        </Box>
                    </Stack>

                    {/* Location */}
                    <Box sx={{ mb: 4 }}>
                        <InputLabel sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>Location <span style={{ color: '#EF4444' }}>*</span></InputLabel>
                        <Controller
                            name="location"
                            control={control}
                            render={({ field }) => (
                                <Paper variant="outlined" sx={{ p: '8.5px 14px', display: 'flex', bgcolor: '#FFF' }}>
                                    <RadioGroup row {...field} sx={{ width: '100%', justifyContent: 'flex-start', gap: 4 }}>
                                        <FormControlLabel
                                            value="Office"
                                            control={<Radio size="small" sx={{ color: '#EA580C', '&.Mui-checked': { color: '#EA580C' } }} />}
                                            label={<Typography fontWeight="600" fontSize="0.9rem">Office</Typography>}
                                        />
                                        <FormControlLabel
                                            value="Remote"
                                            control={<Radio size="small" sx={{ color: '#EA580C', '&.Mui-checked': { color: '#EA580C' } }} />}
                                            label={<Typography fontWeight="600" fontSize="0.9rem">Remote</Typography>}
                                        />
                                    </RadioGroup>
                                </Paper>
                            )}
                        />
                        {errors.location && <FormHelperText error>{errors.location.message}</FormHelperText>}
                    </Box>

                    {/* Attachments */}
                    <Box sx={{ mb: 4 }}>
                        <InputLabel sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>Attachments</InputLabel>
                        <Box
                            sx={{
                                border: '2px dashed #E5E7EB',
                                borderRadius: 3,
                                p: 3,
                                textAlign: 'center',
                                bgcolor: '#FFF',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' }
                            }}
                            component="label"
                        >
                            <input type="file" hidden multiple onChange={handleFileChange} accept="image/png, image/jpeg, application/pdf" />
                            <CloudUploadIcon sx={{ fontSize: 32, color: '#9CA3AF', mb: 1 }} />
                            <Typography variant="subtitle2" color="#EA580C" fontWeight="600">Upload files</Typography>
                            <Typography variant="caption" color="textSecondary">PNG, JPG, PDF up to 10MB each</Typography>
                        </Box>
                        {fileError && <Alert severity="error" sx={{ mt: 1 }}>{fileError}</Alert>}

                        {files.length > 0 && (
                            <Stack spacing={1} sx={{ mt: 2 }}>
                                {files.map((file, index) => (
                                    <Paper key={index} variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <DescriptionIcon color="action" fontSize="small" />
                                            <Box>
                                                <Typography variant="body2" fontWeight="600" noWrap sx={{ maxWidth: 200 }}>{file.name}</Typography>
                                                <Typography variant="caption" color="textSecondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Typography>
                                            </Box>
                                        </Box>
                                        <IconButton size="small" onClick={() => removeFile(index)}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </Box>

                    {/* Footer Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 3, borderTop: '1px solid #F3F4F6' }}>
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            sx={{
                                textTransform: 'none', fontWeight: 700,
                                color: '#6B7280', borderColor: '#D1D5DB',
                                '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                                bgcolor: '#EA580C',
                                '&:hover': { bgcolor: '#C2410C' },
                                textTransform: 'none', fontWeight: 700,
                                px: 4
                            }}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                        </Button>
                    </Box>
                </form>
            </Box>

            <Snackbar
                open={openSuccessToast}
                autoHideDuration={6000}
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseToast} severity="success" sx={{ width: '100%', bgcolor: '#059669', color: 'white', fontWeight: 600 }}>
                    Ticket created successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CreateTicket;
