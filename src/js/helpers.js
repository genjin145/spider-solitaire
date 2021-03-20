export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]]
  }
}

export function intersectionRect(x1, y1, x2, y2, x3, y3, x4, y4) {
  const left = Math.max(x1, x3)
  const top = Math.min(y2, y4)
  const right = Math.min(x2, x4)
  const bottom = Math.max(y1, y3)

  const width = right - left
  const height = top - bottom

  if (width < 0 || height < 0) {
    return 0
  }

  return width * height
}