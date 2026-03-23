import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../navbar/navbar';
import { QuizAttemptService } from '../../service/quiz-attempt.service';
import { ToastService } from '../../service/toast.service';
import { QuizResultDTO } from '../../models/models';

@Component({
  selector: 'app-my-results',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar],
  templateUrl: './my-results.html'
})
export class MyResults implements OnInit {
  results: QuizResultDTO[] = [];
  loading = true;

  constructor(
    private attemptService: QuizAttemptService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.attemptService.getMyResults().subscribe({
      next: (res) => {
        this.results = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.toast.error('Failed to load results.'), 0);
      }
    });
  }
}
