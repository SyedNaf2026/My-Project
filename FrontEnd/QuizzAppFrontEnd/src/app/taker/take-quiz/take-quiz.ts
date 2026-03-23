import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../navbar/navbar';
import { QuizService } from '../../service/quiz.service';
import { QuestionService } from '../../service/question.service';
import { QuizAttemptService } from '../../service/quiz-attempt.service';
import { ToastService } from '../../service/toast.service';
import { AnswerDTO, QuestionDTO, QuizDTO, QuizResultDTO } from '../../models/models';

@Component({
  selector: 'app-take-quiz',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar],
  templateUrl: './take-quiz.html'
})
export class TakeQuiz implements OnInit, OnDestroy {
  quiz: QuizDTO | null = null;
  questions: QuestionDTO[] = [];
  answers: Map<number, number> = new Map();

  loading = true;
  loadError = false;
  errorMessage = '';
  submitting = false;
  submitted = false;
  quizStarted = false;     // confirmation gate — timer starts only after this
  result: QuizResultDTO | null = null;
  showResult = false;

  timeLeft = 0;
  private timerInterval: any = null;
  private warnedAt30 = false;
  private warnedAt10 = false;

  get currentQ(): number { return this.questions.filter(q => this.answers.has(q.id)).length; }
  get progress(): number { return this.questions.length ? (this.currentQ / this.questions.length) * 100 : 0; }

  get timerClass(): string {
    if (!this.quiz?.timeLimit) return 'timer-normal';
    const total = this.quiz.timeLimit * 60;
    if (this.timeLeft <= 10) return 'timer-danger';
    if (this.timeLeft <= 30 || this.timeLeft < total * 0.25) return 'timer-warning';
    return 'timer-normal';
  }

  get timerDisplay(): string {
    const m = Math.floor(this.timeLeft / 60);
    const s = this.timeLeft % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private questionService: QuestionService,
    private attemptService: QuizAttemptService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.setError('Invalid quiz ID.'); return; }

    this.quizService.getQuizById(id).subscribe({
      next: (res) => {
        if (!res.success || !res.data) { this.setError('Quiz not found.'); return; }
        this.quiz = res.data;
        this.cdr.detectChanges();

        this.questionService.getByQuiz(id).subscribe({
          next: (qRes) => {
            this.questions = qRes.data || [];
            this.loading = false;
            if (this.questions.length === 0) {
              this.setError('This quiz has no questions yet.');
              return;
            }
            if (this.quiz?.timeLimit) this.timeLeft = this.quiz.timeLimit * 60;
            this.cdr.detectChanges();
            // Timer starts only after user confirms on the confirmation screen
          },
          error: (err) => this.setError(err?.error?.message || 'Failed to load questions.')
        });
      },
      error: (err) => this.setError(err?.error?.message || 'Failed to load quiz.')
    });
  }

  private setError(msg: string): void {
    this.loading = false;
    this.loadError = true;
    this.errorMessage = msg;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  confirmStart(): void {
    this.quizStarted = true;
    this.cdr.detectChanges();
    setTimeout(() => { if (this.quiz?.timeLimit) this.startTimer(); }, 100);
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.cdr.detectChanges();

      // ⚡ Warnings
      if (this.timeLeft === 30 && !this.warnedAt30) {
        this.warnedAt30 = true;
        setTimeout(() => this.toast.error('⚠️ 30 seconds remaining!'), 0);
      }
      if (this.timeLeft === 10 && !this.warnedAt10) {
        this.warnedAt10 = true;
        setTimeout(() => this.toast.error('🚨 10 seconds left — hurry!'), 0);
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        setTimeout(() => this.toast.error('⏰ Time is up! Auto-submitting...'), 0);
        this.submit();
      }
    }, 1000);
  }

  selectAnswer(questionId: number, optionId: number): void {
    if (this.submitted) return;   // lock after submit
    this.answers.set(questionId, optionId);
    this.cdr.detectChanges();
  }

  isSelected(questionId: number, optionId: number): boolean {
    return this.answers.get(questionId) === optionId;
  }

  // After result: check if this option was the user's answer
  wasSelected(questionId: number, optionId: number): boolean {
    return this.answers.get(questionId) === optionId;
  }

  // After result: check if this option is the correct one
  isCorrectOption(questionId: number, optionId: number): boolean {
    const breakdown = this.result?.answerBreakdown.find(a => a.questionId === questionId);
    return breakdown?.correctOptionId === optionId;
  }

  // Button class during quiz (selected = primary)
  // Button class after submit (green = correct, red = wrong selection, outline = unselected)
  optionClass(questionId: number, optionId: number): string {
    if (!this.submitted) {
      return this.isSelected(questionId, optionId) ? 'btn-primary' : 'btn-outline';
    }
    const correct = this.isCorrectOption(questionId, optionId);
    const selected = this.wasSelected(questionId, optionId);
    if (correct) return 'btn-correct';
    if (selected && !correct) return 'btn-wrong';
    return 'btn-outline';
  }

  submit(): void {
    if (!this.quiz || this.submitting || this.submitted) return;
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    this.submitting = true;
    this.cdr.detectChanges();

    const answersArr: AnswerDTO[] = [];
    this.answers.forEach((selectedOptionId, questionId) => {
      answersArr.push({ questionId, selectedOptionId });
    });

    this.attemptService.submitQuiz({ quizId: this.quiz.id, answers: answersArr }).subscribe({
      next: (res) => {
        this.submitting = false;
        this.submitted = true;
        if (res.success && res.data) {
          this.result = res.data;
          this.cdr.detectChanges();
          // Delay result screen for instant feedback view
          setTimeout(() => {
            this.showResult = true;
            this.cdr.detectChanges();
          }, 1800);
        } else {
          setTimeout(() => this.toast.error(res.message || 'Submission failed.'), 0);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.submitting = false;
        this.submitted = false;
        const msg = err?.error?.message || err?.error?.Message || 'Submission failed.';
        setTimeout(() => this.toast.error(msg), 0);
        this.cdr.detectChanges();
      }
    });
  }
}
