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
  @Input() minSalary: number | null = null;
  @Input() maxSalary: number | null = null;
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
  @Output() minSalaryChange = new EventEmitter<number | null>();
  @Output() maxSalaryChange = new EventEmitter<number | null>();
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
  
  minSalaryMin = 50000;
  minSalaryMax = 200000;
  minSalaryStep = 5000;
  
  maxSalaryMin = 50000;
  maxSalaryMax = 200000;
  maxSalaryStep = 5000;

  // Focus tracking for mobile sidebar
  isAnyElementFocused = false;

  onElementFocus(): void {
    this.isAnyElementFocused = true;
  }

  onElementBlur(): void {
    // Add a small delay to prevent immediate closing when switching between elements
    setTimeout(() => {
      this.isAnyElementFocused = false;
    }, 1000);
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


