import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {_HttpClient } from '@delon/theme';
import { CommonService } from '../../services/common.service';


@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styles: []
})
export class ForgetPasswordComponent implements OnInit {
  @Input() userName: string;

  forgetPasswordForm: FormGroup;
  isOkBtnDisabled = true;
  handleOk: any;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private http: _HttpClient,
    private common: CommonService
    ) {
    this.forgetPasswordForm = this.fb.group({
      userName: [ '', [ Validators.required ]],
      email   : [ '', [ Validators.email, Validators.required ] ],
      description : [ '', [ Validators.required ] ]
    });

    // 订阅form表单的合法性状态
    this.forgetPasswordForm.valueChanges.subscribe(data => {
      if (this.forgetPasswordForm.invalid) {
        this.isOkBtnDisabled = true;
      } else {
        this.isOkBtnDisabled = false;
      }
    });
  }

  ngOnInit() {
    // 初始化登录名
    this.forgetPasswordForm.controls.userName.setValue(this.userName);

    // 确认按钮提交事件
    this.handleOk = () => {
      for (const key of Object.keys(this.forgetPasswordForm.controls)) {
          this.forgetPasswordForm.controls[ key ].markAsDirty();
          this.forgetPasswordForm.controls[ key ].updateValueAndValidity();
      }
      if (this.forgetPasswordForm.controls.userName.invalid
        || this.forgetPasswordForm.controls.email.invalid
        || this.forgetPasswordForm.controls.description.invalid) {
        return;
      }

      return this.auth.forgetPassword({
        userName: this.forgetPasswordForm.controls.userName.value,
        email: this.forgetPasswordForm.controls.email.value,
        description: this.forgetPasswordForm.controls.description.value
      }).subscribe((res: any) => {
        this.common.showAlert({
          type: 'success',
          nzContent: '您的重置密码请求已经发送给管理员',
        });

      }, (err: any) => {
        this.common.showAlert({
          type: 'error',
          nzContent: '用户名输入错误，请重新输入'
        });
      });
    };
  }

}
