<template>
  <a-config-provider :locale="locale" v-bind="$attrs">
    <slot></slot>
  </a-config-provider>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VatsProvider',
});
</script>

<script lang="ts" setup>
import { withDefaults, defineProps, toRefs, provide, watch } from 'vue';
import { initVatsProvider } from './inject';
import { initI18n, langMap, ILocale } from '../locale';

interface IProps {
  locale: ILocale;
}

const props = withDefaults(defineProps<IProps>(), {
  locale: {
    locale: 'zh-cn',
  },
});

const { locale } = toRefs(props);

const vatsProvider = initVatsProvider();
provide('vatsProvider', vatsProvider);

const vatsLang = initI18n(props.locale ? props.locale.locale : 'zh-cn');
provide('vatsLang', vatsLang);

watch(
  () => locale.value,
  async newVal => {
    vatsLang.message = newVal?.locale ? langMap[newVal.locale] : langMap['zh-cn'];
  },
);
</script>

<style lang="scss" scoped></style>
