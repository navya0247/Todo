import { Component, EventEmitter, Input, OnInit, Output, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../booking.service';

@Component({
  selector: 'app-step-expert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-expert.component.html',
  styleUrls: ['./step-expert.component.css']
})
export class StepExpertComponent implements OnInit, OnChanges {
  @Input() service: any = null;
  @Output() expertSelected = new EventEmitter<any>();

  private bookingService = inject(BookingService);
  experts: any[] = [];
  isLoading = true;

  categories: any[] = [];
  selectedCategory: string = 'All';

  ngOnInit() {
    this.categories = [
      { name: 'Cleaning', icon: '🧹' },
      { name: 'Cooking', icon: '🍳' },
      { name: 'Gardening', icon: '🪴' },
      { name: 'Repair', icon: '🔧' },
      { name: 'Painting', icon: '🎨' },
      { name: 'Laundry', icon: '🧺' }
    ];
  }

  ngOnChanges() {
    if (this.service) {
      this.loadExperts();
    }
  }

  loadExperts() {
    this.isLoading = true;
    // Map service name to category for mock data search if needed, or search by service name
    const query = this.selectedCategory === 'All' ? (this.service.category?.name || this.service.name || '') : this.selectedCategory;

    this.bookingService.getExperts(query).subscribe({
      next: (data) => {
        this.experts = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load experts', err);
        this.isLoading = false;
      }
    });
  }

  filterByCategory(categoryName: string) {
    this.selectedCategory = categoryName;
    this.loadExperts();
  }

  selectExpert(expert: any) {
    this.expertSelected.emit(expert);
  }
}
