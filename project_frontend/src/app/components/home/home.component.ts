import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  rating?: number;
  phone?: string;
  joinDate?: Date;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  // User authentication state
  isLoggedIn = false;
  showProfileDropdown = false;
  showMobileMenu = false;
  
  // Active tab for service selection
  activeTab: 'ride' | 'drive' = 'ride';
  
  // User profile data
  userProfile: UserProfile = {
    id: '',
    name: '',
    email: '',
    profileImage: '',
    rating: 0
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkAuthenticationStatus();
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    // Cleanup any subscriptions if needed
  }

  /**
   * Check if user is authenticated
   */
  private checkAuthenticationStatus(): void {
    // Replace this with your actual authentication service
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      this.isLoggedIn = true;
      try {
        this.userProfile = JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.isLoggedIn = false;
      }
    } else {
      this.isLoggedIn = false;
    }
  }

  /**
   * Load user profile data
   */
  private loadUserProfile(): void {
    if (this.isLoggedIn) {
      // In a real app, you would fetch this from your API
      // For demo purposes, using mock data
      if (!this.userProfile.name) {
        this.userProfile = {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          profileImage: 'assets/default-avatar.png',
          rating: 4.8,
          phone: '+1 (555) 123-4567',
          joinDate: new Date('2023-01-15')
        };
      }
    }
  }

  /**
   * Toggle profile dropdown visibility
   */
  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
    
    // Close mobile menu if open
    if (this.showMobileMenu) {
      this.showMobileMenu = false;
    }
  }

  /**
   * Toggle mobile menu visibility
   */
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    
    // Close profile dropdown if open
    if (this.showProfileDropdown) {
      this.showProfileDropdown = false;
    }
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  /**
   * Set active tab (ride or drive)
   */
  setActiveTab(tab: 'ride' | 'drive'): void {
    this.activeTab = tab;
  }

  /**
   * Handle user logout
   */
  logout(): void {
    // Clear authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Reset component state
    this.isLoggedIn = false;
    this.showProfileDropdown = false;
    this.userProfile = {
      id: '',
      name: '',
      email: '',
      profileImage: '',
      rating: 0
    };

    // Redirect to home page
    this.router.navigate(['/']);
    
    // Optional: Show success message
    console.log('User logged out successfully');
  }

  /**
   * Navigate to login page
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Navigate to register page
   */
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Navigate to profile page
   */
  navigateToProfile(): void {
    this.showProfileDropdown = false;
    this.router.navigate(['/profile']);
  }

  /**
   * Handle ride booking
   */
  bookRide(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/book-ride' } 
      });
      return;
    }
    
    // Navigate to ride booking page
    this.router.navigate(['/book-ride']);
  }

  /**
   * Handle driver registration
   */
  startDriving(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/register'], { 
        queryParams: { role: 'driver' } 
      });
      return;
    }
    
    // Navigate to driver onboarding
    this.router.navigate(['/driver-onboarding']);
  }

  /**
   * Close dropdowns when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Close profile dropdown if clicking outside
    if (this.showProfileDropdown && 
        !target.closest('.profile-dropdown')) {
      this.showProfileDropdown = false;
    }
    
    // Close mobile menu if clicking outside
    if (this.showMobileMenu && 
        !target.closest('.mobile-menu') && 
        !target.closest('.mobile-menu-toggle')) {
      this.showMobileMenu = false;
    }
  }

  /**
   * Handle window resize
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const window = event.target as Window;
    
    // Close mobile menu on desktop
    if (window.innerWidth > 768) {
      this.showMobileMenu = false;
    }
  }

  /**
   * Handle escape key press
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.showProfileDropdown) {
      this.showProfileDropdown = false;
    }
    
    if (this.showMobileMenu) {
      this.showMobileMenu = false;
    }
  }

  /**
   * Format user rating
   */
  formatRating(rating: number): string {
    return rating ? rating.toFixed(1) : '0.0';
  }

  /**
   * Get user initials for avatar fallback
   */
  getUserInitials(): string {
    if (!this.userProfile.name) return '';
    
    const names = this.userProfile.name.split(' ');
    const initials = names.map(name => name.charAt(0)).join('');
    return initials.toUpperCase().slice(0, 2);
  }

  /**
   * Check if user has profile image
   */
  hasProfileImage(): boolean {
    return !!(this.userProfile.profileImage && 
             this.userProfile.profileImage !== 'assets/default-avatar.png');
  }

  /**
   * Handle profile image error
   */
  onProfileImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-avatar.png';
  }

  /**
   * Navigate to specific page
   */
  navigateTo(path: string): void {
    this.showProfileDropdown = false;
    this.showMobileMenu = false;
    this.router.navigate([path]);
  }

  /**
   * Format join date
   */
  formatJoinDate(): string {
    if (!this.userProfile.joinDate) return '';
    
    const date = new Date(this.userProfile.joinDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  }

  /**
   * Check if user is a driver
   */
  isDriver(): boolean {
    // This would typically come from user profile data
    // For now, return false as default
    return false;
  }

  /**
   * Check if user is a rider
   */
  isRider(): boolean {
    // This would typically come from user profile data
    // For now, return true as default for logged in users
    return this.isLoggedIn;
  }
}