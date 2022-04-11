<template>
  <div
    v-if="system"
    :class="[collapsed ? 'vats-system-close' : 'vats-system-open']"
    class="vats-system vats-flex"
  >
    <img :src="system.logo" alt="" width="32" height="32" v-if="system.logo" />
    <div
      class="vats-system-info vats-flex vats-flex-1 vats-flex-column vats-ellipsis"
      v-if="system.title || system.subTitle"
      v-show="!collapsed"
    >
      <a-typography-text
        v-if="system.title"
        strong
        :class="[system.subTitle ? '' : 'vats-system-title-large']"
        class="vats-system-title"
      >
        {{ system.title }}
      </a-typography-text>
      <a-typography-text class="vats-system-sub-title" v-if="system.subTitle">
        {{ system.subTitle }}
      </a-typography-text>
    </div>
  </div>
  <div class="vats-menu vats-flex-1">
    <a-menu
      class="vats-menu-wrap"
      mode="inline"
      theme="dark"
      :inlineCollapsed="false"
      v-model:openKeys="menuSelected.openMenus"
      v-model:selectedKeys="menuSelected.selectedMenus"
    >
      <template v-for="item in menu" :key="item.name">
        <template v-if="item.children && item.children.length > 0 && !item.meta.hideMenu">
          <a-sub-menu :key="item.name">
            <template #title>
              <span class="vats-flex">
                <i :class="item.meta.icon" v-if="!!item.meta.icon" class="anticon"></i>
                <span>{{ item.meta.title }}</span>
              </span>
            </template>
            <template v-for="child in item.children" :key="child.name">
              <a-menu-item
                :key="child.name"
                v-if="!child.meta.hideMenu"
                class="vats-flex"
                @click="jumpTo(child.name)"
              >
                <i :class="child.meta.icon" v-if="!!child.meta.icon" class="anticon"></i>
                <span>{{ child.meta.title }}</span>
              </a-menu-item>
            </template>
          </a-sub-menu>
        </template>
        <template v-else-if="!item.children && !item.meta.hideMenu">
          <a-menu-item :key="item.name" class="vats-flex" @click="jumpTo(item.name)">
            <i :class="item.meta.icon" v-if="!!item.meta.icon" class="anticon"></i>
            <span>{{ item.meta.title }}</span>
          </a-menu-item>
        </template>
      </template>
    </a-menu>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VatsSider',
});
</script>

<script lang="ts" setup>
import { defineProps, withDefaults, toRefs, reactive, toRaw, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ISystem, IMenu, IMenuSelected } from './types.d';

type IBreadcrumb = {
  name: string;
  path: string;
  breadcrumbName: string;
  [props: string]: unknown;
};

interface IProps {
  system?: ISystem;
  menu: IMenu[];
  collapsed: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  menu: () => [],
});

const { system, collapsed, menu } = toRefs(props);

const route = useRoute();
const router = useRouter();

const menuSelected = reactive<IMenuSelected>({
  openMenus: [],
  selectedMenus: [],
});

const setMenuSelected = () => {
  const matched: IBreadcrumb[] = [...toRaw(route.meta.breadcrumb || [])];
  if (!collapsed.value) {
    menuSelected.openMenus = matched.map((_matched: IBreadcrumb) => _matched.name);
  }
  menuSelected.selectedMenus = [(route.meta.selected || route.name) as string];
};

onMounted(() => {
  setMenuSelected();
});

watch(() => route.name, setMenuSelected);

watch(
  () => collapsed.value,
  newCollapsed => {
    if (!newCollapsed) {
      const matched: IBreadcrumb[] = [...toRaw(route.meta.breadcrumb || [])];
      menuSelected.openMenus = matched.map((_matched: IBreadcrumb) => _matched.name) as string[];
    } else {
      menuSelected.openMenus = [];
    }
  },
);

const jumpTo = (routeName: string) => {
  route.name !== routeName && router.push({ name: routeName });
};
</script>

<style lang="scss">
.vats-system {
  width: 100%;
  overflow: hidden;
  &-info {
    margin-left: 10px;
    animation: vats-title-animation 0.2s;
  }
  &-title.ant-typography {
    color: #ffffff;
    font-size: 14px;
    &-large {
      font-size: 16px;
    }
  }
  &-sub-title.ant-typography {
    color: #888;
    font-size: 12px;
  }
  &-close {
    padding: 12px 24px 6px;
  }
  &-open {
    padding: 12px 16px 6px;
  }
}

@keyframes vats-title-animation {
  0% {
    display: none;
    opacity: 0;
  }

  99% {
    display: none;
    opacity: 0;
  }

  100% {
    display: block;
    opacity: 1;
  }
}

.vats-menu {
  overflow-y: auto;
  overflow-x: hidden;
  &-wrap {
    min-height: 100%;
  }
}
</style>
