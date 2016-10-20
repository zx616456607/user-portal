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
import './style/TenxFlowDetail.less'

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
    console.log(this)
    const { formatMessage } = this.props.intl;
    const scope = this;
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
            <div className='msgBox'>
              <p className='title'>这是标题</p>
              <span >这是状态</span>
              <span className='updateTime'>十年前</span>
            </div>
            <div className='btnBox'>
              <Button size='large' type='ghost'>
                <i className="fa fa-wpforms" />&nbsp;执行记录
              </Button>
              <Button size='large' type='ghost'>
                <i className="fa fa-eye" />&nbsp;查看镜像
              </Button>
              <Button size='large' type='primary'>
                <i className="fa fa-pencil-square-o" />&nbsp;立即执行
              </Button>
            </div>
          </Card>
          <Tabs defaultActiveKey="1">
            <TabPane tab="构建流程定义" key="1">选项卡一内容</TabPane>
            <TabPane tab="TenxFlow构建记录" key="2">选项卡二内容</TabPane>
            <TabPane tab="镜像部署记录" key="3">选项卡三内容</TabPane>
            <TabPane tab="构建通知" key="4">选项卡三内容</TabPane>
            <TabPane tab="TenxFow Yaml" key="5">选项卡三内容</TabPane>
            <TabPane tab="设置" key="6">选项卡三内容</TabPane>
          </Tabs>
        </div>       
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  
  return {
    
  }
}

TenxFlowDetail.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  
})(injectIntl(TenxFlowDetail, {
  withRef: true,
}));

