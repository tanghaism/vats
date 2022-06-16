<template>
  <slot name="default"></slot>
  <a-modal
    :visible="visible === undefined ? symbolVisible : visible"
    :body-style="{ height: 'calc(100vh - 300px)', maxHeight: 'auto', overflow: 'hidden' }"
    :title="title || vatsLang.message.uploaderTitle"
    :maskClosable="maskClosable"
    :destroyOnClose="destroyOnClose"
    @cancel="handleCancel"
  >
    <div
      class="vats-drop-container"
      :class="actionType"
      @dragover.prevent="setActionType('dragover')"
      @dragleave.prevent="setActionType('')"
      @dragend.prevent
      @drop.prevent="handleChange($event, 'drop')"
    >
      <Panel
        ref="uploadRef"
        v-loading="localUploadLoading"
        :localUploadList="localUploadList"
        :localUploadMustCrop="localUploadMustCrop"
        :empty-title="emptyTitle"
        :empty-sub-title="emptySubTitle"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        :minCropBoxHeight="minCropBoxHeight"
        :minCropBoxWidth="minCropBoxWidth"
        :ratio="ratio"
        :crop="crop"
        :isCropping="isCropping"
        @inputChange="handleChange"
        @handleDelete="handleDelete"
        @handleCrop="handleCrop"
        @handleConfirmCrop="handleConfirmCrop"
      />
    </div>

    <template #footer>
      <div class="vats-flex vats-uploader-footer">
        <span class="vats-flex-1" style="text-align: left">
          <a-typography-text
            type="secondary"
            v-if="
              localUploadList.length === 0 && localUploadMustCrop.length === 0 && multiple !== true
            "
            >{{
              getLocaleText('uploaderError1', {
                max: typeof multiple === 'number' ? multiple.toString() : 1,
              })
            }}
          </a-typography-text>
          <a-typography-text type="danger" v-if="localUploadMustCrop.length > 0">
            {{ getLocaleText('uploaderMustCropTips', { number: localUploadMustCrop.length }) }}
          </a-typography-text>
        </span>
        <a-space>
          <!-- 关闭弹框按钮 -->
          <VatsButton v-if="!isCropping" :disabled="disabled" @click="handleCancel">
            {{ getLocaleText('cancel') }}
          </VatsButton>
          <!-- 开始上传按钮 -->
          <VatsButton
            type="primary"
            v-if="!isCropping && waitToUpload.length > 0"
            :disabled="disabled"
            :loading="loading.upload"
            success
            @click.stop="handleUpload"
          >
            {{ getLocaleText('uploaderPrimary') }}
          </VatsButton>
          <!-- 确认选择按钮 -->
          <VatsButton
            type="primary"
            v-if="!isCropping && alreadyUpload.length > 0"
            :disabled="disabled"
            @click.stop="handleOK"
          >
            {{ getLocaleText('confirm') }}
          </VatsButton>
          <!-- 裁剪过程中返回图片列表界面 -->
          <VatsButton v-if="isCropping" :disabled="disabled" @click.stop="handleCropBack">
            {{ getLocaleText('uploadBack') }}
          </VatsButton>
          <!-- 裁剪过程中删除某张图片 -->
          <VatsButton
            type="primary"
            v-if="isCropping"
            danger
            :disabled="disabled"
            @click.stop="handleDelete(null, cropIndex)"
          >
            {{ getLocaleText('uploaderRemove') }}
          </VatsButton>
          <!-- 上一张 -->
          <VatsButton
            type="primary"
            v-if="isCropping && localUploadMustCrop.length === 0 && localUploadList.length > 1"
            :disabled="disabled"
            @click.stop="handleToPrev"
          >
            {{ getLocaleText('uploaderPrev') }}
          </VatsButton>
          <!-- 下一张 -->
          <VatsButton
            type="primary"
            v-if="
              isCropping &&
              (localUploadMustCrop.length > 1 ||
                (localUploadMustCrop.length === 0 && localUploadList.length > 1))
            "
            :disabled="disabled"
            @click.stop="handleToNext"
            :loading="loading.crop"
            :success="localUploadMustCrop.length > 1"
            >{{
              localUploadMustCrop.length > 0
                ? getLocaleText('uploaderConfirmNext')
                : getLocaleText('uploaderNext')
            }}
          </VatsButton>
          <!-- 确认裁剪按钮 -->
          <VatsButton
            type="primary"
            v-if="isCropping && localUploadMustCrop.length <= 1"
            success
            :loading="loading.crop"
            :disabled="disabled"
            @click.stop="handleToCrop"
          >
            {{ getLocaleText('uploaderConfirmCrop') }}
          </VatsButton>
        </a-space>
      </div>
    </template>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'VatsUploader',
});
</script>

