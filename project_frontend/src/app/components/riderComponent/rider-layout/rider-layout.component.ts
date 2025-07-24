import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RiderService } from '../../../services/rider.service';
import { ChatService } from '../../../services/riderchat.service';
import { RiderSidebarComponent } from '../rider-sidebar/rider-sidebar.component';

@Component({
  selector: 'app-rider-layout',
  templateUrl: './rider-layout.component.html',
  styleUrls: ['./rider-layout.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, RiderSidebarComponent]
})
export class RiderLayoutComponent implements OnInit, OnDestroy {
  riderDetails: any = {};
  message = '';
  messageType: 'success' | 'error' = 'success';
  
  // UI state
  isProfileMenuOpen = false;
  isSidebarOpen = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private riderService: RiderService,
    private chatService: ChatService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.initializeComponent();
    this.setupSubscriptions();
  }


  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.stopChatPolling();
  }

  private initializeComponent() {
    // Load rider data
    this.riderService.loadRiderData().then(() => {
      // Load stops data
      this.riderService.loadStops().subscribe();
    }).catch(error => {
      console.error('Failed to load rider data:', error);
      this.redirectToLogin();
    });
  }

  private setupSubscriptions() {
    // Subscribe to rider details
    this.subscriptions.push(
      this.riderService.riderDetails$.subscribe(details => {
        this.riderDetails = details;
      })
    );

    // Subscribe to messages
    this.subscriptions.push(
      this.riderService.message$.subscribe(message => {
        this.message = message;
      })
    );

    // Subscribe to message type
    this.subscriptions.push(
      this.riderService.messageType$.subscribe(type => {
        this.messageType = type;
      })
    );
  }

  // Header methods
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }

  // Navigation methods
  openChat() {
    this.router.navigate(['/rider/chat']);
  }

  viewProfile() {
    this.router.navigate(['/rider/profile']);
    this.closeProfileMenu();
  }

  logout() {
    this.chatService.stopChatPolling();
    this.closeProfileMenu();
    this.closeSidebar();
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }

  // Handle menu item clicks from sidebar
  handleMenuItemClick(action: string) {
    switch (action) {
      case 'profile':
        this.router.navigate(['/rider/profile']);
        break;
      case 'myrides':
        this.router.navigate(['/rider/myrides']);
        break;
      case 'help':
        this.router.navigate(['/rider/help']);
        break;
      case 'wallet':
        this.router.navigate(['/rider/wallet']);
        break;
      case 'activity':
        this.router.navigate(['/rider/activity']);
        break;
      case 'terms':
        this.router.navigate(['/rider/terms']);
        break;
      case 'logout':
        this.logout();
        break;
      default:
        console.log('Unknown menu action:', action);
    }
    this.closeSidebar();
  }

  private redirectToLogin() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/login']);
    }
  }
}