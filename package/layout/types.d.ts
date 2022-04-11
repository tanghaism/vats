// 系统信息
import { RouteMeta } from 'vue-router';

export interface ISystem {
  // 系统标题
  title: string;
  // 系统Logo
  logo?: string;
  // 系统二级标题
  subTitle?: string;
}

// 菜单信息
export interface IMenu {
  name: string;
  path: string;
  meta: RouteMeta;
  children?: IMenu[];
  [props: string]: unknown;
}

// 布局状态
export interface ILayoutSate {
  collapsed: boolean;
  isMobile: boolean;
  transition: boolean;
  showSetting: boolean;
}

// 选中的menu
export interface IMenuSelected {
  openMenus: string[];
  selectedMenus: string[];
}

// 用户信息展示
export interface IUserInfo {
  nickname: string;
  avatar: string;
}
