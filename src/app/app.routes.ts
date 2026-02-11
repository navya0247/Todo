import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { BookingWizardComponent } from './features/booking/booking-wizard/booking-wizard.component';
import { ServiceDetailsComponent } from './features/service-details/service-details.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'expert/login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'service/:id', component: ServiceDetailsComponent, canActivate: [authGuard] },
    { path: 'book/:serviceName', component: BookingWizardComponent, canActivate: [authGuard] },
    { path: 'booking-success', loadComponent: () => import('./features/booking/booking-success/booking-success.component').then(m => m.BookingSuccessComponent), canActivate: [authGuard] },
    { path: 'expert/register', loadComponent: () => import('./features/expert/onboarding/expert-onboarding.component').then(m => m.ExpertOnboardingComponent) },
    { path: 'expert/dashboard', loadComponent: () => import('./features/expert/dashboard/expert-dashboard.component').then(m => m.ExpertDashboardComponent), canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
