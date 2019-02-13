import { Injectable, Injector, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { zip } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MenuService, SettingsService, TitleService, ALAIN_I18N_TOKEN } from '@delon/theme';
// import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ACLService } from '@delon/acl';
import { TranslateService } from '@ngx-translate/core';
import { I18NService } from '../i18n/i18n.service';

import { NzIconService } from 'ng-zorro-antd';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../shared/services/auth.service';
import { ICONS_AUTO } from '../../../style-icons-auto';
import { ICONS } from '../../../style-icons';
import { GlobalVariable } from '../../app.global';
import { SessionService } from '../../shared/utils/session';

// 获取用户基础数据


/**
 * 用于应用启动时
 * 一般用来获取应用所需要的基础数据等
 */
@Injectable()
export class StartupService {
  constructor(
    iconSrv: NzIconService,
    private menuService: MenuService,
    private translate: TranslateService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private settingService: SettingsService,
    private aclService: ACLService,
    private titleService: TitleService,
    // @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private httpClient: HttpClient,
    private injector: Injector,
    private cookieService: CookieService,
    private authService: AuthService,
    private sessionService: SessionService,
  ) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }

  private viaHttp(data: any, resolve: any, reject: any) {
    zip(
      this.httpClient.get(`assets/tmp/i18n/${this.i18n.defaultLang}.json`),
      this.httpClient.get('assets/tmp/app-data.json')
    ).pipe(
      // 接收其他拦截器后产生的异常消息
      catchError(([langData, appData]) => {
          resolve(null);
          return [langData, appData];
      })
    ).subscribe(([langData, appData]) => {
      // console.log('appData:', appData);
      // console.log('data:', data);
      // setting language data
      this.translate.setTranslation(this.i18n.defaultLang, langData);
      this.translate.setDefaultLang(this.i18n.defaultLang);

      // 应用信息：包括站点名、描述、年份
      this.settingService.setApp(appData.app);
      // 设置页面标题的前缀
      this.titleService.prefix = appData.app.name;
      // 当前用户否已登录
      const hasLogin = this.cookieService.check(GlobalVariable.USER_INFO_CACHE_KEY);

      if (hasLogin ) {
        // 获取当前登录角色 admin，padmn，puser
        const role = this.authService.getCurrentRole();
        if (role) {
          // 用户信息：包括姓名、头像、邮箱地址
          this.settingService.setUser(appData.user[role]);

          if (role === 'admin') {
              // ACL：设置权限为全量
            this.aclService.setFull(true);
          } else if (role === 'user') {
            this.aclService.set(['padmin']);
          } else if (role === 'momber') {
            this.aclService.set(['puser']);
          }


          // 初始化菜单
          this.menuService.add(appData[`${role}-menu`]);
        }
      } else {
        this.injector.get(Router).navigateByUrl('/auth/login');
      }
    },
    () => { },
    () => {
      resolve(null);
    });
  }

  load(data: any): Promise<any> {
    // only works with promises
    // https://github.com/angular/angular/issues/15088
    return new Promise((resolve, reject) => {
      // http
      this.viaHttp(data , resolve, reject);
    });
  }
}
