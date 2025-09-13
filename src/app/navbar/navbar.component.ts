import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  @Output() runShortlist = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() refreshData = new EventEmitter<void>();
}


