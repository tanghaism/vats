<template>
  <a-tabs
    :activeKey="activeKey"
    :tabBarStyle="{ paddingLeft: '16px', paddingRight: '16px' }"
    hide-add
    size="small"
    @tabClick="toPage"
    type="editable-card"
    class="vats-layout-tab"
  >
    <a-tab-pane v-for="(pane, index) in panes" :key="pane.fullPath" :closable="false">
      <template #tab>
        <span class="vats-flex">
          {{ pane.title }}
          <ReloadOutlined
            class="vats-tab-icon"
            v-show="pane.fullPath === activeKey"
            @click.stop="reloadPage"
          />
          <CloseOutlined
            class="vats-tab-icon"
            v-show="panes.length !== 1"
            @click.stop="removeTab(index)"
          />
        </span>
      </template>
    </a-tab-pane>
    <template #rightExtra>
      <a-dropdown @click="action">
        <a class="ant-dropdown-link p-12 mr-8" @click.prevent>
          <MoreOutlined class="text-16 leading-0" />
        </a>
        <template #overlay>
          <a-menu @click="action">
            <a-menu-item key="closeAll">{{ vatsLang.message.closeOther }}</a-menu-item>
            <a-menu-item key="refresh">{{ vatsLang.message.refreshPage }}</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>
  </a-tabs>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VatsTab',
});
</script>

<script setup lang="ts">
import { watch, inject, ref, defineEmits, onMounted } from 'vue';
import { useRoute, useRouter, RouteLocationNormalizedLoaded, Router, RouteMeta } from 'vue-router';
import { vatsProvider } from '../provider/inject';
import { MoreOutlined, ReloadOutlined, CloseOutlined } from '@ant-design/icons-vue';
import { IMenu } from './types';

interface TabPane {
  title: string;
  fullPath: string;
  name: string;
  cached: boolean;
}

const emit = defineEmits(['refreshCache']);

const route: RouteLocationNormalizedLoaded = useRoute();
const router: Router = useRouter();

const settingProvider = inject('vatsProvider', vatsProvider);

const vatsLang = inject('vatsLang', { message: {} } as { message: Record<string, string> });

const handleRouteFullPath = () => {
  activeKey.value = route.fullPath;
  if (route.name === 'Index') return;
  if (
    panes.value.length === 0 ||
    !panes.value.some((pane: TabPane) => pane.fullPath === route.fullPath)
  ) {
    const meta = route.meta as RouteMeta;
    panes.value.push({
      title: (route.query.title as string) || route.meta.title,
      fullPath: route.fullPath,
      name: route.name as string,
      cached: meta.cached === true || meta.cached === undefined,
    } as TabPane);
  }
};

onMounted(() => {
  handleRouteFullPath();
});
watch(
  () => route.fullPath,
  () => {
    handleRouteFullPath();
  },
);

const toPage = (key: string) => {
  key !== activeKey.value && router.push(key);
};

const reloadPage = () => {
  emit('refreshCache');
};

const activeKey = ref<string>('');
const panes = ref<TabPane[]>([]);

const removeTab = (index: number) => {
  const { fullPath, name, cached } = panes.value[index];
  panes.value.splice(index, 1);
  if (cached) {
    settingProvider.cached = settingProvider.cached.filter((key: string) => key !== name);
  }
  if (fullPath === activeKey.value) {
    activeKey.value = panes.value[panes.value.length - 1].fullPath;
    router.push(activeKey.value);
  }
};

const removeOtherTab = () => {
  panes.value = panes.value.filter((pane: TabPane) => pane.fullPath === activeKey.value);
  settingProvider.cached = panes.value[0].cached ? [panes.value[0].name] : [];
};

const action = ({ key }: IMenu) => {
  switch (key) {
    case 'closeAll':
      removeOtherTab();
      break;
    case 'refresh':
      reloadPage();
      break;
    default:
      break;
  }
};
</script>

<style lang="scss">
.vats-layout-tab {
  padding-top: 6px !important;
  height: 42px;
  background: #ffffff;
}

[vats-mode='dark'] .vats-layout-tab {
  border-bottom-color: #303030;
}

.anticon.vats-tab-icon {
  margin-right: 0 !important;
  color: rgba(0, 0, 0, 0.85);
  font-size: 12px;
  margin-left: 8px;

  &:hover {
    color: #177ddc;
  }
}

[vats-mode='dark'] .anticon.vats-tab-icon {
  color: hsla(0, 0%, 100%, 0.45);

  &:hover {
    color: #177ddc;
  }
}
</style>
