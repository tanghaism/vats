import { ImageProps, IPreviewItem, IPrevHandleImageOptions } from './index.d';
import { Ref } from 'vue';
export declare type IActionType = 'dragover' | 'dragleave' | 'drop' | '';
export declare function fileToBlob(file: File): Promise<string>;
export declare function getImageSize(src: string): Promise<ImageProps>;
export declare function useActionType(init?: IActionType): [Ref<IActionType>, (actionType: IActionType) => void];
export declare function canvasToFile(file: File, options: IPrevHandleImageOptions, getText: (key: string, value: any) => string): Promise<IPreviewItem>;
