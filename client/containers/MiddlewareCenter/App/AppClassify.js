/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * App classify
 *
 * @author zhangxuan
 * @date 2018-09-10
 */
import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import isEmpty from 'lodash/isEmpty'
import './style/AppClassify.less'
import IntlMessage from '../Intl'

export default class AppClassify extends React.PureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    current: PropTypes.string.isRequired,
    dataSource: PropTypes.object.isRequired,
  }

  renderClassifyList = () => {
    const { dataSource, onChange, current } = this.props
    const { data, isFetching } = dataSource
    const allClassify = [{
      classifyName: '全部',
      id: 'all',
    }]
    if (isEmpty(dataSource) || isFetching) {
      return
    }
    const newData = allClassify.concat(data)
    const defaultCurrent = current || allClassify[0]
    return newData.map(item => {
      return <span
        key={item.id}
        onClick={() => onChange(item)}
        className={classNames('classify-item pointer', {
          'classify-item-active': item.classifyName === defaultCurrent.classifyName,
        })}
      >
        {item.classifyName}
      </span>
    })
  }

  render() {
    const { intl } = this.props
    return (
      <div className="app-classify">
        <div className="app-classify-label">{intl.formatMessage(IntlMessage.classify)}：</div>
        <div className="app-classify-box">
          {this.renderClassifyList()}
        </div>
      </div>
    )
  }
}
