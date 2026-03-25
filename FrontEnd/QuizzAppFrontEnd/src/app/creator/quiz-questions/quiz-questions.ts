import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, RouterModule, Navbar, ConfirmDialogComponent],
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
  editingId: number | null = null;
  editingText = '';
  editSaving = false;
  qText = '';
  qType = 'MultipleChoice';
  options: { optionText: string; isCorrect: boolean }[] = [
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false }
  ];
  questionTypes = [
    { value: 'MultipleChoice', label: 'Multiple Choice (1 correct)' },
    { value: 'MultipleAnswer', label: 'Multiple Answer (2+ correct)' },
    { value: 'TrueFalse', label: 'True / False' },
    { value: 'YesNo', label: 'Yes / No' }
  ];

  constructor(
    private questionService: QuestionService,
    private quizService: QuizService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  get isFixed(): boolean { return this.qType === 'TrueFalse' || this.qType === 'YesNo'; }

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));
    this.quizService.getQuizById(this.quizId).subscribe({
      next: (res) => { this.quizTitle = res.data?.title || ''; this.cdr.detectChanges(); }
    });
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.loading = true;
    this.questionService.getByQuiz(this.quizId).subscribe({
      next: (res) => { this.questions = res.data || []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  onTypeChange(): void {
    if (this.qType === 'TrueFalse') {
      this.options = [{ optionText: 'True', isCorrect: false }, { optionText: 'False', isCorrect: false }];
    } else if (this.qType === 'YesNo') {
      this.options = [{ optionText: 'Yes', isCorrect: false }, { optionText: 'No', isCorrect: false }];
    } else {
      this.options = [{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }];
    }
    this.cdr.detectChanges();
  }

  addOption(): void { this.options.push({ optionText: '', isCorrect: false }); }
  removeOption(i: number): void { this.options.splice(i, 1); }

  saveQuestion(): void {
    if (!this.qText.trim()) { setTimeout(() => this.toast.error('Question text is required.'), 0); return; }
    if (!this.isFixed && this.options.some(o => !o.optionText.trim())) { setTimeout(() => this.toast.error('Please fill in all option texts.'), 0); return; }
    const correct = this.options.filter(o => o.isCorrect).length;
    if (correct === 0) { setTimeout(() => this.toast.error('Mark at least one correct option.'), 0); return; }
    if (this.qType === 'MultipleAnswer' && correct < 2) { setTimeout(() => this.toast.error('Mark at least 2 correct options.'), 0); return; }
    if (this.qType !== 'MultipleAnswer' && correct !== 1) { setTimeout(() => this.toast.error('Mark exactly 1 correct option.'), 0); return; }
    this.saving = true;
    this.cdr.detectChanges();
    this.questionService.addQuestion({
      quizId: this.quizId,
      questionText: this.qText.trim(),
      questionType: this.qType,
      options: this.options.map(o => ({ optionText: o.optionText.trim(), isCorrect: o.isCorrect }))
    }).subscribe({
      next: (res) => {
        this.saving = false;
        this.cdr.detectChanges();
        if (res.success) {
          setTimeout(() => { this.showForm = false; this.resetForm(); this.loadQuestions(); this.toast.success('Question added!'); }, 0);
        } else {
          setTimeout(() => this.toast.error(res.message || 'Failed.'), 0);
        }
      },
      error: (err) => {
        this.saving = false;
        this.cdr.detectChanges();
        setTimeout(() => this.toast.error(err?.error?.message || 'Failed to add question.'), 0);
      }
    });
  }

  resetForm(): void {
    this.qText = '';
    this.qType = 'MultipleChoice';
    this.options = [{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }];
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  typeLabel(type: string): string {
    return this.questionTypes.find(t => t.value === type)?.label || type;
  }

  confirmDeleteQ(q: QuestionDTO): void { this.selectedQ = q; this.showConfirm = true; }

  doDeleteQ(): void {
    if (!this.selectedQ) return;
    this.questionService.deleteQuestion(this.selectedQ.id).subscribe({
      next: () => { this.showConfirm = false; this.loadQuestions(); setTimeout(() => this.toast.success('Question deleted.'), 0); },
      error: () => setTimeout(() => this.toast.error('Failed to delete.'), 0)
    });
  }

  startEdit(q: QuestionDTO): void { this.editingId = q.id; this.editingText = q.questionText; }
  cancelEdit(): void { this.editingId = null; this.editingText = ''; }

  saveEdit(q: QuestionDTO): void {
    if (!this.editingText.trim()) { setTimeout(() => this.toast.error('Question text cannot be empty.'), 0); return; }
    this.editSaving = true;
    this.questionService.updateQuestion(q.id, this.editingText.trim()).subscribe({
      next: (res) => {
        this.editSaving = false;
        this.editingId = null;
        if (res.success) {
          setTimeout(() => { q.questionText = this.editingText.trim(); this.cdr.detectChanges(); this.toast.success('Updated.'); }, 0);
        } else {
          setTimeout(() => this.toast.error(res.message || 'Update failed.'), 0);
        }
      },
      error: () => { this.editSaving = false; setTimeout(() => this.toast.error('Update failed.'), 0); }
    });
  }
}