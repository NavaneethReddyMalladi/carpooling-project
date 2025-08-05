import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-driver-side-bar',
  templateUrl: './driver-side-bar.component.html',
  styleUrls: ['./driver-side-bar.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DriverSideBarComponent implements OnInit {
  @Input() activeRides: any[] = [];
  @Input() pendingRequests: any[] = [];
  @Input() riderDetails: any = {};
  @Input() isSidebarOpen: boolean = false;
  
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() menuItemClick = new EventEmitter<string>();


  constructor(private router: Router) {}

  ngOnInit() {
    // Component initialization if needed
  }

  // Check if current route is active
  isActiveRoute(route: string): boolean {
    if (route === '/driver') {
      return this.router.url === '/driver' || this.router.url === '/driver/';
    }
    return this.router.url.startsWith(route);
  }

  // Navigation methods (if you want to handle navigation programmatically)
  navigateToRoute(route: string) {
    this.router.navigate([route]);
  }

  // Method to get badge count for rides
  getActiveRidesCount(): number {
    return this.activeRides ? this.activeRides.length : 0;
  }

  // Method to get badge count for requests
  getPendingRequestsCount(): number {
    return this.pendingRequests ? this.pendingRequests.length : 0;
  }
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