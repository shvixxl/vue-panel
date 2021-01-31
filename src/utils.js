export function getCursorPositionFromEvent(event) {
  const x = event.touches ? event.touches[0].clientX : event.clientX
  const y = event.touches ? event.touches[0].clientY : event.clientY

  return { x, y }
}

export function getElementPosition(element) {
  const computedStyle = window.getComputedStyle(element)

  const left = element.offsetLeft - parseFloat(computedStyle.getPropertyValue('margin-left'))
  const top = element.offsetTop - parseFloat(computedStyle.getPropertyValue('margin-top'))

  return { left, top }
}

export function getElementSize(element) {
  const computedStyle = window.getComputedStyle(element)

  const widthProps = [
    'margin-left',
    'padding-left',
    'width',
    'padding-right',
    'margin-right'
  ]

  const heightProps = [
    'margin-top',
    'padding-top',
    'height',
    'padding-bottom',
    'margin-bottom'
  ]

  const callback = (acc, prop) => {
    return acc + parseFloat(computedStyle.getPropertyValue(prop))
  }

  const width = widthProps.reduce(callback, 0)
  const height = heightProps.reduce(callback, 0)

  return { width, height }
}

export function limitPosition(
  elementX,
  elementY,
  elementWidth,
  elementHeight,
  parentWidth,
  parentHeight,
) {
  const x = Math.min(Math.max(elementX, 0), parentWidth - elementWidth)
  const y = Math.min(Math.max(elementY, 0), parentHeight - elementHeight)

  return { x, y }
}