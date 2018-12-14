/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 */
/**
 * Redux actions for vmTerminalNLog
 *
 * @date 2018-12-13
 * @author songsz
 */

// 更新终端数据
export const VM_TERM_LOG_UPDATE_TERM = 'VM_TERM_LOG_UPDATE_TERM'
export const updateVmTermData = data => dispatch => dispatch({
    data,
    type: VM_TERM_LOG_UPDATE_TERM,
})

// 更新日志数据
export const VM_TERM_LOG_UPDATE_LOG = 'VM_TERM_LOG_UPDATE_LOG'
export const updateVmTermLogData = data => dispatch => dispatch({
    data,
    type: VM_TERM_LOG_UPDATE_LOG,
})
