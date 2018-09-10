/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * App configuration
 *
 * @author zhangxuan
 * @date 2018-09-07
 */
import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Form, Button } from 'antd'
import TenxPage from '@tenx-ui/page'
import './style/index.less'
import BasicInfo from './BasicInfo'
import BpmNode from './BpmNode'
import MysqlNode from './MysqlNode'
import { injectIntl } from 'react-intl'

@connect()
class AppConfiguration extends React.PureComponent {
  render() {
    const { form, intl } = this.props
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10 },
    }
    return (
      <TenxPage className="middleware-configs-wrapper">
        <QueueAnim className="middleware-configs">
          <BasicInfo
            key={'basicInfo'}
            {...{
              intl, form, formItemLayout,
            }}
          />
          <BpmNode
            key={'bpmNode'}
            {...{
              intl, form, formItemLayout,
            }}
          />
          <MysqlNode
            key={'mysqlNode'}
            {...{
              intl, form, formItemLayout,
            }}
          />
          <div className="footer">
            <Button >取消</Button>
            <Button type={'primary'}>创建</Button>
          </div>
        </QueueAnim>
      </TenxPage>
    )
  }
}

const newAppConfiguration = injectIntl(Form.create()(AppConfiguration), {
  withRef: true,
})
export default newAppConfiguration

