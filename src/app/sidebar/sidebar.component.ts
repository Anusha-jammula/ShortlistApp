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


  // Dropdown options
  yearsOptions = [
    { value: null, label: 'Any' },
    { value: 1, label: '1+ years' },
    { value: 2, label: '2+ years' },
    { value: 3, label: '3+ years' },
    { value: 4, label: '4+ years' },
    { value: 5, label: '5+ years' },
    { value: 6, label: '6+ years' },
    { value: 7, label: '7+ years' },
    { value: 8, label: '8+ years' },
    { value: 9, label: '9+ years' },
    { value: 10, label: '10+ years' }
  ];

  minSalaryOptions = [
    { value: null, label: 'Any' },
    { value: 50000, label: '$50,000' },
    { value: 60000, label: '$60,000' },
    { value: 70000, label: '$70,000' },
    { value: 80000, label: '$80,000' },
    { value: 90000, label: '$90,000' },
    { value: 100000, label: '$100,000' },
    { value: 110000, label: '$110,000' },
    { value: 120000, label: '$120,000' },
    { value: 130000, label: '$130,000' },
    { value: 140000, label: '$140,000' },
    { value: 150000, label: '$150,000' }
  ];

  maxSalaryOptions = [
    { value: null, label: 'Any' },
    { value: 60000, label: '$60,000' },
    { value: 70000, label: '$70,000' },
    { value: 80000, label: '$80,000' },
    { value: 90000, label: '$90,000' },
    { value: 100000, label: '$100,000' },
    { value: 110000, label: '$110,000' },
    { value: 120000, label: '$120,000' },
    { value: 130000, label: '$130,000' },
    { value: 140000, label: '$140,000' },
    { value: 150000, label: '$150,000' },
    { value: 160000, label: '$160,000' },
    { value: 170000, label: '$170,000' },
    { value: 180000, label: '$180,000' },
    { value: 190000, label: '$190,000' },
    { value: 200000, label: '$200,000' }
  ];

  trackBySkill(index: number, skill: string): string {
    return skill;
  }

  trackByLocation(index: number, location: string): string {
    return location;
  }

  get totalLocationsCount(): number {
    return this.availableLocations.length;
  }
  
}


