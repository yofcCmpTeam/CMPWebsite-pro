import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

// 基础布局
import { LayoutDefaultComponent } from './default/default.component';
import { LayoutFullScreenComponent } from './fullscreen/fullscreen.component';
import { SidebarComponent } from './default/sidebar/sidebar.component';
import { HeaderComponent } from './default/header/header.component';

// 头部组件
import { HeaderProjectComponent } from './default/header/components/project.component';
import { HeaderRegionComponent } from './default/header/components/region.component';
import { HeaderOrderComponent } from './default/header/components/order.component';
import { HeaderUserComponent } from './default/header/components/user.component';
import { HeaderDateComponent } from './default/header/components/date.component';

// // 设置
// import { SettingDrawerComponent } from './default/setting-drawer/setting-drawer.component';
// import { SettingDrawerItemComponent } from './default/setting-drawer/setting-drawer-item.component';

// const SETTINGDRAWER = [SettingDrawerComponent, SettingDrawerItemComponent];

const COMPONENTS = [
  LayoutDefaultComponent,
  LayoutFullScreenComponent,
  HeaderComponent,
  SidebarComponent,
  // ...SETTINGDRAWER
];

// 头部组件
const HEADERCOMPONENTS = [
  HeaderProjectComponent,
  HeaderRegionComponent,
  HeaderOrderComponent,
  HeaderUserComponent,
  HeaderDateComponent
];

// passport
import { LayoutPassportComponent } from './passport/passport.component';
const PASSPORT = [
  LayoutPassportComponent
];

@NgModule({
  imports: [SharedModule],
  // entryComponents: SETTINGDRAWER,
  entryComponents: [],
  declarations: [
    ...COMPONENTS,
    ...HEADERCOMPONENTS,
    ...PASSPORT
  ],
  exports: [
    ...COMPONENTS,
    ...PASSPORT
  ]
})
export class LayoutModule { }
