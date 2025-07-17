import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RiderService } from '../../../services/rider.service';

@Component({
  selector: 'app-rider-help',
  templateUrl: './rider-help.component.html',
  styleUrls: ['./rider-help.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class RiderHelpComponent {
  expandedFaq: number | null = null;

  constructor(private riderService: RiderService) {}

  // Toggle FAQ item
  toggleFaq(faqId: number) {
    this.expandedFaq = this.expandedFaq === faqId ? null : faqId;
  }

  // Report an issue
  reportIssue() {
    console.log('Reporting issue');
    this.riderService.showMessage('Issue reporting feature coming soon!', 'success');
  }

  // Request refund
  requestRefund() {
    console.log('Requesting refund');
    this.riderService.showMessage('Refund request feature coming soon!', 'success');
  }

  // Provide feedback
  provideFeedback() {
    console.log('Providing feedback');
    this.riderService.showMessage('Feedback feature coming soon!', 'success');
  }
}