<template>
  <a-drawer
    v-bind="$attrs"
    :visible="visible"
    :width="width"
    :maskClosable="false"
    :body-style="computedBodyStyle"
    @close="handleClose"
  >
    <slot name="default"></slot>
    <div class="vats-drawer-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </a-drawer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VatsDrawer',
});
</script>

<script setup lang="ts">
import {
  defineProps,
  toRefs,
  withDefaults,
  computed,
  useSlots,
  toRaw,
  defineEmits,
  watch,
} from 'vue';

interface IProps {
  visible: boolean;
  width: string | number;
  bodyStyle: Record<string, string | number>;
}

const props = withDefaults(defineProps<IProps>(), {
  visible: false,
  width: '500px',
  bodyStyle: () => ({}),
});

const { visible, width, bodyStyle } = toRefs(props);

const emits = defineEmits(['update:visible', 'close', 'show']);

const slots = useSlots();

const computedBodyStyle = computed(() => {
  return slots.footer ? { ...bodyStyle.value, paddingBottom: '55px' } : toRaw(bodyStyle.value);
});

watch(
  () => visible.value,
  newVal => {
    if (newVal) {
      emits('show');
    }
  },
);

const handleClose = () => {
  emits('update:visible', false);
  emits('close');
};
</script>

<style lang="scss">
[vats-mode='dark'] .vats-drawer-footer {
  background-color: #1f1f1f;
  border-color: #303030;
}

.vats-drawer-footer {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e9e9e9;
  padding: 10px 16px;
  background: #fff;
  text-align: center;
  z-index: 1;
}
</style>
