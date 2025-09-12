import { Component, OnInit } from '@angular/core';
import { CandidateService } from '../candidate.service';
import { Candidate } from '../models';
import { autoShortlist } from '../shortlist-algo';

interface DiversitySummary {
  total: number;
  uniqueLocations: number;
  avgExperience: number;
  topSchoolCount: number;
  skillsCovered: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  allCandidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  shortlisted: Candidate[] = [];
  loading = true;

  // filter state
  availableSkills: string[] = [];
  availableLocations: string[] = [];
  selectedSkills: string[] = [];
  selectedLocations: string[] = [];
  minSalary: number | null = null;
  maxSalary: number | null = null;
  blindMode = true;

  diversity: DiversitySummary | null = null;

  constructor(private cs: CandidateService) {}

  ngOnInit(): void {
    this.cs.getCandidates().subscribe({
      next: data => {
        this.allCandidates = data;
        this.filteredCandidates = data;
        this.computeAvailableFilters(data);
        this.loading = false;
      },
      error: err => {
        console.error('Error loading candidates', err);
        this.loading = false;
      }
    });
  }

  private computeAvailableFilters(list: Candidate[]) {
    const skillSet = new Set<string>();
    const locationSet = new Set<string>();
    list.forEach(c => {
      (c.skills || []).forEach(s => { const v = (s || '').trim(); if (v) skillSet.add(v); });
      const loc = (c.location || '').trim(); if (loc) locationSet.add(loc);
    });
    this.availableSkills = Array.from(skillSet).sort((a,b)=>a.localeCompare(b));
    this.availableLocations = Array.from(locationSet).sort((a,b)=>a.localeCompare(b));
  }

  applyFilters(): void {
    this.filteredCandidates = this.allCandidates.filter((c: Candidate) => {
      const hasSelectedSkills = this.selectedSkills.length > 0;
      const skillMatch = hasSelectedSkills
        ? this.selectedSkills.every(sel => (c.skills || []).map(s => (s || '').toLowerCase()).includes(sel.toLowerCase()))
        : true;

      const hasSelectedLocations = this.selectedLocations.length > 0;
      const locationMatch = hasSelectedLocations
        ? this.selectedLocations.map(l => l.toLowerCase()).includes((c.location || '').toLowerCase())
        : true;

      const minSalaryMatch = this.minSalary !== null ? (c.salary_number ?? Infinity) >= this.minSalary : true;
      const maxSalaryMatch = this.maxSalary !== null ? (c.salary_number ?? 0) <= this.maxSalary : true;

      return skillMatch && locationMatch && minSalaryMatch && maxSalaryMatch;
    });
    this.shortlisted = [];
    this.diversity = null;
  }

  resetFilters(): void {
    this.selectedSkills = [];
    this.selectedLocations = [];
    this.minSalary = null;
    this.maxSalary = null;
    this.filteredCandidates = [...this.allCandidates];
    this.shortlisted = [];
    this.diversity = null;
  }

  runAutoShortlist(): void {
    const top = autoShortlist(this.filteredCandidates, {
      mustHaveSkills: this.selectedSkills,
      targetCount: 5
    });
    this.shortlisted = top;
    this.diversity = this.computeDiversity(top);
  }

  toggleBlind(): void { this.blindMode = !this.blindMode; }

  private computeDiversity(list: Candidate[]): DiversitySummary {
    const total = list.length;
    const locations = new Set<string>(list.map(c => (c.location || '').trim()).filter(Boolean));
    const avgExperience = total ? Math.round(((list.reduce((s, c) => s + (c.years_experience || 0), 0)) / total) * 10) / 10 : 0;
    const topSchoolCount = list.filter(c => c.education?.degrees?.some(d => d.isTop25 || d.isTop50)).length;
    const skillSet = new Set<string>();
    list.forEach(c => (c.skills || []).forEach(s => skillSet.add((s || '').toLowerCase())));
    return { total, uniqueLocations: locations.size, avgExperience, topSchoolCount, skillsCovered: skillSet.size };
  }
}


