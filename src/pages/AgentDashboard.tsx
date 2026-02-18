import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Chip,
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Slide,
    Menu,
    MenuItem,
    Checkbox,
    ListItemText,
    Tooltip
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
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
    requester: {
        firstName: string;
        lastName: string;
        email: string;
    };
    assignee?: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}

// --- Constants ---
const FILTER_OPTIONS: { [key: string]: string[] } = {
    type: ['Incident', 'Service Request'],
    category: [
        'Hardware', 'Software', 'Network/VPN',
        'Email/Collaboration', 'Access & Permissions',
        'Policy Request', 'Software Development Request',
        'Knowledge Base Request', 'General Question', 'Other'
    ],
    priority: ['Low', 'Medium', 'High', 'Critical'],
    status: ['Created', 'Assigned', 'Started', 'Completed', 'Cancelled']
};

// --- Transition for Dialog ---
const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const AgentDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // --- State ---

    // Claim Section
    const [unassignedTickets, setUnassignedTickets] = useState<Ticket[]>([]);
    const [loadingUnassigned, setLoadingUnassigned] = useState(false);
    const [rejectedTicketIds, setRejectedTicketIds] = useState<string[]>([]);
    const [isViewAllOpen, setIsViewAllOpen] = useState(false);

    // View All (Simple List instead of Lazy Loading)
    const [allUnassignedTickets, setAllUnassignedTickets] = useState<Ticket[]>([]);
    const [loadingAllUnassigned, setLoadingAllUnassigned] = useState(false);

    // All Tickets Table
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loadingTickets, setLoadingTickets] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('All'); // All, Assigned, Started, Completed
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        assigned: 0,
        started: 0,
        completed: 0
    });

    // Filters
    const [filters, setFilters] = useState<{ [key: string]: string }>({});
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
    const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);


    // --- Fetchers ---

    const fetchUnassigned = async () => {
        try {
            setLoadingUnassigned(true);
            // Fetch top 10 unassigned, priority sorted
            const res = await api.get('/tickets/unassigned', {
                params: { limit: 10, sort: 'priority' }
            });
            setUnassignedTickets(res.data.data);
        } catch (error) {
            console.error("Failed to fetch unassigned tickets", error);
        } finally {
            setLoadingUnassigned(false);
        }
    };

    const fetchAllUnassigned = async () => {
        try {
            setLoadingAllUnassigned(true);
            const res = await api.get('/tickets/unassigned', {
                params: { limit: 50, sort: 'priority' }
            });
            setAllUnassignedTickets(res.data.data);
        } catch (error) {
            console.error("Failed to fetch all unassigned tickets", error);
        } finally {
            setLoadingAllUnassigned(false);
        }
    };

    const fetchAllTickets = async () => {
        try {
            setLoadingTickets(true);
            const params: any = {
                page,
                limit: 10,
                search,
                sort: 'newest',
                ...filters // Spread filters into params
            };

            // Override status filter if tab is specific
            if (activeTab === 'Assigned') params.status = 'Assigned';
            if (activeTab === 'Started') params.status = 'Started';
            if (activeTab === 'Completed') params.status = 'Completed';

            // If tab is 'All' and we have a specific status filter selected manually, it will be used from ...filters
            // If tab is NOT 'All', the tab status overrides the manual filter (or we could disable status filter when not in All tab)
            // For simplicity: Tab status takes precedence.

            const res = await api.get('/tickets', { params });
            setTickets(res.data.data);
            setTotalPages(res.data.pagination.pages);

            if (activeTab === 'All' && Object.keys(filters).length === 0 && !search) {
                setStats(prev => ({ ...prev, total: res.data.pagination.total }));
            }

        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoadingTickets(false);
        }
    };

    // Fetch stats counts
    const fetchStats = async () => {
        try {
            const [all, assigned, started, completed] = await Promise.all([
                api.get('/tickets?limit=1'),
                api.get('/tickets?status=Assigned&limit=1'),
                api.get('/tickets?status=Started&limit=1'),
                api.get('/tickets?status=Completed&limit=1'),
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

    // --- Effects ---

    useEffect(() => {
        fetchUnassigned();
        fetchStats();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAllTickets();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page, activeTab, filters]); // Re-fetch when filters change

    useEffect(() => {
        if (isViewAllOpen) {
            fetchAllUnassigned();
        }
    }, [isViewAllOpen]);


    // --- Handlers ---

    const handleReject = (ticketId: string) => {
        setRejectedTicketIds(prev => [...prev, ticketId]);
    };

    const handleAssignToMyself = async (ticketId: string) => {
        try {
            await api.put(`/tickets/${ticketId}/assign`, { assigneeId: user?._id });
            // Refresh
            fetchUnassigned();
            fetchAllTickets();
            fetchStats();
            if (isViewAllOpen) fetchAllUnassigned();
        } catch (error) {
            console.error("Failed to assign ticket", error);
        }
    };

    // Filter Logic
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
            // Toggle logic: if already selected, remove it. If different, set it.
            // Currently simplified to single select per column for this implementation.
            if (newFilters[activeFilterColumn] === value) {
                delete newFilters[activeFilterColumn];
            } else {
                newFilters[activeFilterColumn] = value;
            }
            return newFilters;
        });
        setPage(1); // Reset to page 1 on filter change
        // Keep menu open? Or close? Let's close for single select feel, or keep for potential multi (but fetching simplified to single for now).
        // Let's close it.
        handleFilterClose();
    };

    const clearFilter = (column: string) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[column];
            return newFilters;
        });
        setPage(1);
        handleFilterClose();
    };


    // --- Render Helpers ---

    const sortedUnassigned = [...unassignedTickets].sort((a, b) => {
        const isARejected = rejectedTicketIds.includes(a._id);
        const isBRejected = rejectedTicketIds.includes(b._id);
        if (isARejected && !isBRejected) return 1;
        if (!isARejected && isBRejected) return -1;
        return 0; // Keep existing order (priority)
    });

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

            {/* 1. Claim Unassigned Tickets */}
            <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="800" color="#111827">Claim unassigned tickets</Typography>
                    <Button
                        color="warning"
                        sx={{ fontWeight: 700, textTransform: 'none' }}
                        onClick={() => setIsViewAllOpen(true)}
                    >
                        View All
                    </Button>
                </Box>

                {loadingUnassigned ? (
                    <CircularProgress size={24} />
                ) : sortedUnassigned.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#F9FAFB', borderStyle: 'dashed' }}>
                        <Typography color="textSecondary">No unassigned tickets found.</Typography>
                    </Paper>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        gap: 3,
                        overflowX: 'auto',
                        pb: 2,
                        '&::-webkit-scrollbar': { height: 8 },
                        '&::-webkit-scrollbar-thumb': { bgcolor: '#E5E7EB', borderRadius: 4 }
                    }}>
                        {sortedUnassigned.map((ticket) => (
                            <Paper
                                key={ticket._id}
                                elevation={0}
                                sx={{
                                    minWidth: 400,
                                    p: 3,
                                    borderRadius: 3,
                                    border: '1px solid #E5E7EB',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: '#EA580C',
                                        boxShadow: '0 4px 12px rgba(234, 88, 12, 0.08)'
                                    }
                                }}
                                onClick={() => navigate(`/tickets/${ticket._id}`)}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="caption" fontWeight="700" color="#6B7280">
                                        {ticket._id.slice(-6).toUpperCase()}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: getPriorityColor(ticket.priority) }} />
                                        <Typography variant="caption" fontWeight="800" sx={{ color: getPriorityColor(ticket.priority) }}>
                                            {ticket.priority.toUpperCase()}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Typography variant="subtitle1" fontWeight="700" noWrap sx={{ mb: 1 }}>
                                    {ticket.title}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{
                                    mb: 2,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    flex: 1
                                }}>
                                    {ticket.description}
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                                    <Chip label={ticket.type} size="small" sx={{ bgcolor: '#F3F4F6' }} />
                                    <Chip label={ticket.category} size="small" sx={{ bgcolor: '#F3F4F6' }} />
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        fullWidth
                                        sx={{ borderRadius: 2, borderColor: '#D1D5DB', color: '#374151' }}
                                        onClick={(e) => { e.stopPropagation(); handleReject(ticket._id); }}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{ borderRadius: 2, borderColor: '#EA580C', color: '#EA580C' }}
                                        onClick={(e) => { e.stopPropagation(); handleAssignToMyself(ticket._id); }}
                                    >
                                        Assign to Myself
                                    </Button>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}
            </Box>

            {/* 2. All Support Tickets */}
            <Box>
                <Typography variant="h6" fontWeight="800" sx={{ mb: 3, color: '#111827' }}>All Support Tickets</Typography>

                {/* Controls */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>

                    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, flex: 1 }}>
                        {/* Tabs as Custom Chips/Buttons */}
                        {[
                            { label: 'All', count: stats.total, val: 'All' },
                            { label: 'Assigned', count: stats.assigned, val: 'Assigned' },
                            { label: 'Started', count: stats.started, val: 'Started' },
                            { label: 'Completed', count: stats.completed, val: 'Completed' }
                        ].map(tab => (
                            <Box
                                key={tab.label}
                                onClick={() => { setActiveTab(tab.val); setPage(1); }}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 1,
                                    borderRadius: 10,
                                    px: 2, py: 1,
                                    bgcolor: activeTab === tab.val ? '#FFF' : 'transparent',
                                    border: '1px solid',
                                    borderColor: activeTab === tab.val ? '#E5E7EB' : 'transparent',
                                    boxShadow: activeTab === tab.val ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    cursor: 'pointer',
                                    color: activeTab === tab.val ? '#111827' : '#6B7280',
                                    fontWeight: 600
                                }}
                            >
                                { /* Icon placeholder if needed */}
                                <span>{tab.label}</span>
                                <Box sx={{ bgcolor: '#F3F4F6', px: 1, borderRadius: 4, fontSize: '0.75rem' }}>{tab.count}</Box>
                            </Box>
                        ))}
                    </Box>

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
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Type to search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </Paper>

                    {Object.keys(filters).length > 0 && (
                        <Button
                            color="error"
                            variant="text"
                            size="small"
                            sx={{ fontWeight: 700, textTransform: 'none' }}
                            onClick={() => { setFilters({}); setPage(1); }}
                        >
                            Clear All Filters
                        </Button>
                    )}
                </Box>

                {/* Table */}
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Ticket ID</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>

                                <TableCell sx={{ fontWeight: 700 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        Type
                                        {renderFilterIcon('type')}
                                    </Box>
                                </TableCell>

                                <TableCell sx={{ fontWeight: 700 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        Category
                                        {renderFilterIcon('category')}
                                    </Box>
                                </TableCell>

                                <TableCell sx={{ fontWeight: 700 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        Priority
                                        {renderFilterIcon('priority')}
                                    </Box>
                                </TableCell>

                                <TableCell sx={{ fontWeight: 700 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        Status
                                        {activeTab === 'All' && renderFilterIcon('status')}
                                    </Box>
                                </TableCell>

                                <TableCell sx={{ fontWeight: 700 }}>Assigned To</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Assignee Email</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loadingTickets ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell>
                                </TableRow>
                            ) : tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>No tickets found</TableCell>
                                </TableRow>
                            ) : tickets.map((ticket) => (
                                <TableRow
                                    key={ticket._id}
                                    hover
                                    onClick={() => navigate(`/tickets/${ticket._id}`)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell sx={{ color: '#EA580C', fontWeight: 600 }}>#{ticket._id.slice(-6).toUpperCase()}</TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{ticket.title}</TableCell>
                                    <TableCell>{ticket.type}</TableCell>
                                    <TableCell>{ticket.category}</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: getPriorityColor(ticket.priority) }}>
                                        {ticket.priority.toUpperCase()}
                                    </TableCell>
                                    <TableCell>{getStatusChip(ticket.status)}</TableCell>
                                    <TableCell>
                                        {ticket.assignee ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar src="" sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>{ticket.assignee.firstName[0]}</Avatar>
                                                <Typography variant="body2">{ticket.assignee.firstName} {ticket.assignee.lastName}</Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color="textSecondary" fontStyle="italic">Unassigned</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {ticket.assignee ? (
                                            <Typography variant="caption" color="textSecondary">{ticket.assignee.email}</Typography>
                                        ) : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination count={totalPages} page={page} onChange={(e, p) => setPage(p)} shape="rounded" />
                </Box>
            </Box>

            {/* Filter Menu */}
            <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
            >
                {activeFilterColumn && FILTER_OPTIONS[activeFilterColumn]?.map((option) => (
                    <MenuItem key={option} onClick={() => handleFilterSelect(option)}>
                        <Checkbox checked={filters[activeFilterColumn] === option} size="small" />
                        <ListItemText primary={option} />
                    </MenuItem>
                ))}
                {activeFilterColumn && filters[activeFilterColumn] && (
                    <MenuItem onClick={() => clearFilter(activeFilterColumn)} sx={{ borderTop: '1px solid #E5E7EB', color: 'error.main', justifyContent: 'center' }}>
                        Clear Filter
                    </MenuItem>
                )}
            </Menu>

            {/* View All Unassigned Dialog (Simplified List) */}
            <Dialog
                open={isViewAllOpen}
                onClose={() => setIsViewAllOpen(false)}
                TransitionComponent={Transition}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Unassigned Tickets Queue</DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {loadingAllUnassigned ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : allUnassignedTickets.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography color="textSecondary">No unassigned tickets found.</Typography>
                            </Box>
                        ) : (
                            allUnassignedTickets.map((ticket) => (
                                <Box
                                    key={ticket._id}
                                    sx={{ p: 2, borderBottom: '1px solid #F3F4F6' }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="subtitle1" fontWeight="700">{ticket.title}</Typography>
                                        <Chip label={ticket.priority} size="small" sx={{ bgcolor: getPriorityColor(ticket.priority) + '20', color: getPriorityColor(ticket.priority), fontWeight: 700 }} />
                                    </Box>
                                    <Typography variant="caption" color="textSecondary">{ticket._id} • {new Date(ticket.createdAt).toLocaleString()}</Typography>
                                    <Typography variant="body2" sx={{ mt: 1, color: '#4B5563' }}>{ticket.description}</Typography>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        sx={{ mt: 1, borderColor: '#EA580C', color: '#EA580C' }}
                                        onClick={() => handleAssignToMyself(ticket._id)}
                                    >
                                        Assign to Me
                                    </Button>
                                </Box>
                            ))
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsViewAllOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
};

export default AgentDashboard;
