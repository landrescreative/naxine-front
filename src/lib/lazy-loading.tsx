/**
 * Utilidades para lazy loading de componentes
 * 
 * @module lib/lazy-loading
 * @description
 * Proporciona helpers para implementar lazy loading y code splitting
 * en componentes pesados de la aplicación.
 * 
 * @example
 * ```typescript
 * import { lazyLoad } from '@/lib/lazy-loading';
 * 
 * const HeavyChart = lazyLoad(() => import('@/components/charts/HeavyChart'));
 * 
 * function Dashboard() {
 *   return (
 *     <Suspense fallback={<ChartSkeleton />}>
 *       <HeavyChart data={data} />
 *     </Suspense>
 *   );
 * }
 * ```
 */

import { lazy, ComponentType } from 'react';

/**
 * Wrapper para React.lazy con mejor tipado
 * 
 * @template P - Props del componente
 * @param importFn - Función que retorna una promesa del componente
 * @returns Componente lazy-loaded
 * 
 * @example
 * ```typescript
 * const MyComponent = lazyLoad(() => import('./MyComponent'));
 * ```
 */
export function lazyLoad<P = Record<string, never>>(
  importFn: () => Promise<{ default: ComponentType<P> }>
): ComponentType<P> {
  return lazy(importFn) as ComponentType<P>;
}

/**
 * Preload un componente lazy para mejorar la experiencia de usuario
 * 
 * @param importFn - Función que retorna una promesa del componente
 * 
 * @example
 * ```typescript
 * // Preload cuando el usuario hace hover sobre un botón
 * <button 
 *   onMouseEnter={() => preloadComponent(() => import('./HeavyComponent'))}
 *   onClick={() => setShowComponent(true)}
 * >
 *   Cargar componente
 * </button>
 * ```
 */
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
): void {
  importFn();
}

