import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  allCandidates: Candidate[] = [];
  filteredCandidates: Candidate[] = [];
  shortlisted: Candidate[] = [];
  loading = true;

  // filter state
  availableSkills: string[] = [];
  availableLocations: string[] = [];
  allAvailableLocations: string[] = []; // Store all locations for reference
  selectedSkills: string[] = [];
  selectedLocations: string[] = [];
  minSalary: number | null = null;
  maxSalary: number | null = null;
  years: number | null = null;

  diversity: DiversitySummary | null = null;
  activeTab = 'results'; // Track active tab
  sidebarOpen = false; // Track sidebar visibility - start closed on mobile
  isMobile = false; // Track if we're on mobile

  constructor(private cs: CandidateService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeSidebarState();
    
    window.addEventListener('resize', () => {
      this.initializeSidebarState();
      this.cdr.detectChanges();
    });
    
    this.loadCandidates();
  }

  private loadCandidates(): void {
    this.loading = true;
    this.cs.getCandidates().subscribe({
      next: data => {
        this.allCandidates = data;
        this.filteredCandidates = data;
        this.computeAvailableFilters(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.loading = false;
        this.allCandidates = [];
        this.filteredCandidates = [];
        this.cdr.detectChanges();
      }
    });
  }

  refreshData(): void {
    this.loadCandidates();
    this.shortlisted = [];
    this.diversity = null;
  }

  private initializeSidebarState(): void {
    this.isMobile = window.innerWidth < 992;
    this.sidebarOpen = window.innerWidth >= 992;
  }

  private computeAvailableFilters(list: Candidate[]) {
    const skillSet = new Set<string>();
    const locationSet = new Set<string>();
    list.forEach(c => {
      (c.skills || []).forEach(s => { const v = (s || '').trim(); if (v) skillSet.add(v); });
      const loc = (c.location || '').trim(); if (loc) locationSet.add(loc);
    });
    this.availableSkills = Array.from(skillSet).sort((a,b)=>a.localeCompare(b));
    this.allAvailableLocations = Array.from(locationSet).sort((a,b)=>a.localeCompare(b));
    this.availableLocations = [...this.allAvailableLocations]; // Start with all locations
  }

  private computeAvailableLocationsForSkills(list: Candidate[], selectedSkills: string[]): string[] {
    if (selectedSkills.length === 0) {
      // If no skills selected, show all locations
      return this.allAvailableLocations;
    }

    const locationSet = new Set<string>();
    list.forEach(candidate => {
      // Check if candidate has all selected skills
      const candidateSkills = (candidate.skills || []).map(s => (s || '').toLowerCase());
      const hasAllSkills = selectedSkills.every(skill => 
        candidateSkills.includes(skill.toLowerCase())
      );
      
      if (hasAllSkills) {
        const loc = (candidate.location || '').trim();
        if (loc) locationSet.add(loc);
      }
    });
    
    return Array.from(locationSet).sort((a,b)=>a.localeCompare(b));
  }

  applyFilters(): void {
    if (this.minSalary !== null && this.minSalary < 50000) {
      alert('Minimum salary must be at least $50,000');
      return;
    }
    if (this.maxSalary !== null && (this.maxSalary < 50000 || this.maxSalary > 200000)) {
      alert('Maximum salary must be in between $50,000 and $200,000');
      return;
    }

    this.filteredCandidates = this.allCandidates.filter((c: Candidate) => {
      const hasSelectedSkills = this.selectedSkills.length > 0;
      const skillMatch = hasSelectedSkills
        ? this.selectedSkills.every(sel => (c.skills || []).map(s => (s || '').toLowerCase()).includes(sel.toLowerCase()))
        : true;

      const hasSelectedLocations = this.selectedLocations.length > 0;
      const locationMatch = hasSelectedLocations
        ? this.selectedLocations.map(l => l.toLowerCase()).includes((c.location || '').toLowerCase())
        : true;

      const minSalaryMatch = this.minSalary !== null ? (c.annual_salary_expectation['full-time'] ?? Infinity) >= ('$'+this.minSalary.toString()) : true;
      const maxSalaryMatch = this.maxSalary !== null ? (c.annual_salary_expectation['full-time'] ?? 0) <= ('$'+this.maxSalary.toString()) : true;

      const yearsMatch = this.years !== null ? (c.work_experiences?.length || 0) >= this.years : true;

      return skillMatch && locationMatch && minSalaryMatch && maxSalaryMatch && yearsMatch;
    });
    this.shortlisted = [];
    this.diversity = null;
    
    // Only close sidebar on mobile if no input is focused
    if (window.innerWidth < 992) {
      this.sidebarOpen = false;
    }
  }

  resetFilters(): void {
    this.selectedSkills = [];
    this.selectedLocations = [];
    this.minSalary = null;
    this.maxSalary = null;
    this.years = null;
    this.filteredCandidates = [...this.allCandidates];
    this.shortlisted = [];
    this.diversity = null;
    
    // Only close sidebar on mobile if no input is focused
    if (window.innerWidth < 992) {
      this.sidebarOpen = false;
    }
  }

  runAutoShortlist(): void {
    const top = autoShortlist(this.filteredCandidates, {
      mustHaveSkills: this.selectedSkills,
      targetCount: 5
    });
    // this.filteredCandidates = top;
    this.shortlisted = top;
    this.diversity = this.computeDiversity(top);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onSkillsChange(newSkills: string[]): void {
    this.selectedSkills = newSkills;
    // Update available locations based on selected skills
    this.availableLocations = this.computeAvailableLocationsForSkills(this.allCandidates, newSkills);
    
    // Automatically select all available locations for the selected skills
    this.selectedLocations = [...this.availableLocations];
    
    // Apply filters immediately when skills change
    this.applyFilters();
  }

  onLocationsChange(newLocations: string[]): void {
    this.selectedLocations = newLocations;
    // Apply filters immediately when locations change
    this.applyFilters();
  }

  onMinSalaryChange(newMinSalary: number | null): void {
    this.minSalary = newMinSalary;
    // Apply filters immediately when min salary changes
    this.applyFilters();
  }

  onMaxSalaryChange(newMaxSalary: number | null): void {
    this.maxSalary = newMaxSalary;
    // Apply filters immediately when max salary changes
    this.applyFilters();
  }

  onYearsChange(newYears: number | null): void {
    this.years = newYears;
    // Apply filters immediately when years change
    this.applyFilters();
  }

  // TrackBy functions for performance optimization
  trackByCandidate(index: number, candidate: Candidate): string {
    return candidate.email || index.toString();
  }

  trackBySkill(index: number, skill: string): string {
    return skill;
  }

  trackByLocation(index: number, location: string): string {
    return location;
  }

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


