import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../booking.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-step-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-address.component.html',
  styleUrls: ['./step-address.component.css']
})
export class StepAddressComponent implements OnInit {
  @Output() addressSelected = new EventEmitter<any>();

  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  addresses: any[] = [];
  isLoading = true;
  showAddForm = false;
  addressForm: FormGroup;
  currentUser: any;

  constructor() {
    this.addressForm = this.fb.group({
      label: ['Home', Validators.required],
      line1: ['', Validators.required],
      line2: [''],
      city: ['Mumbai', Validators.required],
      state: ['Maharashtra', Validators.required],
      postalCode: ['400001', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      propertyType: ['2 BHK', Validators.required],
      contactName: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      alternateContactNumber: ['']
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.currentUser();
    // Fallback if signal null (e.g. reload)
    if (!this.currentUser) {
      const stored = localStorage.getItem('user');
      if (stored) this.currentUser = JSON.parse(stored);
    }

    if (this.currentUser) {
      this.loadAddresses();
    }
  }

  selectedAddressId: string = '';

  loadAddresses() {
    const userId = this.currentUser.id || this.currentUser.userId;
    this.bookingService.getAddresses(userId).subscribe({
      next: (data) => {
        this.addresses = data;
        // Auto-select default or first address
        const defaultAddr = this.addresses.find(a => a.isDefault);
        if (defaultAddr) {
          this.selectAddress(defaultAddr);
        } else if (this.addresses.length > 0) {
          this.selectAddress(this.addresses[0]);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load addresses', err);
        this.isLoading = false;
      }
    });
  }

  selectAddress(address: any) {
    this.selectedAddressId = address.id;
    this.addressSelected.emit(address);
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  onSubmit() {
    if (this.addressForm.valid && this.currentUser) {
      const newAddress = {
        ...this.addressForm.value,
        customerId: this.currentUser.id || this.currentUser.userId,
        id: crypto.randomUUID() // Client-side ID generation for mock
      };

      this.bookingService.addAddress(newAddress).subscribe({
        next: (res) => {
          this.addresses.push(res);
          this.showAddForm = false;
          this.addressForm.reset({ label: 'Home' });
        },
        error: (err) => console.error('Failed to add address', err)
      });
    }
  }
}
