import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.css']
})
export class ServiceDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);

  serviceId: string = '';
  service: any = null;
  isLoading = true;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.serviceId = params.get('id') || '';
      if (this.serviceId) {
        this.fetchServiceDetails();
      }
    });
  }

  fetchServiceDetails() {
    this.http.get<any>(`http://localhost:3000/services/${this.serviceId}`).subscribe({
      next: (data) => {
        this.service = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load service details', err);
        this.isLoading = false;
      }
    });
  }

  bookService() {
    if (this.service) {
      this.router.navigate(['/book', this.service.name]);
    }
  }
}
