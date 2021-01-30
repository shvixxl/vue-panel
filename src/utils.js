export function getCursorPositionFromEvent(event) {
  const x = event.touches ? event.touches[0].clientX : event.clientX
  const y = event.touches ? event.touches[0].clientY : event.clientY

  return [ x, y ]
}

export function getElementSize(element) {
  const computedStyle = window.getComputedStyle(target)

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

  return [ width, height ]
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

  return [ x, y ]
}