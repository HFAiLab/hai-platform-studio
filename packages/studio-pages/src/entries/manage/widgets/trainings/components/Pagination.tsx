/* eslint-disable @typescript-eslint/ban-ts-comment */
import { i18n, i18nKeys } from '@hai-platform/i18n'
import { Button, InputGroup } from '@hai-ui/core'
import React, { useContext, useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import { useRefState } from '../../../../../hooks/useRefState'
import { ManagerServiceContext } from '../../../reducer'

export const Pagination = (props: {
  pageCount: number
  // eslint-disable-next-line react/no-unused-prop-types
  loading: boolean
  forcePage: number
  changeHandler: (s: { selected: number }) => void
}): JSX.Element => {
  const srvc = useContext(ManagerServiceContext)
  const { manageState } = srvc.state
  const { pageSize } = manageState
  const [currentPageSize, currentPageSizeRef, setCurrentPageSize] = useRefState(pageSize)

  useEffect(() => {
    if (currentPageSizeRef.current === pageSize) return
    setCurrentPageSize(pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize])

  const [jump, setJump] = useState<string>('')
  useEffect(() => {
    setJump(String(props.forcePage + 1))
  }, [props.forcePage])

  const setSel = (s: { selected: number }) => {
    setJump(String(s.selected + 1))
    props.changeHandler({ selected: s.selected + 1 })
  }

  const handleJumpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length === 0) {
      setJump('')
    }
    let v = parseInt(e.target.value, 10)
    if (Number.isNaN(v)) {
      return
    }
    if (v < 1) {
      return
    }
    if (v > props.pageCount) {
      v = props.pageCount
    }
    setJump(String(v))
  }
  const doJump = () => {
    if (!jump) {
      return
    }
    const target = parseInt(jump, 10)
    if (target >= 0 && target < props.pageCount) {
      props.changeHandler({ selected: target })
    }
  }

  const handlePageSizeChange = () => {
    if (!(currentPageSize > 0 && currentPageSize <= 50)) {
      srvc.app
        .api()
        .getHFUIToaster()
        ?.show({
          message: i18n.t(i18nKeys.biz_trainings_page_tip),
          intent: 'danger',
        })
      return
    }
    srvc.dispatch({
      type: 'manageState',
      value: {
        pageSize: currentPageSize,
      },
    })
  }

  return (
    <div className="page-manager-pagi">
      <div className="each-page-size-changer">
        <div className="each-page-tip">每页展示</div>
        <InputGroup
          value={`${currentPageSize}`}
          className="each-page-input"
          small
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              handlePageSizeChange()
            }
          }}
          onChange={(e) => {
            setCurrentPageSize(Number(e.target.value))
          }}
        />
        <Button
          outlined
          small
          disabled={currentPageSize === pageSize}
          onClick={handlePageSizeChange}
        >
          更改
        </Button>
      </div>
      <ReactPaginate
        previousLabel="<"
        nextLabel=">"
        breakLabel="..."
        breakClassName="break-me"
        pageCount={props.pageCount}
        marginPagesDisplayed={1}
        pageRangeDisplayed={5}
        onPageChange={setSel}
        containerClassName="pagination"
        activeClassName="active"
        forcePage={props.forcePage - 1}
      />

      {props.pageCount > 9 && (
        <div className="jump">
          <input
            className="hf-input small"
            value={jump}
            onChange={handleJumpChange}
            style={{ width: 40 }}
          />
          <button className="hf-btn small primary" onClick={doJump}>
            Go
          </button>
        </div>
      )}
    </div>
  )
}
