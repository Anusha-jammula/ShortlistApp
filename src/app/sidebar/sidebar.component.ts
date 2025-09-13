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
  @Output() okButtonClicked = new EventEmitter<'years' | 'salary'>();

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

  yearsMin = 0;
  yearsMax = 15;
  yearsStep = 1;
  
  salaryMin = 50000;
  salaryMax = 200000;
  salaryStep = 5000;

  onOkButtonClick(type: 'years' | 'salary'): void {
    this.okButtonClicked.emit(type);
  }

  onRangeChange(type: 'years' | 'salary', value: number): void {
    if (type === 'years') {
      this.years = value;
      this.yearsChange.emit(value);
    } else if (type === 'salary') {
      this.salary = value;
      this.salaryChange.emit(value);
    }
  }

  trackBySkill(index: number, skill: string): string {
    return skill;
  }

  trackByLocation(index: number, location: string): string {
    return location;
  }

  formatYears(value: number | null): string {
    if (value === null || value === 0) return 'Any';
    return `${value}+ years`;
  }

  formatSalary(value: number | null): string {
    if (value === null) return 'Any';
    return `$${value.toLocaleString()}`;
  }
  
}


