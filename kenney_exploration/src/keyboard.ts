export type Keyboard = {
  onAnyKeyDown: (f: (key: string) => void) => void;
  onKeyDown: (key: string, f: () => void) => void;
  onKeyUp: (key: string, f: () => void) => void;
};

export function setupKeyboard(element: HTMLElement) {
  const keydown = new Map<string, () => void>();
  const keyup = new Map<string, () => void>();
  let anyKey = (_key: string) => {};
  const onAnyKeyDown = (f: (key: string) => void) => {
    anyKey = f;
  };
  const onKeyDown = (key: string, f: () => void) => {
    keydown.set(key, f);
  };
  const onKeyUp = (key: string, f: () => void) => {
    keyup.set(key, f);
  };
  element.addEventListener("keydown", (event) => {
    keydown.get(event.key)?.();
    anyKey(event.key);
    if (event.key.startsWith("Arrow")) {
      event.stopPropagation();
      event.preventDefault();
    }
  });
  element.addEventListener("keyup", (event) => {
    keyup.get(event.key)?.();
    if (event.key.startsWith("Arrow")) {
      event.stopPropagation();
      event.preventDefault();
    }
  });

  return {
    onKeyDown,
    onKeyUp,
    onAnyKeyDown,
  };
}
