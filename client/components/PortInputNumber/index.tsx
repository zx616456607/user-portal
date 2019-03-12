/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2019 TenxCloud. All Rights Reserved.
 */

/**
 * Port input number
 *
 * @author zhangpc
 * @date 2019-03-12
 */

import * as React from 'react'
import { InputNumber, InputNumberProps } from 'antd'

export interface PortInputNumberProps extends InputNumberProps {
  placeholder?: string;
  placeholderFunc?: (range: string) => string;
}

export const getTcpPortRange = () => {
  const { begin, end } = window.__INITIAL_CONFIG__.tcpPort
  return { begin, end, range: `${begin} ~ ${end}` }
}

const PortInputNumber: React.SFC<PortInputNumberProps> = props => {
  const { begin, end, range } = getTcpPortRange()
  const { placeholderFunc, ...otherProps } = props
  if (placeholderFunc) {
    otherProps.placeholder = placeholderFunc(range)
  }
  return <InputNumber {...otherProps} min={begin} max={end} />
}

export default PortInputNumber
