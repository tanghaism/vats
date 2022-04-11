<template>
  <a-table :scroll="scroll" v-bind="$attrs" v-loading="loading">
    <template #title v-if="!!$slots.title || !!$slots.extra">
      <a-row align="middle" class="vats-wrap" :class="styleClass">
        <a-col :flex="1">
          <a-space v-if="$slots.title" class="vats-wrap">
            <slot name="title"></slot>
          </a-space>
        </a-col>
        <a-col>
          <a-space v-if="$slots.extra">
            <slot name="extra"></slot>
          </a-space>
        </a-col>
      </a-row>
    </template>

    <template v-for="(index, name) in $slots" v-slot:[name]="slotProps">
      <slot
        :name="name"
        v-bind="slotProps"
        v-if="$slots.name !== 'extra' && $slots.name !== 'title'"
      ></slot>
    </template>
  </a-table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VatsTable',
});
</script>

<script lang="ts" setup>
import { defineProps, toRefs, withDefaults } from 'vue';

interface IProps {
  loading?: boolean;
  scroll?: {
    x?: number;
    y?: number;
  };
  styleClass?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  loading: false,
  scroll: () => ({ x: 1460 }),
});

const { loading, scroll, styleClass } = toRefs(props);
</script>

<style lang="scss">
.vats-wrap {
  flex-wrap: wrap;
}
</style>
