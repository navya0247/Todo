import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor(private fb: FormBuilder) {
    const isExpertPath = this.router.url.includes('expert');
    this.loginForm = this.fb.group({
      role: [isExpertPath ? 'Expert Login' : 'Customer Login'],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login({ email, password }).subscribe({
        next: (res) => {
          const user = res.user;
          if (user && user.roles && user.roles.includes('ROLE_EXPERT')) {
            this.router.navigate(['/expert/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err: any) => {
          console.error('Login failed', err);
          alert('Login failed! Please check your credentials.');
        }
      });
    }
  }
}
