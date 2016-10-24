/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageDeployLog component
 *
 * v0.1 - 2016-10-24
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Spin, Icon, Collapse, Alert } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../../constants'
import './style/ImageDeployLog.less'

const Panel = Collapse.Panel;

let testData = [
  {
    'name': 'test1',
    'updateTime': '1小时前',
    'status': 'normal',
    'user': 'gaojian',
    'cost': '10小时',
    'runningStatus': 'normal',
    'config': '2C 8G',
    'updateType': 'normal'
  },
  {
    'name': 'test2',
    'updateTime': '2小时前',
    'status': 'normal',
    'user': 'gaojian',
    'cost': '10小时',
    'runningStatus': 'fail',
    'config': '2C 8G',
    'updateType': 'normal'
  },
  {
    'name': 'test3',
    'updateTime': '3小时前',
    'status': 'normal',
    'user': 'gaojian',
    'cost': '10小时',
    'runningStatus': 'normal',
    'config': '2C 8G',
    'updateType': 'grey'
  },
  {
    'name': 'test4',
    'updateTime': '4小时前',
    'status': 'fail',
    'user': 'gaojian',
    'cost': '10小时',
    'runningStatus': 'normal',
    'config': '2C 8G',
    'updateType': 'normal'
  },
]

const menusText = defineMessages({
  title: {
    id: 'CICD.Tenxflow.ImageDeployLog.title',
    defaultMessage: '部署记录',
  },
  tooltip: {
    id: 'CICD.Tenxflow.ImageDeployLog.tooltip',
    defaultMessage: '展示自动部署的记录，包含每次部署时的配置情况，部署完成状态，部署消耗时间',
  },
  name: {
    id: 'CICD.Tenxflow.ImageDeployLog.name',
    defaultMessage: '应用名称',
  },
  config: {
    id: 'CICD.Tenxflow.ImageDeployLog.config',
    defaultMessage: '应用配置',
  },
  cluster: {
    id: 'CICD.Tenxflow.ImageDeployLog.cluster',
    defaultMessage: '所属集群',
  },
  updateType: {
    id: 'CICD.Tenxflow.ImageDeployLog.updateType',
    defaultMessage: '升级方式',
  },
  runningStatus: {
    id: 'CICD.Tenxflow.ImageDeployLog.runningStatus',
    defaultMessage: '运行状态',
  },
  cost: {
    id: 'CICD.Tenxflow.ImageDeployLog.cost',
    defaultMessage: '耗时',
  },
  runningNormal: {
    id: 'CICD.Tenxflow.ImageDeployLog.runningNormal',
    defaultMessage: '运行中',
  },
  runningAbnormal: {
    id: 'CICD.Tenxflow.ImageDeployLog.runningAbnormal',
    defaultMessage: '异常',
  },
  success: {
    id: 'CICD.Tenxflow.ImageDeployLog.success',
    defaultMessage: '成功',
  },
  fail: {
    id: 'CICD.Tenxflow.ImageDeployLog.fail',
    defaultMessage: '失败',
  },
  normalUpdate: {
    id: 'CICD.Tenxflow.ImageDeployLog.normalUpdate',
    defaultMessage: '普通升级',
  },
  imageUpdate: {
    id: 'CICD.Tenxflow.ImageDeployLog.imageUpdate',
    defaultMessage: '灰度升级',
  },
})

function checkStatusSpan(status, scope) {
  //this function for user input the status return current words
  const { formatMessage } = scope.props.intl;
  switch(status) {
    case 'normal':
      return formatMessage(menusText.success);
      break;
    case 'fail' :
      return formatMessage(menusText.fail);;
      break;
  }
}

function checkStatusClass(status) {
  //this function for user input the status return current className
  switch(status) {
    case 'normal':
      return 'normal';
      break;
    case 'fail':
      return 'fail';
      break;
  }
}

function checkStatusIcon(status) {
  //this function for user input the status return current className
  switch(status) {
    case 'normal':
      return 'normal fa fa-check-circle';
      break;
    case 'fail':
      return 'fail fa fa-times-circle';
      break;
  }
}

