import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingPageComponent implements OnInit {
  workerImages: string[] = [
    'assets/worker-1.jpeg',
    'assets/worker-2.jpeg',
    'assets/worker-3.jpeg'
  ];

  currentWorkerIndex = 0;

  ngOnInit(): void {
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // Change worker image based on scroll depth
    if (scrollPosition > 800) {
      this.currentWorkerIndex = 2;
    } else if (scrollPosition > 400) {
      this.currentWorkerIndex = 1;
    } else {
      this.currentWorkerIndex = 0;
    }
  }
}
