import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RiderService } from '../../../services/rider.service';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  details: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  paymentMethod: string;
}

@Component({
  selector: 'app-rider-wallet',
  templateUrl: './rider-wallet.component.html',
  styleUrls: ['./rider-wallet.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class RiderWalletComponent implements OnInit {
  walletBalance = 0;
  
  paymentMethods: PaymentMethod[] = [];
  allTransactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  
  selectedTransactionFilter = 'all';
  showAddMoneyModal = false;
  addMoneyAmount: number | null = null;
  selectedPaymentMethod = '';

  constructor(private riderService: RiderService) {}

  ngOnInit() {
    this.loadWalletData();
  }

  private loadWalletData() {
    // Load wallet balance, payment methods, and transactions
    this.loadMockData();
  }

  private loadMockData() {
    // Mock data - replace with actual API calls
    this.walletBalance = 250.75;
    
    this.paymentMethods = [
      {
        id: '1',
        name: 'Visa •••• 1234',
        type: 'card',
        details: 'Expires 12/25',
        isDefault: true
      },
      {
        id: '2',
        name: 'UPI - PhonePe',
        type: 'upi',
        details: 'rider@phonepe',
        isDefault: false
      }
    ];

    this.allTransactions = [
      {
        id: '1',
        description: 'Ride payment to John Doe',
        amount: 45.50,
        type: 'debit',
        status: 'completed',
        date: new Date().toISOString(),
        paymentMethod: 'Wallet'
      },
      {
        id: '2',
        description: 'Wallet top-up',
        amount: 100.00,
        type: 'credit',
        status: 'completed',
        date: new Date(Date.now() - 86400000).toISOString(),
        paymentMethod: 'Visa •••• 1234'
      }
    ];

    this.filteredTransactions = this.allTransactions;
  }

  // Filter transactions
  filterTransactions() {
    if (this.selectedTransactionFilter === 'all') {
      this.filteredTransactions = this.allTransactions;
    } else {
      this.filteredTransactions = this.allTransactions.filter(t => {
        switch (this.selectedTransactionFilter) {
          case 'rides':
            return t.description.includes('Ride payment');
          case 'refunds':
            return t.description.includes('Refund');
          case 'wallet':
            return t.description.includes('Wallet');
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
    if (!this.addMoneyAmount || !this.selectedPaymentMethod) {
      this.riderService.showMessage('Please fill all required fields', 'error');
      return;
    }

    console.log('Adding money:', this.addMoneyAmount);
    
    // Mock success
    this.walletBalance += this.addMoneyAmount;
    this.riderService.showMessage(`₹${this.addMoneyAmount} added to wallet successfully!`, 'success');
    this.closeAddMoneyModal();
  }

  // Close add money modal
  closeAddMoneyModal() {
    this.showAddMoneyModal = false;
    this.addMoneyAmount = null;
    this.selectedPaymentMethod = '';
  }

  // Withdraw money
  withdrawMoney() {
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
}