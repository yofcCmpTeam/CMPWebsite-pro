import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';

// 引入加密库
const CryptoJS = require('crypto-js');


@Injectable()
export class AuthService {

  constructor(
    private http: _HttpClient
  ) { }

  // 定义是否登录父级数据中心标志位，默认为false，表示登录的是本数据中心，非父级数据中心，当aside-nav.compent.js中初始化菜单时，该值刷新
  // 意义在于这样其他组件共用这个service就能拿到该变量，不用再重复请求后台数据
  isGuestRegion = false;
  // 登录的项目是否是子项目标志位，默认为不是子项目
  isSonProject = false;

  /**
   * 对密码进行加密
   * @param word 输入的密码
   */
  public encrypt(word: string): string {
    const key = CryptoJS.enc.Utf8.parse('yofcloud-saltkey');
    const srcs = CryptoJS.enc.Utf8.parse(word);
    const encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
  }

  /**
   * 对密码进行解密
   * @param word 加密的密码
   */
  public decrypt(word: string): string {
    const key = CryptoJS.enc.Utf8.parse('yofcloud-saltkey');
    const decrypted = CryptoJS.AES.decrypt(word, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return CryptoJS.enc.Utf8.stringify(decrypted).toString();
  }

  /**
   * 登录
   * @param userName 账户
   * @param password 密码
   */
  public login(param: any): any {
    const userName = param.userName;
    const password = param.password;
    return this.http.post('/rest/login/doLogin', {
        userName: this.encrypt(userName),
        password: this.encrypt(password),
        loginType: 1
      });
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



}
