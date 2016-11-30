/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * StageBuildLog component
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
import { getFlowBuildStageLogs } from '../../../../../actions/cicd_flow'
import './style/StageBuildLog.less'
import TenxFlowStageBuildLog from '../../TenxFlowStageBuildLog'

const Panel = Collapse.Panel;

const menusText = defineMessages({
  title: {
    id: 'CICD.Tenxflow.StageBuildLog.title',
    defaultMessage: '执行记录',
  },
  cost: {
    id: 'CICD.Tenxflow.StageBuildLog.cost',
    defaultMessage: '耗时',
  },
  running: {
    id: 'CICD.Tenxflow.StageBuildLog.running',
    defaultMessage: '执行中...',
  },
  finish: {
    id: 'CICD.Tenxflow.StageBuildLog.finish',
    defaultMessage: '执行完成',
  },
  waitting: {
    id: 'CICD.Tenxflow.StageBuildLog.waitting',
    defaultMessage: '等待执行',
  },
  fail: {
    id: 'CICD.Tenxflow.StageBuildLog.fail',
    defaultMessage: '执行失败',
  },
  msShow: {
    id: 'CICD.Tenxflow.StageBuildLog.msShow',
    defaultMessage: '毫秒',
  },
  sShow: {
    id: 'CICD.Tenxflow.StageBuildLog.sShow',
    defaultMessage: '秒',
  },
  mShow: {
    id: 'CICD.Tenxflow.StageBuildLog.mShow',
    defaultMessage: '分钟',
  },
  hShow: {
    id: 'CICD.Tenxflow.StageBuildLog.hShow',
    defaultMessage: '小时',
  },
  running: {
    id: 'CICD.Tenxflow.StageBuildLog.running',
    defaultMessage: '运行中',
  },
  wait: {
    id: 'CICD.Tenxflow.StageBuildLog.wait',
    defaultMessage: '等待',
  },
  nodata: {
    id: 'CICD.Tenxflow.StageBuildLog.nodata',
    defaultMessage: '数据为空',
  },
})

function checkStatusSpan(status, scope) {
  //this function for user input the status return current words
  const { formatMessage } = scope.props.intl;
  switch (status) {
    case 0:
      return formatMessage(menusText.finish);
      break;
    case 1:
      return formatMessage(menusText.fail);
      break;
    case 2:
      return formatMessage(menusText.running);
      break;
    case 3:
      return formatMessage(menusText.waitting);
      break;
  }
}

function checkStatusClass(status) {
  //this function for user input the status return current className
  switch (status) {
    case 0:
      return 'finish';
      break;
    case 1:
      return 'fail';
      break;
    case 2:
      return 'running';
      break;
    case 3:
      return 'waitting';
      break;
  }
}

function dateSizeFormat(startTime, endTime, scope) {
  //this function for user get the flow building time
  const { formatMessage } = scope.props.intl;
  if (!Boolean(endTime)) {
    return (<span>{formatMessage(menusText.running)}</span>)
  }
  let newStart = new Date(Date.parse(startTime.replace('T', ' ').replace(/-/g, '/').split('.')[0]));
  let newEnd = new Date(Date.parse(endTime.replace('T', ' ').replace(/-/g, '/').split('.')[0]));
  let timeSize = newEnd.getTime() - newStart.getTime();
  if (timeSize > 1000) {
    timeSize = parseInt(timeSize / 1000);
    if (timeSize > 60) {
      timeSize = parseInt(timeSize / 60);
      if (timeSize > 60) {
        timeSize = parseInt(timeSize / 60);
        return (<span>{timeSize + formatMessage(menusText.hShow)}</span>)
      } else {
        return (<span>{timeSize + formatMessage(menusText.mShow)}</span>)
      }
    } else {
      return (<span>{timeSize + formatMessage(menusText.sShow)}</span>)
    }
  } else {
    return (<span>{timeSize + formatMessage(menusText.msShow)}</span>)
  }
}

function checkStatusIcon(status) {
  //this function for show different icon for different staus
  switch (status) {
    case 0:
      return (<i className='normal fa fa-check-circle' aria-hidden='false'></i>);
      break;
    case 1:
      return (<i className='fail fa fa-times-circle' aria-hidden='false'></i>);
      break;
    case 2:
      return (<Spin />);
      break;
    case 3:
      return (<i className='wait fa fa-circle' ></i>);
      break;
  }
}

