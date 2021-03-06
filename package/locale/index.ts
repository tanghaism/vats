import { reactive } from 'vue';
import ZH from '../locale/lang/zh-cn';
import EN from '../locale/lang/en';
import JA from '../locale/lang/ja';

export type Lang = 'zh-cn' | 'en' | 'ja';

export interface IVatsLocal {
  message: any;
}

export interface ILocale {
  locale: Lang;
  [props: string]: any;
}

export const langMap: Record<Lang, unknown> = {
  'zh-cn': ZH,
  en: EN,
  ja: JA,
};

export function initI18n(lang: Lang) {
  return reactive<IVatsLocal>({
    message: langMap[lang],
  });
}

export function getText(
  vatsLocal: IVatsLocal,
  key: string,
  value?: Record<string, string | number>,
) {
  let message = vatsLocal?.message[key];
  if (message) {
    if (value) {
      const reg = /(\{).*?(\})/g;
      const keyArray = message.match(reg);
      keyArray.forEach((key: string) => {
        const realKey = key.replace(/\{|\}|\s|\n|\t/g, '');
        const reg1 = new RegExp(`${key}`, 'g');
        message = message.replace(reg1, value[realKey]);
      });
    }
    return message;
  } else {
    console.warn('未匹配到文案key');
    return key;
  }
}