<script setup lang="ts">
import {
  onMounted,
  ref,
  defineEmits,
  withDefaults,
  defineProps,
  toRefs,
  reactive,
  provide,
  ComponentInternalInstance,
  useSlots,
  getCurrentInstance,
  inject,
  computed,
  toRaw,
  createVNode,
} from 'vue';
import Panel from './panel.vue';
import { useActionType, canvasToFile } from './utils';
import { IPreviewItem, IFileExt, IValidateError, IEmptyProps, ICropProps, IFileType} from './index.d';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { getText } from '../locale';

interface IProps extends IEmptyProps, ICropProps {
  visible: boolean;
  // 点击蒙层是否可以关闭弹框
  maskClosable: boolean;
  // 关闭弹框是否初始化内部状态
  destroyOnClose: boolean;
  // 弹框标题
  title: string;
  // 允许上传的文件后缀，主要是为了防止拖动上传时可以跳过accept校验
  extType: IFileExt[];
  // input输入框的accept参数
  accept: IFileType[];
  // 是否支持多选, 最多支持上传几个文件，如果为true则不限制上传数量，如果为number类型则为最多可上传图片数量，如果为false则只能上传一张图片
  multiple: boolean | number;
  // 每个文件最大上传限制，单位M
  maxFilesSize: number;
  // 禁用组件
  disabled: boolean;
  // 图片是否可裁剪，默认可裁剪， gif图片不可裁剪
  crop: boolean;
  // 图片最大宽度
  maxWidth: number;
  // 图片最大高度
  maxHeight: number;
  // 上传方法
  upload: (item: IPreviewItem) => Promise<unknown>;
}

const props = withDefaults(defineProps<IProps>(), {
  aspectRatio: 0,
  minCropBoxWidth: 0,
  minCropBoxHeight: 0,
  maskClosable: false,
  destroyOnClose: true,
  extType: () => ['jpg', 'png', 'webp', 'jpeg', 'gif', 'tif', 'tiff'],
  accept: () => ['image/gif', 'image/jpeg', 'image/png', 'image/tiff', 'image/webp'],
  multiple: false,
  maxFilesSize: 5,
  disabled: false,
  crop: true,
  maxWidth: 2000,
  maxHeight: 2000,
});

const {
  disabled,
  extType,
  multiple,
  maxFilesSize,
  maxWidth,
  maxHeight,
  emptyTitle,
  accept,
  emptySubTitle,
  minCropBoxHeight,
  minCropBoxWidth,
  destroyOnClose,
  aspectRatio,
  title,
  crop,
  maskClosable,
  visible,
  upload,
} = toRefs(props);

const emits = defineEmits(['update:visible', 'show', 'cancel', 'ok', 'change', 'error']);
const slots = useSlots();
const app = getCurrentInstance() as ComponentInternalInstance;

const uploadRef = ref();

const loading = reactive({
  crop: false, // 裁剪中
  upload: false, // 上传中
});

provide('vatsUploadLoading', loading);

const vatsLang = inject('vatsLang', { message: {} } as { message: Record<string, string> });

// 弹框显示/隐藏
const symbolVisible = ref<boolean>(false);
// 删除的索引位置
const cropIndex = ref<number>(0);

const localUploadList = ref<IPreviewItem[]>([]);
const localUploadLoading = ref<boolean>(false);
// 不符合尺寸比例必须要裁剪的图片
const localUploadMustCrop = ref<IPreviewItem[]>([]);
// 是否正在裁剪中
const isCropping = ref<boolean>(false);

const [actionType, setActionType] = useActionType('');

const getLocaleText = (key: string, value?: { [props: string]: string | number }) => {
  return getText(vatsLang, key, value);
};

const ratio = computed(() => {
  return !aspectRatio.value ? 0 : parseFloat(aspectRatio.value.toString()).toFixed(4);
});

const showModal = () => {
  symbolVisible.value = true;
  emits('update:visible', true);
  emits('show');
};

