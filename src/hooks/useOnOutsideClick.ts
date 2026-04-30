import { Ref, useCallback, useEffect, useRef } from 'react';

export const useOnOutsideClick = <T extends Node>(
  onOutsideCallback: () => void,
): Ref<T> => {
  const ref = useRef<T>(null);

  const listener = useCallback(
    (event: Event) => {
      if (!ref.current) return;
      // Bruk composedPath() slik at klikk inni en shadow root ikke feiltolkes
      // som outside-klikk (event.target blir retargetet til shadow host).
      const isInside = event
        .composedPath()
        .some(
          (node) =>
            node === ref.current ||
            (node instanceof Node &&
              ref.current instanceof Node &&
              ref.current.contains(node)),
        );
      if (!isInside) {
        onOutsideCallback();
      }
    },
    [ref, onOutsideCallback],
  );

  useEffect(() => {
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, listener]);

  return ref;
};
