import { BaseTable } from 'ali-react-table'
import styled from 'styled-components'
import {
  Z_INDEX_CONTENT_OVERLAY_0,
  Z_INDEX_CONTENT_OVERLAY_1,
  Z_INDEX_CONTENT_OVERLAY_2,
  Z_INDEX_CONTENT_OVERLAY_3,
  Z_INDEX_CONTENT_OVERLAY_4,
  Z_INDEX_CONTENT_OVERLAY_5,
} from '../../style/z-index'

export const BaseTableStyle = `
{
  --color: var(--hai-ui-text-secondary);
  --hover-bgcolor: var(--hf-ui-highlight-bg, #f5f5f5);
  --bgcolor: var(--hai-ui-layout-1);
  --highlight-bgcolor: var(--hai-ui-layout-2);
  --header-row-height: 30px;
  --header-color: var(--hai-ui-text-secondary);
  --header-bgcolor: var(--hai-ui-layout-1);
  --header-hover-bgcolor: #ddd;
  --header-highlight-bgcolor: #e4e8ed;
  --cell-padding: 3px 12px 2px 0;
  --font-size: 13px;
  --line-height: 16px;
  --lock-shadow: rgba(152, 152, 152, 0.5) 0 0 6px 2px;
  --header-cell-border: none;
  --cell-border-vertical: none;
  .art-table-body {
    margin-top: 4px;
  }
  td {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  th {
    font-weight: bold;
    background-color: unset;
    border-bottom: 1px solid var(--hai-ui-text-other);
  }
  .no-data-error-container {
    padding-top: 60px;
  }
  &.sticky-header .art-table-header {
    z-index: ${Z_INDEX_CONTENT_OVERLAY_2};
  }
  .lock-left,
  .lock-right {
    z-index: ${Z_INDEX_CONTENT_OVERLAY_0};
  }
  &.sticky-footer .art-table-footer {
    z-index: ${Z_INDEX_CONTENT_OVERLAY_1};
  }
  .art-lock-shadow-mask {
    z-index: ${Z_INDEX_CONTENT_OVERLAY_3};
  }
  &.art-sticky-scroll {
    z-index: ${Z_INDEX_CONTENT_OVERLAY_4};
  }
  &.art-loading-indicator {
    z-index: ${Z_INDEX_CONTENT_OVERLAY_5}
  }
}`

/**
 * 管理界面 (除明慧的外部账户管理) 所使用的表格样式
 */
export const HFAdminNarrowTable = styled(BaseTable)`
  ${BaseTableStyle} {
    --line-height: 20px;
    --row-height: 26px;
    --border-color: transparent;
    --cell-padding: 1px 12px 1px 0;
    button {
      height: 22px !important;
      min-height: 22px !important;
    }
    th {
      background-color: unset;
      font-weight: 700;
      border-bottom: 1px solid var(--hai-ui-text-other);
    }
  }
`

/**
 * admin-外部账户管理使用的表格样式
 */
export const ExternalAccountViewTable = styled(BaseTable)`
  ${BaseTableStyle} {
    --row-height: 30px;
    --cell-border-horizontal: 1px solid var(--hai-ui-layout-2);
    th {
      padding: 4px;
      text-align: center;
      background-color: var(--hai-ui-layout-bg);
      border-bottom: 1px solid var(--hai-ui-text-other);
      label {
        margin: 0;
      }
    }
    .art-table-header {
      overflow-x: unset;
    }
    tr.art-table-header-row th.art-table-header-cell {
      line-height: 20px !important;
      font-size: 12px;
      padding-right: 0 !important;
    }
    td.art-table-cell {
      text-align: center;
      padding: 2px;
      label {
        margin: 0;
      }
    }
    .art-table-body {
      margin-top: 0;
    }
    .art-sticky-scroll {
      margin-top: -11px !important;
    }
  }
`

/**
 * 界面上默认的 table 样式
 */
export const HFDashTable = styled(BaseTable)`
  ${BaseTableStyle} {
    --row-height: 26px;
    --border-color: transparent;
    th {
      background-color: unset;
      font-weight: 700;
      border-bottom: 1px solid var(--hai-ui-text-other);
    }
  }
`
