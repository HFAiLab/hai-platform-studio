export function windowSmoothScroll(to: number, speed = 1000): void {
  const begin = Date.now()
  const beginTop = window.pageYOffset
  const direction = to > beginTop ? 'down' : 'up'
  const distance = Math.abs(to - beginTop)

  const smoothHelper = (): void => {
    const currentTimeStamp = Date.now()
    const dur = currentTimeStamp - begin
    const moved = (dur / 1000) * speed
    if (moved > distance) {
      window.scrollTo({
        top: to,
      })
    } else {
      const stepTo = direction === 'down' ? beginTop + moved : beginTop - moved
      window.scrollTo({
        top: stepTo,
      })
      window.requestAnimationFrame(smoothHelper)
    }
  }

  smoothHelper()
}

export function scrollToBottom() {
  const bottom = window.document.body.scrollHeight
  windowSmoothScroll(bottom, 6000)
}
