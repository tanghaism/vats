<template>
  <input
    ref="inputRef"
    type="file"
    :accept="accept.join()"
    :multiple="multiple === true || (typeof multiple === 'number' && multiple > 1)"
    :disabled="disabled"
    @change="handleChange"
    style="display: none"
  />
  <VatsUploadEmpty
    v-show="localUploadList.length === 0 && localUploadMustCrop.length === 0"
    :emptyTitle="emptyTitle"
    :emptySubTitle="emptySubTitle"
    @clickEmpty="inputRef.click()"
  />
  <div class="vats-uploader-container" v-show="!isCropping && localUploadList.length > 0">
    <a-image-preview-group>
      <VatsUploaderItem
        v-for="(item, index) in localUploadList"
        :key="index"
        :item="item"
        :index="index"
        :crop="isCropping"
        :ratio="ratio"
        :loading="loading.upload"
        @handleDelete="handleDelete"
        @handleCrop="handleCrop"
      />
      <div class="vats-add-btn" v-show="showAddBtn" @click="inputRef.click()">
        <div class="vats-btn-plus">
          <p><PlusOutlined /></p>
          <p style="font-size: 14px">{{ localUploadList.length }} / {{ multiple }}</p>
        </div>
      </div>
    </a-image-preview-group>
  </div>
  <div class="vats-uploader-cropper" v-show="isCropping">
    <div class="vats-uploader-cropper-wrapper">
      <img ref="cropImageRef" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VatsUploadPanel',
});
</script>

<script setup lang="ts">
import {
  defineProps,
  toRefs,
  withDefaults,
  inject,
  ref,
  computed,
  onBeforeUnmount,
  toRaw,
  defineEmits,
  defineExpose,
} from 'vue';
import VatsUploadEmpty from './empty.vue';
import VatsUploaderItem from './item.vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { IPreviewItem, ICropProps, IEmptyProps, IFileType } from './index.d';
import Cropper from 'cropperjs';
import { fileToBlob, getImageSize } from './utils';

interface IPanelProps extends ICropProps, IEmptyProps {
  localUploadList: IPreviewItem[];
  localUploadMustCrop: IPreviewItem[];
  ratio: number | string;
  isCropping: boolean;
  multiple: boolean;
  accept: IFileType[];
  disabled: boolean;
}

const props = withDefaults(defineProps<IPanelProps>(), {
  localUploadList: () => [],
  localUploadMustCrop: () => [],
  ratio: 0,
  isCropping: false,
});

const {
  minCropBoxWidth,
  minCropBoxHeight,
  ratio,
  emptyTitle,
  emptySubTitle,
  localUploadMustCrop,
  localUploadList,
  multiple,
  isCropping,
  accept,
  disabled,
} = toRefs(props);

const emit = defineEmits(['inputChange', 'handleDelete', 'handleCrop', 'handleConfirmCrop']);

const loading = inject('vatsUploadLoading', { crop: false, upload: false });

const inputRef = ref();
const cropImageRef = ref();

const cropperIndex = ref<number>(-1);
const cropperItem = ref<IPreviewItem>();

let cropInstance: Cropper;

const handleImageReady = () => {
  if (!cropInstance) return;
  const { naturalWidth, naturalHeight, width, height } = cropInstance.getCanvasData();
  const wRate = width / naturalWidth;
  const hRate = height / naturalHeight;
  const _minCropBoxHeight = minCropBoxHeight.value * hRate;
  const _minCropBoxWidth = minCropBoxWidth.value * wRate;
  (cropInstance as any).options.minCropBoxHeight =
    (cropInstance as any).cropBoxData.minHeight =
    (cropInstance as any).initialCropBoxData.minHeight =
      _minCropBoxHeight;
  (cropInstance as any).options.minCropBoxWidth =
    (cropInstance as any).cropBoxData.minWidth =
    (cropInstance as any).initialCropBoxData.minWidth =
      _minCropBoxWidth;
};

const initCrop = () => {
  // 如果已存在裁剪实例
  if (cropInstance) {
    cropInstance.reset();
    cropInstance.replace(cropperItem.value?.originUrl as string);
  } else {
    cropImageRef.value.src = cropperItem.value?.originUrl;
    cropImageRef.value.addEventListener('ready', handleImageReady, false);
    cropInstance = new Cropper(cropImageRef.value, {
      viewMode: 0,
      movable: true,
      autoCropArea: 1,
      aspectRatio: Number(ratio.value),
      minCropBoxHeight: minCropBoxHeight.value,
      minCropBoxWidth: minCropBoxWidth.value,
      zoomable: true,
      scalable: true,
    });
  }
};

