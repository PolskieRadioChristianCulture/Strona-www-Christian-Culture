import { createApp } from 'vue';
import { LumiDirectDock, type DirectMessagingAdapter } from './index';

/**
 * Montuje natywny komponent Vue 3 LUMI Direct Dock w wybranym kontenerze DOM.
 */
export function mountLumiDirectDock(target: HTMLElement | string, adapter: DirectMessagingAdapter) {
  const app = createApp(LumiDirectDock, { adapter });
  app.mount(target);
  return app;
}
