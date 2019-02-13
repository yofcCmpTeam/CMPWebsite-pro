/**
 * 定义一些全局变量
 *
 *  Object.freeze()，返回被冻结的对象，
 * 不能修改、删除已有属性，
 * 以及不能修改该对象已有属性的可枚举性、可配置性、可写性。
 **/

export const GlobalVariable = Object.freeze({
  ACCOUNT_INFO_KEY: '_loggedUser', // 用户的账户信息 ：账户 密码 是否记住密码
  PASSWORD_KEY: 'yofcloud-saltkey', // 密码加密解密的key
  USER_INFO_CACHE_KEY: 'yofc-remoteUserInfo', // 用户信息缓存的的 key： cookie | local | session
  VERSION: 'V100R001C01B021'  // start:2018-12-20 19:50, end:
});
