<template>
  <div class="vats-uploader-item">
    <a-card bordered hoverable :body-style="{ padding: 0 }">
      <template #cover>
        <div class="vats-uploader-item-preview">
          <a-image width="100%" :src="item?.url" />
          <div class="vats-uploader-item-tag">
            <CheckCircleFilled
              style="color: #67c23a; font-size: 18px"
              v-show="item.uploadSuccess"
            />
            <CloseCircleFilled style="color: #ff4949; font-size: 18px" v-show="item.uploadFail" />
          </div>
          <span
            class="vats-uploader-item-loading vats-flex vats-flex-column"
            v-show="!item.uploadSuccess && loading"
          >
            <LoadingOutlined />
          </span>
        </div>
      </template>
      <ul class="ant-card-actions">
        <li v-if="crop && !item.uploadSuccess" style="width: 50%">
          <vats-button
            type="link"
            block
            :disabled="
              item.uploadSuccess ||
              !crop ||
              item.file.type === 'image/gif' ||
              disabled ||
              (!item.uploadSuccess && loading)
            "
            key="scissor"
            @click.stop="handleCrop(item, index)"
          >
            <template #icon>
              <ScissorOutlined />
            </template>
          </vats-button>
        </li>
        <li :style="{ width: crop && !item.uploadSuccess ? '50%' : '100%' }">
          <vats-button
            type="link"
            block
            :disabled="disabled || (!item.uploadSuccess && loading)"
            key="delete"
            danger
            @click.stop="handleDelete(item, index)"
          >
            <template #icon>
              <DeleteOutlined />
            </template>
          </vats-button>
        </li>
      </ul>
    </a-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VatsUploaderItem',
});
</script>

<script setup lang="ts">
import { defineProps, toRefs, withDefaults, defineEmits } from 'vue';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  ScissorOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';
import { IPreviewItem } from './index.d';

interface IProps {
  item: IPreviewItem;
  index: number;
  crop: boolean;
  loading: boolean;
  disabled: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  index: -1,
  crop: false,
  loading: false,
  disabled: false,
});

const { item, index, crop, loading, disabled } = toRefs(props);

const emits = defineEmits(['handleCrop', 'handleDelete']);

const handleCrop = (item: IPreviewItem, index: number) => {
  emits('handleCrop', item, index);
};

const handleDelete = (item: IPreviewItem, index: number) => {
  emits('handleDelete', item, index);
};
</script>

<style lang="scss">
.vats-uploader-item {
  float: left;
  width: 14.666667%;
  margin-left: 2%;
  margin-bottom: 2%;
  &-preview {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 100%;
    overflow: hidden;
    user-select: none;
  }
  &-tag {
    position: absolute;
  }
  &-loading.vats-flex {
    align-items: center;
    justify-content: center;
  }
  .anticon {
    svg {
      margin: auto;
    }
  }
}
</style>
