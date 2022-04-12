import Loading from '../loading/index.vue';
import { createApp, nextTick, App, ComponentInternalInstance, DirectiveBinding } from 'vue';

interface CustomerProperty extends HTMLElement {
  originalPosition: string;
  domInserted: boolean;
  comp: any;
  loadingRoot: HTMLElement;
  loading: any;
}

export default {
  install: (app: App) => {
    const insertDom = (el: CustomerProperty) => {
      if (
        getComputedStyle(el, null).display !== 'none' &&
        getComputedStyle(el, null).visibility !== 'hidden'
      ) {
        if (el.originalPosition !== 'absolute' && el.originalPosition !== 'fixed') {
          el.style.position = 'relative';
        }
        el.comp.cShow = true;
        el.comp.root = (app._instance as ComponentInternalInstance)?.root?.proxy;
        el?.appendChild(el?.loadingRoot);
      }
    };

    const removeDom = (el: CustomerProperty) => {
      el &&
        setTimeout(() => {
          el.domInserted = false;
          (el as CustomerProperty)?.loadingRoot?.parentElement?.removeChild(el?.loadingRoot);
          // el.removeChild(el.loadingRoot);
        }, 300);
    };

    const toggleLoading = async (el: CustomerProperty, binding: DirectiveBinding) => {
      let _show = true;

      if (typeof binding.value === 'object') {
        const { show } = binding.value;
        _show = show;
      } else {
        _show = binding.value;
      }
      if (_show) {
        await nextTick(() => {
          el.originalPosition = getComputedStyle(el, null).position;
          insertDom(el);
        });
        el.domInserted = true;
      } else {
        el.comp.cShow = false;
        if (el.domInserted) {
          removeDom(el);
        }
      }
    };

    app.directive('loading', {
      async beforeMount(el: CustomerProperty, binding: any) {
        const loading = createApp(Loading);

        el.loading = el;
        el.loadingRoot = document.createElement('div');
        el.comp = loading.mount(el.loadingRoot);
        await toggleLoading(el, binding);
      },
      async updated(el: CustomerProperty, binding: any) {
        if (binding.oldValue !== binding.value) {
          await toggleLoading(el, binding);
        }
      },
      async beforeUnmount(el: CustomerProperty) {
        if (el.domInserted) {
          el.loading = el;
          removeDom(el);
          // await toggleLoading(el, { value: false } as DirectiveBinding);
        }
        el.comp = null;
      },
    });
  },
};
