import { registerSW } from 'virtual:pwa-register';

export function setupServiceWorker() {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('App updated. Need refresh.');
    },
    onOfflineReady() {
      console.log('App is ready to work offline.');
    },
  });
}
