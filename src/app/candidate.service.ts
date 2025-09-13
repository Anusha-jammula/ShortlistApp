import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, catchError, of } from 'rxjs';
import { Candidate } from './models';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private apiUrl = environment.apiUrl;
  private candidatesCache$: Observable<Candidate[]> | null = null;

  constructor(private http: HttpClient) {}

  getCandidates(): Observable<Candidate[]> {
    if (!this.candidatesCache$) {
      this.candidatesCache$ = this.http.get<any[]>(this.apiUrl).pipe(
        map(data => this.normalize(data)),
        shareReplay(1), // Cache the result
        catchError(error => {
          console.error('Error loading candidates:', error);
          return of([]);
        })
      );
    }
    return this.candidatesCache$;
  }

  private normalize(rawData: any[]): Candidate[] {
    return rawData.map(item => ({
      ...item,
      years_experience: item.work_experiences?.length || 0,
      salary_number: this.parseSalary(item.annual_salary_expectation?.['full-time']),
      score: 0,
      explanation: '',
      selected: false
    }));
  }

  private parseSalary(salaryStr: string): number {
    if (!salaryStr) return 0;
    const cleaned = salaryStr.replace(/[$,]/g, '');
    return parseInt(cleaned, 10) || 0;
  }
}
