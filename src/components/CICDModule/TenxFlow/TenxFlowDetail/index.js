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
import { Spin, Card, Button, Tabs, Modal , message, Popover } from 'antd'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { getTenxFlowDetail, getTenxflowBuildLastLogs, getTenxFlowYAML } from '../../../../actions/cicd_flow'
import { checkImage } from '../../../../actions/app_center'
import './style/TenxFlowDetail.less'
import TenxFlowDetailAlert from './TenxFlowDetailAlert.js'
import TenxFlowDetailYaml from './TenxFlowDetailYaml.js'
import TenxFlowDetailSetting from './TenxFlowDetailSetting.js'
import TenxFlowDetailLog from './TenxFlowDetailLog.js'
import ImageDeployLogBox from './ImageDeployLogBox.js'
import TenxFlowDetailFlow from './TenxFlowDetailFlow.js'
import TenxFlowBuildLog from '../TenxFlowBuildLog'

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
  unUpdate: {
    id: 'CICD.Tenxflow.TenxFlowDetail.unUpdate',
    defaultMessage: '未更新',
  },
});

class TenxFlowDetail extends Component {
  constructor(props) {
    super(props);
    this.openCreateTenxFlowModal = this.openCreateTenxFlowModal.bind(this);
    this.closeCreateTenxFlowModal = this.closeCreateTenxFlowModal.bind(this);
    this.openTenxFlowDeployLogModal = this.openTenxFlowDeployLogModal.bind(this);
    this.closeTenxFlowDeployLogModal = this.closeTenxFlowDeployLogModal.bind(this);
    this.startBuildStage = this.startBuildStage.bind(this);
    this.state = {
      createTenxFlowModal: false,
      TenxFlowDeployLogModal: false,
      startBuild: false,
      showImage: [],
      statusName:0
    }
  }
  flowState() {
    let { search } = this.props.location;
    let status=''
    search = search.split('&')[1]
    switch (search) {
      case '0':
        status = '成功'
        break;
      case '1':
        status = "失败"
        break;
      case '2':
        status = "执行中..."
        break;
      default:
        status = "等待中..."
    }
    this.setState({
      status,
      statusName: search
    })
  }
  componentWillMount() {
    document.title = 'TenxFlow | 时速云';
    const { getTenxFlowDetail } = this.props;
    let { search } = this.props.location;
    search = search.split('?')[1].split('&')[0]
    const self = this
    getTenxFlowDetail(search, {
      success: {
        func: (res) => {
          const result = res.data.results.stageInfo
          const showImage = []
          if (result.length > 0) {
            result.forEach(list => {
              if (list.spec.hasOwnProperty('build')) {
                showImage.push(list.spec.build.image)
              }
            })
          }
          self.setState({
            showImage
          })
        }
      }
    });
    this.flowState()
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
    const { flowInfo, getTenxflowBuildLastLogs } = this.props;
    const { flowId } = flowInfo;
    this.setState({
      TenxFlowDeployLogModal: true
    });
    getTenxflowBuildLastLogs(flowId)
  }

  closeTenxFlowDeployLogModal() {
    //this function for user close the modal of tenxflow deploy log
    this.setState({
      TenxFlowDeployLogModal: false
    });
  }
  
