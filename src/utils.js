export function getCursorPositionFromEvent(event) {
  return [
    event.touches ? event.touches[0].clientX : event.clientX,
    event.touches ? event.touches[0].clientY : event.clientY,
  ]
}

export function limitPosition(x, y, w=0, h=0) {
  const clientWidth = document.documentElement.clientWidth
  const clientHeight = document.documentElement.clientHeight
  
  return [
    Math.min(Math.max(x, 0), clientWidth - w),
    Math.min(Math.max(y, 0), clientHeight - h),
  ]
}
