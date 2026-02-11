import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="result-container">
      <div class="result-card" [class.fail]="status === 'fail'">
        <div class="image-wrapper">
          <img [src]="status === 'success' ? 'assets/PayhmentSuccess.jpeg' : 'assets/Payment fail.jpeg'" 
               [alt]="status === 'success' ? 'Success' : 'Failed'" 
               class="result-image">
        </div>
        
        <h2 [class.text-success]="status === 'success'" [class.text-fail]="status === 'fail'">
          {{ status === 'success' ? 'Booking Confirmed!' : 'Payment Failed!' }}
        </h2>
        
        <p class="description">
          {{ status === 'success' ? 'Your home service expert has been assigned successfully. We are excited to serve you!' : 'We encountered an error while processing your transaction. Please try again or use a different card.' }}
        </p>
        
        <div class="actions">
          <button *ngIf="status === 'success'" class="btn-dashboard" (click)="goToDashboard()">Go to Dashboard</button>
          <button *ngIf="status === 'fail'" class="btn-retry" (click)="retry()">Back to Summary</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .result-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 90vh;
      background: #f8faff;
      padding: 20px;
    }
    
    .result-card {
      background: white;
      padding: 48px;
      border-radius: 32px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.04);
      text-align: center;
      max-width: 480px;
      width: 100%;
      border: 1px solid #f1f5f9;
      transform: translateY(0);
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .result-card.fail {
      border-color: #fee2e2;
      background: #fffafa;
    }

    .image-wrapper {
      margin-bottom: 32px;
    }
    
    .result-image {
      width: 180px;
      height: 180px;
      object-fit: contain;
      filter: drop-shadow(0 10px 15px rgba(0,0,0,0.05));
    }
    
    h2 {
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }

    .text-success { color: #10b981; }
    .text-fail { color: #ef4444; }
    
    .description {
      color: #64748b;
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 40px;
    }
    
    .btn-dashboard, .btn-retry {
      width: 100%;
      padding: 18px;
      border-radius: 16px;
      font-weight: 700;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
    }

    .btn-dashboard {
      background: #1e3a8a;
      color: white;
      box-shadow: 0 8px 25px rgba(30, 58, 138, 0.2);
    }

    .btn-dashboard:hover {
      background: #1e40af;
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(30, 58, 138, 0.3);
    }

    .btn-retry {
      background: #f1f5f9;
      color: #1e293b;
    }

    .btn-retry:hover {
      background: #e2e8f0;
    }
  `]
})
export class BookingSuccessComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  status: 'success' | 'fail' = 'success';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.status = params['status'] || 'success';
    });
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  retry() {
    window.history.back();
  }
}
