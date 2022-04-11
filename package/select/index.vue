<template>
  <a-select
    :getPopupContainer="getPopupContainer"
    v-bind="$attrs"
    :not-found-content="loading ? undefined : null"
  >
    <template v-if="loading" #notFoundContent>
      <div class="vats-select-loading vats-flex vats-flex-column">
        <VatsLoading />
      </div>
    </template>
    <template v-for="(index, name) in $slots" v-slot:[name]="slotProps">
      <slot :name="name" v-bind="slotProps" v-if="$slots.name !== 'notFoundContent'"></slot>
    </template>
  </a-select>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import VatsLoading from '../loading/index.vue';

export default defineComponent({
  name: 'VatsSelect',
});
</script>

<script lang="ts" setup>
import { defineProps, toRefs } from 'vue';

interface IProps {
  loading?: boolean;
}

const props = defineProps<IProps>();

const { loading } = toRefs(props);

const getPopupContainer = (node: HTMLElement) => node.parentNode;
</script>

<style lang="scss">
.vats-select-loading {
  min-height: 80px;
}
</style>