function checkRunningStatusSpan(status, scope) {
  //this function for user input the status return current words
  const { formatMessage } = scope.props.intl;
  switch(status) {
    case 'normal':
      return formatMessage(menusText.runningNormal);
      break;
    case 'fail':
      return formatMessage(menusText.runningAbnormal);;
      break;
  }
}

function checkRunningStatusClass(status) {
  //this function for user input the status return current className
  switch(status) {
    case 'normal':
      return 'normal';
      break;
    case 'fail':
      return 'fail';
      break;
  }
}

let MyLine = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  render: function () {
    const { config, scope } = this.props;
    let items = config.map((item) => {
      const header = (
        <div className='header'>
          <div className='line'></div>
          <i className={ checkStatusIcon(item.status) } />
        </div>
      );
      return (
        <Panel header={header} className='lineDetail' key={item.name} >
          <div className='line'></div>
        </Panel>
      );
    });
    return (
      <div className='leftBox'>
        <Collapse className='logBoxLine' activeKey={scope.state.activePanel}>
          {items}
        </Collapse>
      </div>
    );
  }
});

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  collapseAction: function (e) {
    //this function for user open or close collapse panel action
    //and then the line collapse will be current change
    const { scope } = this.props;
    scope.setState({
      activePanel: e
    });
  },
  render: function () {
    const { config, scope } = this.props;
    let items = config.map((item) => {
      const header = (
        <div className='header'>
          <span className='name commonHeader'>
            {item.name}
          </span>
          <span className='status commonHeader'>
            <span className={ checkStatusClass(item.status) }>
              <i className='fa fa-circle' />
              { checkStatusSpan(item.status, scope) }
            </span>
          </span>
          <span className='updateTime commonHeader'>
            <i className='fa fa-wpforms' />
            {item.updateTime}
          </span>
          <span className='commonHeader'>
            <Icon type="clock-circle-o" />
            <FormattedMessage {...menusText.cost} />
            {item.cost}
          </span>
        </div>
      );
      return (
        <Panel header={header} className='LogDetail' key={item.name} >
          <div className='titleBox'>
            <span className='name commonTitle'>
              <FormattedMessage {...menusText.name} />
            </span>
            <span className='commonTitle'>
              <FormattedMessage {...menusText.config} />
            </span>
            <span className='cluster commonTitle'>
              <FormattedMessage {...menusText.cluster} />
            </span>
            <span className='commonTitle'>
              <FormattedMessage {...menusText.updateType} />
            </span>
            <span className='status commonTitle'>
              <FormattedMessage {...menusText.runningStatus} />
            </span>
            <div style={{ clear:'both' }}></div>
          </div>
          <div className='infoBox'>
            <span className='name commonInfo'>
              {item.user}
            </span>
            <span className='commonInfo'>
              {item.config}
            </span>
            <span className='cluster commonInfo'>
              {item.user}
            </span>
            <span className='commonInfo'>
              {item.updateType == 'normal' ? [<FormattedMessage {...menusText.normalUpdate} />] : [<FormattedMessage {...menusText.imageUpdate} />]}
            </span>
            <span className='status commonInfo'>
              <span className={ checkRunningStatusClass(item.status) }>
                <i className='fa fa-circle' />
                { checkRunningStatusSpan(item.runningStatus, scope) }
              </span>
            </span>
            <div style={{ clear:'both' }}></div>
          </div>
        </Panel>
      );
    });
    return (
      <div className='rightBox'>
        <Collapse className='logBox' onChange={this.collapseAction}> 
          {items}
        </Collapse>
      </div>
    );
  }
});

class ImageDeployLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePanel: []
    }
  }

  componentWillMount() {
    document.title = 'TenxFlow | 时速云';
  }

  render() {
    const scope = this;
    return (
      <div id='ImageDeployLog'>
        <div className='title'>
          <FormattedMessage {...menusText.title} />
        </div>
        <Alert message={<FormattedMessage {...menusText.tooltip} />} type="info" />
        <MyLine config={testData} scope={scope} />
        <MyComponent config={testData} scope={scope} />
        <div style={{ clear:'both' }}></div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {

  return {

  }
}

ImageDeployLog.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(ImageDeployLog, {
  withRef: true,
}));

