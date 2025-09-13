import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  // available options
  @Input() availableSkills: string[] = [];
  @Input() availableLocations: string[] = [];

  // selected values
  @Input() selectedSkills: string[] = [];
  @Input() selectedLocations: string[] = [];
  @Input() salary: number | null = null;
  @Input() years: number | null = null;
  @Input() blindMode = true;

  // open states
  skillsOpen = false;
  locationsOpen = false;

  // events
  @Output() reset = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() selectedSkillsChange = new EventEmitter<string[]>();
  @Output() selectedLocationsChange = new EventEmitter<string[]>();
  @Output() salaryChange = new EventEmitter<number | null>();
  @Output() yearsChange = new EventEmitter<number | null>();

  toggleSkillsDropdown() { this.skillsOpen = !this.skillsOpen; }
  toggleLocationsDropdown() { this.locationsOpen = !this.locationsOpen; }
  
  onCloseSidebar() {
    this.closeSidebar.emit();
  }

  onSkillToggle(skill: string, event: Event) {
    const input = event.target as HTMLInputElement | null;
    const checked = !!input && !!input.checked;
    const next = new Set(this.selectedSkills);
    checked ? next.add(skill) : next.delete(skill);
    this.selectedSkillsChange.emit(Array.from(next));
  }

  onLocationToggle(location: string, event: Event) {
    const input = event.target as HTMLInputElement | null;
    const checked = !!input && !!input.checked;
    const next = new Set(this.selectedLocations);
    checked ? next.add(location) : next.delete(location);
    this.selectedLocationsChange.emit(Array.from(next));
  }


  // Range slider properties
  yearsMin = 0;
  yearsMax = 15;
  yearsStep = 1;
  
  salaryMin = 50000;
  salaryMax = 200000;
  salaryStep = 5000;

  // Click tracking for mobile sidebar
  isAnyElementClicked = false;
  clickTimeout: any = null;
  
  // Track if OK buttons have been clicked
  yearsOkClicked = false;
  salaryOkClicked = false;

  onElementClick(): void {
    this.isAnyElementClicked = true;
    
    // Clear any existing timeout
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    
    // Set timeout to reset the flag after 2 seconds
    this.clickTimeout = setTimeout(() => {
      this.isAnyElementClicked = false;
    }, 2000);
  }

  onElementInteraction(): void {
    this.isAnyElementClicked = true;
    
    // Clear any existing timeout
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    
    // Set timeout to reset the flag after 3 seconds
    this.clickTimeout = setTimeout(() => {
      this.isAnyElementClicked = false;
    }, 3000);
  }

  onOkButtonClick(type: 'years' | 'salary'): void {
    if (type === 'years') {
      this.yearsOkClicked = true;
    } else if (type === 'salary') {
      this.salaryOkClicked = true;
    }
    
    // Emit the current value to apply the filter
    if (type === 'years') {
      this.yearsChange.emit(this.years);
    } else if (type === 'salary') {
      this.salaryChange.emit(this.salary);
    }
  }

  // Check if any OK button has been clicked
  get hasAnyOkClicked(): boolean {
    return this.yearsOkClicked || this.salaryOkClicked;
  }

  trackBySkill(index: number, skill: string): string {
    return skill;
  }

  trackByLocation(index: number, location: string): string {
    return location;
  }

  get totalLocationsCount(): number {
    return this.availableLocations.length;
  }

  // Helper methods for formatting
  formatYears(value: number | null): string {
    if (value === null || value === 0) return 'Any';
    return `${value}+ years`;
  }

  formatSalary(value: number | null): string {
    if (value === null) return 'Any';
    return `$${value.toLocaleString()}`;
  }
  
}


