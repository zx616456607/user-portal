/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 *  IntegrationDetail index module
 *
 * v2.0 - 2016-11-22
 * @author by Gaojian
 */

import React, { Component, PropTypes } from 'react'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { Button, Tabs } from 'antd'
import './style/IntegrationDetail.less'
import VSphere from './VSphereDetail'
import VmList from './VmList'
import PhysicalList from './PhysicalList'
import VSphereConfig from './VSphereConfig'

const TabPane = Tabs.TabPane;

const menusText = defineMessages({
  VSphere: {
    id: 'Integration.IntegrationDetail.VSphere',
    defaultMessage: 'VSphere面板',
  },
  vmList: {
    id: 'Integration.IntegrationDetail.vmList',
    defaultMessage: '虚拟机列表',
  },
  physicalList: {
    id: 'Integration.IntegrationDetail.physicalList',
    defaultMessage: '物理机列表',
  },
  VSphereConfig: {
    id: 'Integration.IntegrationDetail.VSphereConfig',
    defaultMessage: '配置VSphere',
  },
  back: {
    id: 'Integration.IntegrationDetail.back',
    defaultMessage: '返回',
  },
})

class IntegrationDetail extends Component {
  constructor(props) {
    super(props);
    this.returnToList = this.returnToList.bind(this);
    this.state = {
    }
  }
  
  componentWillMount() {
    document.title = '集成中心 | 时速云';
  }
  
  returnToList() {
    //the function for user return to the list
    const { scope } = this.props;
    scope.setState({
      showType: 'list'
    });
  }
  
  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
      
    return (
      <QueueAnim className='IntegrationDetailAnimate' key='IntegrationDetailAnimate'>
        <div id='IntegrationDetail'>
          <Tabs>
            <TabPane tab={<FormattedMessage {...menusText.VSphere} />} key='1'><VSphere scope={scope} /></TabPane>
            <TabPane tab={<FormattedMessage {...menusText.vmList} />} key='2'><VmList scope={scope} /></TabPane>
            <TabPane tab={<FormattedMessage {...menusText.physicalList} />} key='3'><PhysicalList scope={scope} /></TabPane>
            <TabPane tab={<FormattedMessage {...menusText.VSphereConfig} />} key='4'><VSphereConfig scope={scope} /></TabPane>
          </Tabs>
          <Button size='large' type='primary' className='backBtn' onClick={this.returnToList}>
            <FormattedMessage {...menusText.back} />
          </Button>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultAppList = {
  }
  const {isFetching, appList} = defaultAppList
  return {
  }
}

IntegrationDetail.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(IntegrationDetail, {
  withRef: true,
}));

