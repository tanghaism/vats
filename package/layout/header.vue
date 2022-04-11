<template>
  <MenuFoldOutlined
    v-show="!collapsed"
    class="vats-menu-toggle"
    @click="emit('handleMenuToggle')"
  />
  <MenuUnfoldOutlined
    v-show="collapsed"
    class="vats-menu-toggle"
    @click="emit('handleMenuToggle')"
  />
  <div id="vats-header" class="vats-flex vats-flex-1" />
  <div class="vats-hover-dropdown" v-if="userInfo" @click="emit('handleShowSetting')">
    <a-avatar
      shape="circle"
      size="small"
      v-if="userInfo?.avatar"
      :src="userInfo.avatar"
      :style="{ verticalAlign: 'middle' }"
    >
    </a-avatar>
    <span v-if="userInfo?.nickname" style="padding-left: 6px">{{ userInfo.nickname }}</span>
  </div>
  <div class="vats-hover-dropdown vats-flex" @click="emit('handleShowSetting')" v-else>
    <SettingOutlined style="font-size: 16px" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VatsHeader',
});
</script>

<script lang="ts" setup>
import { MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { defineProps, toRefs, defineEmits } from 'vue';
import { IUserInfo } from '../layout/types';

interface IProps {
  collapsed: boolean;
  userInfo: IUserInfo;
}

const props = defineProps<IProps>();

const { collapsed, userInfo } = toRefs(props);

const emit = defineEmits(['handleMenuToggle', 'handleShowSetting']);
</script>

<style lang="scss">
#vats-header {
  padding: 0 12px;
}

.vats-menu-toggle {
  padding: 12px;
  font-size: 18px;
}

.vats-hover-dropdown {
  padding: 0 12px;
  height: 48px;
  line-height: 48px;
  cursor: pointer;
  &:hover {
    background: #e6f7ff;
  }
}

[vats-mode='dark'] .vats-hover-dropdown {
  &:hover {
    background: #190800;
  }
}
</style>
