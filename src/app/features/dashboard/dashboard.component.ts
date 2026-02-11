import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  protected authService = inject(AuthService);

  currentUser: any = null;

  // Header Inputs
  locations = ['Pune - 411001', 'Mumbai - 400001', 'Delhi - 110001'];
  selectedLocation = this.locations[0];
  searchQuery = '';

  // Data for the UI sections
  allBookings: any[] = [];
  upcomingBookings: any[] = [];
  pastBookings: any[] = [];
  bookingTab: 'upcoming' | 'history' = 'upcoming';

  popularServices: any[] = [];
  featuredServices: any[] = [];

  faqs = [
    {
      question: "How Can I Trust The Expert Sent By HouseMate?",
      answer: "We Thoroughly Vet All Of Our Experts Through Background Checks And Skill Assessments. You Can Also View Ratings And Reviews From Other Users Before Booking.",
      isOpen: true
    },
    {
      question: "What If The Service Provider Is Late Or Doesn't Show Up?",
      answer: "We track all experts in real-time. If there's a delay, you'll be notified immediately, and we offer 100% money-back guarantee for no-shows.",
      isOpen: false
    }
  ];

  ngOnInit() {
    this.currentUser = this.authService.currentUser();
    if (!this.currentUser) {
      const stored = localStorage.getItem('user');
      if (stored) this.currentUser = JSON.parse(stored);
    }

    this.loadData();
  }

  loadData() {
    this.dashboardService.getServices().subscribe(services => {
      // Map images to services
      const servicesWithImages = services.map(service => {
        let image = 'assets/cat-cleaning.png'; // Default
        if (service.name.includes('Cleaning')) image = 'assets/cat-cleaning.png';
        else if (service.name.includes('Cooking')) image = 'assets/cat-cooking.png';
        else if (service.name.includes('Garden')) image = 'assets/cat-gardening.png';

        return { ...service, image };
      });

      this.popularServices = servicesWithImages.slice(0, 4);
      this.featuredServices = servicesWithImages.slice(0, 3);
    });

    if (this.currentUser && this.currentUser.id) {
      this.dashboardService.getBookings(this.currentUser.id).subscribe(bookings => {
        this.allBookings = bookings;
        this.filterBookings();
      });
    }
  }

  filterBookings() {
    // Logic to separate upcoming and past bookings
    // For now, assuming everything not completed is upcoming
    this.upcomingBookings = this.allBookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
    this.pastBookings = this.allBookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED');
  }

  setBookingTab(tab: 'upcoming' | 'history') {
    this.bookingTab = tab;
  }

  toggleFaq(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}
