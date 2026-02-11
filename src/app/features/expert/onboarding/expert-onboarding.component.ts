import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ExpertService } from '../expert.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-expert-onboarding',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './expert-onboarding.component.html',
    styleUrls: ['./expert-onboarding.component.css']
})
export class ExpertOnboardingComponent {
    private fb = inject(FormBuilder);
    private expertService = inject(ExpertService);
    private authService = inject(AuthService);
    private router = inject(Router);

    currentStep = 1;
    isSubmitting = false;

    onboardingForm = this.fb.group({
        // Step 1: Personal Info
        personalInfo: this.fb.group({
            fullName: ['', Validators.required],
            dob: ['', Validators.required],
            mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            address: ['', Validators.required],
            city: ['', Validators.required],
            state: ['', Validators.required],
            pinCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
        }),
        // Step 2: Service Profile
        serviceProfile: this.fb.group({
            services: [[] as string[], Validators.required],
            expYears: ['', Validators.required],
            expMonths: ['', Validators.required],
            specializations: [''],
            languages: [[] as string[], Validators.required],
            education: ['', Validators.required],
            availability: ['Full-time', Validators.required],
            hourlyRate: ['', [Validators.required, Validators.min(100)]],
            about: ['']
        }),
        // Step 3: ID Verification
        verification: this.fb.group({
            idType: ['Aadhaar Card', Validators.required],
            idNumber: ['', Validators.required],
            photo: ['', Validators.required] // Making it required
        })
    });

    selectedPhotoName: string = '';

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedPhotoName = file.name;
            // In a real app, we'd upload to S3/Firebase and get a URL
            // For this mock, we'll just store the filename
            this.onboardingForm.get('verification.photo')?.setValue(file.name);
        }
    }

    serviceCategories = [
        { name: 'Cleaning', icon: '🧹' },
        { name: 'Cooking', icon: '🍳' },
        { name: 'Gardening', icon: '🪴' },
        { name: 'Laundry', icon: '🧺' },
        { name: 'Electrical', icon: '⚡' },
        { name: 'Plumbing', icon: '🔧' }
    ];

    languages = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati', 'Malayalam', 'Punjabi', 'Urdu'];

    educationLevels = [
        'Below 10th', '10th Pass', '12th Pass', 'Graduate', 'Post Graduate', 'Diploma/Certificate Course'
    ];

    nextStep() {
        if (this.currentStep < 3) {
            this.currentStep++;
            window.scrollTo(0, 0);
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            window.scrollTo(0, 0);
        }
    }

    toggleService(service: string) {
        const control = this.onboardingForm.get('serviceProfile.services');
        const services = [...(control?.value || [])];
        const index = services.indexOf(service);
        if (index > -1) {
            services.splice(index, 1);
        } else {
            services.push(service);
        }
        control?.setValue(services);
    }

    isServiceSelected(service: string): boolean {
        return (this.onboardingForm.get('serviceProfile.services')?.value || []).includes(service);
    }

    toggleLanguage(lang: string) {
        const control = this.onboardingForm.get('serviceProfile.languages');
        const langs = [...(control?.value || [])];
        const index = langs.indexOf(lang);
        if (index > -1) {
            langs.splice(index, 1);
        } else {
            langs.push(lang);
        }
        control?.setValue(langs);
    }

    isLanguageSelected(lang: string): boolean {
        return (this.onboardingForm.get('serviceProfile.languages')?.value || []).includes(lang);
    }

    onSubmit() {
        if (this.onboardingForm.valid) {
            this.isSubmitting = true;
            const formValue: any = this.onboardingForm.value;

            // 1. Prepare User Registration Payload
            const registerPayload = {
                email: formValue.personalInfo.email,
                password: formValue.personalInfo.password,
                fullName: formValue.personalInfo.fullName,
                phone: formValue.personalInfo.mobile,
                roles: ['ROLE_EXPERT'],
                createdAt: new Date().toISOString()
            };

            // 2. Register User first to enable login
            this.authService.register(registerPayload).subscribe({
                next: (userRes: any) => {
                    // 3. Prepare Onboarding Payload
                    const onboardingPayload = {
                        ...formValue,
                        expertId: userRes.user?.id || userRes.userId || userRes.id,
                        status: 'PENDING',
                        submittedAt: new Date().toISOString()
                    };

                    this.expertService.registerOnboarding(onboardingPayload).subscribe({
                        next: () => {
                            this.isSubmitting = false;
                            alert('Registration successful! Please login to your dashboard.');
                            this.router.navigate(['/expert/login']);
                        },
                        error: (err) => {
                            console.error('Onboarding storage failed', err);
                            this.isSubmitting = false;
                            this.router.navigate(['/expert/login']);
                        }
                    });
                },
                error: (err) => {
                    console.error('User registration failed', err);
                    this.isSubmitting = false;
                    alert('Registration failed. The email might already be in use.');
                }
            });
        } else {
            alert('Please fill all required fields correctly.');
        }
    }
}
