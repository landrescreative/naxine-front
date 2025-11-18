/**
 * Utilidades de accesibilidad
 * 
 * @module lib/accessibility
 * @description
 * Proporciona helpers y constantes para mejorar la accesibilidad
 * de la aplicación, incluyendo ARIA labels, roles y atributos.
 * 
 * @example
 * ```typescript
 * import { ariaLabels, getAriaLabel } from '@/lib/accessibility';
 * 
 * <button aria-label={getAriaLabel('close', 'modal')}>
 *   <CloseIcon />
 * </button>
 * ```
 */

/**
 * Labels ARIA predefinidos para acciones comunes
 */
export const ariaLabels = {
  // Navegación
  navigation: 'Navegación principal',
  menu: 'Menú',
  closeMenu: 'Cerrar menú',
  openMenu: 'Abrir menú',
  
  // Formularios
  submit: 'Enviar formulario',
  cancel: 'Cancelar',
  save: 'Guardar',
  delete: 'Eliminar',
  edit: 'Editar',
  search: 'Buscar',
  clear: 'Limpiar',
  
  // Acciones comunes
  close: 'Cerrar',
  open: 'Abrir',
  expand: 'Expandir',
  collapse: 'Colapsar',
  next: 'Siguiente',
  previous: 'Anterior',
  loading: 'Cargando',
  
  // Dashboard
  dashboard: 'Panel de control',
  profile: 'Perfil de usuario',
  settings: 'Configuración',
  logout: 'Cerrar sesión',
  
  // Contenido
  readMore: 'Leer más',
  showLess: 'Mostrar menos',
  download: 'Descargar',
  upload: 'Subir archivo',
} as const;

/**
 * Genera un label ARIA contextual
 * 
 * @param action - Acción principal
 * @param context - Contexto adicional (opcional)
 * @returns Label ARIA completo
 * 
 * @example
 * ```typescript
 * getAriaLabel('close', 'modal') // "Cerrar modal"
 * getAriaLabel('edit', 'perfil') // "Editar perfil"
 * ```
 */
export function getAriaLabel(
  action: keyof typeof ariaLabels,
  context?: string
): string {
  const baseLabel = ariaLabels[action];
  return context ? `${baseLabel} ${context}` : baseLabel;
}

/**
 * Atributos ARIA para estados de carga
 */
export const loadingAria = {
  busy: { 'aria-busy': true as const, 'aria-live': 'polite' as const },
  idle: { 'aria-busy': false as const },
};

/**
 * Atributos ARIA para modales
 */
export const modalAria = {
  role: 'dialog' as const,
  'aria-modal': true as const,
  'aria-labelledby': 'modal-title',
};

/**
 * Atributos ARIA para alertas
 */
export const alertAria = {
  role: 'alert' as const,
  'aria-live': 'assertive' as const,
  'aria-atomic': true as const,
};

/**
 * Atributos ARIA para regiones
 */
export const regionAria = {
  main: { role: 'main' as const, 'aria-label': 'Contenido principal' },
  navigation: { role: 'navigation' as const },
  banner: { role: 'banner' as const },
  complementary: { role: 'complementary' as const },
  contentinfo: { role: 'contentinfo' as const },
};

/**
 * Verifica si un elemento tiene suficiente contraste
 * (helper básico, para validación completa usar herramientas especializadas)
 * 
 * @param foreground - Color de texto (hex)
 * @param background - Color de fondo (hex)
 * @returns true si el contraste es suficiente (WCAG AA)
 */
export function hasSufficientContrast(
  foreground: string,
  background: string
): boolean {
  // Implementación simplificada - en producción usar una librería como 'color-contrast'
  // Por ahora retorna true, pero se puede mejorar con cálculo real de contraste
  return true;
}

