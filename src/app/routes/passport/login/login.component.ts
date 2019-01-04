import { SettingsService, _HttpClient } from '@delon/theme';
import { Component, OnDestroy, Inject, Optional, ViewChild} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { CommonService } from '../../../shared/services/common.service';
import { AuthService } from '../../../shared/services/auth.service';

import {
  SocialService,
  SocialOpenType,
  TokenService,
  DA_SERVICE_TOKEN,
} from '@delon/auth';
import { ReuseTabService } from '@delon/abc';
import { environment } from '@env/environment';
import { StartupService } from '@core/startup/startup.service';

import { ForgetPasswordComponent } from '../../../shared/actions/forget-password/forget-password.component';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [SocialService],
})
export class UserLoginComponent implements OnDestroy {


  constructor(
    fb: FormBuilder,
    private modalSrv: NzModalService,
    public msg: NzMessageService,
    route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    private socialService: SocialService,
    @Optional()
    @Inject(ReuseTabService)
    private reuseTabService: ReuseTabService,
    // @Inject(DA_SERVICE_TOKEN) private tokenService: TokenService,
    private startupSrv: StartupService,
    public http: _HttpClient,
    private auth: AuthService,
    private common: CommonService
  ) {
    // if (route.snapshot.queryParamMap.has('clean')) {
    //   tokenService.clear();
    // }
    // 自定义验证器，组合html中的限制一起使用
    // 名称 1-25字符，密码4-20字符，都是必填
    this.form = fb.group({
      userName: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(25)]],
      password: [null, [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      remember: [false],
    });

    // 订阅form表单改变事件
    this.form.valueChanges.subscribe(data => {
      if (this.form.controls.userName.errors && this.form.controls.userName.errors.required  ) {
        this.error = '请输入您的账号或密码';
      } else {
        if (this.form.controls.password.errors && this.form.controls.password.errors.required  ) {
          this.error = '请输入您的账号或密码';
        } else if (this.form.controls.password.errors && this.form.controls.password.errors.minlength ) {
          this.error = '密码必须在6到20位之间';
        }
      }
    });
    // this.modalSrv.closeAll();
  }

  // #region fields

  get userName() {
    return this.form.controls.userName;
  }
  get password() {
    return this.form.controls.password;
  }


  form: FormGroup;
  // 错误信息
  error = '';
  // 是否开启大小写
  capital: boolean;

  // 大小写是否锁定
  toggleCpas(event: any) {
      const e = event || window.event;
      const keyCode = e.keyCode;
      if (keyCode === 20 && this.capital) {
          this.capital = false;
      } else if (keyCode === 20 && !this.capital) {
          this.capital = true;
      }
  }

  // 键盘输入事件，大小写是否锁定
  detectCapsLock(event: any) {
    const e = event || window.event;
    const keyCode = e.keyCode || e.which; // 按键的keyCode

    if ( keyCode >= 48 && keyCode <= 57
        || keyCode === 33 || keyCode === 61 || keyCode === 64 || keyCode === 45 || keyCode === 126
        || keyCode >= 35 && keyCode <= 38
        || keyCode >= 40 && keyCode <= 43
        || keyCode >= 94 && keyCode <= 96 ) {
        // 按退格键左边一排键位时不做任何操作
        return;
    }
    const isShift = e.shiftKey || (keyCode === 16) || false; // shift键是否按住
    if (
        ((keyCode >= 65 && keyCode <= 90) && !isShift) // Caps Lock 打开，且没有按住shift键
        ||
        ((keyCode >= 97 && keyCode <= 122) && isShift) // Caps Lock 打开，且按住shift键
    ) {
        this.capital = true;
    } else {
        this.capital = false;
    }
  }

  openForgotModel() {
    this.common.showComponentConfirm({
      nzTitle: '忘记密码',
      nzContent: ForgetPasswordComponent,
      nzComponentParams: {
        userName: this.userName.value,
      }
    });


  }

  submit() {
    this.error = '';
    this.userName.markAsDirty();
    this.userName.updateValueAndValidity();
    this.password.markAsDirty();
    this.password.updateValueAndValidity();
    if (this.userName.invalid || this.password.invalid) {
      return;
    }

    // if ( this.form.controls.remember ) {
    //   this.$cookies.remove('_loggedUser');
    // }
    // 默认配置中对所有HTTP请求都会强制 [校验](https://ng-alain.com/auth/getting-started) 用户 Token
    // 然一般来说登录请求不需要校验，因此可以在请求URL加上：`/login?_allow_anonymous=true` 表示不触发用户 Token 校验
    this.auth.login({
      userName: this.userName.value,
      password: this.password.value,
    }).subscribe((res: any) => {
        if (res.code !== 200) {
          // this.error = res.msg;
          return;
        }
        // 清空路由复用信息
        this.reuseTabService.clear();
        // 设置用户Token信息
        // this.tokenService.set(res.data);
        // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
        this.startupSrv.load().then(() => this.router.navigate(['/']));
      });
  }

  // #endregion

  ngOnDestroy(): void {
    // if (this.interval$) clearInterval(this.interval$);
  }
}
