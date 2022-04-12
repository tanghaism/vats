import { RouteLocationNormalizedLoaded } from 'vue-router';
export interface ILocalSetting {
    darkMode: boolean;
    tabVisible: boolean;
    tabFixed: boolean;
}
export interface IProvider extends ILocalSetting {
    refresh: boolean;
    cached: string[];
    [props: string]: unknown;
}
export declare const vatsProvider: IProvider;
export declare function initVatsProvider(): {
    [x: string]: unknown;
    refresh: boolean;
    cached: string[];
    darkMode: boolean;
    tabVisible: boolean;
    tabFixed: boolean;
};
export declare function setVatsProvider(provider: IProvider): void;
export declare function resetCached(provider: IProvider, route: RouteLocationNormalizedLoaded, resetAll?: boolean): Promise<boolean>;
