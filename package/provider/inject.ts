import { nextTick, reactive, toRaw } from 'vue';
import { RouteLocationNormalizedLoaded } from 'vue-router';

export interface ILocalSetting {
  darkMode: boolean; // 是否启用深色模式
  tabVisible: boolean; // 是否显示页面tab控件
  tabFixed: boolean; // tab控件是否固定在顶部
}

export interface IProvider extends ILocalSetting {
  refresh: boolean; // 刷新页面
  cached: string[]; // keep-alive缓存的页面组件数组
  [props: string]: unknown;
}

const HTML = document.querySelector('html') as HTMLHtmlElement;

export const vatsProvider: IProvider = {
  refresh: true,
  cached: [],
  darkMode: false,
  tabVisible: true,
  tabFixed: true,
};

export function initVatsProvider() {
  const localSetting = localStorage.getItem('vats-setting');
  let defaultData: ILocalSetting = {
    darkMode: false,
    tabFixed: true,
    tabVisible: true,
  };
  try {
    if (localSetting) {
      defaultData = JSON.parse(localSetting);
    }
  } catch (e) {}

  if (defaultData.darkMode) {
    HTML.setAttribute('vats-mode', 'dark');
  }

  return reactive<IProvider>({
    ...defaultData,
    cached: [],
    refresh: true,
  });
}

export function setVatsProvider(provider: IProvider) {
  const { darkMode, tabFixed, tabVisible } = toRaw(provider);
  if (darkMode) {
    HTML.setAttribute('vats-mode', 'dark');
  } else {
    HTML.removeAttribute('vats-mode');
  }
  localStorage.setItem('vats-setting', JSON.stringify({ darkMode, tabFixed, tabVisible }));
}

export async function resetCached(
  provider: IProvider,
  route: RouteLocationNormalizedLoaded,
  resetAll = false, // 刷新所有页面组件的缓存
) {
  if (resetAll) {
    provider.cached = [];
  } else {
    // 清除当前路由缓存
    if (route.meta.cached !== false) {
      provider.cached = provider.cached.filter((name: string) => route.name !== name);
    }
  }
  provider.refresh = false;
  await nextTick();
  // 添加当前路由缓存
  if (route.meta.cached !== false) {
    provider.cached = [...provider.cached, route.name as string];
  }
  provider.refresh = true;
  return true;
}
