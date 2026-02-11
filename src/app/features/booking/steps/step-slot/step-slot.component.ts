import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step-slot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './step-slot.component.html',
  styleUrls: ['./step-slot.component.css']
})
export class StepSlotComponent {
  @Output() slotSelected = new EventEmitter<any>();

  currentDate = new Date();
  selectedDate: Date = new Date();
  selectedTime: string = '';

  // Calendar Data
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: { date: Date, isCurrentMonth: boolean, isPast: boolean }[] = [];

  // Time Slots
  morningSlots = ['09:00 AM', '10:00 AM', '11:00 AM'];
  afternoonSlots = ['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
  eveningSlots = ['05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'];

  constructor() {
    this.generateCalendar();
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sun

    this.calendarDays = [];

    // Empty slots for previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      this.calendarDays.push({ date: null!, isCurrentMonth: false, isPast: true });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      this.calendarDays.push({
        date: date,
        isCurrentMonth: true,
        isPast: date < today
      });
    }
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  prevMonth() {
    const today = new Date();
    if (this.currentDate.getMonth() > today.getMonth() || this.currentDate.getFullYear() > today.getFullYear()) {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      this.generateCalendar();
    }
  }

  selectDate(day: any) {
    if (!day.date || day.isPast) return;
    this.selectedDate = day.date;
    this.selectedTime = ''; // Reset time on date change
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  confirm() {
    if (this.selectedDate && this.selectedTime) {
      this.slotSelected.emit({
        type: 'SCHEDULED',
        date: this.selectedDate,
        time: this.selectedTime
      });
    }
  }
}
