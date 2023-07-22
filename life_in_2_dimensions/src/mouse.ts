export type Mouse = {
  onMove: (f: (coords: { x: number; y: number }) => void) => void;
  onClick: (f: (coords: { x: number; y: number }) => void) => void;
};

export function setupMouse(element: HTMLElement) {
  let move: ((coords: { x: number; y: number }) => void) | undefined = undefined;
  let click: ((coords: { x: number; y: number }) => void) | undefined = undefined;
  const onMove = (f: (coords: { x: number; y: number }) => void) => {
    move = f;
  };
  const onClick = (f: (coords: { x: number; y: number }) => void) => {
    click = f;
  };
  element.addEventListener("mousemove", (event) => {
    move?.({ x: event.clientX, y: event.clientY });
  });
  element.addEventListener("mousedown", (event) => {
    click?.({ x: event.clientX, y: event.clientY });
  });

  return {
    onMove,
    onClick,
  };
}
