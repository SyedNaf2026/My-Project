import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../navbar/navbar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';
import { QuestionService } from '../../service/question.service';
import { QuizService } from '../../service/quiz.service';
import { ToastService } from '../../service/toast.service';
import { QuestionDTO } from '../../models/models';

@Component({
  selector: 'app-quiz-questions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Navbar, ConfirmDialogComponent],
  templateUrl: './quiz-questions.html'
})
export class QuizQuestions implements OnInit {
  quizId = 0;
  quizTitle = '';
  questions: QuestionDTO[] = [];
  loading = true;
  showForm = false;
  saving = false;
  showConfirm = false;
  selectedQ: QuestionDTO | null = null;
  qForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private questionService: QuestionService,
    private quizService: QuizService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.qForm = this.fb.group({
      questionText: ['', Validators.required],
      options: this.fb.array([this.newOption(), this.newOption()])
    });
  }

  get optionsArray(): FormArray { return this.qForm.get('options') as FormArray; }

  newOption(): FormGroup {
    return this.fb.group({ optionText: ['', Validators.required], isCorrect: [false] });
  }

  addOption(): void { this.optionsArray.push(this.newOption()); }
  removeOption(i: number): void { this.optionsArray.removeAt(i); }

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (res) => { this.quizTitle = res.data?.title || ''; }
    });
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.questionService.getByQuiz(this.quizId).subscribe({
      next: (res) => {
        this.questions = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.toast.error('Failed to load questions.'), 0);
      }
    });
  }

  addQuestion(): void {
    if (this.qForm.invalid) { this.qForm.markAllAsTouched(); return; }

    // Validate exactly one correct option is selected
    const opts = this.optionsArray.value as { optionText: string; isCorrect: boolean }[];
    const correctCount = opts.filter(o => o.isCorrect === true).length;
    if (correctCount === 0) {
      setTimeout(() => this.toast.error('Please mark exactly one option as correct.'), 0);
      return;
    }
    if (correctCount > 1) {
      setTimeout(() => this.toast.error('Only one option can be marked as correct.'), 0);
      return;
    }

    this.saving = true;
    this.cdr.detectChanges();

    const payload = {
      quizId: this.quizId,
      questionText: this.qForm.value.questionText,
      options: opts.map(o => ({ optionText: o.optionText, isCorrect: o.isCorrect === true }))
    };

    this.questionService.addQuestion(payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.cdr.detectChanges();
        if (res.success) {
          setTimeout(() => this.toast.success('Question added!'), 0);
          this.showForm = false;
          this.resetForm();
          this.loadQuestions();
        } else {
          setTimeout(() => this.toast.error(res.message || 'Failed to add question.'), 0);
        }
      },
      error: (err) => {
        this.saving = false;
        this.cdr.detectChanges();
        const msg = err?.error?.message || 'Failed to add question.';
        setTimeout(() => this.toast.error(msg), 0);
      }
    });
  }

  resetForm(): void {
    // Clear and rebuild the form array cleanly
    while (this.optionsArray.length > 0) this.optionsArray.removeAt(0);
    this.optionsArray.push(this.newOption());
    this.optionsArray.push(this.newOption());
    this.qForm.get('questionText')?.reset('');
    this.qForm.markAsPristine();
    this.qForm.markAsUntouched();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  confirmDeleteQ(q: QuestionDTO): void {
    this.selectedQ = q;
    this.showConfirm = true;
  }

  doDeleteQ(): void {
    if (!this.selectedQ) return;
    this.questionService.deleteQuestion(this.selectedQ.id).subscribe({
      next: () => {
        setTimeout(() => this.toast.success('Question deleted.'), 0);
        this.showConfirm = false;
        this.loadQuestions();
      },
      error: () => setTimeout(() => this.toast.error('Failed to delete question.'), 0)
    });
  }
}
