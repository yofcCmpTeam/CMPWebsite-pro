import { Component, ChangeDetectionStrategy, Input, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { _HttpClient } from '@delon/theme';
import { CookieService } from 'ngx-cookie-service';
import { SessionService } from '../../../../shared/utils/session';

import { AuthService } from '../../../../shared/services/auth.service';
import { CommonService } from '../../../../shared/services/common.service';
import { GlobalVariable } from '../../../../app.global';

import { ChangePasswordComponent } from '../../../../shared/actions/header/change-password/change-password.component';

@Component({
  selector: 'header-user',
  template: `
  <nz-dropdown nzPlacement="bottomLeft">
    <a nz-dropdown class="title-link">
      <i class="yofc-icon yf yf-user"></i>
      <span>{{userName}}</span>
    </a>
    <ul nz-menu class="width-sm" style="paddding: 0px;">
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
export class HeaderUserComponent {
  // 接受用户名称
  @Input()
  userName: string;

  constructor(
    private router: Router,
    private injector: Injector,
    private authService: AuthService,
    private commonService: CommonService,
    private cookieService: CookieService,
    private sessionService: SessionService
  ) {}

  // 退出登录
  logout() {
    this.authService.logOut().subscribe(() => {
      // 清空缓存
      this.cookieService.delete(GlobalVariable.USER_INFO_CACHE_KEY, '/');
      this.sessionService.remove(GlobalVariable.USER_INFO_CACHE_KEY);
      // 停止请求
      this.injector.get(_HttpClient).end();
      this.commonService.showPreloader(() => {
        // 跳转到登录页
        this.router.navigate(['/auth/login']);
      });
    }, err => {
      // 某些场景下，禁止用户登出
      this.confirmToLogout(err.message);
    });
  }

  confirmToLogout(msg: string) {
    this.commonService.showAlert({
      type: 'wraning',
      nzTitle: '退出登录',
      nzContent: msg
    });
  }

  // 修改密码
  changePwd() {
    this.commonService.showComponentConfirm({
      nzTitle: '忘记密码',
      nzContent: ChangePasswordComponent,
      nzComponentParams: {
        userName: '',
      }
    });
  }
}
