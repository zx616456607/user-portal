/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * App middleware
 *
 * @author zhangxuan
 * @date 2018-09-06
 */
import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import TenxPage from '@tenx-ui/page'
import './style/index.less'
import { injectIntl } from 'react-intl'
import IntlMessage from '../Intl'

@connect()
class App extends React.PureComponent {
  render() {
    const { intl } = this.props
    return (
      <TenxPage className="middleware-center-apps">
        <QueueAnim>
          <div className="alertRow" key={'notice'}>
            {intl.formatMessage(IntlMessage.appPageTip)}
          </div>
          <Link to="/middleware_center/app/config">deploy</Link>
        </QueueAnim>
      </TenxPage>
    )
  }
}

export default injectIntl(App, {
  withRef: true,
})
