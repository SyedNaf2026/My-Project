import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, UpdateProfileDTO, UserProfileDTO } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = 'https://localhost:7220/api/user';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ApiResponse<UserProfileDTO>> {
    return this.http.get<ApiResponse<UserProfileDTO>>(`${this.baseUrl}/profile`);
  }

  updateProfile(data: UpdateProfileDTO): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.baseUrl}/profile`, data);
  }
}
