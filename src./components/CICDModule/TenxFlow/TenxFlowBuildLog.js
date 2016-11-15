/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowBuildLog component
 *
 * v0.1 - 2016-10-25
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Spin, Icon, Collapse, Alert } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import $ from 'n-zepto'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../constants'
import './style/TenxFlowBuildLog.less'

const Panel = Collapse.Panel;

let testData = [
  {
    'name': 'test1',
    'updateTime': '2016-10-25 09:24:11',
    'status': 'normal',
    'cost': '10小时',
  },
  {
    'name': 'test2',
    'updateTime': '2016-10-25 09:24:11',
    'status': 'normal',
    'cost': '10小时',
  },
  {
    'name': 'test3',
    'updateTime': '2016-10-25 09:24:11',
    'status': 'normal',
    'cost': '10小时',
  },
  {
    'name': 'test4',
    'updateTime': '2016-10-25 09:24:11',
    'status': 'fail',
    'cost': '10小时',
  },
]

const menusText = defineMessages({
  title: {
    id: 'CICD.Tenxflow.TenxFlowBuildLog.title',
    defaultMessage: '执行记录',
  },
  cost: {
    id: 'CICD.Tenxflow.TenxFlowBuildLog.cost',
    defaultMessage: '耗时',
  },
  running: {
    id: 'CICD.Tenxflow.TenxFlowBuildLog.running',
    defaultMessage: '执行中...',
  },
  finish: {
    id: 'CICD.Tenxflow.TenxFlowBuildLog.finish',
    defaultMessage: '执行完成',
  },
  waitting: {
    id: 'CICD.Tenxflow.TenxFlowBuildLog.waitting',
    defaultMessage: '等待执行',
  },
  fail: {
    id: 'CICD.Tenxflow.TenxFlowBuildLog.fail',
    defaultMessage: '执行失败',
  }
})

function checkStatusSpan(status, scope) {
  //this function for user input the status return current words
  const { formatMessage } = scope.props.intl;
  switch (status) {
    case 'running':
      return formatMessage(menusText.running);
      break;
    case 'finish':
      return formatMessage(menusText.finish);
      break;
    case 'waitting':
      return formatMessage(menusText.waitting);
      break;
    case 'fail':
      return formatMessage(menusText.fail);
      break;
  }
}

function checkStatusClass(status) {
  //this function for user input the status return current className
  switch (status) {
    case 'running':
      return 'running';
      break;
    case 'finish':
      return 'finish';
      break;
    case 'waitting':
      return 'waitting';
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
    let items = config.map((item, index) => {
      const header = (
        <div className='header'>
          <div className='line'></div>
          <i className='fa fa-dot-circle-o' />
        </div>
      );
      return (
        <Panel header={header} className={'lineDetail lineDetail' + index} key={index} >
          <div className='cover'></div>
          <div className='hideCover'>
            <div className='titleBox'>
              <br />
              <br />
              <br />
              <br />
            </div>
            <div className='infoBox'>

            </div>
          </div>
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
    let items = config.map((item, index) => {
      const header = (
        <div className='header'>
          <span className='name commonHeader'>
            {item.name}
          </span>
          <span className='status commonHeader'>
            <span className={checkStatusClass(item.status)}>
              <i className='fa fa-circle' />
              {checkStatusSpan(item.status, scope)}
            </span>
          </span>
          <span className='updateTime commonHeader'>
            <i className='fa fa-wpforms' />
            {item.updateTime}
          </span>
          <span className='commonHeader'>
            <Icon type='clock-circle-o' />
            <FormattedMessage {...menusText.cost} />
            {item.cost}
          </span>
        </div>
      );
      return (
        <Panel header={header} className={'LogDetail LogDetail' + index} key={index}>
          <div className='titleBox'>
            <br />
            <br />
            <br />
            <br />
          </div>
          <div className='infoBox'>

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

class TenxFlowBuildLog extends Component {
  constructor(props) {
    super(props);
    this.changeModalSize = this.changeModalSize.bind(this);
    this.state = {
      activePanel: [],
      modalSize: 'normal'
    }
  }

  componentWillMount() {
    document.title = 'TenxFlow | 时速云';
  }

  changeModalSize() {
    //this function for change the modal size
    //when the size is the big , the size will be change to the normal
    //when the size is the normal , the size will be change to the big
    const { modalSize } = this.state;
    if (modalSize == 'normal') {
      this.setState({
        modalSize: 'big'
      });
    } else {
      this.setState({
        modalSize: 'normal'
      });
    }
  }

  render() {
    const scope = this;
    return (
      <div id='TenxFlowBuildLog' className={this.state.modalSize == 'big' ? 'bigModal' : 'smallModal'}>
        <div className='title'>
          <span>执行记录</span>
          <i className='fa fa-expand' onClick={this.changeModalSize} />
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='paddingBox'>
          <MyComponent config={testData} scope={scope} />
          <MyLine config={testData} scope={scope} />
          <div style={{ clear: 'both' }}></div>
        </div>
      </div>
    )
  }
}

function mapStateToProps(state, props) {

  return {

  }
}

TenxFlowBuildLog.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(TenxFlowBuildLog, {
  withRef: true,
}));

