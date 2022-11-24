
export function getScrollParent (el: HTMLElement | null): HTMLElement | null {
  if (el == null) {
    return null;
  }

  if (el.scrollHeight > el.clientHeight) {
    return el;
  } else {
    return getScrollParent(el.parentElement);
  }
}

export function findPos (_el: HTMLElement) {
  let curtop = 0;
  let curtopscroll = 0;
  let el: HTMLElement | null = _el;
  if (el.offsetParent) {
    while (el) {
      curtop += el.offsetTop;
      curtopscroll += el.offsetParent ? el.offsetParent.scrollTop : 0;
      el = el.offsetParent as HTMLElement | null;
    }
  }
  return curtop + curtopscroll;
}
