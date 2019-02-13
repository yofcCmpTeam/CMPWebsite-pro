import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SettingsService } from '@delon/theme';
import { CookieService } from 'ngx-cookie-service';

import { AuthService } from '../../../shared/services/auth.service';
// 导入用户信息的类型
import { UserInfoInterface, ResponseInterface } from '../../../shared/utils/interface';
import { GlobalVariable } from '../../../app.global';
import { SessionService } from '../../../shared/utils/session';


import * as _ from 'lodash';

@Component({
  selector: 'layout-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {

  // 是否上级数据中心admin
  isFatherLadmin = false;
  // 数据中心列表
  regionList: any;
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

  constructor(
    public settings: SettingsService,
    private authService: AuthService,
    private cookieService: CookieService,
    private sessionService: SessionService
    ) { }

  toggleCollapsedSidebar() {
    this.settings.setLayout('collapsed', !this.settings.layout.collapsed);
  }

  ngOnInit() {
    this.currentProject = '所有项目';
    let cookieUser, cp;
    if (this.cookieService.check(GlobalVariable.USER_INFO_CACHE_KEY)) {
      cookieUser = JSON.parse(this.cookieService.get(GlobalVariable.USER_INFO_CACHE_KEY));
      cp = cookieUser ? cookieUser.currentProject : '';
    }
    const remoteUserInfo = this.sessionService.get(GlobalVariable.USER_INFO_CACHE_KEY);
    /**
     *
     * 跨tab页登录信息丢失解决方案，从$sessionStorage或cookie里拿用户登录信息
     * 下面根据user信息会初始化redux
     */
    if (remoteUserInfo || cookieUser) {
      this.userInfo = cookieUser || remoteUserInfo;
      console.log('userInfo:', this.userInfo);
      /**
       * 测试中有发现多tab页，第二个tab页先退出登录再以高权限账户登录时
       * 需要取cookie中的登录信息，覆盖掉原来的$sessionStorage中的旧数据
       * 所以不仅要判断$sessionStorage中 有没有数据，而且还要考虑其中的数据是否正确是否最新
       */
      if (cookieUser) {
        // 另行获取用户的配额信息
        const curProject = this.userInfo.currentProject.id ? this.userInfo.currentProject : cp;
        this.getUserQuotaInfo(curProject.id).subscribe(res => {
          // 回填配额信息
          this.userInfo.userQuotaInfo = res.data.data;
          // 回填工作模式
          this.userInfo.workMode = curProject.id === 'ALL' ? 'MUTIPLE' : 'SINGLE' ;
          if (!this.userInfo.currentProject.id) {
            this.userInfo.currentProject = cp;
          }
          // 缓存到session
          this.sessionService.put(GlobalVariable.USER_INFO_CACHE_KEY, this.userInfo);
          // 同步缓存到cookie
          this.cookieService.set(GlobalVariable.USER_INFO_CACHE_KEY, JSON.stringify(this.userInfo));
        });

        // 获取数据中心列表
        this.authService.getRegionList().subscribe((res: ResponseInterface) => {
          const regionList = res.data;
          this.regionList = regionList;
          _.forEach(this.regionList, (region) => {
            region.projectList = [];
          });
          // 更新是否为子项目标识符,下面方法体会依赖this.regionList数据，故写在这里的回调里
          this.authService.isSonProject = this._isSonProject(curProject);
          // 初始化是否是父级数据中心ladmin标识符
          this.isFatherLadmin = this.isLocalAdmin() && this._isFatherMember();
          // 上级数据中心默认列表第一个为全部
          if (this.isFatherLadmin) {
            this.regionList = _.concat([{
              id: 'ALL',
              regionId: 'ALL',
              isCurrent: true,
              regionDisplayName: '所有项目',
              projectList: []
            }], this.regionList);
          }

        });

        // 获取当前用户的项目列表
        this.authService.refreshProject().subscribe((res: ResponseInterface) => {
          console.log('projectList:', res.data);
          const projectList = res.data;
          this.projectList = projectList;
          // 将项目放入对应的数据中心
          _.forEach(this.regionList, (region) => {
            _.forEach(this.projectList, (project) => {
              if (region.regionId === project.regionId) {
                region.projectList.push(project);
              }
            });
          });
          console.log('regionList:', this.regionList);
          console.log('this.userInfo:', this.userInfo);
        });

      }

    }
  }

  // 装载用户配额信息
  getUserQuotaInfo(projectId) {
    return this.authService.getUserQuotaInfo(projectId);
    // resp.subscribe(res => {
    //   const data = res.data.data;
    //   // //触发更新用户配额信息的动作
    //   // this.$ngRedux.dispatch(actions.set_user_quota_info(data));
    //   this.userInfo.userQuotaInfo = data;
    //   // 并缓存到本地
    //   // 缓存到session
    //   this.sessionService.put(GlobalVariable.USER_INFO_CACHE_KEY, this.userInfo);
    // }, err => {
    //     console.log(err);
    // });
    // return resp;
  }

  selectProject(event) {
    console.log(event);
  }

  /**
   * 切换的项目是否是子数据中心的项目
   * 会刷新auth.service.js中的标识位
   *
   */
  private _isSonProject(proj) {
      // 默认不是子数据中心的项目
      const result = {
          flag: false
      };
      const isFatherMember = this._isFatherMember();
      if (isFatherMember) {
          const fr = this._getFatherRegion();
          const frId = fr ? fr.regionId : '';
          // 切换的项目的数据中心id（regionId）等于父级数据中心的id，则证明该project是父级数据中心的项目，而不是子数据中心的项目
          result.flag = proj.regionId !== frId;
      }
      // this.$log.log("是否是子项目：", result.flag);
      return result.flag;
  }

  /**
   * 封装私有方法，判断当前登录用户是否属于父数据中心
   * @since 2018/06/07 by chengjiajun
   * 同步非阻塞方法
   *
   */
  private _isFatherMember() {
    const obj = {
        'result': false
    };
    const regions = this.regionList;
    if (regions && regions.length > 0) {
        const r = _.find(regions, item => item.parentRegionId === '');
        if (r && r.defaultRegion) {
            obj.result = true;
        }
    }
    return obj.result;
  }

  /**
   * 新增私有方法，判断待切换的数据中心是否为当前数据中心的直接父节点
   *
   */
  private _isFatherRegion(proj) {
    const regionList = this.regionList;
    if (regionList && regionList.length > 0) {
      // ie不支持原生find方法，这里改用lodash的find方法
      const r = _.find(regionList, item => item.regionId === this.userInfo.currentRegion.id);
      if (r) {
          return r.parentRegionId === proj.regionId;
      }
    }
  }

  /**
   * 获得父级数据中心
   *
   */
  private _getFatherRegion() {
    const regionList = this.regionList;
    if (regionList && regionList.length > 0) {
        // 通过父级数据中心id字段为“”来判断它是不是一个父级数据中心
        return _.find(regionList, item => item.parentRegionId === '');
    }
  }
  change() {

  }

}
