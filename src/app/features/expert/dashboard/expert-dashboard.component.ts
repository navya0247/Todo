import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ExpertService } from '../expert.service';

import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-expert-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './expert-dashboard.component.html',
    styleUrls: ['./expert-dashboard.component.css']
})
export class ExpertDashboardComponent implements OnInit {
    private authService = inject(AuthService);
    private expertService = inject(ExpertService);
    private router = inject(Router);

    currentUser: any = null;
    isOnline = true;
    showActionModal = false;
    selectedRequest: any = null;

    getEarnings(): string {
        const total = this.appointments
            .filter(appt => appt.statusType === 'accepted')
            .reduce((sum, appt) => sum + (appt.earning || 0), 0);

        return total >= 1000 ? `₹${(total / 1000).toFixed(1)}K` : `₹${total}`;
    }

    get stats() {
        return [
            { label: "Today's Job", value: '02', icon: '📅' },
            { label: 'This Week', value: '05', icon: '📊' },
            { label: 'Total Earning', value: this.getEarnings(), icon: '💰' },
            { label: 'My Rating', value: '4.7', icon: '⭐' }
        ];
    }

    appointments = [
        {
            id: '1',
            date: '31 Jan, Wednesday',
            time: '2:30 PM',
            duration: '2hrs',
            address: '201, Manjari Khurd, Pune - 143505',
            service: 'Cleaning',
            status: 'Booking Rejected',
            statusType: 'rejected',
            earning: 299,
            icon: '🧹'
        },
        {
            id: '2',
            date: '31 Jan, Wednesday',
            time: '2:30 PM',
            duration: '2hrs',
            address: '201, Manjari Khurd, Pune - 143505',
            service: 'Cooking',
            status: 'Booking Accepted',
            statusType: 'accepted',
            earning: 299,
            icon: '🍳'
        },
        {
            id: '3',
            date: '31 Jan, Wednesday',
            time: '2:30 PM',
            duration: '2hrs',
            address: '201, Manjari Khurd, Pune - 143505',
            service: 'Gardening',
            status: 'Cancelled by Customer',
            statusType: 'cancelled',
            earning: 299,
            icon: '🪴'
        },
        {
            id: '5',
            date: '30 Jan, Tuesday',
            time: '11:00 AM',
            duration: '3hrs',
            address: '505, Baner Road, Pune - 411045',
            service: 'Electrical',
            status: 'Booking Completed',
            statusType: 'completed',
            earning: 450,
            icon: '⚡'
        },
        {
            id: '6',
            date: '29 Jan, Monday',
            time: '4:00 PM',
            duration: '1hr',
            address: '102, Hinjewadi Phase 1, Pune',
            service: 'Plumbing',
            status: 'Booking Completed',
            statusType: 'completed',
            earning: 150,
            icon: '🔧'
        }
    ];

    pendingRequests = [
        {
            id: 'r1',
            date: '31 Jan, Wednesday',
            time: '2:30 PM',
            duration: '2hrs',
            address: '201, Manjari Khurd, Pune - 143505',
            service: 'Cooking',
            customer: 'John Doe',
            amount: 300,
            icon: '🍳'
        },
        {
            id: 'r2',
            date: '31 Jan, Wednesday',
            time: '2:30 PM',
            duration: '2hrs',
            address: '201, Manjari Khurd, Pune - 143505',
            service: 'Cleaning',
            customer: 'Jane Smith',
            amount: 250,
            icon: '🧹'
        }
    ];

    calendarDays = [
        { day: 1, current: false }, { day: 2, current: false }, { day: 3, current: false }, { day: 4, current: false }, { day: 5, current: false },
        { day: 6, current: false }, { day: 7, current: false }, { day: 8, current: false }, { day: 9, current: false }, { day: 10, current: false },
        { day: 11, current: false }, { day: 12, current: false }, { day: 13, current: false }, { day: 14, current: false }, { day: 15, current: false },
        { day: 16, current: false }, { day: 17, current: false }, { day: 18, current: false }, { day: 19, current: false }, { day: 20, current: false },
        { day: 21, current: false }, { day: 22, current: true }, { day: 23, current: false }, { day: 24, current: false }, { day: 25, current: false },
        { day: 26, current: false }, { day: 27, current: false }, { day: 28, current: false }, { day: 29, current: false }, { day: 30, current: false }
    ];

    ngOnInit() {
        this.currentUser = this.authService.currentUser();
    }

    searchQuery: string = '';
    selectedFilter: string = 'All';
    isSearchActive: boolean = false;
    showProfileDropdown: boolean = false;

    toggleProfileDropdown() {
        this.showProfileDropdown = !this.showProfileDropdown;
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/']);
    }

    get filteredAppointments() {
        let list = this.appointments;

        // Apply Status Filter
        if (this.selectedFilter !== 'All') {
            const filter = this.selectedFilter.toLowerCase();
            list = list.filter(appt => {
                if (filter === 'completed') return appt.status.toLowerCase().includes('completed');
                if (filter === 'accepted') return appt.statusType === 'accepted';
                if (filter === 'pending') return appt.status.toLowerCase().includes('pending') || (!appt.statusType && !appt.status.toLowerCase().includes('rejected'));
                return true;
            });
        }

        // Apply Search Query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            list = list.filter(appt =>
                appt.service?.toLowerCase().includes(query) ||
                appt.address?.toLowerCase().includes(query) ||
                appt.status?.toLowerCase().includes(query)
            );
        }

        return list;
    }

    toggleOnline() {
        this.isOnline = !this.isOnline;
    }

    toggleSearch() {
        this.isSearchActive = !this.isSearchActive;
        if (!this.isSearchActive) this.searchQuery = '';
    }

    openActionModal(request: any) {
        this.selectedRequest = request;
        this.showActionModal = true;
    }

    closeModal() {
        this.showActionModal = false;
        this.selectedRequest = null;
    }

    handleAction(action: 'accept' | 'reject') {
        if (this.selectedRequest) {
            if (action === 'accept') {
                const newAppt = {
                    ...this.selectedRequest,
                    status: 'Booking Accepted',
                    statusType: 'accepted',
                    earning: this.selectedRequest.amount,
                    id: Math.random().toString(36).substr(2, 9)
                };
                this.appointments = [newAppt, ...this.appointments];
            } else {
                const newAppt = {
                    ...this.selectedRequest,
                    status: 'Booking Rejected',
                    statusType: 'rejected',
                    earning: this.selectedRequest.amount,
                    id: Math.random().toString(36).substr(2, 9)
                };
                this.appointments = [newAppt, ...this.appointments];
            }
            this.pendingRequests = this.pendingRequests.filter(r => r.id !== this.selectedRequest.id);
            this.closeModal();
        }
    }
}
