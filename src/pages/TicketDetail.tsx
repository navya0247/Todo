import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Chip,
    Divider,
    Avatar,
    Button,
    TextField,
    CircularProgress,
    IconButton,
    Tabs,
    Tab,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch,
    FormControlLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import TagIcon from '@mui/icons-material/Tag';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Comment {
    _id: string;
    body: string;
    isInternal: boolean;
    author: {
        _id: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    attachments?: Array<{
        _id: string;
        filename: string;
        contentType: string;
    }>;
    createdAt: string;
}

interface Attachment {
    _id: string;
    filename: string;
    path: string;
    uploadDate: string;
}

interface TicketDetail {
    _id: string;
    title: string;
    description: string;
    type: string;
    category: string;
    subcategory: string;
    priority: string;
    status: string;
    requester: {
        firstName: string;
        lastName: string;
        email: string;
    };
    assignee?: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    updatedAt: string;
    attachments: Attachment[];
    resolutionSummary?: string;
}

interface HistoryItem {
    _id: string;
    action: string;
    details: string;
    actor: {
        firstName: string;
        lastName: string;
        role: string;
    };
    createdAt: string;
}

const TicketDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [activeTab, setActiveTab] = useState(0); // 0: Comments, 1: History
    const [resolutionOpen, setResolutionOpen] = useState(false);
    const [resolutionSummary, setResolutionSummary] = useState('');
    const [unassignOpen, setUnassignOpen] = useState(false);
    const [unassignReason, setUnassignReason] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [commentFiles, setCommentFiles] = useState<File[]>([]);
    const [resolutionError, setResolutionError] = useState(false);

    const fetchTicketData = async () => {
        try {
            setLoading(true);
            const [ticketRes, commentsRes, historyRes] = await Promise.all([
                api.get(`/tickets/${id}`),
                api.get(`/tickets/${id}/comments`),
                api.get(`/tickets/${id}/history`)
            ]);
            setTicket(ticketRes.data.data);
            setComments(commentsRes.data.data);
            setHistory(historyRes.data.data);
        } catch (error) {
            console.error("Failed to fetch ticket data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() && commentFiles.length === 0) return;

        try {
            setSubmittingComment(true);
            const formData = new FormData();
            formData.append('body', newComment);
            formData.append('isInternal', String(isInternal));
            commentFiles.forEach(file => {
                formData.append('attachments', file);
            });

            await api.post(`/tickets/${id}/comments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setNewComment('');
            setIsInternal(false);
            setCommentFiles([]);
            const commentsRes = await api.get(`/tickets/${id}/comments`);
            setComments(commentsRes.data.data);
        } catch (error) {
            console.error("Failed to add comment", error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string, resolutionSummary?: string) => {
        try {
            await api.put(`/tickets/${id}/status`, { status: newStatus, resolutionSummary });
            fetchTicketData();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleAssignToMyself = async () => {
        try {
            await api.put(`/tickets/${id}/assign`, { assigneeId: user?._id });
            fetchTicketData();
        } catch (error) {
            console.error("Failed to assign ticket", error);
        }
    };

    const handleUnassign = async () => {
        try {
            await api.put(`/tickets/${id}/assign`, { assigneeId: null, description: unassignReason });
            setUnassignOpen(false);
            setUnassignReason('');
            fetchTicketData();
        } catch (error) {
            console.error("Failed to unassign ticket", error);
        }
    };

    useEffect(() => {
        if (id) fetchTicketData();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#EA580C' }} />
            </Box>
        );
    }

    if (!ticket) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h5" color="textSecondary">Ticket not found.</Typography>
                <Button onClick={() => navigate('/requester/dashboard')} sx={{ mt: 2 }}>Back to Dashboard</Button>
            </Container>
        );
    }

    const { status, type, category } = ticket;

    const steps = ['Created', 'Assigned', 'Started', 'Completed'];
    const getActiveStep = (status: string) => {
        if (status === 'Cancelled') return -1;
        const index = steps.indexOf(status);
        return index === -1 ? 0 : (status === 'Completed' ? 4 : index + 1);
    };
    const activeStep = getActiveStep(status);

    const canComment = user?.role === 'Requester' || (user?.role === 'Agent' && ticket.assignee && ticket.assignee._id === user._id);
    const isAssignedToMe = user?.role === 'Agent' && ticket.assignee && ticket.assignee._id === user._id;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
            {/* Header / Breadcrumbs */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#6B7280', mb: 1, fontSize: '0.9rem' }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => navigate(user?.role === 'Agent' ? '/agent/dashboard' : '/requester/dashboard')}>Dashboard</span>
                        <span>&gt;</span>
                        <span style={{ cursor: 'pointer' }} onClick={() => navigate(user?.role === 'Agent' ? '/agent/my-tickets' : '/requester/dashboard')}>My Support Tickets</span>
                        <span>&gt;</span>
                        <span style={{ color: '#EA580C', fontWeight: 600 }}>{ticket._id.slice(-6).toUpperCase()}</span>
                    </Box>
                    <Typography variant="h4" fontWeight="800" sx={{ color: '#111827' }}>
                        Ticket ID - {ticket._id.slice(-6).toUpperCase()}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {user?.role === 'Agent' && !ticket.assignee && (
                        <Button
                            variant="contained"
                            sx={{ bgcolor: '#EA580C', '&:hover': { bgcolor: '#D9480F' }, fontWeight: 700, px: 4, py: 1.5, borderRadius: 2, textTransform: 'none' }}
                            onClick={handleAssignToMyself}
                        >
                            Assign to Myself
                        </Button>
                    )}
                    {isAssignedToMe && status === 'Assigned' && (
                        <>
                            <Button
                                variant="outlined"
                                sx={{ color: '#EA580C', borderColor: '#EA580C', '&:hover': { borderColor: '#D14D0B', bgcolor: 'rgba(234, 88, 12, 0.04)' }, fontWeight: 700, px: 4, py: 1.5, borderRadius: 2, textTransform: 'none' }}
                                onClick={() => setUnassignOpen(true)}
                            >
                                Unassign Ticket
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ bgcolor: '#EA580C', '&:hover': { bgcolor: '#D9480F' }, fontWeight: 700, px: 6, py: 1.5, borderRadius: 2, textTransform: 'none' }}
                                onClick={() => handleUpdateStatus('Started')}
                            >
                                Start
                            </Button>
                        </>
                    )}
                    {isAssignedToMe && status === 'Started' && (
                        <>
                            <Button
                                variant="outlined"
                                sx={{ color: '#EA580C', borderColor: '#EA580C', '&:hover': { borderColor: '#D14D0B', bgcolor: 'rgba(234, 88, 12, 0.04)' }, fontWeight: 700, px: 4, py: 1.5, borderRadius: 2, textTransform: 'none' }}
                                onClick={() => setUnassignOpen(true)}
                            >
                                Unassign Ticket
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ bgcolor: '#EA580C', '&:hover': { bgcolor: '#D9480F' }, fontWeight: 700, px: 6, py: 1.5, borderRadius: 2, textTransform: 'none' }}
                                onClick={() => setResolutionOpen(true)}
                            >
                                Mark Complete
                            </Button>
                        </>
                    )}
                    {isAssignedToMe && status === 'Completed' && (
                        <Button
                            variant="contained"
                            sx={{ bgcolor: '#EA580C', '&:hover': { bgcolor: '#D9480F' }, fontWeight: 700, px: 4, py: 1.5, borderRadius: 2, textTransform: 'none' }}
                            onClick={() => handleUpdateStatus('Assigned')}
                        >
                            Reopen Ticket
                        </Button>
                    )}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'flex-start' }}>
                {/* Left Side */}
                <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                    {/* Stepper */}
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E5E7EB', mb: 3 }}>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label, index) => (
                                <Step key={label} completed={activeStep >= index + 1}>
                                    <StepLabel
                                        StepIconProps={{
                                            sx: {
                                                '&.Mui-active': { color: '#EA580C' },
                                                '&.Mui-completed': { color: '#059669' }
                                            }
                                        }}
                                    >
                                        {label}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Paper>

                    {/* Description */}
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E5E7EB', mb: 3 }}>
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#111827', mb: 1 }}>{ticket.title}</Typography>
                        <Typography variant="body1" sx={{ color: '#4B5563', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{ticket.description}</Typography>
                        {ticket.attachments && ticket.attachments.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#374151', mb: 1.5 }}>Attachments</Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                    {ticket.attachments.map(att => (
                                        <Paper key={att._id} variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F9FAFB' }}>
                                            <AttachFileIcon fontSize="small" color="action" />
                                            <Typography variant="body2" sx={{ color: '#374151' }}>{att.filename}</Typography>
                                        </Paper>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Paper>

                    {/* Tabs */}
                    <Box sx={{ mb: 2 }}>
                        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ '& .MuiTabs-indicator': { bgcolor: '#EA580C' } }}>
                            <Tab label={`All Comments (${comments.length})`} sx={{ textTransform: 'none', fontWeight: 600, '&.Mui-selected': { color: '#EA580C' } }} />
                            <Tab label="History" sx={{ textTransform: 'none', fontWeight: 600, '&.Mui-selected': { color: '#EA580C' } }} />
                        </Tabs>
                    </Box>

                    {/* Tab Panels */}
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB', minHeight: 300 }}>
                        {activeTab === 0 ? (
                            <>
                                <Box sx={{ height: 300, overflowY: 'auto', mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {comments.length === 0 ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                                            <Typography>No Conversation found</Typography>
                                        </Box>
                                    ) : (
                                        comments.map((comment) => (
                                            <Box key={comment._id} sx={{ display: 'flex', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: comment.author.role === 'Agent' ? '#EA580C' : '#3B82F6' }}>{comment.author.firstName[0]}</Avatar>
                                                <Box sx={{ bgcolor: comment.isInternal ? '#FFF7ED' : '#F9FAFB', p: 2, borderRadius: 2, flex: 1, border: comment.isInternal ? '1px solid #FFEDD5' : 'none' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography variant="subtitle2" fontWeight="700">
                                                                {comment.author.firstName} {comment.author.lastName}
                                                                {comment.author._id === user?._id ? ' (You)' : ''}
                                                            </Typography>
                                                            {comment.isInternal && <Chip label="Internal Note - Agent Only" size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#A855F7', color: '#FFF', fontWeight: 700, borderRadius: 1 }} />}
                                                        </Box>
                                                        <Typography variant="caption" color="textSecondary">{new Date(comment.createdAt).toLocaleString()}</Typography>
                                                    </Box>
                                                    <Typography variant="body2">{comment.body}</Typography>
                                                    {comment.attachments && comment.attachments.length > 0 && (
                                                        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                            {comment.attachments.map(att => (
                                                                <Chip key={att._id} icon={<AttachFileIcon sx={{ fontSize: '0.8rem !important' }} />} label={att.filename} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                                            ))}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        ))
                                    )}
                                </Box>
                                <Box>
                                    {user?.role === 'Agent' && !ticket.resolutionSummary && (
                                        <FormControlLabel
                                            control={<Switch size="small" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} color="warning" />}
                                            label={<Typography variant="caption" color="textSecondary">Internal Note</Typography>}
                                            sx={{ mb: 1 }}
                                        />
                                    )}
                                    <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                                        {canComment && !ticket.resolutionSummary ? (
                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                <TextField
                                                    fullWidth
                                                    placeholder={isInternal ? "Add internal note..." : "Add comment..."}
                                                    variant="standard"
                                                    multiline
                                                    maxRows={4}
                                                    InputProps={{ disableUnderline: true }}
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                />
                                                <input type="file" id="comment-file" multiple style={{ display: 'none' }} onChange={(e) => setCommentFiles(Array.from(e.target.files || []))} />
                                                <label htmlFor="comment-file"><IconButton component="span" size="small"><AttachFileIcon sx={{ color: commentFiles.length > 0 ? '#EA580C' : '#9CA3AF' }} /></IconButton></label>
                                                <IconButton onClick={handleAddComment} disabled={submittingComment || (!newComment.trim() && commentFiles.length === 0)}><SendIcon sx={{ color: '#EA580C' }} /></IconButton>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="textSecondary" align="center">{status === 'Completed' ? "Ticket resolved. Comments disabled." : "Agent only."}</Typography>
                                        )}
                                    </Box>
                                </Box>
                            </>
                        ) : (
                            <Stack spacing={2}>
                                {history.map((item) => (
                                    <Box key={item._id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#D1D5DB' }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight="600">{item.action} by {item.actor ? `${item.actor.firstName} ${item.actor.lastName}` : 'System'}</Typography>
                                            <Typography variant="caption" color="textSecondary">{item.details} • {new Date(item.createdAt).toLocaleString()}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Box>

                {/* Right Side Info */}
                <Box sx={{ width: { xs: '100%', md: 320 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
                        <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 2 }}>Ticket Information</Typography>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <TagIcon fontSize="small" color="action" />
                                <Box><Typography variant="caption" color="textSecondary">Type</Typography><Typography variant="body2" fontWeight="600">{type}</Typography></Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <CategoryIcon fontSize="small" color="action" />
                                <Box><Typography variant="caption" color="textSecondary">Category</Typography><Typography variant="body2" fontWeight="600">{category}</Typography></Box>
                            </Box>
                            <Divider />
                            <Box>
                                <Typography variant="caption" color="textSecondary">Requester</Typography>
                                <Typography variant="body2" fontWeight="600">{ticket.requester.firstName} {ticket.requester.lastName}</Typography>
                                <Typography variant="caption" color="textSecondary">{ticket.requester.email}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="textSecondary">Assigned To</Typography>
                                <Typography variant="body2" fontWeight="600">{ticket.assignee ? `${ticket.assignee.firstName} ${ticket.assignee.lastName}` : 'Unassigned'}</Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    {status === 'Completed' && ticket.resolutionSummary && (
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #DCFCE7' }}>
                            <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 1 }}>Resolution Summary</Typography>
                            <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.6 }}>{ticket.resolutionSummary}</Typography>
                        </Paper>
                    )}
                </Box>
            </Box>

            {/* Dialogs */}
            <Dialog open={resolutionOpen} onClose={() => setResolutionOpen(false)} fullWidth maxWidth="sm">
                <Box sx={{ p: 4, position: 'relative' }}>
                    <IconButton onClick={() => setResolutionOpen(false)} sx={{ position: 'absolute', right: 16, top: 16 }}><CloseIcon /></IconButton>
                    <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Mark Complete Ticket {ticket._id.slice(-6).toUpperCase()}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>Provide a resolution summary below.</Typography>
                    <TextField fullWidth multiline rows={4} value={resolutionSummary} onChange={(e) => setResolutionSummary(e.target.value)} error={resolutionError} sx={{ mb: 1 }} />
                    {resolutionError && <Typography variant="caption" color="error">Resolution Summary is required.</Typography>}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                        <Button onClick={() => setResolutionOpen(false)}>Cancel</Button>
                        <Button variant="contained" sx={{ bgcolor: '#EA580C' }} onClick={() => { if (!resolutionSummary.trim()) { setResolutionError(true); return; } handleUpdateStatus('Completed', resolutionSummary); setResolutionOpen(false); }}>Mark Complete</Button>
                    </Box>
                </Box>
            </Dialog>

            <Dialog open={unassignOpen} onClose={() => setUnassignOpen(false)} fullWidth maxWidth="sm">
                <Box sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight="800">Unassign Ticket</Typography>
                    <TextField fullWidth multiline rows={3} value={unassignReason} onChange={(e) => setUnassignReason(e.target.value)} sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button onClick={() => setUnassignOpen(false)}>Cancel</Button>
                        <Button variant="contained" sx={{ bgcolor: '#EA580C' }} onClick={handleUnassign} disabled={!unassignReason.trim()}>Confirm</Button>
                    </Box>
                </Box>
            </Dialog>
        </Container>
    );
};

export default TicketDetail;
