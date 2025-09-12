import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Candidate } from './models';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private apiUrl = 'https://file.notion.so/f/f/f86ed84d-b33c-4dfb-b0e0-97c5661516a3/3ed586a1-78e7-46af-9cf1-0961f95b5109/form-submissions-1.json?table=block&id=2575392c-c93e-81c2-94b0-f93e6998cce9&spaceId=f86ed84d-b33c-4dfb-b0e0-97c5661516a3&expirationTimestamp=1757682585498&signature=qyWejhUXBpvTfW6_YV4nxy53_1C1BnbBiEipEnc3M94&downloadName=form-submissions.json';
  constructor(private http: HttpClient) {}


  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl);
  }
 
}
