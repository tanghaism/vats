export declare type Lang = 'zh-cn' | 'en' | 'ja';
export interface IVatsLocal {
    message: any;
}
export interface ILocale {
    locale: Lang;
    [props: string]: any;
}
export declare function initI18n(lang: Lang): {
    message: any;
};
export declare function getText(vatsLocal: IVatsLocal, key: string, value?: Record<string, string | number>): any;
