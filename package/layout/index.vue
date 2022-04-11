<template>
  <a-layout class="vats-h-full">
    <!--  PC端侧边栏  -->
    <div
      v-show="!layoutState.isMobile"
      :class="{ 'vats-layout-transition': !layoutState.isMobile }"
      :style="{ width: siderWidth }"
    />
    <a-layout-sider
      v-show="!layoutState.isMobile"
      v-model:collapsed="layoutState.collapsed"
      collapsible
      :trigger="null"
      class="vats-layout-sider vats-h-full vats-flex vats-flex-column"
    >
      <VatsSider :system="system" :collapsed="layoutState.collapsed" :menu="menu" />
    </a-layout-sider>
    <!--  移动端侧边栏  -->
    <a-drawer
      placement="left"
      width="200px"
      :closable="false"
      :visible="drawerSiderVisible"
      :bodyStyle="{ padding: 0, height: '100%' }"
      @close="layoutState.collapsed = false"
    >
      <a-layout-sider
        class="vats-h-full vats-flex vats-flex-column"
        collapsible
        theme="light"
        style="overflow: hidden"
        :collapsed="false"
        :trigger="null"
      >
        <VatsSider :system="system" :collapsed="layoutState.collapsed" :menu="menu" />
      </a-layout-sider>
    </a-drawer>
    <!--  内容布局  -->
    <a-layout>
      <a-layout-header class="vats-layout-header vats-flex">
        <VatsHeader
          :collapsed="layoutState.collapsed"
          :userInfo="userInfo"
          @handleMenuToggle="layoutState.collapsed = !layoutState.collapsed"
          @handleShowSetting="layoutState.showSetting = true"
        />
      </a-layout-header>
      <VatsTab
        v-if="settingProvider.tabVisible"
        :class="[
          settingProvider.tabFixed ? 'vats-tab-fixed' : '',
          !layoutState.isMobile && layoutState.transition ? 'vats-layout-transition' : '',
        ]"
        :style="{
          width:
            settingProvider.tabFixed && !layoutState.isMobile
              ? `calc(100% - ${siderWidth})`
              : `100%`,
        }"
        @refreshCache="handleRefreshCache"
      />
      <div style="height: 42px" v-if="settingProvider.tabVisible && settingProvider.tabFixed"></div>
      <a-layout-content>
        <router-view v-slot="{ Component }">
          <transition name="slid-up" mode="out-in">
            <keep-alive :include="cached">
              <component
                :is="Component"
                :key="(Component || {}).name"
                v-if="settingProvider.refresh"
              />
            </keep-alive>
          </transition>
        </router-view>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        &copy; {{ copyRightYear }} Vats
      </a-layout-footer>
    </a-layout>
  </a-layout>
  <VatsSetting
    v-model:visible="layoutState.showSetting"
    :userInfo="userInfo"
    :onLogout="onLogout"
    :onEditPwd="onEditPwd"
  >
    <template #setting>
      <slot name="setting"></slot>
    </template>
  </VatsSetting>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'VatsLayout',
});
</script>

<script lang="ts" setup>
import {
  defineProps,
  reactive,
  toRefs,
  withDefaults,
  onBeforeUnmount,
  computed,
  inject,
  watch,
} from 'vue';
import { useRoute } from 'vue-router';
import VatsSider from './sider.vue';
import VatsHeader from './header.vue';
import VatsSetting from './setting.vue';
import VatsTab from './tab.vue';
import { isMobile } from '../utils/isMobile';
import { debounced } from '../utils/debounced';
import { ISystem, IMenu, ILayoutSate, IUserInfo } from './types.d';
import { vatsProvider, resetCached } from '../provider/inject';

interface IProps {
  system?: ISystem;
  menu: IMenu[];
  userInfo: IUserInfo;
  startYear: string | number;
  onLogout?: () => Promise<unknown>;
  onEditPwd?: () => Promise<unknown>;
}

const props = withDefaults(defineProps<IProps>(), {
  menu: () => [],
});

const route = useRoute();

const { system, menu, userInfo, onLogout, onEditPwd } = toRefs(props);

const settingProvider = inject('vatsProvider', vatsProvider);

const mobile = isMobile();

const layoutState = reactive<ILayoutSate>({
  collapsed: mobile,
  isMobile: mobile,
  transition: true,
  showSetting: false,
});

const siderWidth = computed(() => (layoutState.collapsed ? '80px' : '200px'));

const drawerSiderVisible = computed(() => !layoutState.collapsed && layoutState.isMobile);

const cached = computed(() => (settingProvider.tabVisible ? settingProvider.cached : []));

const copyRightYear = computed(() => {
  let year = new Date().getFullYear();
  if (!props.startYear) return '';
  if (props.startYear.toString() === year.toString()) {
    return props.startYear;
  }
  return `${props.startYear}-${year}`;
});

const handleRefreshCache = async (refresh = false) => {
  return resetCached(settingProvider, route, refresh);
};

const handleAddCached = () => {
  if (route.meta.cached !== false && !settingProvider.cached.includes(route.name as string)) {
    settingProvider.cached = [...settingProvider.cached, route.name as string];
  }
};

handleAddCached();
watch(
  () => route.name,
  name => {
    handleAddCached();
  },
);

// 监听页面resize事件
const onResize = () =>
  debounced(() => {
    if (layoutState.collapsed && window?.innerWidth > 1200) {
      layoutState.collapsed = false;
    } else if (!layoutState.collapsed && window?.innerWidth <= 1200) {
      layoutState.collapsed = true;
    }
    if (layoutState.isMobile && window?.innerWidth > 750) {
      layoutState.isMobile = false;
    } else if (!layoutState.isMobile && window?.innerWidth <= 750) {
      layoutState.isMobile = true;
    }
  }, 250)();
// 初始化
onResize();
// 开始监听窗口尺寸变化
window?.addEventListener('resize', onResize, false);
// 移除监听窗口尺寸变化
onBeforeUnmount(() => {
  window?.removeEventListener('resize', onResize, false);
});
</script>

<style lang="scss">
.vats-h-full {
  min-height: 100vh;
}
.vats-layout-sider.ant-layout-sider {
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  z-index: 10;
}
.vats-layout-header.ant-layout-header {
  padding: 0 12px;
  height: 44px;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
}

[vats-mode='dark'] .vats-layout-header.ant-layout-header {
  background: #141414;
  border-bottom: 1px solid #303030;
}

.vats-tab-fixed {
  position: fixed;
  right: 0;
  top: 44px;
  z-index: 10;
}
</style>
