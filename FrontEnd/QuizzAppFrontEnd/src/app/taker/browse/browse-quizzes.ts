import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../navbar/navbar';
import { QuizService } from '../../service/quiz.service';
import { CategoryService } from '../../service/category.service';
import { ToastService } from '../../service/toast.service';
import { CategoryDTO, QuizDTO } from '../../models/models';

@Component({
  selector: 'app-browse-quizzes',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar],
  templateUrl: './browse-quizzes.html'
})
export class BrowseQuizzes implements OnInit {
  quizzes: QuizDTO[] = [];
  filtered: QuizDTO[] = [];
  paged: QuizDTO[] = [];
  categories: CategoryDTO[] = [];
  loading = true;
  search = '';
  categoryId: number | null = null;
  difficulty = '';
  page = 1;
  pageSize = 6;
  totalPages = 1;
  pages: number[] = [];

  get pageStart() { return (this.page - 1) * this.pageSize + 1; }
  get pageEnd() { return Math.min(this.page * this.pageSize, this.filtered.length); }

  constructor(
    private quizService: QuizService,
    private categoryService: CategoryService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (r) => {
        this.categories = r.data || [];
        this.cdr.detectChanges();
      }
    });
    this.load();
  }

  load(catId?: number): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.quizService.getActiveQuizzes(catId).subscribe({
      next: (res) => {
        this.quizzes = res.data || [];
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.toast.error('Failed to load quizzes.'), 0);
      }
    });
  }

  applyFilter(): void {
    const q = this.search.toLowerCase();
    this.filtered = this.quizzes.filter(quiz =>
      (!q || quiz.title.toLowerCase().includes(q) || (quiz.description || '').toLowerCase().includes(q)) &&
      (!this.difficulty || (quiz.difficulty || '') === this.difficulty)
    );
    this.page = 1;
    this.updatePage();
  }

  updatePage(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.page - 1) * this.pageSize;
    this.paged = this.filtered.slice(start, start + this.pageSize);
    this.cdr.detectChanges();
  }

  onSearch(e: Event): void {
    this.search = (e.target as HTMLInputElement).value;
    this.applyFilter();
  }

  onCategoryFilter(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    this.categoryId = val ? Number(val) : null;
    this.load(this.categoryId || undefined);
  }

  onDifficultyFilter(e: Event): void {
    this.difficulty = (e.target as HTMLSelectElement).value;
    this.applyFilter();
  }

  goToPage(p: number): void {
    this.page = p;
    this.updatePage();
  }
}
