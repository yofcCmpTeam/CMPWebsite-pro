import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { CookieService } from 'ngx-cookie-service';
import { SessionService } from '../../shared/utils/session';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';

const _ = require('lodash');

// 引入加密库
const CryptoJS = require('crypto-js');

// 导入用户信息的类型
import { UserInfoInterface } from '../utils/interface';
import { GlobalVariable } from '../../app.global';

@Injectable()
export class AuthService {

  constructor(
    private http: _HttpClient,
    private cookieService: CookieService,
    private sessionService: SessionService,
  ) { }

  // 定义是否登录父级数据中心标志位，默认为false，表示登录的是本数据中心，非父级数据中心，当aside-nav.compent.js中初始化菜单时，该值刷新
  // 意义在于这样其他组件共用这个service就能拿到该变量，不用再重复请求后台数据
  isGuestRegion = false;
  // 登录的项目是否是子项目标志位，默认为不是子项目
  isSonProject = false;
  // 用户信息
  loggedUserInfo: any;
  /**
   * 对密码进行加密
   * @param word 输入的密码
   */
  public encrypt(word: string): string {
    const key = CryptoJS.enc.Utf8.parse(GlobalVariable.PASSWORD_KEY);
    const srcs = CryptoJS.enc.Utf8.parse(word);
    const encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
  }