  startBuildStage() {
    //this function for user build all stages 
    //and the state changed will be trigger the children's recivice props
    //and start build flow functon will be trigger in children
    this.setState({
      startBuild: true
    })
  }
  handleChange(e) {
    if ('5' == e) {
      const _this = this
      const {flowInfo, getTenxFlowYAML} = this.props
      getTenxFlowYAML(flowInfo.flowId, {
        success: {
          func: (resp) => {
            _this.setState({
              yamlContent: resp.data.results
            })
          },
          isAsync: true
        }
      })
    }
  }
  goCheckImage(image) {
    const config = {registry: DEFAULT_REGISTRY, image}
    this.props.checkImage(config, {
      success: {
        func: (res) => {
          if (res.data.hasOwnProperty('status') && res.data.status == 404) {
            message.error('镜像不存在')
            return
          }
          browserHistory.push(`/app_center?imageName=${image}`)
        },
        isAsync: true
      }
    })
  }
  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    const { flowInfo, isFetching, buildFetching, logs } = this.props;
    if(isFetching || flowInfo == {} || !Boolean(flowInfo)) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const checkImage = this.state.showImage.length > 0 && this.state.showImage.map(list => {
      return (
        <div onClick={()=> this.goCheckImage(list)} key={list} style={{lineHeight:'25px'}}><a>{ list }</a></div>
      )
    })
    return (
      <QueueAnim className='TenxFlowDetail'
        type='right'
        >
        <div id='TenxFlowDetail' key='TenxFlowDetail'>
          <Card className='infoBox'>
            <div className='imgBox' >
              <img src='/img/flow.png' />
            </div>
              <p className='title'>{flowInfo.name}</p>
            <div className='msgBox'>
              状态：<span className={'status-'+this.state.statusName}><i className="fa fa-circle" style={{marginRight:'5px'}}></i>{this.state.status}</span>
              <span className='updateTime'>{flowInfo.update_time ? flowInfo.update_time : flowInfo.create_time }</span>
            </div>
            <div className='btnBox'>
              <Button size='large' type='primary' onClick={this.startBuildStage} className='buildBtn'>
                <svg className='cicdbuildfast'>
                  <use xlinkHref='#cicdbuildfast' />
                </svg>
                <FormattedMessage {...menusText.deloyStart} />
              </Button>
              {this.state.showImage.length > 0 ?
                <Popover placement="topLeft" title="查看镜像" content={ checkImage } >
                  <Button size='large' type='ghost'>
                    <i className='fa fa-eye' />&nbsp;
                    <FormattedMessage {...menusText.checkImage} />
                  </Button>
                </Popover>
                :
                null
              }
              <Button size='large' type='ghost' onClick={this.openTenxFlowDeployLogModal} className='titleLogBtn'>
                <svg className='cicdlog'>
                  <use xlinkHref='#cicdlog' />
                </svg>
                <FormattedMessage {...menusText.deloyLog} />
              </Button>
              <div style={{ clear:'both' }}></div>
            </div>
            <div style={{ clear:'both' }}></div>
          </Card>
          <Tabs defaultActiveKey='1' size="small" onChange={(e)=>this.handleChange(e)}>
            <TabPane tab='构建流程定义' key='1'><TenxFlowDetailFlow scope={scope} flowId={flowInfo.flowId} stageInfo={flowInfo.stageInfo} supportedDependencies={flowInfo.supportedDependencies} startBuild={this.state.startBuild} /></TabPane>
            <TabPane tab='TenxFlow构建记录' key='2'><TenxFlowDetailLog scope={scope} flowId={flowInfo.flowId} flowName={flowInfo.name} /></TabPane>
            <TabPane tab='镜像部署记录' key='3'><ImageDeployLogBox scope={scope} flowId={flowInfo.flowId} /></TabPane>
            <TabPane tab='构建通知' key='4'><TenxFlowDetailAlert scope={scope} notify={flowInfo.notificationConfig} flowId={flowInfo.flowId} /></TabPane>
            <TabPane tab='TenxFow Yaml' key='5'><TenxFlowDetailYaml flowId={flowInfo.flowId} yaml={this.state.yamlContent} /></TabPane>
            <TabPane tab='设置' key='6'><TenxFlowDetailSetting scope={scope} flowId={flowInfo.flowId} /></TabPane>
          </Tabs>
        </div>
        <Modal
          visible={this.state.TenxFlowDeployLogModal}
          className='TenxFlowBuildLogModal'
          onCancel={this.closeTenxFlowDeployLogModal}
          >
          <TenxFlowBuildLog scope={scope} isFetching={buildFetching} logs={logs} flowId={flowInfo.flowId}/>
        </Modal>
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultFlowInfo = {
    isFetching: false,
    flowInfo: {}
  }
  const deafaultFlowLog = {
    isFetching: false,
    logs: []
  }
  const { getTenxflowDetail, getTenxflowBuildLastLogs } = state.cicd_flow;
  const { isFetching, flowInfo } = getTenxflowDetail || defaultFlowInfo;
  const buildFetching = getTenxflowBuildLastLogs.isFetching ||  deafaultFlowLog.isFetching;
  const { logs } = getTenxflowBuildLastLogs;
  return {
    isFetching,
    flowInfo,
    buildFetching,
    logs
  }
}

TenxFlowDetail.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxFlowYAML,
  getTenxFlowDetail,
  getTenxflowBuildLastLogs,
  checkImage
})(injectIntl(TenxFlowDetail, {
  withRef: true,
}));

