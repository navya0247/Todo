import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ExpertService } from '../expert.service';
import { BookingService } from '../../booking/booking.service';

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
    private bookingService = inject(BookingService);

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

    appointments: any[] = [];

    pendingRequests: any[] = [];

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
        if (!this.currentUser) {
            const stored = localStorage.getItem('user');
            if (stored) this.currentUser = JSON.parse(stored);
        }

        if (this.currentUser) {
            this.loadBookings();
        }
    }

    loadBookings() {
        const expertId = this.currentUser.id || this.currentUser.userId;
        this.expertService.getExpertBookings(expertId).subscribe({
            next: (data) => {
                // Split bookings into confirmed (appointments) and pending
                this.appointments = data.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED' || b.status === 'REJECTED');
                this.pendingRequests = data.filter(b => b.status === 'PENDING' || b.status === 'REQUESTED');

                // Map API data to UI model if needed
                this.appointments = this.appointments.map(b => ({
                    ...b,
                    date: new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', weekday: 'long' }),
                    time: b.scheduledTimeSlot || 'N/A',
                    earning: b.finalAmount || b.quotedAmount,
                    statusType: b.status.toLowerCase(),
                    icon: b.serviceName?.includes('Cleaning') ? '🧹' : b.serviceName?.includes('Cooking') ? '🍳' : '🔧'
                }));

                this.pendingRequests = this.pendingRequests.map(b => ({
                    ...b,
                    date: new Date(b.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', weekday: 'long' }),
                    time: b.scheduledTimeSlot || 'N/A',
                    amount: b.quotedAmount,
                    icon: b.serviceName?.includes('Cleaning') ? '🧹' : b.serviceName?.includes('Cooking') ? '🍳' : '🔧'
                }));
            },
            error: (err) => console.error('Failed to load bookings', err)
        });
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
            const newStatus = action === 'accept' ? 'CONFIRMED' : 'REJECTED';

            this.bookingService.updateBookingStatus(this.selectedRequest.id, newStatus).subscribe({
                next: () => {
                    this.loadBookings(); // Refresh from server
                    this.closeModal();
                },
                error: (err) => console.error('Failed to update booking status', err)
            });
        }
    }
}
