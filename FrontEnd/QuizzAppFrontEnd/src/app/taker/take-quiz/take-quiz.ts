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

  // Single-answer map: questionId → selectedOptionId
  answers: Map<number, number> = new Map();
  // Multi-answer map: questionId → Set of selected optionIds
  multiAnswers: Map<number, Set<number>> = new Map();
  // Skipped question IDs
  skipped: Set<number> = new Set();

  // Active question index in navigator
  currentIndex = 0;

  loading = true;
  loadError = false;
  errorMessage = '';
  submitting = false;
  submitted = false;
  quizStarted = false;
  result: QuizResultDTO | null = null;
  showResult = false;

  timeLeft = 0;
  private timerInterval: any = null;
  private warnedAt30 = false;
  private warnedAt10 = false;

  get currentQuestion(): QuestionDTO | null {
    return this.questions[this.currentIndex] ?? null;
  }

  get answeredCount(): number {
    return this.questions.filter(q => this.isAnswered(q.id)).length;
  }

  get progress(): number {
    return this.questions.length ? (this.answeredCount / this.questions.length) * 100 : 0;
  }

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
    this.currentIndex = 0;
    this.cdr.detectChanges();
    setTimeout(() => { if (this.quiz?.timeLimit) this.startTimer(); }, 100);
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.cdr.detectChanges();
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

  // ── Navigator ──────────────────────────────────────────────
  goToQuestion(index: number): void {
    if (this.submitted) return;
    this.currentIndex = index;
    this.cdr.detectChanges();
  }

  skipQuestion(): void {
    if (!this.currentQuestion) return;
    this.skipped.add(this.currentQuestion.id);
    // Move to next unanswered/unskipped question, or just next
    const next = this.findNext();
    if (next !== -1) this.currentIndex = next;
    this.cdr.detectChanges();
  }

  private findNext(): number {
    for (let i = this.currentIndex + 1; i < this.questions.length; i++) {
      if (!this.isAnswered(this.questions[i].id) && !this.skipped.has(this.questions[i].id)) return i;
    }
    // wrap around
    for (let i = 0; i < this.currentIndex; i++) {
      if (!this.isAnswered(this.questions[i].id) && !this.skipped.has(this.questions[i].id)) return i;
    }
    return this.currentIndex + 1 < this.questions.length ? this.currentIndex + 1 : this.currentIndex;
  }

  questionStatus(q: QuestionDTO): 'answered' | 'skipped' | 'unanswered' | 'active' {
    if (this.questions[this.currentIndex]?.id === q.id && !this.submitted) return 'active';
    if (this.isAnswered(q.id)) return 'answered';
    if (this.skipped.has(q.id)) return 'skipped';
    return 'unanswered';
  }

  isAnswered(questionId: number): boolean {
    const q = this.questions.find(x => x.id === questionId);
    if (!q) return false;
    if (q.questionType === 'MultipleAnswer') {
      return (this.multiAnswers.get(questionId)?.size ?? 0) > 0;
    }
    return this.answers.has(questionId);
  }

  // ── Single-answer selection ─────────────────────────────────
  selectAnswer(questionId: number, optionId: number): void {
    if (this.submitted) return;
    this.skipped.delete(questionId);
    this.answers.set(questionId, optionId);
    this.cdr.detectChanges();
  }

  isSelected(questionId: number, optionId: number): boolean {
    return this.answers.get(questionId) === optionId;
  }

  // ── Multi-answer selection ──────────────────────────────────
  toggleMultiAnswer(questionId: number, optionId: number): void {
    if (this.submitted) return;
    this.skipped.delete(questionId);
    if (!this.multiAnswers.has(questionId)) this.multiAnswers.set(questionId, new Set());
    const set = this.multiAnswers.get(questionId)!;
    if (set.has(optionId)) set.delete(optionId);
    else set.add(optionId);
    this.cdr.detectChanges();
  }

  isMultiSelected(questionId: number, optionId: number): boolean {
    return this.multiAnswers.get(questionId)?.has(optionId) ?? false;
  }

  // ── Result helpers ──────────────────────────────────────────
  wasSelected(questionId: number, optionId: number): boolean {
    return this.answers.get(questionId) === optionId;
  }

  wasMultiSelected(questionId: number, optionId: number): boolean {
    const bd = this.result?.answerBreakdown.find(a => a.questionId === questionId);
    return bd?.selectedOptionIds?.includes(optionId) ?? false;
  }

  isCorrectOption(questionId: number, optionId: number): boolean {
    const bd = this.result?.answerBreakdown.find(a => a.questionId === questionId);
    if (!bd) return false;
    if (bd.questionType === 'MultipleAnswer') return bd.correctOptionIds?.includes(optionId) ?? false;
    return bd.correctOptionId === optionId;
  }

  optionClass(q: QuestionDTO, optionId: number): string {
    if (!this.submitted) {
      if (q.questionType === 'MultipleAnswer') {
        return this.isMultiSelected(q.id, optionId) ? 'btn-primary' : 'btn-outline';
      }
      return this.isSelected(q.id, optionId) ? 'btn-primary' : 'btn-outline';
    }
    const correct = this.isCorrectOption(q.id, optionId);
    const selected = q.questionType === 'MultipleAnswer'
      ? this.wasMultiSelected(q.id, optionId)
      : this.wasSelected(q.id, optionId);
    if (correct) return 'btn-correct';
    if (selected && !correct) return 'btn-wrong';
    return 'btn-outline';
  }

  // ── Submit ──────────────────────────────────────────────────
  submit(): void {
    if (!this.quiz || this.submitting || this.submitted) return;
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    this.submitting = true;
    this.cdr.detectChanges();

    const answersArr: AnswerDTO[] = this.questions.map(q => {
      if (q.questionType === 'MultipleAnswer') {
        return {
          questionId: q.id,
          selectedOptionId: 0,
          selectedOptionIds: Array.from(this.multiAnswers.get(q.id) ?? [])
        };
      }
      return {
        questionId: q.id,
        selectedOptionId: this.answers.get(q.id) ?? 0,
        selectedOptionIds: []
      };
    });

    this.attemptService.submitQuiz({ quizId: this.quiz.id, answers: answersArr }).subscribe({
      next: (res) => {
        this.submitting = false;
        this.submitted = true;
        if (res.success && res.data) {
          this.result = res.data;
          this.cdr.detectChanges();
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
