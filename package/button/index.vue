<template>
  <a-button v-bind="$attrs" :type="type" :class="className">
    <template #icon>
      <slot name="icon"></slot>
    </template>
    <slot></slot>
  </a-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VatsButton',
});
</script>

<script setup lang="ts">
import { computed, toRefs, defineProps, withDefaults } from 'vue';

interface IProps {
  type: 'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default';
  success: boolean;
  warning: boolean;
  info: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  type: 'default',
  success: false,
  warning: false,
  info: false,
});

const { type, success, warning, info } = toRefs(props);

const className = computed(() => {
  let className = '';
  if (success.value) {
    className += 'vats-btn-success';
  } else if (warning.value) {
    className += 'vats-btn-warning';
  } else if (info.value) {
    className += 'vats-btn-info';
  }
  return className;
});
</script>

<style lang="scss" scoped></style>
