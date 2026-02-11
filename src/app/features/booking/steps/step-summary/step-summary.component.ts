import { Component, EventEmitter, Input, Output, OnInit, OnChanges, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { BookingService } from '../../booking.service';

@Component({
  selector: 'app-step-summary',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './step-summary.component.html',
  styleUrls: ['./step-summary.component.css']
})
export class StepSummaryComponent implements OnInit, OnChanges {
  @Input() expert: any;
  @Input() slot: any;
  @Input() address: any;
  @Input() service: any;
  @Output() confirm = new EventEmitter<any>();

  private bookingService = inject(BookingService);

  coupons: any[] = [];
  selectedCoupon: any = null;
  couponCode: string = '';
  isProcessing = false;

  // Pricing
  basePrice: number = 0;
  taxes: number = 0;
  discount: number = 0;
  finalAmount: number = 0;

  showPaymentModal = false;
  paymentStatus: 'pending' | 'success' | 'fail' = 'pending';

  ngOnInit() {
    this.loadCoupons();
  }

  ngOnChanges() {
    this.calculateTotal();
  }

  loadCoupons() {
    this.bookingService.getCoupons().subscribe({
      next: (data) => this.coupons = data,
      error: (err) => console.error('Error fetching coupons', err)
    });
  }

  calculateTotal() {
    if (!this.expert) return;

    this.basePrice = this.expert.price;

    // Calculate Discount
    this.discount = 0;
    if (this.selectedCoupon) {
      if (this.selectedCoupon.discountType === 'PERCENTAGE') {
        this.discount = (this.basePrice * this.selectedCoupon.discountValue) / 100;
        if (this.selectedCoupon.maxDiscount) {
          this.discount = Math.min(this.discount, this.selectedCoupon.maxDiscount);
        }
      } else {
        this.discount = this.selectedCoupon.discountValue;
      }
    }

    const taxableAmount = this.basePrice - this.discount;
    this.taxes = taxableAmount * 0.18; // 18% GST
    this.finalAmount = taxableAmount + this.taxes;
  }

  applyCoupon(coupon: any) {
    if (this.selectedCoupon === coupon) {
      this.selectedCoupon = null; // Toggle off
    } else {
      this.selectedCoupon = coupon;
    }
    this.calculateTotal();
  }

  applyCode() {
    const found = this.coupons.find(c => c.code === this.couponCode);
    if (found) {
      this.selectedCoupon = found;
      this.calculateTotal();
    } else {
      alert('Invalid Coupon Code');
    }
  }

  openPaymentModal() {
    this.showPaymentModal = true;
    this.paymentStatus = 'pending';
  }

  closeModal(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      if (this.paymentStatus === 'pending') {
        this.showPaymentModal = false;
      }
    }
  }

  pay() {
    this.isProcessing = true;
    // Mocking an API call delay
    setTimeout(() => {
      // Simulate 90% success rate for demo
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        this.paymentStatus = 'success';
        setTimeout(() => {
          this.confirm.emit({
            totalAmount: this.finalAmount,
            discount: this.discount,
            couponId: this.selectedCoupon?.id
          });
          this.isProcessing = false;
          this.showPaymentModal = false;
        }, 2000);
      } else {
        this.paymentStatus = 'fail';
        this.isProcessing = false;
      }
    }, 2000);
  }
}
