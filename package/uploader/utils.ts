import { ImageProps, IValidateError, IPreviewItem, IPrevHandleImageOptions } from './index.d';
import { Ref, ref } from 'vue';
export type IActionType = 'dragover' | 'dragleave' | 'drop' | '';

// file转blob
export function fileToBlob(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = function (e: ProgressEvent<FileReader>) {
      let blob;
      const result = (e.target as FileReader).result;
      if (typeof result === 'object') {
        blob = new Blob([result as ArrayBuffer]);
      } else {
        blob = (e.target as FileReader).result;
      }
      resolve(window?.URL.createObjectURL(blob as Blob));
    };
  });
}

// 获取图片的真实宽高
export async function getImageSize(src: string): Promise<ImageProps> {
  const image = new Image();
  image.src = src;
  return new Promise(resolve => {
    image.onload = () => {
      resolve({ width: image.width, height: image.height, image });
    };
  });
}

// 初始化及设置拖动状态
export function useActionType(
  init: IActionType = '',
): [Ref<IActionType>, (actionType: IActionType) => void] {
  const actionType = ref<IActionType>(init);

  const setActionType = (_actionType: IActionType) => {
    actionType.value = _actionType;
  };

  return [actionType, setActionType];
}

// 通过选择文件校验后，使用canvas预处理图片，压缩宽高及大小
export async function canvasToFile(
  file: File,
  options: IPrevHandleImageOptions,
  getText: (key: string, value: any) => string,
): Promise<IPreviewItem> {
  const { minCropBoxWidth, minCropBoxHeight, maxHeight, maxWidth } = options;
  const src = await fileToBlob(file);
  const { width, height, image } = await getImageSize(src);
  // gif跳过前端预处理压缩
  if (file.type !== 'image/gif') {
    if (
      (minCropBoxWidth > 0 && width < minCropBoxWidth) ||
      (minCropBoxHeight > 0 && height < minCropBoxHeight)
    ) {
      return Promise.reject({
        code: 'FILE_MIN_WITH_HEIGHT',
        message: getText('uploaderError3', { size: `${minCropBoxWidth}x${minCropBoxHeight}` }),
        fileList: [file],
      } as IValidateError);
    }
    if (width > maxWidth || height > maxHeight) {
      let canvas: HTMLCanvasElement | null = document.createElement('canvas');
      const rate = width / height;
      if (rate >= 1) {
        canvas.width = maxWidth;
        canvas.height = Math.floor(maxWidth / rate);
      } else {
        canvas.width = Math.floor(maxHeight / rate);
        canvas.height = maxHeight;
      }
      if (
        (minCropBoxWidth > 0 && canvas.width < minCropBoxWidth) ||
        (minCropBoxHeight > 0 && canvas.height < minCropBoxHeight)
      ) {
        return Promise.reject({
          code: 'FILE_MIN_WITH_HEIGHT',
          message: getText('uploaderError3', { size: `${minCropBoxWidth}x${minCropBoxHeight}` }),
          fileList: [file],
        } as IValidateError);
      }
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      //通过canvas drawImage方法绘制图片
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return new Promise(resolve => {
        (canvas as HTMLCanvasElement).toBlob(blob => {
          const newFile = new File([blob as Blob], file.name, { type: file.type });
          resolve({
            file: newFile,
            url: src,
            originUrl: src,
            name: file.name,
            width,
            height,
            size: newFile.size,
            aspectRatio: parseFloat(
              (
                (canvas as HTMLCanvasElement).width / (canvas as HTMLCanvasElement).height
              ).toString(),
            ).toFixed(4),
            uploadSuccess: false,
            uploadFail: false,
            uploadLoading: false,
          });
          canvas = null;
        }, file.type);
      });
    }
  }
  return {
    file,
    url: src,
    originUrl: src,
    name: file.name,
    width,
    height,
    size: file.size,
    aspectRatio: parseFloat((width / height).toString()).toFixed(4),
    uploadSuccess: false,
    uploadFail: false,
    uploadLoading: false,
  };
}
