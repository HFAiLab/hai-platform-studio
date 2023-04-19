import type { Sequelize } from 'sequelize'
import { XTopicCarousel, XTopicCarouselInit } from '../../models/xtopic/Carousel'

export class XTopicCarouselController {
  constructor(sequelize: Sequelize) {
    XTopicCarouselInit(sequelize)
  }

  async list() {
    const itemList = await XTopicCarousel.findAll({
      order: [['order', 'desc']],
    })
    return itemList
  }
}