  /**
   * 对密码进行解密
   * @param word 加密的密码
   */
  public decrypt(word: string): string {
    const key = CryptoJS.enc.Utf8.parse(GlobalVariable.PASSWORD_KEY);
    const decrypted = CryptoJS.AES.decrypt(word, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return CryptoJS.enc.Utf8.stringify(decrypted).toString();
  }

  /**
   * name
   */
  public saveUserToLocal (remoteUserInfo) {
    return new Observable(() => {
      const userInfo = {
        userName: remoteUserInfo.userName,
        email: remoteUserInfo.email,
        currentProject: remoteUserInfo.currentProject,
        currentRegion: remoteUserInfo.currentRegion,
        projectList: remoteUserInfo.projectList,
        regionList: remoteUserInfo.regionList,
        userQuotaInfo: {},
        roleList: remoteUserInfo.roleList,
        pwdUnsafe: remoteUserInfo.pwdUnsafe || false,
        toApproveCount: remoteUserInfo.toApproveCount,
        unReadApprovedCount: remoteUserInfo.unReadApprovedCount,
        // pwdUnsafe: true
      };
      // 缓存到session
      this.sessionService.put(GlobalVariable.USER_INFO_CACHE_KEY, userInfo);

      /**
       * 受cookie存储大小仅为4k的限制
       * 放入到cookie中的信息，相较于$sessionStorage而言做了部分字段的删减,项目相关的都拿掉，在首页通过接口取查询
       * @ {{userName: *, currentProject: *, currentRegion: *, roleList: *}}
       */
      const cookieUser = {
        userName: remoteUserInfo.userName,
        // email: remoteUserInfo.email,
        currentProject: remoteUserInfo.currentProject,
        currentRegion: remoteUserInfo.currentRegion,
        // projectList: remoteUserInfo.projectList,
        // regionList: remoteUserInfo.regionList,
        userQuotaInfo: {},
        roleList: remoteUserInfo.roleList,
        hasEntered: false,
        pwdUnsafe: remoteUserInfo.pwdUnsafe || false,
        toApproveCount: remoteUserInfo.toApproveCount,
        unReadApprovedCount: remoteUserInfo.unReadApprovedCount,
        // pwdUnsafe: true
      };

      this.cookieService.set(GlobalVariable.USER_INFO_CACHE_KEY, JSON.stringify(cookieUser));
    });
  }

  /**
   * 登录
   * @param userName 账户
   * @param password 密码
   */
  public login(param: any): any {
    const userName = param.userName;
    const password = param.password;
    const login =  this.http.post('/rest/login/doLogin', {
      userName: this.encrypt(userName),
      password: this.encrypt(password),
      loginType: 1
    });

    // login.subscribe((res: UserInfoInterface) => {
    //   if (res) {
    //     // 缓存用户信息
    //     this.saveUserToLocal(JSON.stringify(res.data));
    //   }
    // });

    return login;
  }

  /**
   * 登出
   *
   */
  public logOut(): any {
    return this.http.post('/rest/login/doLoginOut', {});
  }


  /**
   * 忘记密码
   * @param userName 账户
   * @param email 邮箱
   * @param email 备注
   */
  public forgetPassword(param: any): any {
    const userName = param.userName;
    const email = param.email;
    const description = param.description;
    return this.http.post('/rest/user/forgetPassword', {
      userName: userName,
      email: email,
      description: description
    });
  }

  /**
   * 获取当前用户登录信息
   * @param userName 账户
   * @param email 邮箱
   * @param email 备注
   */

  public loggedInfo(): any {
    const cookieUser: UserInfoInterface = this.cookieService.check(GlobalVariable.USER_INFO_CACHE_KEY)
                                  && JSON.parse(this.cookieService.get(GlobalVariable.USER_INFO_CACHE_KEY));
    let localUserInfo: UserInfoInterface = this.sessionService.get(GlobalVariable.USER_INFO_CACHE_KEY);

    if (!cookieUser && !localUserInfo) {
      window.location.href = '/auth.html';
      return null;
    } else if ( localUserInfo && cookieUser ) {
      // localUserInfo和cookieUser信息不一致，即多tab页登录不同用户时
      if (localUserInfo.userName && (localUserInfo.userName !== cookieUser.userName)) {
        window.location.href = '/auth.html';
        this.sessionService.put(GlobalVariable.USER_INFO_CACHE_KEY, null);
        return null;
      }
    } else if (localUserInfo && !cookieUser) {
      // cookie用户信息不存在，那就重新登录吧
      window.location.href = '/auth.html';
      this.sessionService.put(GlobalVariable.USER_INFO_CACHE_KEY, null);
      return null;
    } else {
      // 最后只能是localUserInfo不存在，cookieUser存在
      localUserInfo = cookieUser;
    }

    if (localUserInfo.userName === undefined && cookieUser.userName === undefined) {
      // this.sessionService.put(GlobalVariable.USER_INFO_CACHE_KEY, null);
      return null;
    }

    return  {
      userName: localUserInfo.userName,
      projectId: localUserInfo.currentProject.id,
      regionId: localUserInfo.currentRegion.id,
      authData: localUserInfo.roleList,
    };
  }

  /**
   *  获取当前用户角色
   */
  public getCurrentRole(): string {
    const loggedInfo = this.loggedInfo();
    const origin = loggedInfo ? loggedInfo.authData : '';
    const isAdmin = _.indexOf(origin, 'admin') < 0 ? 0 : 1;
    const isMember = _.indexOf(origin, 'member') < 0 ? 0 : 1;
    const isUser = _.indexOf(origin, 'user') < 0 ? 0 : 1;

    if (isAdmin) {
        return 'admin';
    } else if (isUser) {
        return 'user';
    } else if (isMember) {
        return 'member';
    } else {
        return '';
    }
  }

  /**
   * 查询用户下的项目
   */
  public refreshProject() {
    return this.http.get(`rest/authority/user/projects`, {});
  }

  /**
   * 查询待处理工单数量
   */
  public refreshUnreadList(isPolling) {
    const headParams = isPolling ? {headers : {'Polling-Request' : 'Y'}} : {};
    return this.http.get(`rest/authority/user/orders`, headParams);
  }

  /**
   * 查询当前用户所有region（可以切换的数据中心）
   */
  public getRegionList() {
    return this.http.get(`rest/region/user/regions`, {});
  }

  /**
   * 获得详细的regions和所属的projectList，包括isDefault和isCurrent
   */
  public getDetailRegions() {
    return this.http.get(`/rest/authority/user/regions`, {});
  }

  /**
   * 获取用户配额信息
   */
  public getUserQuotaInfo(projectId: string): any {
    if (!projectId) {
      projectId = this.loggedInfo().projectId;
    }
    return this.http.get(`/rest/quota/${projectId}`, {});
  }


  /**
   * 切换当前项目
   * @param param.regionId 切换项目id
   */
  public switchProject(param) {
    const projectId = param.id;
    const Observ = this.http.get(`/rest/authority/region/${projectId}/switch`, {});
    Observ.subscribe((res) => {
      // 刷新当前视图
      // if (this.$state.$current.name !== 'yofc-cmp.cloud-resource-mgr.overview') {
      //   this.$state.reload(this.$state.current.name);
      // }
      // //如果切换至所有项目，即多项目工作模式
      // if (proj.id === 'ALL') {
      //     this.$sessionStorage.remoteUserInfo.workMode = 'MUTIPLE';
      // } else {
      //     //单项目模式
      //     this.$sessionStorage.remoteUserInfo.workMode = 'SINGLE';
      // }
      // //切换项目成功后workMode信息要回填至cookie中
      // let cookieUser = window.cookieUtil._getCurLoginUser()
      // if (cookieUser) {
      //     cookieUser.workMode = this.$sessionStorage.remoteUserInfo.workMode
      //     this.$cookies.putObject("_curLoginUser", cookieUser);
      //     this.$log.log("auth.service：161", cookieUser);
      // }
    });
    return Observ;
  }


  /**
   * 切换数据中心
   * @param param.regionId 数据中心id
   */
  public switchRegion(param) {
    const regionId = param.regionId;
    return this.http.get(`/rest/authority/region/${regionId}/switch`, {});
  }

  /**
   * 切换模式
   * @param mode:string 路径参数，模式，必填，值项：SINGLE，MULTIPLE
   */
  public switchRemotePattern(mode) {
    const Observ = this.http.get(`/rest/authority/region/${mode}/switch`, {});
    Observ.subscribe((res) => {
      // 刷新当前视图
      // if (this.$state.$current.name !== 'yofc-cmp.cloud-resource-mgr.overview') {
      //   this.$state.reload(this.$state.current.name);
      // }
    });
    return Observ;
  }

  // /**
  //  * 判断当前登录的用户所属的数据中心是不是他上级的父级数据中心
  //  */
  // public refleshGuestRegion(): any {
  //   const cookieUser: UserInfo = JSON.parse(this.cookieService.get(GlobalVariable.USER_INFO_COOKIE_KEY));
  //   if (cookieUser && cookieUser.currentRegion && cookieUser.currentRegion.parentRegionId !== '') {
  //       this.isGuestRegion = false;
  //       return
  //   } else {

  //   }
  // }

}

