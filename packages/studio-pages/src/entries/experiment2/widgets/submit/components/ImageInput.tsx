import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Button, FormGroup, MenuItem } from '@hai-ui/core/lib/esm'
import type { ItemRenderer } from '@hai-ui/select'
import { Select } from '@hai-ui/select'
import React, { useContext, useState } from 'react'
import { genPopover } from '../../../../../ui-components/popover'
import { ClusterHelper } from '../../../funcs/ClusterHelper'
import type { IImage, IImageListInfo } from '../../../funcs/ExperimentHelper'
import { ExpServiceContext, IfParamChangeInDraft } from '../../../reducer'
import type { SubmitCommonInputProps } from '../schema'
import { Exp2EditTip } from '../widgets/EditTip'

const ImageSelect = Select.ofType<string | IImage>()

export interface Exp2ImageInputProps extends SubmitCommonInputProps {
  value: string
  imageListInfo: IImageListInfo
}

export const Exp2ImageInput = (props: Exp2ImageInputProps) => {
  const srvc = useContext(ExpServiceContext)
  const { state } = srvc
  const ifImageChangeInDraft = IfParamChangeInDraft(state, 'image')
  const [imageLoading, setImageLoading] = useState(false)

  const defaultImage = (
    props.imageListInfo.imgListForSelect.find(
      (cItem) => typeof cItem !== 'string' && cItem.default,
    ) as IImage | undefined
  )?.value

  const fetchImageList = () => {
    setImageLoading(true)
    ClusterHelper.getTrainImages({
      apiServerClient: srvc.app.api().getApiServerClient(),
      token: srvc.app.api().getToken(),
    })
      .then((imageList) => {
        srvc.dispatch({ type: 'sourceTrainImages', value: imageList })
      })
      .catch((e) => {
        console.warn('Fetch training image list failed', e)
      })
      .finally(() => {
        setImageLoading(false)
      })
  }

  const activeImageValue =
    props.value === 'default'
      ? defaultImage
      : (
          props.imageListInfo.imgListForSelect.find(
            (cItem) => typeof cItem !== 'string' && cItem.value === props.value,
          ) as IImage | undefined
        )?.value

  const isSettingDefaultButNotValueDefault = defaultImage === props.value

  const selectDisabled = props.isLock
  const itemRender: ItemRenderer<IImage | string> = (
    item: IImage | string,
    { handleClick, modifiers },
  ) => {
    if (typeof item === 'string') {
      let text = item
      if (item === 'mars') text = i18n.t(i18nKeys.biz_env_mars)
      if (item === 'user') text = i18n.t(i18nKeys.biz_env_user)
      return (
        <div key={text} className="submit-settings-hf-create-classify H2">
          {text}
        </div>
      )
    }
    if (!modifiers.matchesPredicate) {
      return null
    }
    return (
      <MenuItem
        className="haiEnv-list-item"
        active={activeImageValue === item.value}
        title={item.value}
        label={item.verInfo}
        key={item.key}
        onClick={handleClick}
        text={`${item.name}${item.default ? '(default)' : ''}`}
      />
    )
  }
  return (
    <div className="exp2-form-group-container">
      {ifImageChangeInDraft && (
        <Exp2EditTip value={`${state.createDraft.image}`} isLock={props.isLock} />
      )}
      <FormGroup
        inline
        label={genPopover({
          inline: true,
          label: i18n.t(i18nKeys.biz_exp_submit_env),
          helperText: i18n.t(i18nKeys.biz_exp_submit_env_helper),
        })}
      >
        <ImageSelect
          fill
          items={imageLoading ? ['Loading...'] : props.imageListInfo.imgListForSelect}
          activeItem={
            props.imageListInfo.imgListForSelect.filter((image) => {
              if (typeof image === 'string') {
                return false
              }
              return props.value === image.value
            })[0]
          }
          // eslint-disable-next-line react/no-unstable-nested-components
          itemRenderer={itemRender}
          itemPredicate={(query, item, _index, exactMatch) => {
            if (typeof item === 'string') {
              return true
            }
            const normalizedTitle = item.name.toLowerCase()
            const normalizedQuery = query.toLowerCase()

            if (exactMatch) {
              return normalizedTitle === normalizedQuery
            }
            return normalizedTitle.includes(normalizedQuery)
          }}
          popoverProps={{ minimal: true }}
          disabled={selectDisabled}
          onItemSelect={(item: IImage | string) => {
            props.onChange({ type: 'image', value: (item as IImage).value })
          }}
        >
          <Button
            onClick={fetchImageList}
            id="exp2-image-input"
            loading={props.isLoading}
            rightIcon="caret-down"
            className="exp2-submit-common-select-btn"
            small
            title={`${props.value}${isSettingDefaultButNotValueDefault ? '(default)' : ''}`}
            disabled={selectDisabled}
          >
            {`${props.value}${isSettingDefaultButNotValueDefault ? '(default)' : ''}`}
          </Button>
        </ImageSelect>
      </FormGroup>
    </div>
  )
}
