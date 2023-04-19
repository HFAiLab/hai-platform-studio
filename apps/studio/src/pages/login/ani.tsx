import anime from 'animejs'
import React, { useEffect, useState } from 'react'
import useEffectOnce from 'react-use/esm/useEffectOnce'

interface AniProp {
  stage: 1 | 2
  completedCallback?(): void
}

export const Ani = (p: AniProp) => {
  const [cut1, setCut1] = useState<anime.AnimeInstance[] | null>(null)

  useEffectOnce(() => {
    const action1 = () => {
      return [
        anime({
          targets: '.ani-login #tPoly',
          keyframes: [
            { points: '380 120 380 266 380 333 380 480 20 480 20 120' },
            { points: '20 120 380 120 380 480 20 480 20 333 20 266', duration: 0 },
            { points: '380 120 380 266 380 333 380 480 20 480 20 120' },
            { points: '20 120 380 120 380 480 20 480 20 333 20 266', duration: 0 },
            { points: '200 120 380 266.25 380 333.75 200 480 20 333.75 20 266.25' },
          ],
          easing: 'easeInOutQuad',
          duration: 20000,
          // direction: 'alternate',
          loop: true,
        }),
        //  <circle id="hfc1" cx="140" cy="160" r="60" fill="#3D47F4" stroke-width="2"/>
        anime({
          targets: '.ani-login #hfc1',
          cx: [{ value: '170' }, { value: '120' }, { value: '130' }, { value: '100' }],
          cy: [{ value: '180' }, { value: '140' }, { value: '170' }, { value: '130' }],
          scale: [{ value: 0.9 }, { value: 1.1 }, { value: 0.9 }, { value: 1.1 }],
          easing: 'easeInOutQuad',
          duration: 15000,
          direction: 'alternate',
          loop: true,
        }),
        //  <circle id="hfc2" cx="100" cy="440" r="26" stroke="#3D47F4" stroke-width="2" />
        anime({
          targets: '.ani-login #hfc2',
          cx: [{ value: '110' }, { value: '90' }, { value: '120' }],
          cy: [{ value: '420' }, { value: '460' }, { value: '438' }],
          scale: [{ value: 0.9 }, { value: 1.1 }, { value: 0.95 }],
          easing: 'easeInOutQuad',
          duration: 22000,
          direction: 'alternate',
          loop: true,
        }),

        //  <circle id="hfc3" cx="300" cy="500" r="15" stroke="#3D47F4" stroke-width="2" />
        anime({
          targets: '.ani-login #hfc3',
          cx: [{ value: '290' }, { value: '310' }, { value: '285' }, { value: '310' }],
          cy: [{ value: '480' }, { value: '512' }, { value: '490' }, { value: '512' }],
          scale: [{ value: 0.95 }, { value: 1.05 }, { value: 0.95 }, { value: 1.1 }],
          easing: 'easeInOutQuad',
          duration: 22000,
          direction: 'alternate',
          loop: true,
        }),
      ]
    }

    if (cut1) {
      cut1.forEach((ani) => ani.pause())
    }
    requestAnimationFrame(() => setCut1(action1()))
  })

  useEffect(() => {
    // 放在外面的话，每次都会声明，可能有问题，而且也浪费
    const action2 = (prev_cut: anime.AnimeInstance[]) => {
      prev_cut.forEach((ani) => ani.pause())
      const cut2 = [
        anime({
          targets: '.ani-login #tPoly',
          points: '200 170 330 275 330 325 200 430 70 325 70 275',
          scale: 1,
          easing: 'easeInOutQuad',
          duration: 1000,
          loop: false,
          autoplay: false,
          complete: () => {
            if (!window.is_hai_studio) {
              anime({
                targets: '.ani-login .inner-line',
                strokeDashoffset: 0,
                easing: 'easeInOutQuad',
                duration: 1000,
              })
              anime({
                targets: '.ani-login .s-w-change',
                strokeWidth: 6,
                duration: 1000,
                easing: 'easeInOutQuad',
                complete: () => {
                  if (p.completedCallback) {
                    p.completedCallback()
                  }
                },
              })
            } else {
              setTimeout(() => {
                if (p.completedCallback) {
                  p.completedCallback()
                }
              }, 1000)
            }
          },
        }),
        anime({
          targets: '.ani-login #hfc1',
          cy: -100,
          easing: 'easeInOutQuad',
          duration: 1000,
          autoplay: false,
        }),
        anime({
          targets: '.ani-login #hfc2',
          cy: -100,
          easing: 'easeInOutQuad',
          duration: 1000,
          autoplay: false,
        }),
        anime({
          targets: '.ani-login #hfc3',
          cy: -100,
          easing: 'easeInOutQuad',
          duration: 1000,
          autoplay: false,
        }),
      ]
      cut2.forEach((ani) => ani.play())
    }

    if (p.stage === 2) {
      if (cut1) {
        action2(cut1)
      }
    }
  }, [p, cut1])

  return (
    <div
      className="ani-login"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `<svg viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="600" fill="none" />
            <polygon class="s-w-change" id="tPoly" points="200 120 380 266.25 380 333.75 200 480 20 333.75 20 266.25"
                style="fill:none; stroke:#3D47F4;" stroke-width="2" />
            <circle id="hfc1" cx="140" cy="160" r="60" fill="#3D47F4EE" stroke-width="2" />
            <circle id="hfc2" cx="100" cy="440" r="26" stroke="#3D47F4" stroke-width="2" />
            <circle id="hfc3" cx="300" cy="500" r="15" stroke="#3D47F4" stroke-width="2" />

            <path class="inner-line s-w-change" d="M168.5 301L201.102 274L267 328.5L200.408 383L70 276.096" stroke="#3D47F4"
                style="stroke-dashoffset:400" stroke-dasharray="400" stroke-width="2" stroke-linejoin="round" />
            <path class="inner-line s-w-change" d="M231.5 299L198.898 326L133 271.5L199.592 217L330 323.904" stroke="#3D47F4"
                style="stroke-dashoffset:400" stroke-dasharray="400" stroke-width="2" stroke-linejoin="round" />
        </svg>`,
      }}
    />
  )
}
