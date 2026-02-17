import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Chip,
    Divider,
    Avatar,
    IconButton,
    InputBase,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Pagination,
    Menu,
    MenuItem,
    Checkbox,
    ListItemText,
    Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// --- Interfaces ---
interface Ticket {
    _id: string;
    title: string;
    description: string;
    type: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    requester: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    assignee?: {
        _id: string;
        firstName: string;
        lastName: string;
    };
}

const FILTER_OPTIONS: { [key: string]: string[] } = {
    type: ['Incident', 'Service Request'],
    category: ['Hardware', 'Software', 'Network/VPN', 'Email/Collaboration', 'Access & Permissions', 'Other'],
    priority: ['Low', 'Medium', 'High', 'Critical'],
    status: ['Assigned', 'Started', 'Completed', 'On-hold']
};

const MySupportTickets: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- State ---
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('All'); // All, Assigned, Started, Completed
    const [stats, setStats] = useState({ total: 0, assigned: 0, started: 0, completed: 0 });

    // Filter Menu State
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
    const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
    const [filters, setFilters] = useState<{ [key: string]: string }>({});

    // --- Fetchers ---

    const fetchMySupportTickets = async () => {
        try {
            setLoading(true);
            const params: any = {
                page,
                limit: 10,
                search,
                sort: 'newest',
                ...filters
            };

            if (activeTab === 'Assigned') params.status = 'Assigned';
            if (activeTab === 'Started') params.status = 'Started';
            if (activeTab === 'Completed') params.status = 'Completed';

            const res = await api.get('/tickets/assigned-to-me', { params });
            setTickets(res.data.data);
            setTotalPages(res.data.pagination.pages);

        } catch (error) {
            console.error("Failed to fetch my support tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const [all, assigned, started, completed] = await Promise.all([
                api.get('/tickets/assigned-to-me?limit=1'),
                api.get('/tickets/assigned-to-me?status=Assigned&limit=1'),
                api.get('/tickets/assigned-to-me?status=Started&limit=1'),
                api.get('/tickets/assigned-to-me?status=Completed&limit=1'),
            ]);
            setStats({
                total: all.data.pagination.total,
                assigned: assigned.data.pagination.total,
                started: started.data.pagination.total,
                completed: completed.data.pagination.total
            });
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMySupportTickets();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page, activeTab, filters]);

    // --- Handlers ---

    const handleFilterClick = (event: React.MouseEvent<HTMLElement>, column: string) => {
        setFilterAnchorEl(event.currentTarget);
        setActiveFilterColumn(column);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
        setActiveFilterColumn(null);
    };

    const handleFilterSelect = (value: string) => {
        if (!activeFilterColumn) return;
        setFilters(prev => {
            const newFilters = { ...prev };
            if (newFilters[activeFilterColumn] === value) delete newFilters[activeFilterColumn];
            else newFilters[activeFilterColumn] = value;
            return newFilters;
        });
        setPage(1);
        handleFilterClose();
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return '#DC2626';
            case 'High': return '#EA580C';
            case 'Medium': return '#D97706';
            default: return '#16A34A';
        }
    };

    const getStatusChip = (status: string) => {
        let color = '#E0E0E0';
        let textColor = '#757575';
        switch (status) {
            case 'Completed': color = '#DCFCE7'; textColor = '#166534'; break;
            case 'Assigned': color = '#F3E8FF'; textColor = '#6B21A8'; break;
            case 'Started': color = '#E0F2FE'; textColor = '#075985'; break;
            case 'Created': color = '#FFEDD5'; textColor = '#9A3412'; break;
            case 'Cancelled': color = '#FEE2E2'; textColor = '#991B1B'; break;
        }
        return <Chip label={status} size="small" sx={{ bgcolor: color, color: textColor, fontWeight: 700, borderRadius: 1 }} />;
    };

    const renderFilterIcon = (column: string) => {
        const isActive = !!filters[column];
        return (
            <Tooltip title="Filter">
                <IconButton
                    size="small"
                    onClick={(e) => handleFilterClick(e, column)}
                    sx={{ ml: 0.5, color: isActive ? '#EA580C' : '#9CA3AF' }}
                >
                    <FilterListIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        );
    };

    return (
        <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, md: 4, lg: 6 } }}>
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" fontWeight="800" color="#111827">My Support tickets</Typography>
                    <Typography variant="body2" sx={{ color: '#EA580C', fontWeight: 700, cursor: 'pointer' }}>View All</Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, flex: 1 }}>
                        {[
                            { label: 'All', count: stats.total, val: 'All', icon: '⌘' },
                            { label: 'Assigned', count: stats.assigned, val: 'Assigned', icon: '👤' },
                            { label: 'Started', count: stats.started, val: 'Started', icon: '🚀' },
                            { label: 'Completed', count: stats.completed, val: 'Completed', icon: '✅' }
                        ].map(tab => (
                            <Box
                                key={tab.label}
                                onClick={() => { setActiveTab(tab.val); setPage(1); }}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 1,
                                    borderRadius: 10,
                                    px: 2.5, py: 1.2,
                                    bgcolor: activeTab === tab.val ? '#EA580C' : '#FFF',
                                    border: '1px solid',
                                    borderColor: activeTab === tab.val ? '#EA580C' : '#E5E7EB',
                                    boxShadow: activeTab === tab.val ? '0 4px 12px rgba(234, 88, 12, 0.2)' : 'none',
                                    cursor: 'pointer',
                                    color: activeTab === tab.val ? '#FFF' : '#6B7280',
                                    fontWeight: 600,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ opacity: 0.8 }}>{tab.icon}</span>
                                <span>{tab.label}</span>
                                <Box sx={{
                                    bgcolor: activeTab === tab.val ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
                                    px: 1, borderRadius: 4, fontSize: '0.75rem',
                                    color: activeTab === tab.val ? '#FFF' : '#6B7280'
                                }}>
                                    {tab.count}
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    <Paper
                        elevation={0}
                        sx={{
                            p: '2px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            width: { xs: '100%', sm: 300 },
                            bgcolor: '#FFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '20px'
                        }}
                    >
                        <IconButton sx={{ p: '10px' }} aria-label="search">
                            <SearchIcon sx={{ color: '#9CA3AF' }} />
                        </IconButton>
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Type to search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Paper>
                </Box>

                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: '#4B5563' }}>Ticket ID</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#4B5563' }}>Title</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#4B5563' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>Type {renderFilterIcon('type')}</Box>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#4B5563' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>Category {renderFilterIcon('category')}</Box>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#4B5563' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>Priority {renderFilterIcon('priority')}</Box>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#4B5563' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>Status {activeTab === 'All' && renderFilterIcon('status')}</Box>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#4B5563' }}>Assigned To</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#4B5563' }}>Requester</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                        <CircularProgress sx={{ color: '#EA580C' }} />
                                    </TableCell>
                                </TableRow>
                            ) : tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                                        <Typography color="textSecondary">No tickets found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map((ticket) => (
                                    <TableRow
                                        key={ticket._id}
                                        hover
                                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#F9FAFB' } }}
                                        onClick={() => navigate(`/tickets/${ticket._id}`)}
                                    >
                                        <TableCell sx={{ color: '#EA580C', fontWeight: 600 }}>
                                            {ticket._id.slice(-6).toUpperCase()}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {ticket.title}
                                        </TableCell>
                                        <TableCell>{ticket.type}</TableCell>
                                        <TableCell>{ticket.category}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: getPriorityColor(ticket.priority) }} />
                                                <Typography variant="body2" fontWeight="700" sx={{ color: getPriorityColor(ticket.priority), fontSize: '0.75rem' }}>
                                                    {ticket.priority.toUpperCase()}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{getStatusChip(ticket.status)}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', bgcolor: '#EA580C' }}>
                                                    {ticket.assignee?.firstName?.[0]}
                                                </Avatar>
                                                <Typography variant="body2">{ticket.assignee?.firstName} {ticket.assignee?.lastName}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                                                    {ticket.requester.firstName[0]}
                                                </Avatar>
                                                <Typography variant="body2">{ticket.requester.firstName} {ticket.requester.lastName}</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {totalPages > 1 && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, v) => setPage(v)}
                            sx={{ '& .Mui-selected': { bgcolor: '#EA580C !important', color: '#FFF' } }}
                        />
                    </Box>
                )}
            </Box>

            {/* Filter Menu */}
            <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
            >
                {activeFilterColumn && FILTER_OPTIONS[activeFilterColumn]?.map((option) => (
                    <MenuItem key={option} onClick={() => handleFilterSelect(option)}>
                        <Checkbox checked={filters[activeFilterColumn] === option} size="small" sx={{ color: '#EA580C', '&.Mui-checked': { color: '#EA580C' } }} />
                        <ListItemText primary={option} />
                    </MenuItem>
                ))}
                <Divider />
                <MenuItem onClick={() => { if (activeFilterColumn) { const nf = { ...filters }; delete nf[activeFilterColumn]; setFilters(nf); setPage(1); handleFilterClose(); } }}>
                    <Typography color="error" variant="body2" fontWeight="600">Clear Filter</Typography>
                </MenuItem>
            </Menu>
        </Container>
    );
};

export default MySupportTickets;
