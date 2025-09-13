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
}


