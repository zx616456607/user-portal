/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowDetail component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Spin, Card, Button, Tabs } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { getTenxFlowDetail } from '../../../../actions/cicd_flow'
import './style/TenxFlowDetail.less'
import TenxFlowDetailAlert from './TenxFlowDetailAlert.js'
import TenxFlowDetailYaml from './TenxFlowDetailYaml.js'
import TenxFlowDetailSetting from './TenxFlowDetailSetting.js'
import TenxFlowDetailLog from './TenxFlowDetailLog.js'
import ImageDeployLogBox from './ImageDeployLogBox.js'
import TenxFlowDetailFlow from './TenxFlowDetailFlow.js'

const TabPane = Tabs.TabPane;

const menusText = defineMessages({
  search: {
    id: 'CICD.Tenxflow.TenxFlowDetail.search',
    defaultMessage: '搜索',
  },
  name: {
    id: 'CICD.Tenxflow.TenxFlowDetail.name',
    defaultMessage: '名称',
  },
  updateTime: {
    id: 'CICD.Tenxflow.TenxFlowDetail.updateTime',
    defaultMessage: '更新时间',
  },
  status: {
    id: 'CICD.Tenxflow.TenxFlowDetail.status',
    defaultMessage: '构建状态',
  },
  opera: {
    id: 'CICD.Tenxflow.TenxFlowDetail.opera',
    defaultMessage: '操作',
  },
  tooltips: {
    id: 'CICD.Tenxflow.TenxFlowDetail.tooltips',
    defaultMessage: 'TenxFlow：这里完成【代码项目构建、测试】等流程的定义与执行，可以实现若干个（≥1）项目组成的一个Flow，由若干个项目流程化完成一个Flow，直至完成整个总项目，其中大部分流程以生成应用镜像为结束标志。',
  },
  create: {
    id: 'CICD.Tenxflow.TenxFlowDetail.create',
    defaultMessage: '创建TenxFlow',
  },
  deloyLog: {
    id: 'CICD.Tenxflow.TenxFlowDetail.deloyLog',
    defaultMessage: '构建记录',
  },
  deloyStart: {
    id: 'CICD.Tenxflow.TenxFlowDetail.deloyStart',
    defaultMessage: '立即构建',
  },
  checkImage: {
    id: 'CICD.Tenxflow.TenxFlowDetail.checkImage',
    defaultMessage: '查看镜像',
  },
  delete: {
    id: 'CICD.Tenxflow.TenxFlowDetail.delete',
    defaultMessage: '删除TenxFlow',
  },
});

class TenxFlowDetail extends Component {
  constructor(props) {
    super(props);
    this.openCreateTenxFlowModal = this.openCreateTenxFlowModal.bind(this);
    this.closeCreateTenxFlowModal = this.closeCreateTenxFlowModal.bind(this);
    this.state = {
      createTenxFlowModal: false,
      TenxFlowDeployLogModal: false,
    }
  }

  componentWillMount() {
    document.title = 'TenxFlow | 时速云';
    const { getTenxFlowDetail } = this.props;
    let { search } = this.props.location;
    search = search.slice(1);
    getTenxFlowDetail(search);
  }

  openCreateTenxFlowModal() {
    //this function for user open the modal of create new tenxflow
    this.setState({
      createTenxFlowModal: true
    });
  }

  closeCreateTenxFlowModal() {
    //this function for user close the modal of create new tenxflow
    this.setState({
      createTenxFlowModal: false
    });
  }

  openTenxFlowDeployLogModal() {
    //this function for user open the modal of tenxflow deploy log
    this.setState({
      TenxFlowDeployLogModal: true
    });
  }

  closeTenxFlowDeployLogModal() {
    //this function for user close the modal of tenxflow deploy log
    this.setState({
      TenxFlowDeployLogModal: false
    });
  }

  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    console.log(this.props)
    const tenxflow = this.props.config;
    return (
      <QueueAnim className='TenxFlowDetail'
        type='right'
        >
        <div id='TenxFlowDetail' key='TenxFlowDetail'>
          <Card className='infoBox'>
            <div className='imgBox' >
              <img src='/img/test/github.jpg' />
            </div>
              <p className='title'>这是标题</p>
            <div className='msgBox'>
              <span >这是状态</span>
              <span className='updateTime'>十年前</span>
              <div style={{ clear:'both' }}></div>
            </div>
            <div className='btnBox'>
              <Button size='large' type='primary'>
                <i className='fa fa-pencil-square-o' />&nbsp;立即执行
              </Button>
              <Button size='large' type='ghost'>
                <i className='fa fa-eye' />&nbsp;查看镜像
              </Button>
              <Button size='large' type='ghost'>
                <i className='fa fa-wpforms' />&nbsp;执行记录
              </Button>
              <div style={{ clear:'both' }}></div>
            </div>
            <div style={{ clear:'both' }}></div>
          </Card>
          <Tabs defaultActiveKey='1' size="small">
            <TabPane tab='构建流程定义' key='1'><TenxFlowDetailFlow scope={scope} /></TabPane>
            <TabPane tab='TenxFlow构建记录' key='2'><TenxFlowDetailLog scope={scope} /></TabPane>
            <TabPane tab='镜像部署记录' key='3'><ImageDeployLogBox scope={scope} /></TabPane>
            <TabPane tab='构建通知' key='4'><TenxFlowDetailAlert scope={scope} /></TabPane>
            <TabPane tab='TenxFow Yaml' key='5'><TenxFlowDetailYaml scope={scope} /></TabPane>
            <TabPane tab='设置' key='6'><TenxFlowDetailSetting scope={scope} /></TabPane>
          </Tabs>
        </div>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultFlowInfo = {
    isFetching: false,
    flowInfo: {}
  }
  const { getTenxflowDetail } = state.cicd_flow;
  const { isFetching, flowInfo } = getTenxflowDetail || defaultFlowInfo;
  return {
    isFetching,
    flowInfo
  }
}

TenxFlowDetail.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxFlowDetail
})(injectIntl(TenxFlowDetail, {
  withRef: true,
}));

