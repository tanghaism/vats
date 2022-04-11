<template>
  <a-drawer
    id="vats-setting"
    placement="right"
    width="320px"
    v-bind="$attrs"
    @close="$emit('update:visible', false)"
  >
    <template #title>
      <header class="vats-flex">
        <a-avatar
          shape="circle"
          size="default"
          v-if="userInfo?.avatar"
          :src="userInfo.avatar"
          :style="{ verticalAlign: 'middle', marginRight: '8px' }"
        >
        </a-avatar>
        {{ userInfo?.nickname }}
      </header>
    </template>

    <slot name="setting"></slot>

    <a-typography-text strong class="vats-block vats-setting-title">
      {{ vatsLang.message.styleSetting }}
    </a-typography-text>
    <div class="vats-flex vats-setting-subtitle">
      <span class="vats-flex-1">
        <a-typography-text> {{ vatsLang.message.darkSetting }} </a-typography-text>
      </span>
      <div>
        <a-switch :checked="settingProvider.darkMode" @change="setSetting('darkMode', $event)" />
      </div>
    </div>
    <div class="vats-flex vats-setting-subtitle">
      <span class="vats-flex-1">
        <a-typography-text> {{ vatsLang.message.showTabSetting }} </a-typography-text>
      </span>
      <div>
        <a-switch
          :checked="settingProvider.tabVisible"
          @change="setSetting('tabVisible', $event)"
        />
      </div>
    </div>
    <div class="vats-flex vats-setting-subtitle">
      <span class="vats-flex-1">
        <a-typography-text> {{ vatsLang.message.fixedTabSetting }} </a-typography-text>
      </span>
      <div>
        <a-switch :checked="settingProvider.tabFixed" @change="setSetting('tabFixed', $event)" />
      </div>
    </div>

    <a-divider v-if="!!onLogout || !!onEditPwd" />

    <a-typography-text
      strong
      class="vats-block vats-setting-title"
      v-if="!!onLogout || !!onEditPwd"
    >
      {{ vatsLang.message.more }}
    </a-typography-text>

    <div class="vats-more-item vats-flex" @click="handleEditPassword" v-if="!!onEditPwd">
      <LockOutlined class="vats-setting-icon" />
      <a-typography-text>{{ vatsLang.message.editPassword }}</a-typography-text>
    </div>
    <div class="vats-more-item vats-flex" @click="handleLogout" v-if="!!onLogout">
      <a-typography-text type="danger">
        <LogoutOutlined class="vats-setting-icon" />
      </a-typography-text>
      <a-typography-text type="danger">{{ vatsLang.message.logout }}</a-typography-text>
    </div>
  </a-drawer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VatsSetting',
});
</script>

<script lang="ts" setup>
import { defineProps, toRefs, inject, createVNode } from 'vue';
import { IUserInfo } from './types';
import { Modal } from 'ant-design-vue';
import { vatsProvider, setVatsProvider, IProvider } from '../provider/inject';
import { LockOutlined, LogoutOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';

interface IProp {
  userInfo?: IUserInfo;
  onLogout?: () => Promise<unknown>;
  onEditPwd?: () => Promise<unknown>;
}

const props = defineProps<IProp>();

const { userInfo, onLogout, onEditPwd } = toRefs(props);

const settingProvider = inject('vatsProvider', vatsProvider);

const vatsLang = inject('vatsLang', { message: {} } as { message: Record<string, string> });

const setSetting = (key: string, value: boolean | string) => {
  settingProvider[key] = value;
  setVatsProvider(settingProvider as IProvider);
};

const handleLogout = () => {
  Modal.confirm({
    title: vatsLang.message.logoutTitle,
    icon: createVNode(ExclamationCircleOutlined),
    content: vatsLang.message.logoutMessage,
    centered: true,
    okText: vatsLang.message.confirm,
    cancelText: vatsLang.message.cancel,
    async onOk() {
      return props?.onLogout ? props.onLogout() : true;
    },
  });
};

const handleEditPassword = () => {
  props?.onEditPwd && props.onEditPwd();
};
</script>

<style lang="scss">
.vats-setting-title {
  margin-bottom: 24px;
  font-size: 16px;
}

.vats-setting-subtitle {
  margin-bottom: 18px;
}

.vats-more-item {
  padding-left: 24px;
  padding-right: 24px;
  margin-bottom: 10px;
  margin-left: -24px;
  margin-right: -24px;
  cursor: pointer;
  height: 44px;
  &:hover {
    background: #e6f7ff;
  }
}

[vats-mode='dark'] .vats-more-item:hover {
  background: #303030;
}

.vats-setting-icon {
  margin-right: 6px;
  font-size: 16px;
}
</style>
