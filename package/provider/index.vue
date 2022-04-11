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
import { initI18n, ILocale } from '../locale';
import ZH from '../locale/lang/zh-cn';
import EN from '../locale/lang/en';
import JA from '../locale/lang/ja';

const langMap: any = {
  'zh-cn': ZH,
  en: EN,
  ja: JA,
};

interface IProps {
  locale: ILocale;
}

const props = withDefaults(defineProps<IProps>(), {
  locale: () => ({
    locale: 'zh-cn',
  }),
});

const { locale } = toRefs(props);

const vatsProvider = initVatsProvider();
provide('vatsProvider', vatsProvider);

const vatsLang = initI18n(props.locale ? props.locale.locale : 'zh-cn');
provide('vatsLang', vatsLang);

watch(
  () => locale.value,
  async newVal => {
    const lang = newVal?.locale ? newVal.locale : 'zh-cn';

    // const message = await import(
    //   /* webpackInclude: /(zh-cn|ja|en)\.ts/ */ /* webpackChunkName: "vats-locale-[request]" */ `../locale/lang/${lang}.ts`
    // );

    vatsLang.message = langMap[lang];
  },
);
</script>

<style lang="scss" scoped></style>
