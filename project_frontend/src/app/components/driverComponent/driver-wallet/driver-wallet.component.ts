import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { RiderService } from '../../../services/rider.service';
import { WalletService, WalletData, PaymentMethod, Transaction } from '../../../services/wallet.service';

@Component({
  selector: 'app-rider-wallet',
  templateUrl: './driver-wallet.component.html',
  styleUrls: ['./driver-wallet.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class DriverWalletComponent implements OnInit, OnDestroy {
  walletData: WalletData | null = null;
  walletBalance = 0;
  
  paymentMethods: PaymentMethod[] = [];
  allTransactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  
  selectedTransactionFilter = 'all';
  showAddMoneyModal = false;
  addMoneyAmount: number | null = null;
  selectedPaymentMethod = '';
  isLoading = false;
  isProcessingPayment = false;

  private subscriptions: Subscription[] = [];
  private currentUserId: number = 3; // Changed to match your API response - get this from auth service

  constructor(
    private riderService: RiderService,
    private walletService: WalletService
  ) {}

  ngOnInit() {
    this.loadWalletData();
    this.subscribeToWalletUpdates();
    this.loadTransactionSummary();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private subscribeToWalletUpdates() {
    const walletSub = this.walletService.wallet$.subscribe(walletData => {
      if (walletData) {
        this.walletData = walletData;
        this.walletBalance = walletData.balance;
      }
    });
    this.subscriptions.push(walletSub);
  }

  private loadWalletData() {
    this.isLoading = true;
    
    // Load wallet data
    this.loadWallet();
    
    // Load payment methods
    this.loadPaymentMethods();
    
    // Load transactions
    this.loadTransactions();
  }

  private loadWallet() {
    console.log('Loading wallet for user ID:', this.currentUserId); // Debug log
    
    const walletSub = this.walletService.getWalletByUserId(this.currentUserId).subscribe({
      next: (walletData) => {
        console.log('Component received wallet data:', walletData); // Debug log
        console.log('Balance from response:', walletData.balance, 'Type:', typeof walletData.balance); // Debug log
        
        this.walletData = walletData;
        this.walletBalance = walletData.balance;
        
        console.log('Component walletBalance set to:', this.walletBalance); // Debug log
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Component: Error loading wallet:', error);
        if (error.status === 404) {
          console.log('Wallet not found, attempting to create one...');
          // Wallet doesn't exist, create one
          this.createWallet();
        } else {
          this.riderService.showMessage('Error loading wallet data', 'error');
          this.isLoading = false;
        }
      }
    });
    this.subscriptions.push(walletSub);
  }

  private createWallet() {
    const createSub = this.walletService.createWallet(this.currentUserId, 0).subscribe({
      next: (response) => {
        console.log('Wallet created:', response);
        // Reload wallet data after creation
        this.loadWallet();
      },
      error: (error) => {
        console.error('Error creating wallet:', error);
        this.riderService.showMessage('Error creating wallet', 'error');
        this.isLoading = false;
      }
    });
    this.subscriptions.push(createSub);
  }

  private loadPaymentMethods() {
    const paymentSub = this.walletService.getPaymentMethods(this.currentUserId).subscribe({
      next: (methods) => {
        this.paymentMethods = methods;
      },
      error: (error) => {
        console.error('Error loading payment methods:', error);
        this.riderService.showMessage('Error loading payment methods', 'error');
      }
    });
    this.subscriptions.push(paymentSub);
  }

  private loadTransactions() {
    const transactionSub = this.walletService.getTransactions(this.currentUserId).subscribe({
      next: (transactions) => {
        console.log('Real transactions loaded:', transactions);
        this.allTransactions = transactions;
        this.filteredTransactions = transactions;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        // Fallback to empty array instead of showing error
        this.allTransactions = [];
        this.filteredTransactions = [];
        this.riderService.showMessage('Error loading transactions', 'error');
      }
    });
    this.subscriptions.push(transactionSub);
  }

  // Filter transactions
  filterTransactions() {
    if (this.selectedTransactionFilter === 'all') {
      this.filteredTransactions = this.allTransactions;
    } else {
      this.filteredTransactions = this.allTransactions.filter(t => {
        switch (this.selectedTransactionFilter) {
          case 'rides':
            return t.description.toLowerCase().includes('ride') || 
                   t.description.toLowerCase().includes('payment');
          case 'refunds':
            return t.description.toLowerCase().includes('refund');
          case 'wallet':
            return t.description.toLowerCase().includes('wallet') || 
                   t.description.toLowerCase().includes('top-up') ||
                   t.description.toLowerCase().includes('topup');
          case 'credit':
            return t.type === 'credit';
          case 'debit':
            return t.type === 'debit';
          default:
            return true;
        }
      });
    }
  }
  // Add money to wallet
  addMoney() {
    this.showAddMoneyModal = true;
    this.addMoneyAmount = null;
    this.selectedPaymentMethod = '';
  }

  // Process add money
  processAddMoney() {
    if (!this.addMoneyAmount || !this.selectedPaymentMethod || !this.walletData) {
      this.riderService.showMessage('Please fill all required fields', 'error');
      return;
    }

    if (this.addMoneyAmount <= 0) {
      this.riderService.showMessage('Please enter a valid amount', 'error');
      return;
    }

    this.isProcessingPayment = true;

    // First process the payment
    const paymentRequest = {
      amount: this.addMoneyAmount,
      payment_method_id: this.selectedPaymentMethod
    };

    const paymentSub = this.walletService.processPayment(paymentRequest).subscribe({
      next: (paymentResponse) => {
        if (paymentResponse.success) {
          // Payment successful, now update wallet balance
          const newBalance = (this.walletBalance ?? 0) + (this.addMoneyAmount ?? 0);
          this.updateWalletBalance(newBalance);
        } else {
          this.riderService.showMessage('Payment failed. Please try again.', 'error');
          this.isProcessingPayment = false;
        }
      },
      error: (error) => {
        console.error('Payment processing error:', error);
        this.riderService.showMessage('Payment processing failed', 'error');
        this.isProcessingPayment = false;
      }
    });
    this.subscriptions.push(paymentSub);
  }

  private updateWalletBalance(newBalance: number) {
    if (!this.walletData) return;
  
    const updateSub = this.walletService.updateWalletBalance(this.walletData.wallet_id, newBalance).subscribe({
      next: (response) => {
        this.riderService.showMessage(`₹${this.addMoneyAmount} added to wallet successfully!`, 'success');
        this.closeAddMoneyModal();
        this.isProcessingPayment = false;
        
        // Reload transactions from backend instead of adding locally
        this.loadTransactions();
      },
      error: (error) => {
        console.error('Error updating wallet balance:', error);
        this.riderService.showMessage('Error updating wallet balance', 'error');
        this.isProcessingPayment = false;
      }
    });
    this.subscriptions.push(updateSub);
  }

  // Close add money modal
  closeAddMoneyModal() {
    this.showAddMoneyModal = false;
    this.addMoneyAmount = null;
    this.selectedPaymentMethod = '';
    this.isProcessingPayment = false;
  }

  // Withdraw money
  withdrawMoney() {
    if (!this.walletData || this.walletBalance <= 0) {
      this.riderService.showMessage('Insufficient balance for withdrawal', 'error');
      return;
    }
    
    console.log('Withdrawing money');
    this.riderService.showMessage('Withdrawal feature coming soon!', 'success');
  }

  // Payment method management
  addPaymentMethod() {
    console.log('Adding payment method');
    this.riderService.showMessage('Add payment method feature coming soon!', 'success');
  }

  editPaymentMethod(method: PaymentMethod) {
    console.log('Editing payment method:', method);
    this.riderService.showMessage('Edit payment method feature coming soon!', 'success');
  }

  deletePaymentMethod(method: PaymentMethod) {
    if (!confirm(`Are you sure you want to delete ${method.name}?`)) {
      return;
    }
    
    console.log('Deleting payment method:', method);
    this.riderService.showMessage('Delete payment method feature coming soon!', 'success');
  }

  // Refresh wallet data
  refreshWallet() {
    this.loadWalletData();
  }

  private loadTransactionSummary() {
    const summarySub = this.walletService.getTransactionSummary(this.currentUserId).subscribe({
      next: (summary) => {
        console.log('Transaction summary:', summary);
        // You can use this data to show additional insights in your UI
        // For example: total spent, total received, etc.
      },
      error: (error) => {
        console.error('Error loading transaction summary:', error);
      }
    });
    this.subscriptions.push(summarySub);
  }

  // Utility methods
  getPaymentMethodIcon(type: string): string {
    switch (type) {
      case 'card':
        return 'fa-solid fa-credit-card';
      case 'upi':
        return 'fa-solid fa-mobile-alt';
      case 'bank':
        return 'fa-solid fa-university';
      default:
        return 'fa-solid fa-wallet';
    }
  }

  getTransactionIcon(type: string): string {
    return type === 'credit' ? 'fa-solid fa-arrow-down' : 'fa-solid fa-arrow-up';
  }

  formatDateTime(dateString: string): string {
    return this.riderService.formatDateTime(dateString);
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toFixed(2)}`;
  }

  getTransactionStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  // TrackBy functions for performance optimization
  trackByPaymentMethodId(index: number, method: PaymentMethod): string {
    return method.id;
  }

  trackByTransactionId(index: number, transaction: Transaction): string {
    return transaction.id;
  }
}