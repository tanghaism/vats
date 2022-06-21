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
  let className = type.value === 'link' ? 'vats-px-0 ' : '';
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

<style lang="scss">
$success: #4caf50;
$warning: #ffb300;
$info: #909399;
$disabled: rgba(0, 0, 0, 0.25);
$dark-disabled: rgba(255, 255, 255, 0.3);
$background-disabled: #f5f5f5;
$dark-background-disabled: rgba(255, 255, 255, 0.08);
$border-disabled: #d9d9d9;
$dark-border-disabled: #434343;

.vats-px-0 {
  padding-left: 0;
  padding-right: 0;
}

@mixin VatsButtonLink($color, $isDark) {
  color: $color;
  &:hover,
  &:active,
  &:focus {
    color: if($isDark, darken($color, 10%), lighten($color, 15%));
  }
  &[disabled] {
    color: if($isDark, $dark-disabled, $disabled);
    background-color: transparent;
  }
}

.ant-btn-link.vats-btn-success,
.ant-btn-text.vats-btn-success {
  @include VatsButtonLink($success, false);
}
.ant-btn-link.vats-btn-warning,
.ant-btn-text.vats-btn-warning {
  @include VatsButtonLink($warning, false);
}
.ant-btn-link.vats-btn-info,
.ant-btn-text.vats-btn-info {
  @include VatsButtonLink($info, false);
}

[vats-mode='dark'] .ant-btn-link.vats-btn-success,
[vats-mode='dark'] .ant-btn-text.vats-btn-success {
  @include VatsButtonLink(darken($success, 10%), true);
}

[vats-mode='dark'] .ant-btn-link.vats-btn-warning,
[vats-mode='dark'] .ant-btn-text.vats-btn-warning {
  @include VatsButtonLink(darken($warning, 10%), true);
}

[vats-mode='dark'] .ant-btn-link.vats-btn-info,
[vats-mode='dark'] .ant-btn-text.vats-btn-info {
  @include VatsButtonLink(darken($info, 10%), true);
}

@mixin VatsButtonPrimary($color, $isDark) {
  background-color: $color;
  border-color: $color;
  &:hover,
  &:active,
  &:focus {
    background-color: if($isDark, darken($color, 10%), lighten($color, 15%));
    border-color: if($isDark, darken($color, 10%), lighten($color, 15%));
  }
}

@mixin VatsButtonDisabled($isDark) {
  &[disabled] {
    background-color: if(
            $isDark,
            $dark-background-disabled,
            $background-disabled
    );
    color: if($isDark, $dark-disabled, $disabled);
    border-color: if($isDark, $dark-border-disabled, $border-disabled);
  }
}

.ant-btn-primary.vats-btn-success {
  @include VatsButtonPrimary($success, false);
  @include VatsButtonDisabled(false);
}
.ant-btn-primary.vats-btn-warning {
  @include VatsButtonPrimary($warning, false);
  @include VatsButtonDisabled(false);
}
.ant-btn-primary.vats-btn-info {
  @include VatsButtonPrimary($info, false);
  @include VatsButtonDisabled(false);
}

[vats-mode='dark'] .ant-btn-primary.vats-btn-success {
  @include VatsButtonPrimary(darken($success, 10%), true);
  @include VatsButtonDisabled(true);
}
[vats-mode='dark'] .ant-btn-primary.vats-btn-warning {
  @include VatsButtonPrimary(darken($warning, 10%), true);
  @include VatsButtonDisabled(true);
}
[vats-mode='dark'] .ant-btn-primary.vats-btn-info {
  @include VatsButtonPrimary(darken($info, 10%), true);
  @include VatsButtonDisabled(true);
}

@mixin VatsButtonGhost($color, $isDark) {
  color: $color;
  border-color: $color;
  &:hover,
  &:active,
  &:focus {
    color: if($isDark, darken($color, 10%), lighten($color, 15%));
    border-color: if($isDark, darken($color, 10%), lighten($color, 15%));
  }
}

.ant-btn-ghost.vats-btn-success,
.ant-btn-dashed.vats-btn-success,
.ant-btn-default.vats-btn-success {
  @include VatsButtonGhost($success, false);
  @include VatsButtonDisabled(false);
}
.ant-btn-ghost.vats-btn-warning,
.ant-btn-dashed.vats-btn-warning,
.ant-btn-default.vats-btn-warning {
  @include VatsButtonGhost($warning, false);
  @include VatsButtonDisabled(false);
}
.ant-btn-ghost.vats-btn-info,
.ant-btn-dashed.vats-btn-info,
.ant-btn-default.vats-btn-info {
  @include VatsButtonGhost($info, false);
  @include VatsButtonDisabled(false);
}

[vats-mode='dark'] .ant-btn-ghost.vats-btn-success,
[vats-mode='dark'] .ant-btn-dashed.vats-btn-success,
[vats-mode='dark'] .ant-btn-default.vats-btn-success {
  @include VatsButtonGhost($success, true);
  @include VatsButtonDisabled(true);
}
[vats-mode='dark'] .ant-btn-ghost.vats-btn-warning,
[vats-mode='dark'] .ant-btn-dashed.vats-btn-warning,
[vats-mode='dark'] .ant-btn-default.vats-btn-warning {
  @include VatsButtonGhost($warning, true);
  @include VatsButtonDisabled(true);
}
[vats-mode='dark'] .ant-btn-ghost.vats-btn-info,
[vats-mode='dark'] .ant-btn-dashed.vats-btn-info,
[vats-mode='dark'] .ant-btn-default.vats-btn-info {
  @include VatsButtonGhost($info, true);
  @include VatsButtonDisabled(true);
}
</style>
