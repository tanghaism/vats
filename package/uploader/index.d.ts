// 空状态相关属性
export interface IEmptyProps {
  // 本地上传空状态标题
  emptyTitle?: string;
  // 本地上传空状态二级标题
  emptySubTitle?: string;
}

// 裁剪相关属性
export interface ICropProps {
  // 裁剪的宽高比
  aspectRatio: number;
  // 可裁剪到的最小宽度
  minCropBoxWidth: number;
  // 可裁剪到的最小高度
  minCropBoxHeight: number;
}

// 文件后缀
export type IFileExt = 'jpg' | 'png' | 'webp' | 'jpeg' | 'gif' | 'tif' | 'tiff';
// 文件类型
export type IFileType = 'image/gif' | 'image/jpeg' | 'image/png' | 'image/tiff' | 'image/webp';

export interface IPreviewItem {
  file: File;
  name: string;
  url: string;
  originUrl: string;
  width: number;
  height: number;
  size: number;
  uploadSuccess: boolean;
  uploadFail: boolean;
  uploadLoading: boolean;
  aspectRatio?: string;
}

export interface ImageProps {
  width: number;
  height: number;
  image: HTMLImageElement;
}

// code:
// FILE_TYPE_ERROR：文件类型错误,
// FILE_MAX_COUNT: 文件数量超过上传数量限制
// FILE_MAX_SIZE: 文件内存超过上传内存限制
// FILE_MIN_WITH_HEIGHT: 文件的宽高小于可裁剪到的最低宽高
export interface IValidateError {
  code:
    | 'FILE_TYPE_ERROR'
    | 'FILE_MAX_COUNT'
    | 'FILE_MAX_SIZE'
    | 'FILE_MIN_WITH_HEIGHT'
    | 'FILE_UPLOAD_ERROR'
    | 'FILE_LIST_ERROR';
  message: string;
  fileList: File[];
}

export interface IPrevHandleImageOptions {
  minCropBoxWidth: number;
  minCropBoxHeight: number;
  maxWidth: number;
  maxHeight: number;
}
