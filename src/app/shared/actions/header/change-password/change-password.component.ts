import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { _HttpClient } from '@delon/theme';
import { CommonService } from '../../../services/common.service';

// 校验两次密码是否一致
export let matchOtherValidator = function(otherControlName: string) {
  let thisControl: FormControl;
  let otherControl: FormControl;
  return function matchOtherValidate(control: FormControl) {
    if (!control.parent) {
      return null;
    }
    // Initializing the validator.
    if (!thisControl) {
      thisControl = control;
      otherControl = control.parent.get(otherControlName) as FormControl;
      if (!otherControl) {
        throw new Error('matchOtherValidator(): other control is not found in parent group');
      }
      otherControl.valueChanges.subscribe(() => {
        thisControl.updateValueAndValidity();
      });
    }

    if (!otherControl) {
      return null;
    }

    if (otherControl.value !== thisControl.value) {
      return {
        matchOther: true
      };
    }

    return null;

  };

};

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styles: []
})
export class ChangePasswordComponent implements OnInit {

  changePasswordForm: FormGroup;
  isOkBtnDisabled = true;
  handleOk: any;
  secondLeft: number;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private http: _HttpClient,
    private router: Router,
    private common: CommonService
  ) {

    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      reNewPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20), matchOtherValidator('newPassword')]]
    });

    // 订阅form表单的合法性状态
    this.changePasswordForm.valueChanges.subscribe(data => {
      if (this.changePasswordForm.invalid) {
        this.isOkBtnDisabled = true;
      } else {
        this.isOkBtnDisabled = false;
      }
    });
  }

  ngOnInit() {
    // 确认按钮提交事件
    this.handleOk = () => {
      for (const key of Object.keys(this.changePasswordForm.controls)) {
        this.changePasswordForm.controls[key].markAsDirty();
        this.changePasswordForm.controls[key].updateValueAndValidity();
      }
      if (this.changePasswordForm.controls.oldPassword.invalid
        || this.changePasswordForm.controls.newPassword.invalid
        || this.changePasswordForm.controls.reNewPassword.invalid) {
        return;
      }

      if (this.changePasswordForm.controls.oldPassword.value === this.changePasswordForm.controls.newPassword.value) {
        this.common.toaster({
          type: 'warning',
          title: '修改密码:',
          content: '旧密码不能与新密码相同'
        });
        return;
      }

      return this.auth.forgetPassword({
        oldPassword: this.changePasswordForm.controls.oldPassword.value,
        newPassword: this.changePasswordForm.controls.newPassword.value,
      }).subscribe((res: any) => {
        this.secondLeft = 5;
        this.confirmToAuth();
        console.log(1);
      }, (err: any) => {
        this.common.showAlert({
          type: 'error',
          nzContent: '用户名输入错误，请重新输入'
        });
        console.log(err);
      }, () => {
        console.log(3);
        this.secondLeft = 5;
        this.confirmToAuth();
      }) ;
    };
  }

  private confirmToAuth() {
    this.common.showAlert({
      type: 'success',
      title: '修改密码成功:',
      nzOkText: '重新登录',
      nzContent: `<span [(ngModel)]="secondLeft">{{secondLeft}}</span>秒钟后自动跳转至登录界面，或直接点击"重新登录"`,
    }).afterClose.subscribe(() => {
      if ( timer ) {
        clearInterval(timer);
      }
      this.router.navigate(['/auth/login']);
    });

    const timer = setInterval(() => {
      this.secondLeft--;
      if (this.secondLeft === 0) {
          clearInterval(timer);

          this.router.navigate(['/auth/login']);
      }
    }, 1000);
  }

}
