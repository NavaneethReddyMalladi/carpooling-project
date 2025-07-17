import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rider-sidebar',
  templateUrl: './rider-sidebar.component.html',
  styleUrls: ['./rider-sidebar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class RiderSidebarComponent {
  @Input() riderDetails: any = {};
  @Input() isSidebarOpen: boolean = false;
  
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() menuItemClick = new EventEmitter<string>();

  constructor() {}

  // Close sidebar
  closeSidebar() {
    this.sidebarToggle.emit();
  }

  // Handle menu item clicks
  onMenuItemClick(action: string) {
    this.menuItemClick.emit(action);
  }

  // Utility method to get first letter for avatar
  getFirstLetter(name: string): string {
    return (name || 'U')[0].toUpperCase();
  }
}