import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { SettingsService } from '@delon/theme';

import { AuthService } from '../../../../shared/services/auth.service';

@Component({
  selector: 'header-order',
  template: `
    <nz-dropdown nzPlacement="bottomLeft">
      <a nz-dropdown class="title-link">
        <i class="yofc-icon yf yf-workorder"></i>
        <nz-badge nzDot [nzShowDot]="true" style="margin-left: 6px">
          <span>工单</span>
        </nz-badge>
      </a>
      <ul nz-menu class="width-sm" style="paddding: 0px;">
        <li nz-menu-item (click)="changePwd(item)" *ngFor="let item of getOrderList()">
          <i class="yofc-icon yf {{item.iconClass}}"></i>
          <span class="{{item.menuSubTitleClass}}">{{item.menuTitle}}:</span>
          <span class="trailTxt">{{item.menuSubTitle}}</span>
        </li>
        <li nz-menu-item (click)="changePwd()">
          <i class="yofc-icon yf yf-lock"></i>
          <span>修改密码</span>
        </li>
        <li nz-menu-divider></li>
        <li nz-menu-item (click)="logout()">
          <i class="yofc-icon yf yf-power-off"></i>
          <span>退出登录</span>
        </li>
      </ul>
    </nz-dropdown>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderOrderComponent {
  loading = true;

  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
  ) {
    // this.authService.getAuthHeaderData();
   }

   getOrderList() {
     return this.settingsService.user.header;
   }

  // change() {
  //   setTimeout(() => {
  //     this.loading = false;
  //     this.cdr.detectChanges();
  //   }, 500);
  // }
}
