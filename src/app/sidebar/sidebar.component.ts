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
  @Input() years: number | null = null;
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
  @Output() yearsChange = new EventEmitter<number | null>();
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

  onKeyPress(event: KeyboardEvent): boolean {
    const key = event.key;
    const input = event.target as HTMLInputElement;
  
    // allow control keys (Backspace, Delete, Tab, Escape, Enter)
    const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'];
    if (controlKeys.includes(key) || (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(key.toLowerCase()))) {
      return true;
    }
  
    // only digits allowed
    if (!/^\d$/.test(key)) {
      event.preventDefault();
      return false;
    }
  
    // disallow '0' as first char
    if (key === '0' && input.value.length === 0) {
      event.preventDefault();
      return false;
    }
  
    return true;
  }
  
  onPaste(event: ClipboardEvent): void {
    const input = event.target as HTMLInputElement;
    const pasteData = event.clipboardData?.getData('text') ?? '';
  
    // only allow digits and not start with 0 if empty
    if (!/^\d+$/.test(pasteData) || (pasteData.startsWith('0') && input.value.length === 0)) {
      event.preventDefault();
    }
  }
  
}


