/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ComposeCenter component
 *
 * v0.1 - 2016-10-10
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Menu, Button, Card } from 'antd'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import PrivateCompose from './ComposeCenter/PrivateCompose.js'
import PublicCompose from './ComposeCenter/PublicCompose.js'
import "./style/ComposeCenter.less"
import Title from '../Title'
import classNames from 'classnames'

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class ComposeCenter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: "privateCompose",
    }
  }
  selectCurrentTab(current) {
    //this function for user select current show tabs
    this.setState({
      current: current
    });
  }
  render() {
    const { current } = this.state;
    const { formatMessage } = this.props.intl;
    const scope = this;
    const privateComposeStyle = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_style': current == "privateCompose"
    })
    const publicComposeStyle = classNames({
      'tabs_item_style': true,
      'tabs_item_selected_style': current == "publicCompose"
    })
    return (
      <QueueAnim className="ComposeCenterBox"
        type="right"
        >
        <div id="ComposeCenter" key="ComposeCenterBox">
          <Title title="编排文件" />
          <div className="titleList">
            <ul className='tabs_header_style'>
              <li className={privateComposeStyle}
                onClick={this.selectCurrentTab.bind(this, "privateCompose")}
                >
                我的编排
              </li>
              <li className={publicComposeStyle}
                onClick={this.selectCurrentTab.bind(this, "publicCompose")}
                >
                公共编排
              </li>
            </ul>
          </div>
          <div className='check_box'></div>
          {current == "privateCompose" ? [<PrivateCompose scope={scope} />] : null}
          {current == "publicCompose" ? [<PublicCompose scope={scope} />] : null}
        </div>
      </QueueAnim>
    )
  }
}

ComposeCenter.propTypes = {
  intl: PropTypes.object.isRequired
}

export default connect()(injectIntl(ComposeCenter, {
  withRef: true,
}))