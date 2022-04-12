import './theme/theme.scss';
import { App } from 'vue';
import vPermission from './directive/v-permission';
import vLoading from './directive/v-loading';
import VatsLoading from './loading/index.vue';
import VatsProvider from './provider/index.vue';
import VatsSelect from './select/index.vue';
import VatsPage from './page/index.vue';
import VatsTable from './table/index.vue';
import VatsDrawer from './drawer/index.vue';
import VatsButton from './button/index.vue';
import VatsUploader from './uploader/index.vue';
import { isMobile } from './utils/isMobile';
import { debounced } from './utils/debounced';
declare const _default: {
    install: (app: App<any>) => void;
};
export default _default;
export { vPermission, vLoading, VatsLoading, VatsProvider, VatsPage, VatsSelect, VatsTable, VatsDrawer, VatsButton, VatsUploader, isMobile, debounced, };
