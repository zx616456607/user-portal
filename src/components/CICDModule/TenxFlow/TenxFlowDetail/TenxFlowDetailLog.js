/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFLowDetailLog component
 *
 * v0.1 - 2016-10-24
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Card, Dropdown, Spin, Menu, Icon } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import './style/TenxFLowDetailLog.less'

let testData = [
  {
    'name': 'test1',
    'updateTime': '1小时前',
    'status': 'finish',
    'user': 'gaojian',
    'cost': '10小时',
    'status': 'normal'
  },
  {
    'name': 'test2',
    'updateTime': '2小时前',
    'status': 'running',
    'user': 'gaojian',
    'cost': '10小时',
    'status': 'fail'
  },
  {
    'name': 'test3',
    'updateTime': '3小时前',
    'status': 'finish',
    'user': 'gaojian',
    'cost': '10小时',
    'status': 'normal'
  },
  {
    'name': 'test4',
    'updateTime': '4小时前',
    'status': 'fail',
    'user': 'gaojian',
    'cost': '10小时',
    'status': 'normal'
  },
]

const menusText = defineMessages({
  bulidLog: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.bulidLog',
    defaultMessage: '执行记录',
  },
  downLoadBulidLog: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.downLoadBulidLog',
    defaultMessage: '下载执行记录',
  },
  viewBulidLog: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.viewBulidLog',
    defaultMessage: '查看执行记录',
  },
  cost: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.cost',
    defaultMessage: '耗时',
  },
  checkImage: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.checkImage',
    defaultMessage: '查看镜像',
  },
  normal: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.normal',
    defaultMessage: '执行成功',
  },
  fail: {
    id: 'CICD.Tenxflow.TenxFLowDetailLog.fail',
    defaultMessage: '执行失败',
  },
})

function checkStatusSpan(status, scope) {
  //this function for user input the status return current words
  const { formatMessage } = scope.props.intl;
  switch(status) {
    case 'normal':
      return formatMessage(menusText.normal);
      break;
    case 'fail':
      return formatMessage(menusText.fail);
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

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  operaMenuClick: function () {
    //this function for user click the drop menu
  },
  render: function () {
    const { config, scope } = this.props;
    let items = config.map((item) => {
      const dropdown = (
        <Menu onClick={this.operaMenuClick.bind(this, item)}
          style={{ width: '130px' }}
          >
          <Menu.Item key='1'>
            <i className='fa fa-download' style={{ float:'left',lineHeight:'18px',marginRight:'5px' }} />
            <span style={{ float:'left' }} ><FormattedMessage {...menusText.downLoadBulidLog} /></span>
            <div style={{ clear:'both' }}></div>
          </Menu.Item>
          <Menu.Item key='2'>
            <i className='fa fa-eye' style={{ float:'left',lineHeight:'18px',marginRight:'5px' }} />
            <span style={{ float:'left' }} ><FormattedMessage {...menusText.viewBulidLog} /></span>
            <div style={{ clear:'both' }}></div>
          </Menu.Item>
        </Menu>
      );
      return (
        <div className='LogDetail' key={item.name} >
          <div className='leftBox'>
            <p className={ checkStatusClass(item.status) + ' title' }>
              { checkStatusSpan(item.status, scope) }
            </p>
            <span className='space'>
              <i className='fa fa-github' />&nbsp;
              {item.user}
            </span>
            <i className={ checkStatusClass(item.status) + ' fa fa-dot-circle-o dot' } />
          </div>
          <div className='rightBox'>
            <p className='title'>
              {item.name}
            </p>
            <div className='infoBox'>
              <span className='user'>
                <i className='fa fa-user' />
                {item.user}
              </span>
              <span className='updateTime'>
                <i className='fa fa-wpforms' />
                {item.updateTime}
              </span>
              <span className='costTime'>
                <Icon type="clock-circle-o" />
                <FormattedMessage {...menusText.cost} />
                {item.cost}
              </span>
              <div className='btnBox'>
                <Button size='large' type='primary' className='viewBtn'>
                  <i className='fa fa-eye' />&nbsp;
                  <FormattedMessage {...menusText.checkImage} />
                </Button>
                <Dropdown.Button overlay={dropdown} type='ghost' size='large' className='operaBtn'>
                  <i className='fa fa-pencil-square-o' />&nbsp;
                  <FormattedMessage {...menusText.bulidLog} />
                </Dropdown.Button>
              </div>
              <div style={{ clear:'both' }}></div>
            </div>
          </div>
            <div style={{ clear:'both' }}></div>
        </div>
      );
    });
    return (
      <div className='DeployLogList'>
        {items}
      </div>
    );
  }
});

class TenxFLowDetailLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentWillMount() {
    document.title = 'TenxFlow | 时速云';
  }

  render() {
    const scope = this;
    return (
      <Card id='TenxFLowDetailLog'>
        <MyComponent config={testData} scope={scope} />
      </Card>
    )
  }
}

function mapStateToProps(state, props) {

  return {

  }
}

TenxFLowDetailLog.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {

})(injectIntl(TenxFLowDetailLog, {
  withRef: true,
}));

