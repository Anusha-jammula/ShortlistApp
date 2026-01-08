import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CandidateService } from '../candidate.service';
import { Candidate } from '../models';
import { autoShortlist } from '../shortlist-algo';
import { SidebarComponent } from '../sidebar/sidebar.component';

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
  salary: number | null = null;
  years: number | null = null;

  diversity: DiversitySummary | null = null;
  activeTab = 'results'; // Track active tab
  sidebarOpen = false; // Track sidebar visibility - start closed on mobile
  isMobile = false; // Track if we're on mobile

  @ViewChild('sidebarRef') sidebarRef!: SidebarComponent;

  get diversityMetrics() {
    if (!this.diversity) return [];
    return [
      { value: this.diversity.total, label: 'Total', color: 'primary' },
      { value: this.diversity.uniqueLocations, label: 'Locations', color: 'success' },
      { value: this.diversity.avgExperience, label: 'Avg Exp', color: 'info' },
      { value: this.diversity.topSchoolCount, label: 'Top Schools', color: 'warning' },
      { value: this.diversity.skillsCovered, label: 'Skills', color: 'danger' },
    ];
  }

  constructor(private cs: CandidateService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
// TEST

console.log('test git mergre')



// TEST END



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
        console.log(this.filteredCandidates);
        
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
    this.activeTab = 'results';
    this.cdr.detectChanges();
    this.shortlisted = [];
    this.loadCandidates();
    this.diversity = null;
    this.salary = null;
    this.years = null;
    this.selectedSkills = [];
    this.selectedLocations = [];
    this.availableLocations = [...this.allAvailableLocations];
    if (this.sidebarRef) {
      this.sidebarRef.resetDropdownStates();
    }
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
    if (this.salary !== null && (this.salary < 50000 || this.salary > 200000)) {
      alert('Salary must be between $50,000 and $200,000');
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

      const salaryMatch = this.salary !== null ? this.parseSalary(c.annual_salary_expectation['full-time']) >= this.salary : true;

      const yearsMatch = this.years !== null ? (c.work_experiences?.length || 0) >= this.years : true;

      return skillMatch && locationMatch && salaryMatch && yearsMatch;
    });
    this.shortlisted = [];
    this.diversity = null;
    
    // If no candidates found, switch to results tab
    if (this.filteredCandidates.length === 0) {
      this.activeTab = 'results';
    }
    
    // Don't automatically close sidebar - only OK button should close it
  }

  resetFilters(): void {
    this.selectedSkills = [];
    this.selectedLocations = [];
    this.salary = null;
    this.years = null;
    this.filteredCandidates = [...this.allCandidates];
    this.shortlisted = [];
    this.diversity = null;
    this.activeTab = 'results'; // Always switch to results tab when resetting
    
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
    // Automatically switch to Shortlist Summary tab
    this.activeTab = 'shortlist';
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

  onSalaryChange(newSalary: number | null): void {
    this.salary = newSalary;
    this.applyFilters();
  }

  onYearsChange(newYears: number | null): void {
    this.years = newYears;
    this.applyFilters();
  }

  onOkButtonClicked(type: 'years' | 'salary'): void {
    // OK button clicked - now we can dismiss the sidebar on mobile
    if (window.innerWidth < 992) {
      this.sidebarOpen = false;
    }
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

  private parseSalary(salaryStr: string): number {
    if (!salaryStr) return 0;
    const cleaned = salaryStr.replace(/[$,]/g, '');
    return parseInt(cleaned, 10) || 0;
  }
}


