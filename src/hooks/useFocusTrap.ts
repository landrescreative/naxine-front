import { useEffect, useRef, RefObject } from "react";

/**
 * Hook para atrapar el foco dentro de un modal o diálogo
 * Implementa las mejores prácticas de accesibilidad para modales
 * 
 * @param isOpen - Si el modal está abierto
 * @param onClose - Función para cerrar el modal
 * @param initialFocusRef - Ref opcional al elemento que debe recibir el foco inicial
 * @returns Ref que debe ser asignado al contenedor del modal
 */
export function useFocusTrap(
  isOpen: boolean,
  onClose?: () => void,
  initialFocusRef?: RefObject<HTMLElement>
): RefObject<HTMLElement> {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Guardar el elemento que tenía el foco antes de abrir el modal
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Obtener todos los elementos enfocables dentro del modal
    const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    };

    const container = containerRef.current;
    if (!container) return;

    // Mover el foco al modal
    const focusInitialElement = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        // Si no hay ref inicial, buscar el primer elemento enfocable
        const focusableElements = getFocusableElements(container);
        const firstElement = focusableElements[0];
        if (firstElement) {
          firstElement.focus();
        } else {
          // Si no hay elementos enfocables, enfocar el contenedor
          container.focus();
        }
      }
    };

    // Pequeño delay para asegurar que el DOM esté actualizado
    setTimeout(focusInitialElement, 100);

    // Función para manejar Tab y Shift+Tab
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Si solo hay un elemento, mantener el foco ahí
      if (focusableElements.length === 1) {
        e.preventDefault();
        firstElement.focus();
        return;
      }

      // Si se presiona Tab sin Shift
      if (!e.shiftKey) {
        // Si el último elemento tiene el foco, mover al primero
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      } else {
        // Si se presiona Shift+Tab
        // Si el primer elemento tiene el foco, mover al último
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
    };

    // Función para manejar Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    // Agregar event listeners
    container.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscape);

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscape);

      // Restaurar el foco al elemento anterior cuando se cierra el modal
      if (previousActiveElement.current) {
        // Pequeño delay para asegurar que el modal se haya cerrado
        setTimeout(() => {
          if (previousActiveElement.current && document.contains(previousActiveElement.current)) {
            previousActiveElement.current.focus();
          }
        }, 100);
      }
    };
  }, [isOpen, onClose, initialFocusRef]);

  return containerRef;
}