const handleCancel = () => {
  symbolVisible.value = false;
  emits('update:visible', false);
  emits('cancel');
  if (destroyOnClose.value) {
    localUploadList.value = [];
    localUploadLoading.value = false;
    localUploadMustCrop.value = [];
    isCropping.value = false;
    loading.crop = false;
    loading.upload = false;
  }
};

let trigger: HTMLElement;
onMounted(() => {
  if (slots.default && app.subTree?.el?.nextElementSibling) {
    trigger = app.subTree?.el?.nextElementSibling;
    trigger.addEventListener('click', showModal, false);
  }
});

const waitToUpload = computed(() => {
  return localUploadList.value.filter(item => !item.uploadSuccess);
});

const alreadyUpload = computed(() => {
  return localUploadList.value.filter(item => item.uploadSuccess);
});

const handleChange = async (e: DragEvent, fromAction: 'drop' | '' = '') => {
  const fileList = Array.from(
    fromAction === 'drop'
      ? (((e as DragEvent).dataTransfer as DataTransfer).files as FileList)
      : ((e.target as HTMLInputElement).files as FileList),
  );
  (e.target as HTMLInputElement).value = '';
  (e.target as HTMLInputElement).files = null;
  if (disabled.value || isCropping.value) return;
  setActionType(fromAction);
  // 拖动上传的文件后缀名不合法
  if (
    fromAction === 'drop' &&
    extType.value &&
    fileList.some((file: File) => {
      const fileNameArray = file.name.split('.');
      return !(extType.value.includes(fileNameArray[fileNameArray.length - 1] as IFileExt));
    })
  ) {
    const errorMsg = vatsLang.message.uploaderError0;
    message.error(errorMsg);
    return emits('error', {
      code: 'FILE_TYPE_ERROR',
      message: errorMsg,
      fileList: fileList,
    } as IValidateError);
  }
  // 批量上传时，文件数量是否超过最大限制
  if (
    (typeof multiple.value === 'number' &&
      fileList.length + localUploadList.value.length > multiple.value) ||
    (multiple.value === false &&
      (localUploadList.value.length > 0 ||
        (localUploadList.value.length === 0 && fileList.length > 1)))
  ) {
    let number = 0;
    if (multiple.value === false && localUploadList.value.length === 0 && fileList.length > 1) {
      number = 1;
    }
    if (
      typeof multiple.value === 'number' &&
      fileList.length + localUploadList.value.length > multiple.value
    ) {
      number =
        multiple.value - localUploadList.value.length > 0
          ? multiple.value - localUploadList.value.length
          : 0;
    }
    const errorMsg = getLocaleText('uploaderError1', { max: number });
    message.error(errorMsg);
    return emits('error', {
      code: 'FILE_MAX_COUNT',
      message: errorMsg,
      fileList: fileList,
    } as IValidateError);
  }
  // 单个文件不能超过内存最大限制
  if (fileList.some(file => file.size / 1024 / 1024 > maxFilesSize.value)) {
    const errorMsg = getLocaleText('uploaderError2', { max: maxFilesSize.value });
    message.error(errorMsg);
    return emits('error', {
      code: 'FILE_MAX_SIZE',
      message: errorMsg,
      fileList: fileList,
    } as IValidateError);
  }

  const fileArray: IPreviewItem[] = [];
  const mustCropArray: IPreviewItem[] = [];
  localUploadLoading.value = true;
  for (const file of fileList) {
    try {
      const fileItem = await canvasToFile(
        file,
        {
          maxHeight: maxHeight.value,
          maxWidth: maxWidth.value,
          minCropBoxHeight: minCropBoxHeight.value,
          minCropBoxWidth: minCropBoxWidth.value,
        },
        getLocaleText,
      );
      if (
        ratio.value &&
        fileItem.file.type !== 'image/gif' &&
        ratio.value !== fileItem.aspectRatio
      ) {
        mustCropArray.push(fileItem);
      } else {
        fileArray.push(fileItem);
      }
    } catch (e) {
      localUploadLoading.value = false;
      message.error((e as any).message);
      return emits('error', e);
    }
  }

  localUploadLoading.value = false;

  localUploadList.value = [...toRaw(localUploadList.value), ...fileArray];
  localUploadMustCrop.value = [...toRaw(localUploadMustCrop.value), ...mustCropArray];

  if (localUploadMustCrop.value.length > 0) {
    isCropping.value = true;
    cropIndex.value = 0;
    uploadRef.value.setCurrent(
      {
        ...toRaw(localUploadMustCrop.value[0]),
      },
      0,
    );
    uploadRef.value.initCrop();
  }

  emits('change', fileList);
};