const setCurrent = (item: IPreviewItem, index: number) => {
  cropperIndex.value = index;
  cropperItem.value = item;
};

onBeforeUnmount(() => {
  cropInstance?.destroy();
  cropImageRef.value?.removeEventListener('ready', handleImageReady, false);
});

// 确认裁剪
// mustCrop: 是否为强制裁剪
const confirmCrop = (mustCrop = false) => {
  return new Promise(resolve => {
    loading.crop = true;
    cropInstance.getCroppedCanvas().toBlob(async (blob: any) => {
      const { name, originUrl } = toRaw(cropperItem.value) as IPreviewItem;
      const fileNameArray = name.split('.');
      const newFileName = `${fileNameArray.slice(0, fileNameArray.length - 1).join('.')}.webp`;
      const newFile = new File([blob], newFileName, { type: 'image/webp' });
      const url = await fileToBlob(newFile);
      const { width, height } = await getImageSize(url);
      const newPreviewItem: IPreviewItem = {
        url,
        originUrl,
        file: newFile,
        name: newFileName,
        width,
        height,
        size: newFile.size,
        uploadSuccess: false,
        uploadFail: false,
        uploadLoading: false,
      };
      emit('handleConfirmCrop', newPreviewItem, cropperIndex.value, mustCrop);
      loading.crop = false;
      resolve(newPreviewItem);
    }, 'image/webp');
  });
};

// 跳转到下一张裁剪
const toNext = async () => {
  const array =
    localUploadMustCrop.value.length > 0 ? localUploadMustCrop.value : localUploadList.value;
  let len = array.length - 1;
  // 必须要裁剪
  let index = 0;
  if (localUploadMustCrop.value.length > 0) {
    await confirmCrop(true);
  } else {
    if (cropperIndex.value < len) {
      index = cropperIndex.value + 1;
    }
  }
  setCurrent(
    {
      ...toRaw(array[index]),
    },
    index,
  );
  initCrop();
};

// 跳转到上一张裁剪
const toPrev = () => {
  let len = localUploadList.value.length - 1;
  let index = 0;
  if (cropperIndex.value < len) {
    index = cropperIndex.value + 1;
  }
  setCurrent(
    {
      ...toRaw(localUploadList.value[index]),
    },
    index,
  );
  initCrop();
};

const showAddBtn = computed(() => {
  if (localUploadList.value.length > 0) {
    if (typeof multiple.value === 'number' && multiple.value > localUploadList.value.length) {
      return true;
    } else if (multiple.value === true) {
      return true;
    }
  }
  return false;
});

const handleChange = (e: InputEvent | Event) => {
  emit('inputChange', e);
};

const handleDelete = (item: IPreviewItem, index: number) => {
  emit('handleDelete', { ...toRaw(item) }, index);
};

const handleCrop = (item: IPreviewItem, index: number) => {
  const pureItem = { ...toRaw(item) };
  emit('handleCrop', pureItem, index);
  setCurrent(pureItem, index);
  initCrop();
};

defineExpose({
  toPrev,
  toNext,
  setCurrent,
  initCrop,
  confirmCrop
});
</script>

<style lang="scss">
.vats-uploader-container {
  position: relative;
  overflow: auto;
  width: 100%;
  height: 100%;
  .vats-add-btn {
    float: left;
    position: relative;
    width: 14.666667%;
    height: 0;
    padding-bottom: 14.666667%;
    margin-left: 2%;
    margin-bottom: 2%;
    background-color: #fafafa;
    border: 1px dashed #d9d9d9;
    cursor: pointer;
    &:hover {
      border: 1px dashed #1890ff;
      .vats-btn-plus {
        color: #1890ff;
      }
    }
    .vats-btn-plus {
      font-size: 24px;
      position: absolute;
      color: rgba(0, 0, 0, 0.45);
      top: 50%;
      left: 50%;
      text-align: center;
      transform: translate(-50%, -50%);
    }
  }
}

@media (max-width: 960px) {
  .vats-uploader-container .vats-add-btn {
    width: 23%;
    padding-bottom: 23%;
  }
}

@media (max-width: 540px) {
  .vats-uploader-container .vats-add-btn {
    width: 48%;
    padding-bottom: 48%;
  }
}

.vats-uploader-cropper {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(100% - 4px);
  height: calc(100% - 4px);
  z-index: 1;
  box-sizing: border-box;
  overflow: hidden;
  .vats-uploader-cropper-wrapper {
    position: relative;
    top: 4px;
    left: 4px;
    width: calc(100% - 8px);
    height: calc(100% - 8px);
  }
}
</style>
