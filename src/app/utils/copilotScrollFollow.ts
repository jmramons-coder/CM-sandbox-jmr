export function findScrollableAncestor(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

export function isNearScrollBottom(container: HTMLElement, threshold = 96): boolean {
  return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
}

export function scrollContainerToBottom(
  container: HTMLElement,
  behavior: ScrollBehavior = 'auto',
): void {
  container.scrollTo({ top: container.scrollHeight, behavior });
}
