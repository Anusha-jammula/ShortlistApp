import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
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
  @Input() blindMode = true;

  // open states
  skillsOpen = false;
  locationsOpen = false;

  // events
  @Output() apply = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() selectedSkillsChange = new EventEmitter<string[]>();
  @Output() selectedLocationsChange = new EventEmitter<string[]>();
  @Output() minSalaryChange = new EventEmitter<number | null>();
  @Output() maxSalaryChange = new EventEmitter<number | null>();
  @Output() blindModeChange = new EventEmitter<boolean>();

  toggleSkillsDropdown() { this.skillsOpen = !this.skillsOpen; }
  toggleLocationsDropdown() { this.locationsOpen = !this.locationsOpen; }

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
}