const handleDelete = (item: IPreviewItem | null, index: number) => {
  if (localUploadMustCrop.value.length > 0) {
    localUploadMustCrop.value.splice(index, 1);
    if (isCropping.value) {
      if (localUploadMustCrop.value.length === 0) {
        isCropping.value = false;
      } else {
        let len = localUploadMustCrop.value.length - 1;
        let realIndex = index > len ? len : index;
        cropIndex.value = realIndex;
        uploadRef.value.setCurrent({ ...toRaw(localUploadMustCrop.value[realIndex]) }, realIndex);
        uploadRef.value.initCrop();
      }
    }
  } else {
    localUploadList.value.splice(index, 1);
    if (isCropping.value) {
      if (localUploadList.value.length === 0) {
        isCropping.value = false;
      } else {
        let len = localUploadList.value.length - 1;
        let realIndex = index > len ? len : index;
        cropIndex.value = realIndex;
        uploadRef.value.setCurrent({ ...toRaw(localUploadList.value[realIndex]) }, realIndex);
        uploadRef.value.initCrop();
      }
    }
  }
};

const handleCrop = (item: IPreviewItem, index: number) => {
  isCropping.value = true;
  cropIndex.value = index;
};

const handleConfirmCrop = (item: IPreviewItem, index: number, isMustCrop = false) => {
  if (isMustCrop) {
    localUploadMustCrop.value.splice(index, 1);
    localUploadList.value.push(item);
    if (localUploadMustCrop.value.length === 0) {
      isCropping.value = false;
      cropIndex.value = -1;
    }
  } else {
    localUploadList.value.splice(index, 1, item);
    isCropping.value = false;
    cropIndex.value = -1;
  }
};

const handleCropBack = () => {
  if (localUploadMustCrop.value.length > 0) {
    Modal.confirm({
      title: getLocaleText('uploaderBackTitle'),
      icon: createVNode(ExclamationCircleOutlined),
      content: getLocaleText('uploaderBackMsg'),
      async onOk() {
        isCropping.value = false;
        cropIndex.value = 0;
        localUploadMustCrop.value = [];
        loading.crop = false;
        return true;
      },
    });
  } else {
    isCropping.value = false;
    loading.crop = false;
    cropIndex.value = 0;
  }
};

const handleOK = () => {
  const array = alreadyUpload.value.map((item: IPreviewItem) => {
    const { url, name, size, width, height } = item;
    return {
      url,
      name,
      size,
      width,
      height,
    };
  });
  if (waitToUpload.value.length > 0) {
    return Modal.confirm({
      title: getLocaleText('uploadWaitTitle'),
      icon: createVNode(ExclamationCircleOutlined),
      content: getLocaleText('uploadWaitMsg', { number: waitToUpload.value.length }),
      async onOk() {
        handleCancel();
        emits('ok', array);
        return true;
      },
    });
  }
  handleCancel();
  emits('ok', array);
};

const handleToCrop = () => {
  uploadRef.value.confirmCrop(localUploadMustCrop.value.length > 0);
};

const handleToNext = () => {
  uploadRef.value.toNext();
};

const handleToPrev = () => {
  uploadRef.value.toPrev();
};

const handleUpload = async () => {
  loading.upload = true;
  for (let i = 0; i < localUploadList.value.length; i++) {
    if (localUploadList.value[i].uploadSuccess) {
      continue;
    }
    try {
      localUploadList.value[i].uploadLoading = true;
      await upload.value({
        ...toRaw(localUploadList.value[i]),
      });
    } catch (e) {
      message.error(getLocaleText('uploadError'));
      localUploadList.value[i].uploadLoading = false;
      localUploadList.value[i].uploadFail = true;
      emits('error', e);
    }
  }
  loading.upload = false;
};
</script>

<style lang="scss">
.vats-drop-container {
  position: relative;
  height: calc(100vh - 400px);
  overflow: auto;

  &.dragover {
    background: #fafafa;
  }
}

.vats-uploader-footer {
  justify-content: flex-end;
}

[vats-mode='dark'] .vats-drop-container.dragover {
  background: hsla(0, 0%, 100%, 0.04);
}
</style>
