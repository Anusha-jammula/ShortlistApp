import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  @Input() showShortlistButton = true;
  @Output() runShortlist = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() refreshData = new EventEmitter<void>();

  onRefreshClick(): void {
    // Emit refresh event on click
    this.refreshData.emit();
  }

  onRefreshTouch(event: TouchEvent): void {
    // Prevent default touch behavior
    event.preventDefault();
    // Emit refresh event immediately on touch
    this.refreshData.emit();
  }

  onHamburgerTouch(event: TouchEvent): void {
    // Prevent default touch behavior
    event.preventDefault();
    // Emit toggle sidebar event immediately on touch
    this.toggleSidebar.emit();
  }
}


