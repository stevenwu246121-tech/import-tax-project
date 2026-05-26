import { Component } from '@angular/core';

import { SidebarComponent }
from '../../shared/sidebar/sidebar.component';

import { RouterOutlet }
from '@angular/router';

@Component({
  selector: 'app-main-layout',

  standalone: true,

  imports: [
    SidebarComponent,
    RouterOutlet
  ],

  templateUrl: './main-layout.component.html',

  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {

}
