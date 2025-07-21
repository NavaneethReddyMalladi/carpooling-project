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

  isLoggedIn = false;
  showProfileDropdown = false;
  showMobileMenu = false;
  

  activeTab: 'ride' | 'drive' = 'ride';

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
  }

 
  private checkAuthenticationStatus(): void {
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


  private loadUserProfile(): void {
    if (this.isLoggedIn) {
     
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


  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
    

    if (this.showMobileMenu) {
      this.showMobileMenu = false;
    }
  }


  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    
    if (this.showProfileDropdown) {
      this.showProfileDropdown = false;
    }
  }


  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }


  setActiveTab(tab: 'ride' | 'drive'): void {
    this.activeTab = tab;
  }


  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    this.isLoggedIn = false;
    this.showProfileDropdown = false;
    this.userProfile = {
      id: '',
      name: '',
      email: '',
      profileImage: '',
      rating: 0
    };

    this.router.navigate(['/']);
    
    console.log('User logged out successfully');
  }

  
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

 
  navigateToProfile(): void {
    this.showProfileDropdown = false;
    this.router.navigate(['/profile']);
  }


  bookRide(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: '/book-ride' } 
      });
      return;
    }
    
    this.router.navigate(['/book-ride']);
  }

  
  startDriving(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/register'], { 
        queryParams: { role: 'driver' } 
      });
      return;
    }
    
    this.router.navigate(['/driver-onboarding']);
  }

  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    if (this.showProfileDropdown && 
        !target.closest('.profile-dropdown')) {
      this.showProfileDropdown = false;
    }
    
    if (this.showMobileMenu && 
        !target.closest('.mobile-menu') && 
        !target.closest('.mobile-menu-toggle')) {
      this.showMobileMenu = false;
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const window = event.target as Window;
    
    if (window.innerWidth > 768) {
      this.showMobileMenu = false;
    }
  }


  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.showProfileDropdown) {
      this.showProfileDropdown = false;
    }
    
    if (this.showMobileMenu) {
      this.showMobileMenu = false;
    }
  }


  formatRating(rating: number): string {
    return rating ? rating.toFixed(1) : '0.0';
  }


  getUserInitials(): string {
    if (!this.userProfile.name) return '';
    
    const names = this.userProfile.name.split(' ');
    const initials = names.map(name => name.charAt(0)).join('');
    return initials.toUpperCase().slice(0, 2);
  }

  
  hasProfileImage(): boolean {
    return !!(this.userProfile.profileImage && 
             this.userProfile.profileImage !== 'assets/default-avatar.png');
  }

 
  onProfileImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-avatar.png';
  }


  navigateTo(path: string): void {
    this.showProfileDropdown = false;
    this.showMobileMenu = false;
    this.router.navigate([path]);
  }

  formatJoinDate(): string {
    if (!this.userProfile.joinDate) return '';
    
    const date = new Date(this.userProfile.joinDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  }


  isDriver(): boolean {
    // This would typically come from user profile data
    // For now, return false as default
    return false;
  }


  isRider(): boolean {

    return this.isLoggedIn;
  }
}