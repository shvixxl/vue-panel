export function getCursorPositionFromEvent(event) {
  return [
    event.touches ? event.touches[0].clientX : event.clientX,
    event.touches ? event.touches[0].clientY : event.clientY,
  ]
}

export function limitPosition(x, y, width=0, height=0) {
  const clientWidth = document.documentElement.clientWidth
  const clientHeight = document.documentElement.clientHeight

  return [
    Math.min(Math.max(x, 0), clientWidth - width),
    Math.min(Math.max(y, 0), clientHeight - height),
  ]
}
  
export function getPercentageOfViewport(width, height) {
  return [
    (width / document.documentElement.clientWidth) * 100,
    (height / document.documentElement.clientHeight) * 100,
  ]
}