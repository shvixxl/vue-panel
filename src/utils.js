export function getCursorPositionFromEvent(event) {
  return [
    event.touches ? event.touches[0].clientX : event.clientX,
    event.touches ? event.touches[0].clientY : event.clientY,
  ]
}

export function limitPosition(
  elementX,
  elementY,
  elementWidth,
  elementHeight,
  parentWidth,
  parentHeight,
) {
  return [
    Math.min(Math.max(elementX, 0), parentWidth - elementWidth),
    Math.min(Math.max(elementY, 0), parentHeight - elementHeight),
  ]
}
  
export function getPercentageOfViewport(width, height) {
  return [
    (width / document.documentElement.clientWidth) * 100,
    (height / document.documentElement.clientHeight) * 100,
  ]
}