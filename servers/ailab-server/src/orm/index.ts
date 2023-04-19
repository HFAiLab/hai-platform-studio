import { Sequelize } from 'sequelize'
import { GlobalConfig } from '../config'
import { AppVersionController } from './controllers/AppVersion'
import { LogUploadController } from './controllers/LogUpload'
import { UserConfigController } from './controllers/UserConfig'
import { ClusterUserMessageController } from './controllers/UserMessage'
import { XTopicCarouselController } from './controllers/xtopic/Carousel'
import { XTopicCategoryController } from './controllers/xtopic/Category'
import { XTopicLikeController } from './controllers/xtopic/Like'
import { XTopicNotificationController } from './controllers/xtopic/Notification'
import { XTopicNotificationMassSendingHistoryController } from './controllers/xtopic/NotificationMassSendingHistory'
import { XTopicNotificationTemplateController } from './controllers/xtopic/NotificationTemplate'
import { XTopicNotificationTriggerController } from './controllers/xtopic/NotificationTrigger'
import { XTopicPostController } from './controllers/xtopic/Post'
import { XTopicReplyController } from './controllers/xtopic/Reply'
import { XTopicReportController } from './controllers/xtopic/Report'
import { XTopicTopContentController } from './controllers/xtopic/TopContent'
import { XTopicTopTagController } from './controllers/xtopic/TopTag'
import { XTopicUserController } from './controllers/xtopic/User'
import { XTopicPost } from './models/xtopic/Post'
import { XTopicReply } from './models/xtopic/Reply'

let sequelizeClient: HFSequelize
export class HFSequelize {
  static async getInstance() {
    if (sequelizeClient) return sequelizeClient
    sequelizeClient = new HFSequelize()

    await sequelizeClient.sequelize.sync({ force: false })
    return sequelizeClient
  }

  public sequelize: Sequelize

  private userConfigController: UserConfigController

  private logUploadController: LogUploadController

  private appVersionController: AppVersionController

  private xTopicPostController: XTopicPostController

  private xtopicReplyController: XTopicReplyController

  private xTopicCategoryController: XTopicCategoryController

  private xTopicUserController: XTopicUserController

  private xTopicTopTagController: XTopicTopTagController

  private xTopicLikeController: XTopicLikeController

  private xTopicCarouselController: XTopicCarouselController

  private xTopicTopContentController: XTopicTopContentController

  private xTopicReportController: XTopicReportController

  private xTopicNotificationController: XTopicNotificationController

  private xTopicNotificationTemplateController: XTopicNotificationTemplateController

  private xTopicNotificationTriggerController: XTopicNotificationTriggerController

  private xTopicNotificationMassSendingHistoryController: XTopicNotificationMassSendingHistoryController

  private clusterUserMessageController: ClusterUserMessageController

  constructor() {
    this.sequelize = new Sequelize(GlobalConfig.STUDIO_CLUSTER_PGSQL)
    this.userConfigController = new UserConfigController(this.sequelize)
    this.logUploadController = new LogUploadController(this.sequelize)
    this.appVersionController = new AppVersionController(this.sequelize)
    this.appVersionController = new AppVersionController(this.sequelize)
    this.xTopicPostController = new XTopicPostController(this.sequelize)
    this.xtopicReplyController = new XTopicReplyController(this.sequelize)
    this.xTopicCategoryController = new XTopicCategoryController(this.sequelize)
    this.xTopicUserController = new XTopicUserController(this.sequelize)
    this.xTopicLikeController = new XTopicLikeController(this.sequelize)
    this.xTopicTopTagController = new XTopicTopTagController(this.sequelize)
    this.xTopicCarouselController = new XTopicCarouselController(this.sequelize)
    this.xTopicTopContentController = new XTopicTopContentController(this.sequelize)
    this.xTopicReportController = new XTopicReportController(this.sequelize)
    this.xTopicNotificationController = new XTopicNotificationController(this.sequelize)
    this.xTopicNotificationTemplateController = new XTopicNotificationTemplateController(
      this.sequelize,
    )
    this.xTopicNotificationTriggerController = new XTopicNotificationTriggerController(
      this.sequelize,
    )
    this.xTopicNotificationMassSendingHistoryController =
      new XTopicNotificationMassSendingHistoryController(this.sequelize)
    this.clusterUserMessageController = new ClusterUserMessageController(this.sequelize)

    XTopicPost.hasMany(XTopicReply, {
      sourceKey: 'index',
      foreignKey: 'postIndex',
    })
  }

  get UserConfig() {
    return this.userConfigController
  }

  get LogUploadRequest() {
    return this.logUploadController
  }

  get AppVersion() {
    return this.appVersionController
  }

  get XTopicPosts() {
    return this.xTopicPostController
  }

  get XTopicReply() {
    return this.xtopicReplyController
  }

  get XTopicCategory() {
    return this.xTopicCategoryController
  }

  get XTopicUser() {
    return this.xTopicUserController
  }

  get XTopicTopTag() {
    return this.xTopicTopTagController
  }

  get XTopicLike() {
    return this.xTopicLikeController
  }

  get xTopicCarousel() {
    return this.xTopicCarouselController
  }

  get xTopicTopContent() {
    return this.xTopicTopContentController
  }

  get xTopicReport() {
    return this.xTopicReportController
  }

  get xTopicNotification() {
    return this.xTopicNotificationController
  }

  get xTopicNotificationTemplate() {
    return this.xTopicNotificationTemplateController
  }

  get xTopicNotificationTrigger() {
    return this.xTopicNotificationTriggerController
  }

  get xTopicNotificationMassSendingHistory() {
    return this.xTopicNotificationMassSendingHistoryController
  }

  get clusterUserMessage() {
    return this.clusterUserMessageController
  }
}
