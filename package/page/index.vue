<template>
  <template v-if="$checkPermissions(route.meta.permission) || hasPermission">
    <div>
      <div class="vats-page-breadcrumb-wrap" v-if="showPageHeader">
        <a-page-header :title="pageTitle" :ghost="false">
          <template #breadcrumb>
            <a-breadcrumb :routes="breadcrumbRoutes" v-if="breadcrumbRoutes.length > 1">
              <template #itemRender="{ route }">
                <router-link :to="route.path">
                  {{ route.breadcrumbName }}
                </router-link>
              </template>
            </a-breadcrumb>
          </template>
          <p v-if="pageDesc">{{ pageDesc }}</p>
          <slot name="header"></slot>
        </a-page-header>
      </div>
      <div class="vats-page-wrap">
        <slot></slot>
      </div>
    </div>
  </template>
  <a-result
    status="403"
    title="403"
    class="vats-error"
    :sub-title="vatsLang.message.noPermission"
    v-else
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VatsPage',
});
</script>

<script setup lang="ts">
import {
  inject,
  defineProps,
  computed,
  toRefs,
  getCurrentInstance,
  ComponentInternalInstance,
  defineEmits,
} from 'vue';
import { useRoute, RouteLocationNormalizedLoaded, RouteLocationMatched } from 'vue-router';

interface BreadcrumbRoute {
  name: string;
  path: string;
  breadcrumbName: string;
  [props: string]: any;
}

interface IProps {
  showPageHeader?: boolean;
  breadcrumb?: BreadcrumbRoute[];
  title?: string;
  desc?: string;
  hasPermission?: boolean;
}

const props = defineProps<IProps>();

const emit = defineEmits(['init']);

const { appContext } = getCurrentInstance() as ComponentInternalInstance;

const { showPageHeader, breadcrumb, title, desc, hasPermission } = toRefs(props);

const route: RouteLocationNormalizedLoaded = useRoute();

const vatsLang = inject('vatsLang', { message: {} } as { message: Record<string, string> });

const pageTitle = computed((): string => {
  return title?.value || ((route.meta.title && route.meta.title) as string);
});

const pageDesc = computed((): string => {
  return desc?.value || ((route.meta.desc && route.meta.desc) as string);
});

// 是否可以执行初始化渲染请求数据
if (
  hasPermission?.value ||
  appContext.config.globalProperties.$checkPermissions(route.meta.permission)
) {
  emit('init');
}

const breadcrumbRoutes = computed(() => {
  return (
    breadcrumb?.value ||
    route.meta.breadcrumb ||
    route.matched.slice(1).map((_route: RouteLocationMatched) => {
      return {
        path: _route.path,
        breadcrumbName: _route.meta.title,
      };
    })
  );
});
</script>

<style lang="scss">
.vats-page-wrap {
  padding: 24px;
  min-height: calc(100vh - 156px);
}

.vats-page-breadcrumb-wrap {
  .ant-page-header-footer {
    margin: 0;
  }
}

.vats-error {
  min-height: 82vh;
}
</style>
