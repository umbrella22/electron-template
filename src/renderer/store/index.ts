import Store from '@/renderer/common/store';
import { windowUpdate } from '@/renderer/common/window';

export function setCustomize(args: Customize) {
  Store.set('customize', args);
}

export function getCustomize() {
  return Store.get<Customize>('customize') as Customize;
}

/**
 * 更新页面路由信息
 */
export function updateCustomizeRoute(route: string) {
  let customize = getCustomize();
  customize.route = route;
  setCustomize(customize);
  windowUpdate(customize);
}

export function testProxy(date: string, el: HTMLElement): ProxyValue<string> {
  return Store.setProxy('test', date, (value) => (el.textContent = value));
}

export function testProxyRemove() {
  Store.removeProxy('test');
}
