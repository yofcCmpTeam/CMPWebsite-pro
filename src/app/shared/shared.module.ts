import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
// delon
import { AlainThemeModule } from '@delon/theme';
import { DelonABCModule } from '@delon/abc';
import { DelonACLModule } from '@delon/acl';
import { DelonFormModule } from '@delon/form';
// i18n
import { TranslateModule } from '@ngx-translate/core';

// #region third libs
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CountdownModule } from 'ngx-countdown';

const THIRDMODULES = [
  NgZorroAntdModule,
  CountdownModule
];

// #region your componets & directives
// actoins
import { ForgetPasswordComponent } from './actions/forget-password/forget-password.component';
import { ChangePasswordComponent } from './actions/header/change-password/change-password.component';

const MODELCOMPONENTS = [
  ForgetPasswordComponent,
  ChangePasswordComponent
];
const DIRECTIVES = [];
// #endregion

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    AlainThemeModule.forChild(),
    DelonABCModule,
    DelonACLModule,
    DelonFormModule,
    // third libs
    ...THIRDMODULES
  ],
  declarations: [
    // your components
    ...MODELCOMPONENTS,
    ...DIRECTIVES,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AlainThemeModule,
    DelonABCModule,
    DelonACLModule,
    DelonFormModule,
    // i18n
    TranslateModule,
    // third libs
    ...THIRDMODULES,
    // your components
    ...MODELCOMPONENTS,
    ...DIRECTIVES
  ],
  // 注意 model如果使用Component模式，则需要在NgModule中的 declarations 和 entryComponents 加入自定义的Component
  entryComponents: [
    ...MODELCOMPONENTS
  ]
})
export class SharedModule { }
