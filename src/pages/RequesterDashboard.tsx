import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Container,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    TextField,
    CircularProgress,
    Pagination,
    Menu,
    MenuItem,
    Checkbox,
    ListItemText,
    Drawer
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import Avatar from '@mui/material/Avatar';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
// @ts-ignore
import NoDataFoundImage from '../assets/NoDataFound.jpeg';
import CreateTicket from './CreateTicket';

// --- Constants ---
const FILTER_OPTIONS = {
    Type: ['Service Request', 'Incident'],
    Category: ['Policy Request', 'Software Development Request', 'Knowledge Base Request', 'General Question', 'Hardware', 'Network/VPN'],
    Priority: ['Critical', 'High', 'Low'],
    Status: ['Created', 'Assigned', 'Started', 'Completed', 'On-hold', 'Cancelled']
};

interface Ticket {
    _id: string;
    title: string;
    type: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string;
    assignee?: {
        firstName: string;
        lastName: string;
    };
}

const RequesterDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- State ---
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters & Pagination State
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Stats State
    const [stats, setStats] = useState({
        all: 0,
        unassigned: 0,
        assigned: 0,
        completed: 0
    });

    const [activeTab, setActiveTab] = useState<'all' | 'unassigned' | 'assigned' | 'completed'>('all');

    // Column Filters State
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
    const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
    const [filters, setFilters] = useState<{ [key: string]: string[] }>({
        Type: [],
        Category: [],
        Priority: [],
        Status: []
    });

    // Drawer State
    const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);

    // --- Actions ---

    const fetchStats = async () => {
        try {
            const [allReq, unassignedReq, assignedReq, completedReq] = await Promise.all([
                api.get('/tickets/my?limit=1'),
                api.get('/tickets/my?status=Created&limit=1'),
                api.get('/tickets/my?status=Assigned&limit=1'),
                api.get('/tickets/my?status=Completed&limit=1'),
            ]);

            setStats({
                all: allReq.data.pagination.total,
                unassigned: unassignedReq.data.pagination.total,
                assigned: assignedReq.data.pagination.total,
                completed: completedReq.data.pagination.total
            });
        } catch (e) {
            console.error("Failed to fetch stats", e);
        }
    };

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const params: any = {
                page,
                limit: 10,
                search,
                sort: 'newest'
            };

            // Apply Tab Filter
            if (activeTab === 'unassigned') params.status = 'Created';
            if (activeTab === 'assigned') params.status = 'Assigned';
            if (activeTab === 'completed') params.status = 'Completed';

            // Apply Column Filters
            if (filters.Type.length > 0) params.type = filters.Type[0];
            if (filters.Category.length > 0) params.category = filters.Category[0];
            if (filters.Priority.length > 0) params.priority = filters.Priority[0];
            if (filters.Status.length > 0 && activeTab === 'all') params.status = filters.Status[0];

            const response = await api.get('/tickets/my', { params });
            setTickets(response.data.data);
            setTotalPages(response.data.pagination.pages);
        } catch (error) {
            console.error('Failed to fetch tickets', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicketSuccess = () => {
        setIsCreateTicketOpen(false);
        fetchTickets();
        fetchStats();
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTickets();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search, page, activeTab, filters]);

    // --- Event Handlers ---

    const handleFilterClick = (event: React.MouseEvent<HTMLElement>, column: string) => {
        setFilterAnchorEl(event.currentTarget);
        setActiveFilterColumn(column);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
        setActiveFilterColumn(null);
    };

    const handleFilterToggle = (value: string) => {
        if (!activeFilterColumn) return;

        setFilters(prev => {
            const current = prev[activeFilterColumn];
            const isSelected = current.includes(value);
            return {
                ...prev,
                [activeFilterColumn]: isSelected ? [] : [value] // Single select
            };
        });
    };

    const handleTabChange = (tab: any) => {
        setActiveTab(tab);
        setPage(1);
    };

    // --- Render Helpers ---

    const getStatusChip = (status: string) => {
        let color = '#E0E0E0';
        let texColor = '#757575';

        switch (status) {
            case 'Completed': color = '#E6FFFA'; texColor = '#047857'; break;
            case 'Assigned': color = '#F3E8FF'; texColor = '#7E22CE'; break;
            case 'Created': color = '#FFEDD5'; texColor = '#C2410C'; break;
            case 'Started': color = '#E0F2FE'; texColor = '#0369A1'; break;
            case 'Critical': color = '#FEF2F2'; texColor = '#EF4444'; break;
            case 'High': color = '#FFF7ED'; texColor = '#F97316'; break;
            case 'Low': color = '#F0FDF4'; texColor = '#16A34A'; break;
        }

        return (
            <Chip
                label={status === 'Created' && activeTab === 'unassigned' ? 'Unassigned' : status}
                size="small"
                sx={{
                    bgcolor: color,
                    color: texColor,
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid transparent'
                }}
            />
        );
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'Critical': return { color: '#DC2626', fontWeight: 700 };
            case 'High': return { color: '#EA580C', fontWeight: 600 };
            case 'Low': return { color: '#16A34A', fontWeight: 600 };
            default: return { color: '#4B5563' };
        }
    };

    return (
        <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 2, md: 4, lg: 6 } }}>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>
                    Welcome back, {user?.firstName}!
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="body1" sx={{ color: '#6B7280' }}>
                        Here's an overview of your support tickets
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setIsCreateTicketOpen(true)}
                        sx={{
                            bgcolor: '#EA580C',
                            '&:hover': { bgcolor: '#C2410C' },
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: '8px',
                            px: 3,
                            py: 1
                        }}
                    >
                        Create Ticket
                    </Button>
                </Box>
            </Box>

            <Drawer
                anchor="right"
                open={isCreateTicketOpen}
                onClose={() => setIsCreateTicketOpen(false)}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 600, md: 700 } }
                }}
            >
                <CreateTicket
                    onClose={() => setIsCreateTicketOpen(false)}
                    onSuccess={handleCreateTicketSuccess}
                />
            </Drawer>

            {/* Stats / Filters Tabs */}
            <Box sx={{
                display: 'flex',
                gap: 2,
                mb: 4,
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                {/* All */}
                <Box
                    onClick={() => handleTabChange('all')}
                    sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        bgcolor: activeTab === 'all' ? '#EA580C' : '#FFF',
                        color: activeTab === 'all' ? 'white' : '#4B5563',
                        px: 2, py: 1, borderRadius: '20px', cursor: 'pointer',
                        border: '1px solid',
                        borderColor: activeTab === 'all' ? '#EA580C' : '#E5E7EB',
                        transition: 'all 0.2s',
                        boxShadow: activeTab === 'all' ? '0 4px 6px -1px rgba(234, 88, 12, 0.3)' : 'none'
                    }}
                >
                    <Typography fontWeight="600">All</Typography>
                    <Box sx={{ bgcolor: activeTab === 'all' ? 'rgba(255,255,255,0.2)' : '#F3F4F6', px: 1, borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {stats.all}
                    </Box>
                </Box>

                {/* Unassigned */}
                <Box
                    onClick={() => handleTabChange('unassigned')}
                    sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        bgcolor: activeTab === 'unassigned' ? '#FEF2F2' : '#FFF',
                        color: activeTab === 'unassigned' ? '#DC2626' : '#4B5563',
                        px: 2, py: 1, borderRadius: '20px', cursor: 'pointer',
                        border: '1px solid',
                        borderColor: activeTab === 'unassigned' ? '#FCA5A5' : '#E5E7EB',
                    }}
                >
                    <Box sx={{ color: '#DC2626' }}>⚠️</Box>
                    <Typography fontWeight="600">Unassigned</Typography>
                    <Box sx={{ bgcolor: '#F3F4F6', px: 1, borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, color: '#1F2937' }}>
                        {stats.unassigned}
                    </Box>
                </Box>

                {/* Assigned */}
                <Box
                    onClick={() => handleTabChange('assigned')}
                    sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        bgcolor: activeTab === 'assigned' ? '#F3E8FF' : '#FFF',
                        color: activeTab === 'assigned' ? '#7E22CE' : '#4B5563',
                        px: 2, py: 1, borderRadius: '20px', cursor: 'pointer',
                        border: '1px solid',
                        borderColor: activeTab === 'assigned' ? '#D8B4FE' : '#E5E7EB',
                    }}
                >
                    <Box sx={{ color: '#7E22CE' }}>⚛️</Box>
                    <Typography fontWeight="600">Assigned</Typography>
                    <Box sx={{ bgcolor: '#F3F4F6', px: 1, borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, color: '#1F2937' }}>
                        {stats.assigned}
                    </Box>
                </Box>

                {/* Completed */}
                <Box
                    onClick={() => handleTabChange('completed')}
                    sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        bgcolor: activeTab === 'completed' ? '#ECFDF5' : '#FFF',
                        color: activeTab === 'completed' ? '#059669' : '#4B5563',
                        px: 2, py: 1, borderRadius: '20px', cursor: 'pointer',
                        border: '1px solid',
                        borderColor: activeTab === 'completed' ? '#6EE7B7' : '#E5E7EB',
                    }}
                >
                    <Box sx={{ color: '#059669' }}>✅</Box>
                    <Typography fontWeight="600">Completed</Typography>
                    <Box sx={{ bgcolor: '#F3F4F6', px: 1, borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, color: '#1F2937' }}>
                        {stats.completed}
                    </Box>
                </Box>

                {/* Spacer */}
                <Box sx={{ flexGrow: 1 }} />

                {/* Search */}
                <Paper
                    elevation={0}
                    sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        width: 300,
                        bgcolor: '#FFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '20px'
                    }}
                >
                    <IconButton sx={{ p: '10px' }} aria-label="search">
                        <SearchIcon sx={{ color: '#9CA3AF' }} />
                    </IconButton>
                    <TextField
                        sx={{ ml: 1, flex: 1, '& fieldset': { border: 'none' } }}
                        placeholder="Type to search..."
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Paper>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #F3F4F6' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#FFF' }}>
                        <TableRow>
                            {['Ticket ID', 'Title', 'Type', 'Category', 'Priority', 'Status', 'Assigned To', 'Created On'].map((head) => (
                                <TableCell key={head} sx={{ fontWeight: 700, color: '#111827', borderBottom: '1px solid #F3F4F6', py: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {head}
                                        {['Type', 'Category', 'Priority', 'Status'].includes(head) && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleFilterClick(e, head)}
                                                color={filters[head] && filters[head].length > 0 ? "primary" : "default"}
                                            >
                                                <FilterListIcon fontSize="small" sx={{ color: '#E67E22', fontSize: '1rem' }} />
                                            </IconButton>
                                        )}
                                    </Box>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                    <CircularProgress sx={{ color: '#EA580C' }} />
                                </TableCell>
                            </TableRow>
                        ) : tickets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Box
                                            component="img"
                                            src={NoDataFoundImage}
                                            alt="No Data"
                                            sx={{ maxWidth: '200px', mb: 2, opacity: 0.8 }}
                                        />
                                        <Typography color="textSecondary">No tickets found matching your criteria.</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            tickets.map((ticket) => (
                                <TableRow
                                    key={ticket._id}
                                    hover
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: '#F9FAFB' }
                                    }}
                                    onClick={() => navigate(`/tickets/${ticket._id}`)}
                                >
                                    <TableCell sx={{ color: '#EA580C', fontWeight: 600, textDecoration: 'underline' }}>
                                        #{ticket._id.slice(-6).toUpperCase()}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 500, color: '#374151' }}>{ticket.title}</TableCell>
                                    <TableCell sx={{ color: '#6B7280' }}>
                                        {ticket.type || 'Service Request'}
                                    </TableCell>
                                    <TableCell sx={{ color: '#6B7280' }}>{ticket.category}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: getPriorityStyle(ticket.priority).color }} />
                                            <Typography variant="body2" sx={{ ...getPriorityStyle(ticket.priority), fontSize: '0.875rem' }}>
                                                {ticket.priority.toUpperCase()}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusChip(ticket.status)}
                                    </TableCell>
                                    <TableCell>
                                        {ticket.assignee ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#1F2937' }}>
                                                    {ticket.assignee.firstName[0]}
                                                </Avatar>
                                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                                    {ticket.assignee.firstName} {ticket.assignee.lastName}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" sx={{ color: '#9CA3AF', fontStyle: 'italic' }}>Not Assigned</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{ color: '#6B7280' }}>
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, p) => setPage(p)}
                    shape="rounded"
                    sx={{
                        '& .Mui-selected': {
                            bgcolor: '#EA580C !important',
                            color: 'white',
                        }
                    }}
                />
            </Box>

            {/* Filter Menu */}
            <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
            >
                {activeFilterColumn && FILTER_OPTIONS[activeFilterColumn as keyof typeof FILTER_OPTIONS]?.map((option) => (
                    <MenuItem key={option} onClick={() => handleFilterToggle(option)} dense>
                        <Checkbox checked={filters[activeFilterColumn].includes(option)} size="small" sx={{ color: '#EA580C', '&.Mui-checked': { color: '#EA580C' } }} />
                        <ListItemText primary={option} />
                    </MenuItem>
                ))}
                {(!activeFilterColumn || !FILTER_OPTIONS[activeFilterColumn as keyof typeof FILTER_OPTIONS]) && (
                    <MenuItem disabled>No filters available</MenuItem>
                )}
            </Menu>
        </Container>
    );
};

export default RequesterDashboard;
