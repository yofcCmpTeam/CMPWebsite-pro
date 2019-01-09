import {
  Component,
  OnInit,
  HostBinding,
  Input,
  ElementRef,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

import { AuthService } from '../../../../shared/services/auth.service';
// 导入用户信息的类型
import { UserInfoInterface, ResponseInterface } from '../../../../shared/utils/interface';
import { GlobalVariable } from '../../../../app.global';

// changeDetection 检测模型和视图之间绑定的数据的是否发生了改变
// OnPush检测机制
@Component({
  selector: 'header-project',
  template: `
    <nz-dropdown (nzVisibleChange)="change($event)">
        <a nz-dropdown class="current-project-link">
          <i class="yofc-icon yf yf-project"></i>
          <span>当前项目：3423432432423</span>
        </a>
        <ul nz-menu *ngIf="isFatherLadmin">
          <li nz-menu-item ngFor="userInfo.projectList">1st menu item</li>
        </ul>
        <ul nz-menu>
          <li nz-menu-item>1st menu item</li>
          <li nz-menu-item>2nd menu item</li>
          <li nz-submenu>
            <span title>sub menu</span>
            <ul>
              <li nz-menu-item>3rd menu item</li>
              <li nz-menu-item>4th menu item</li>
            </ul>
          </li>
          <li nz-submenu nzDisabled>
            <span title>disabled sub menu</span>
            <ul>
              <li nz-menu-item>3rd menu item</li>
              <li nz-menu-item>4th menu item</li>
            </ul>
          </li>
        </ul>
      </nz-dropdown>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HeaderProjectComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private cookieService: CookieService
  ) {}
  // 是否上级数据中心admin
  isFatherLadmin = false;
  // 项目列表
  projectList: any;
  // 当前数据中心
  currentProject: string;
  // 用户数据
  userInfo: UserInfoInterface;

  // 是否是admin
  private isLocalAdmin() {
    return this.authService.getCurrentRole() === 'admin';
  }

  // 获取
  private name() {

  }

  ngOnInit() {
    this.userInfo = this.authService.loggedInfo();
    console.log('prject:', this.userInfo);

    // 获取当前用户的项目列表
    this.authService.refreshProject().subscribe((res: ResponseInterface) => {
      console.log('res:', res);
      const projectList = res.data;
      this.projectList = projectList;


    });
  }
  change() {

  }
}
