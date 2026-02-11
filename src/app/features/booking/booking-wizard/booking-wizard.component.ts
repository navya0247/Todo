import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService } from '../booking.service';
import { StepExpertComponent } from '../steps/step-expert/step-expert.component';
import { StepSlotComponent } from '../steps/step-slot/step-slot.component';
import { StepAddressComponent } from '../steps/step-address/step-address.component';
import { StepSummaryComponent } from '../steps/step-summary/step-summary.component';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StepExpertComponent,
    StepSlotComponent,
    StepAddressComponent,
    StepSummaryComponent
  ],
  templateUrl: './booking-wizard.component.html',
  styleUrls: ['./booking-wizard.component.css']
})
export class BookingWizardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);

  serviceName: string = '';
  currentStep: number = 1;

  // Booking State
  selectedExpert: any = null;
  selectedSlot: { date: Date, time: string, type: 'ASAP' | 'SCHEDULED' } | null = null;
  selectedAddress: any = null;

  service: any = null;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.serviceName = params.get('serviceName') || '';
      if (this.serviceName) {
        this.fetchServiceDetails();
      }
    });
  }

  fetchServiceDetails() {
    this.bookingService.getServiceByName(this.serviceName).subscribe({
      next: (services) => {
        if (services && services.length > 0) {
          this.service = services[0];
        }
      },
      error: (err) => console.error('Error fetching service', err)
    });
  }

  // Step Navigation
  nextStep() {
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  // State Updates from Steps
  onExpertSelected(expert: any) {
    this.selectedExpert = expert;
    this.nextStep();
  }

  onSlotSelected(slot: any) {
    this.selectedSlot = slot;
    this.nextStep();
  }

  onAddressSelected(address: any) {
    this.selectedAddress = address;
    this.nextStep();
  }

  onConfirmBooking(paymentData: any) {
    if (!this.selectedExpert || !this.selectedSlot || !this.selectedAddress) return;

    const user = this.authService.currentUser();
    const userId = user ? (user.id || user.userId) : 'guest';

    // Enhance payload for dashboard display
    const bookingPayload = {
      customerId: userId,
      expertId: this.selectedExpert.id,
      serviceName: this.serviceName,
      serviceId: this.service?.id || '1',
      addressId: this.selectedAddress.id,
      addressHint: `${this.selectedAddress.line1}, ${this.selectedAddress.city}`,
      status: 'CONFIRMED',
      bookingType: this.selectedSlot.type,
      scheduledStartTime: this.selectedSlot.type === 'SCHEDULED' ? this.selectedSlot.date : new Date().toISOString(),
      scheduledTimeSlot: this.selectedSlot.time,
      quotedAmount: this.selectedExpert.price,
      finalAmount: paymentData?.totalAmount || this.selectedExpert.price,
      currency: 'INR',
      couponId: paymentData?.couponId,
      discountAmount: paymentData?.discount,
      createdAt: new Date().toISOString()
    };

    this.bookingService.createBooking(bookingPayload).subscribe({
      next: (createdBooking: any) => {
        // Create Payment record linked to this booking
        const paymentPayload = {
          bookingId: createdBooking.id,
          customerId: userId,
          amount: bookingPayload.finalAmount,
          currency: 'INR',
          status: 'SUCCEEDED',
          method: 'CARD', // Mocked as Card for now
          transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        this.bookingService.createPayment(paymentPayload).subscribe({
          next: () => {
            this.router.navigate(['/booking-success'], { queryParams: { status: 'success' } });
          },
          error: (err) => {
            console.error('Payment record creation failed', err);
            // Even if payment record fails, the booking was confirmed in this mock
            this.router.navigate(['/booking-success'], { queryParams: { status: 'success' } });
          }
        });
      },
      error: (err) => {
        console.error('Booking failed', err);
        this.router.navigate(['/booking-success'], { queryParams: { status: 'fail' } });
      }
    });
  }
}
