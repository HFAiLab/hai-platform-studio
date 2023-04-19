import { AilabServerApiName } from '@hai-platform/client-ailab-server'
import type { XTopicUserDetailResult } from '@hai-platform/client-ailab-server'
import { Button, FileInput, InputGroup } from '@hai-ui/core'
import React, { useEffect, useState } from 'react'
import Cropper from 'react-cropper'
import { GlobalAilabServerClient } from '../../api/ailabServer'
import { conn } from '../../api/serverConnection'
import { AppToaster, TOPIC_DEFAULT_AVATAR_SRC, getUserName } from '../../utils'

import './index.scss'

const EditAvatar = (props: {
  user: XTopicUserDetailResult | null
  updateHandler: (type: 'nickname' | 'bio' | 'avatar', value: string) => Promise<void>
}) => {
  const rawAvatar = props.user?.avatar ?? ''
  // 显示头像的 URL
  const [image, setImage] = useState(rawAvatar)
  // 编辑模式时上传的文件
  const [file, setFile] = useState<File | null>(null)
  // 编辑模式时上传文件时的错误提示
  const [avatarErr, setAvatarErr] = useState('')
  // 裁剪器 canvas 实例
  const [cropper, setCropper] = useState<any>()

  const nicknameNotReady = !props.user?.nickname

  const getAvatarErr = () => {
    if (nicknameNotReady) {
      return '请先设置一个昵称'
    }
    return avatarErr
  }

  const loadLocalFile = (e: any) => {
    let files
    if (e.dataTransfer) {
      files = e.dataTransfer.files
    } else if (e.target) {
      files = e.target.files
    }
    if (files?.length) {
      const f = files[0] as File
      const fileType = f.type
      const validImageTypes = ['image/gif', 'image/jpeg', 'image/png']
      if (!validImageTypes.includes(fileType)) {
        setAvatarErr('请选择 PNG / JPEG / GIF 图片！')
      } else if (f.size > 5 * 1024 * 1024) {
        setAvatarErr('文件大小超过限制！')
      } else {
        setAvatarErr('')
        setFile(f)
        const reader = new FileReader()
        reader.onload = () => {
          setImage(reader.result as any)
        }
        reader.readAsDataURL(f)
      }
    }
  }

  const uploadAndSet = () => {
    if (typeof cropper !== 'undefined') {
      const croppedCanvas = cropper.getCroppedCanvas({
        // 参数详见
        // https://github.com/fengyuanchen/cropperjs#getcroppedcanvasoptions
        width: 256,
        height: 256,
        // fillColor 属性为当图片中包含透明信息时，使用何种颜色来填充底色。
        // 使用 jpg 有损压缩，目前网页展示最大 74px，256 大于 3x 缩放，用 90% 的质量压缩肉眼很难看出区别。
        // 简单测试了下，png 相比 jpg，体积大了六七倍。
        fillColor: '#fff',
        // 由 canvas 底层实现，默认是 true。如果设为 false，缩放不做差值，低分辨率会出现 8bit 像素风格。高分辨率缩放会出现锯齿。
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'medium', // 这个属性默认是 low
      }) as HTMLCanvasElement
      croppedCanvas.toBlob(
        (blob) => {
          if (!blob) {
            AppToaster.show({
              message: '读取裁剪图片失败',
              intent: 'danger',
              icon: 'error',
            })
            return
          }
          const fileName = `topic-user-avatar-${getUserName()}.jpg`
          conn.uploadResource(blob, fileName).then((res) => {
            const uploadedURL = res?.succMap[fileName]
            if (!uploadedURL) {
              AppToaster.show({
                message: '上传图片失败',
                intent: 'danger',
                icon: 'error',
              })
              return
            }
            // 可能存储有时会比较慢，上传后不等待直接拿有概率 404
            setTimeout(() => {
              props.updateHandler('avatar', uploadedURL)
            }, 1000)
          })
        },
        'image/jpeg',
        // 简易图片实测，95% 质量 30.1kB, 90% 质量 21.3kB
        0.9,
      )
    }
  }

  const reset = () => {
    setFile(null)
    setAvatarErr('')
    setImage(rawAvatar)
  }

  useEffect(() => {
    setImage(rawAvatar)
  }, [rawAvatar])

  return (
    <div className="avatar-upload-container">
      <div>
        <header>
          <FileInput
            hasSelection={!!file}
            text={file ? file.name : '从本地选择一张图片'}
            onInputChange={loadLocalFile}
            buttonText="选择文件"
          />
        </header>
        {getAvatarErr() && <div className="err">{getAvatarErr()}</div>}
        <main>
          <Cropper
            className="cropper-box"
            aspectRatio={1}
            preview=".img-preview"
            src={image || TOPIC_DEFAULT_AVATAR_SRC}
            viewMode={1} // 设置头像必须为1:1图
            minCropBoxHeight={10}
            minCropBoxWidth={10}
            background={false}
            responsive
            autoCropArea={1}
            checkOrientation={false}
            onInitialized={(instance) => {
              setCropper(instance)
            }}
            guides
            checkCrossOrigin={false}
          />
          <div className="preview-box">
            <label>预览</label>
            <div className="center-wrapper">
              <div className="img-preview" />
              <Button
                className="preview-btn"
                intent="primary"
                onClick={uploadAndSet}
                disabled={Boolean(getAvatarErr())}
              >
                修改
              </Button>
              <Button className="preview-btn" onClick={reset}>
                重置
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export const PersonaEditor = (props: {
  user: XTopicUserDetailResult | null
  fetchUser: () => void
}) => {
  const [name, setName] = useState(props.user?.nickname ?? '')
  const [nameErr, setNameErr] = useState('')
  const [bio, setBio] = useState(props.user?.bio ?? '')
  const [bioErr, setBioErr] = useState('')

  const checkNameValid = (v: string) => {
    if (!v) {
      setNameErr('昵称不能为空')
      return
    }
    if (v.length > 12) {
      setNameErr('昵称长度不能大于 20 字符')
      return
    }
    setNameErr('')
  }

  const checkBioValid = (v: string) => {
    if (!props.user?.nickname) {
      setBioErr('请先设置一个昵称')
      return
    }
    if (v.length > 30) {
      setBioErr('简介长度不能大于 20 字符')
      return
    }
    setBioErr('')
  }

  // 更新后检查
  useEffect(() => {
    checkNameValid(name)
    checkBioValid(bio)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.user])

  const submitEdit = async (type: 'nickname' | 'bio' | 'avatar', value: string) => {
    const displayMap = {
      nickname: '昵称',
      bio: '简介',
      avatar: '头像',
    } as const
    const data = {} as Record<typeof type, string | null>
    data[type] = value
    await GlobalAilabServerClient.request(AilabServerApiName.XTOPIC_USER_UPDATE, undefined, {
      data,
    } as any)
    AppToaster.show({
      message: `${displayMap[type]}设置成功`,
      intent: 'success',
    })
    props.fetchUser()
  }

  return (
    <div className="edit-persona-container">
      <div className="persona-item">
        <header>昵称</header>
        <main>
          <InputGroup
            className="inline-input"
            placeholder="12字以内"
            value={name}
            onChange={(e) => {
              const v = e.currentTarget.value.trim()
              setName(v)
              checkNameValid(v)
            }}
          />
          <Button
            disabled={Boolean(nameErr)}
            intent="primary"
            onClick={() => submitEdit('nickname', name)}
            style={{ marginRight: 10 }}
          >
            修改
          </Button>
          {nameErr && <div className="err">{nameErr}</div>}
        </main>
      </div>
      {/* =================简介================= */}
      <div className="persona-item">
        <header>简介</header>
        <main>
          <InputGroup
            className="inline-input"
            placeholder="30字以内，可以介绍下你的专长"
            value={bio}
            onChange={(e) => {
              const v = e.currentTarget.value.trim()
              setBio(v)
              checkBioValid(v)
            }}
          />
          <Button
            disabled={Boolean(bioErr)}
            intent="primary"
            onClick={() => submitEdit('bio', bio)}
            style={{ marginRight: 10 }}
          >
            修改
          </Button>
          {bioErr && <div className="err">{bioErr}</div>}
        </main>
      </div>
      {/* =================头像================= */}
      <div className="persona-item">
        <header>头像</header>
        <main>
          <EditAvatar updateHandler={submitEdit} user={props.user} />
        </main>
      </div>
    </div>
  )
}
