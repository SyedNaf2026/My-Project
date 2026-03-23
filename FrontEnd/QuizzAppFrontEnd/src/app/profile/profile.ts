import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { UserService } from '../service/user.service';
import { ToastService } from '../service/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Navbar],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  form: FormGroup;
  loading = true;
  saving = false;
  role = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (res) => {
        if (res.data) {
          this.form.patchValue({ fullName: res.data.fullName, email: res.data.email });
          this.role = res.data.role;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.toast.error('Failed to load profile.'), 0);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.cdr.detectChanges();
    this.userService.updateProfile(this.form.value).subscribe({
      next: (res) => {
        this.saving = false;
        this.cdr.detectChanges();
        if (res.success) {
          localStorage.setItem('user-name', this.form.value.fullName);
          localStorage.setItem('user-email', this.form.value.email);
          setTimeout(() => this.toast.success('Profile updated!'), 0);
        } else {
          setTimeout(() => this.toast.error(res.message), 0);
        }
      },
      error: () => {
        this.saving = false;
        this.cdr.detectChanges();
        setTimeout(() => this.toast.error('Update failed.'), 0);
      }
    });
  }
}
