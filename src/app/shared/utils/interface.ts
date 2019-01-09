/**
 * 自定义数据类型
 */

/**
 * 用户信息
 */
export interface UserInfoInterface {
  data: {
    userName: string;
    email: string;
    currentProject: any;
    currentRegion: any;
    projectList: any;
    regionList: any;
    userQuotaInfo: any;
    roleList: any;
    pwdUnsafe: boolean;
    toApproveCount: number;
    unReadApprovedCount: number;
  };
  userName: string;
  email: string;
  currentProject: any;
  currentRegion: any;
  projectList: any;
  regionList: any;
  userQuotaInfo: any;
  roleList: any;
  pwdUnsafe: boolean;
  toApproveCount: number;
  unReadApprovedCount: number;
  workMode: string;
}

/**
 * 接口响应数据类型
 */
export interface ResponseInterface {
  code: number;
  data: {};
  message: string;
}
