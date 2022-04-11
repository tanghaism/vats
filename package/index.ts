import { App } from 'vue';
import './theme/theme.scss';

import vPermission from './directive/v-permission';
import vLoading from './directive/v-loading';

import VatsLoading from './loading/index.vue';
import VatsLayout from './layout/index.vue';
import VatsProvider from './provider/index.vue';
import VatsSelect from './select/index.vue';
import VatsPage from './page/index.vue';
import VatsTable from './table/index.vue';
import VatsDrawer from './drawer/index.vue';
import VatsButton from './button/index.vue';
import VatsUploader from './uploader/index.vue';

import { isMobile } from './utils/isMobile';
import { debounced } from './utils/debounced';

export default {
  install(app: App) {
    // 指令挂载
    [vPermission, vLoading].forEach(directive => {
      app.use(directive);
    });

    // 组件挂载
    [
      VatsLoading,
      VatsProvider,
      VatsLayout,
      VatsSelect,
      VatsPage,
      VatsTable,
      VatsDrawer,
      VatsButton,
      VatsUploader,
    ].forEach(component => {
      app.component(component.name, component);
    });
  },
};

export {
  vPermission,
  vLoading,
  VatsLoading,
  VatsProvider,
  VatsPage,
  VatsSelect,
  VatsTable,
  VatsDrawer,
  VatsButton,
  VatsUploader,
  isMobile,
  debounced,
};
