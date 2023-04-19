import type { XTopicCarouselListResult } from '@hai-platform/client-ailab-server'
import classNames from 'classnames'
import React from 'react'
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/css'
import './Carousel.scss'
import { HFPanel } from '../../../components/HFPanel'

export interface XTopicCarouselProps {
  carousels: XTopicCarouselListResult | undefined
}

export const XTopicCarousel = (props: XTopicCarouselProps) => {
  const carousels = props.carousels?.list || []

  return (
    <HFPanel className="xtopic-carousel-container" title="技术博客" shadow disableLoading>
      <Swiper
        spaceBetween={0}
        centeredSlides
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        loop
        pagination={false}
        navigation
        className="join-swiper"
        speed={600}
        slidesPerView={1}
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
      >
        {carousels.map((carousel) => {
          return (
            <SwiperSlide key={carousel.image} className="carousel-swiper-side">
              <a target="_blank" href={carousel.link} rel="noreferrer">
                <div
                  className={classNames(`carousel-swiper-image`)}
                  style={{
                    backgroundImage: `url(${carousel.image})`,
                  }}
                />
                <div className="carousel-swiper-title">{carousel.title}</div>
              </a>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </HFPanel>
  )
}
