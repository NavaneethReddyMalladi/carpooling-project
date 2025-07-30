import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface WalletData {
  wallet_id: number;
  user_id: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  details: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  paymentMethod: string;
  payment_id?: number;
  transaction_type?: string;
  other_user_id?: number;
}

export interface TransactionSummary {
  user_id: number;
  wallet_id: number;
  current_balance: number;
  total_transactions: number;
  total_received: number;
  total_sent: number;
  pending_received: number;
  pending_sent: number;
  net_amount: number;
  last_updated: string;
}

export interface AddMoneyRequest {
  amount: number;
  payment_method_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = 'http://127.0.0.1:42099'; // Adjust base URL as needed
  private walletSubject = new BehaviorSubject<WalletData | null>(null);
  public wallet$ = this.walletSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
  }

  // Create wallet for user
  createWallet(userId: number, initialBalance: number = 0): Observable<any> {
    const body = {
      user_id: userId,
      balance: initialBalance
    };
    return this.http.post(`${this.apiUrl}/wallets`, body, this.getHttpOptions());
  }

  // Get wallet by ID
  getWalletById(walletId: number): Observable<WalletData> {
    return this.http.get<WalletData>(`${this.apiUrl}/wallets/${walletId}`, this.getHttpOptions());
  }

  // Get wallet by user ID
  getWalletByUserId(userId: number): Observable<WalletData> {
    const url = `${this.apiUrl}/wallets/user/${userId}`;
    console.log('Making API call to:', url); // Debug log
    
    return this.http.get<WalletData>(url, this.getHttpOptions())
      .pipe(
        map(response => {
          console.log('API Response received:', response); // Debug log
          console.log('Balance from API:', response.balance, 'Type:', typeof response.balance); // Debug log
          this.walletSubject.next(response);
          return response;
        }),
        catchError(error => {
          console.error('API Error:', error); // Debug log
          return this.handleError(error);
        })
      );
  }

  // Update wallet balance
  updateWalletBalance(walletId: number, newBalance: number): Observable<any> {
    const body = { balance: newBalance };
    return this.http.put(`${this.apiUrl}/wallets/${walletId}`, body, this.getHttpOptions())
      .pipe(
        map(response => {
          // Update local wallet data
          const currentWallet = this.walletSubject.value;
          if (currentWallet && currentWallet.wallet_id === walletId) {
            this.walletSubject.next({
              ...currentWallet,
              balance: newBalance,
              updated_at: new Date().toISOString()
            });
          }
          return response;
        })
      );
  }

  // Add money to wallet
  addMoneyToWallet(walletId: number, amount: number): Observable<any> {
    return this.getWalletById(walletId).pipe(
      map(wallet => {
        const newBalance = wallet.balance + amount;
        return this.updateWalletBalance(walletId, newBalance);
      })
    );
  }

  // Delete wallet
  deleteWallet(walletId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/wallets/${walletId}`, this.getHttpOptions());
  }

  // Get real transactions from backend
  getTransactions(userId: number): Observable<Transaction[]> {
    const url = `${this.apiUrl}/users/${userId}/transactions/simple`;
    console.log('Fetching transactions from:', url);
    
    return this.http.get<Transaction[]>(url, this.getHttpOptions())
      .pipe(
        map(response => {
          console.log('Transactions received:', response);
          // Ensure the response matches our Transaction interface
          return response.map(transaction => ({
            ...transaction,
            // Ensure status is lowercase for frontend consistency
            status: transaction.status.toLowerCase() as 'completed' | 'pending' | 'failed'
          }));
        }),
        catchError(error => {
          console.error('Error fetching transactions:', error);
          // Return empty array on error instead of throwing
          return [];
        })
      );
  }

  // Get detailed transactions with filtering
  getTransactionsDetailed(userId: number, type?: 'credit' | 'debit', limit?: number): Observable<any> {
    let url = `${this.apiUrl}/users/${userId}/transactions`;
    const params: string[] = [];
    
    if (type) params.push(`type=${type}`);
    if (limit) params.push(`limit=${limit}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<any>(url, this.getHttpOptions());
  }

  // Get transaction summary
  getTransactionSummary(userId: number): Observable<TransactionSummary> {
    const url = `${this.apiUrl}/users/${userId}/transactions/summary`;
    return this.http.get<TransactionSummary>(url, this.getHttpOptions());
  }

  // Create a payment (for testing)
  createPayment(driverWalletId: number, payerWalletId: number, amount: number, paymentMethod: string): Observable<any> {
    const body = {
      driver_wallet_id: driverWalletId,
      payer_wallet_id: payerWalletId,
      amount: amount,
      payment_status: 'Completed',
      payment_method: paymentMethod
    };
    return this.http.post(`${this.apiUrl}/payments`, body, this.getHttpOptions());
  }

  // Mock methods for payment methods (extend based on your backend implementation)
  getPaymentMethods(userId: number): Observable<PaymentMethod[]> {
    // Mock data - replace with actual API call when backend is implemented
    return new Observable(observer => {
      const mockPaymentMethods: PaymentMethod[] = [
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
      observer.next(mockPaymentMethods);
      observer.complete();
    });
  }

  // Process payment (mock implementation)
  processPayment(request: AddMoneyRequest): Observable<any> {
    // Mock payment processing - replace with actual payment gateway integration
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          message: 'Payment processed successfully',
          transaction_id: `txn_${Date.now()}`
        });
        observer.complete();
      }, 2000);
    });
  }

  // Utility method to handle errors
  private handleError(error: any): Observable<never> {
    console.error('Wallet Service Error:', error);
    console.error('Error status:', error.status);
    console.error('Error message:', error.message);
    console.error('Full error object:', error);
    throw error;
  }
}