function dateFormat(dateString) {
  //this function for user format string to date
  let newString = dateString.replace('T', ' ').replace(/-/g, '/').split('.')[0];
  return newString;
}

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  collapseAction: function (config, e) {
    //this function for user open or close collapse panel action
    //and then the line collapse will be current change
    const { scope, flowId } = this.props;
    const { getFlowBuildStageLogs } = scope.props;
    if (e.length > 0) {
      let index = e[e.length - 1].replace('LogDetail', '');
      config[index].isFetching = true;
      scope.setState({
        currentLogList: config
      })
      getFlowBuildStageLogs(flowId, config[index].stageId, config[index].buildId, {
        success: {
          func: (res) => {
            config[index].logInfo = res.message;
            config[index].isFetching = false;
            scope.setState({
              currentLogList: config
            })
          },
          isAsync: true
        }
      })
    }
  },
  changeItemStatus() {
    return (index, status) => {
      this.props.changeItemStatus(index, status)
    }
  },
  render: function () {
    const { config, scope, flowId } = this.props;

    let items = config.map((item, index) => {
      let com = <FormattedMessage {...menusText.cost} />
      if (item.status == 2) {
        com = ''
      }
      const header = (
        <div className='header'>
          <div className='leftHeader'>
            <div className='line'></div>
            {checkStatusIcon(item.status)}
          </div>
          <div className='rightHeader'>
            <div className='borderBox'>
              <span className='name commonHeader'>
                {item.stageName}
              </span>
              <span className='status commonHeader'>
                <span className={checkStatusClass(item.status)}>
                  {checkStatusSpan(item.status, scope)}
                </span>
              </span>
              <span className='updateTime commonHeader'>
                <i className='fa fa-wpforms' />
                {dateFormat(item.creationTime)}
              </span>
              <span className='commonHeader'>
                <Icon type='clock-circle-o' />
                {com}
                { item.status == 2 ? '' : dateSizeFormat(item.creationTime, item.endTime, scope)}
              </span>
              <div style={{ clear: 'both' }}></div>
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      );
      return (
        <Panel header={header} className={'LogDetail LogDetail' + index} key={'LogDetail' + index} >
          <div className='leftInfo'>
            <div className='line'></div>
          </div>
          <div className='rightInfo'>
            <TenxFlowStageBuildLog logs={item.logInfo} isFetching={item.isFetching} logInfo={item} flowId={flowId} changeItemStatus={this.changeItemStatus()} index={index}/>
          </div>
        </Panel>
      );
    });
    return (
      <div className='rightBox'>
        <Collapse className='logBox' onChange={this.collapseAction.bind(this, config)}>
          {items}
        </Collapse>
      </div>
    );
  }
});

class StageBuildLog extends Component {
  constructor(props) {
    super(props);
    this.changeModalSize = this.changeModalSize.bind(this);
    this.state = {
      modalSize: 'normal',
      currentLogList: []
    }
  }

  componentWillMount() {
    const { logs } = this.props;
    this.setState({
      currentLogList: logs
    })
  }

  componentWillReceiveProps(nextProps) {
    const { logs } = nextProps;
    if (!nextProps.isFetching) {
      this.setState({
        currentLogList: logs
      })
    }
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
  changeItemStatus() {
    return (index, status) => {
      const { config } = this.props
      config[index].status = status
    }
  }
  render() {
    const scope = this;
    const { logs, isFetching, flowId } = this.props;
    if (isFetching) {
      return (
        <div id='StageBuildLog' className={this.state.modalSize == 'big' ? 'bigModal' : 'smallModal'}>
          <div className='title'>
            <span>执行记录</span>
            <i className='fa fa-expand' onClick={this.changeModalSize} />
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className='paddingBox'>
            <div className='loadingBox'>
              <Spin size='large' />
            </div>
          </div>
        </div>
      )
    }
    if (!Boolean(logs) || logs.length == 0) {
      return (
        <div id='StageBuildLog' className={this.state.modalSize == 'big' ? 'bigModal' : 'smallModal'}>
          <div className='title'>
            <span>执行记录</span>
            <i className='fa fa-expand' onClick={this.changeModalSize} />
            <div style={{ clear: 'both' }}></div>
          </div>
          <div className='paddingBox'>
            <div className='loadingBox'>
              <span><FormattedMessage {...menusText.nodata} /></span>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div id='StageBuildLog' className={this.state.modalSize == 'big' ? 'bigModal' : 'smallModal'}>
        <div className='title'>
          <span>执行记录</span>
          <i className='fa fa-expand' onClick={this.changeModalSize} />
          <div style={{ clear: 'both' }}></div>
        </div>
        <div className='paddingBox'>
          <MyComponent config={logs} scope={scope} flowId={flowId}  changeItemStatus={this.changeItemStatus()}/>
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

StageBuildLog.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getFlowBuildStageLogs
})(injectIntl(StageBuildLog, {
  withRef: true,
}));

