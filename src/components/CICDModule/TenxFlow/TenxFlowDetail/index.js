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
import { Spin, Card, Button, Tabs, Modal, message, Popover } from 'antd'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import {
  getTenxFlowDetail, getTenxflowBuildLastLogs, getTenxFlowYAML,
  deploymentLog, getTenxflowBuildLogs, getCdInimage,
  changeBuildStatus, getTenxFlowStatus, getRepoBranchesAndTagsByProjectId,
} from '../../../../actions/cicd_flow'
import { LoadOtherImage } from '../../../../actions/app_center'
import { checkImage } from '../../../../actions/app_center'
import './style/TenxFlowDetail.less'
import TenxFlowDetailAlert from './TenxFlowDetailAlert.js'
import TenxFlowDetailYaml from './TenxFlowDetailYaml.js'
import TenxFlowDetailSetting from './TenxFlowDetailSetting.js'
import TenxFlowDetailLog from './TenxFlowDetailLog.js'
import ImageDeployLogBox from './ImageDeployLogBox.js'
import TenxFlowDetailFlow from './TenxFlowDetailFlow.js'
import TenxFlowBuildLog from '../TenxFlowBuildLog'
import NotificationHandler from '../../../../common/notification_handler'
import flowImg from '../../../../assets/img/flow.png'
import { camelize } from 'humps'
import PopTabSelect from '../../../PopTabSelect'
import Title from '../../../Title'

const TabPane = Tabs.TabPane;
const PopTab = PopTabSelect.Tab;
const PopOption = PopTabSelect.Option;

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
    defaultMessage: '执行记录',
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
    this.refreshStageList = this.refreshStageList.bind(this);
    this.startBuildStage = this.startBuildStage.bind(this);
    this.renderBuildBtn = this.renderBuildBtn.bind(this);
    const pathname = window.location.pathname
    let isBuildImage = false
    if(pathname.indexOf('/build_image') >= 0) {
      isBuildImage = true
    }
    this.state = {
      createTenxFlowModal: false,
      TenxFlowDeployLogModal: false,
      startBuild: false,
      buildInfo: null,
      showImage: [],
      statusName: 0,
      refreshFlag: false,
      showTargeImage:false,
      projectId: null,
      projectBranch: null,
      isBuildImage
    }
  }
  flowState() {
    let { search } = this.props.location;
    let status = ''
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
    const { getTenxFlowDetail, getCdInimage, getRepoBranchesAndTagsByProjectId } = this.props;
    let { search } = this.props.location;
    search = search.split('?')[1].split('&')[0]
    const self = this
    getTenxFlowDetail(search, {
      success: {
        func: (res) => {
          getCdInimage(search)
          const stages = res.data.results.stageInfo || []
          const firstStage = stages[0]
          if (!firstStage) {
            return
          }
          const { id, branch } = firstStage.spec.project
          this.setState({
            projectId: id,
            projectBranch: branch,
          })
          // data.results.stageInfo[0].spec.project.id
          if (id) {
            getRepoBranchesAndTagsByProjectId(id)
          }
        },
        isAsync: true
      }
    })
    this.flowState()
    this.props.LoadOtherImage()
  }

  componentWillReceiveProps(nextProps) {
    const { currentSpace } = nextProps;
    if (nextProps.cdImageList) {
      this.setState({
        showImage:nextProps.cdImageList
      })
    }
    if (currentSpace && this.props.currentSpace && currentSpace != this.props.currentSpace) {
      browserHistory.push(`/ci_cd/tenx_flow`)
      return
    }
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

  startBuildStage(key, tabKey) {
    //this function for user build all stages
    //and the state changed will be trigger the children's recivice props
    //and start build flow functon will be trigger in children
    let notification = new NotificationHandler()
    if (this.props.flowInfo && this.props.flowInfo.stageInfo && this.props.flowInfo.stageInfo.length < 1) {
      notification.error('请先添加构建子任务')
      return
    }
    notification.success('流程正在构建中')
    const newState = {
      startBuild: true
    }
    if (key && tabKey) {
      newState.buildInfo = {
        type: tabKey,
        name: key,
      }
    }
    this.setState(newState)
  }
  handleChange(e) {
    const {flowInfo, getTenxFlowYAML, deploymentLog, getTenxflowBuildLogs} = this.props
    const _this = this
    if ('5' == e) {
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
    } else if ('3' == e) {
      deploymentLog(flowInfo.flowId)
    } else if ('2' == e) {
      getTenxflowBuildLogs(flowInfo.flowId)
    }
  }
  goCheckImage(image) {
    const config = { registry: DEFAULT_REGISTRY, image }
    let notification = new NotificationHandler()
    const {namespace, owner} = this.props.flowInfo
    this.setState({showTargeImage: false})
    this.props.checkImage(config, {
      success: {
        func: (res) => {
          if (res.data.hasOwnProperty('status') && res.data.status == 404) {
            notification.error('镜像不存在，请先执行构建')
            return
          }
          if (namespace != res.data.contributor && owner != res.data.contributor) {
            notification.error('没有权限访问该镜像')
            return
          }
          browserHistory.push(`/app_center?imageName=${image}`)
        },
        isAsync: true
      }
    })
  }
  handleVisibleChange(visible) {
    this.setState({ showTargeImage: visible });
  }

  setStatus(scope, status) {
    let statusName = status
    switch (statusName) {
      case 0:
        status = '成功'
        break;
      case 1:
        status = "失败"
        break;
      case 2:
        status = "执行中..."
        break;
      default:
        status = "等待中..."
    }
    scope.setState({
      status,
      statusName
    })
  }

  refreshStageList() {
    //this function for refrash
    const { getTenxFlowStatus } = this.props;
    let { search } = this.props.location;
    search = search.split('?')[1].split('&')[0]
    const self = this
    getTenxFlowStatus(search, {
      success: {
        func: (result) => {
          let statusName = result.data.results.status;
          let status
          switch (statusName) {
            case 0:
              status = '成功'
              break;
            case 1:
              status = "失败"
              break;
            case 2:
              status = "执行中..."
              break;
            default:
              status = "等待中..."
          }
          self.setState({
            status,
            statusName
          })
        },
        isAsync: true
      }
    })
    this.setState({
      refreshFlag: true
    });
  }

  callback(flowId) {
    const {getTenxflowBuildLastLogs, changeBuildStatus} = this.props
    return ()=> {
      getTenxflowBuildLastLogs(flowId, {
        success: {
          func: (result) => {
            const info = result.data.results.results
            changeBuildStatus(info.buildId, info.status)
          },
          isAsync: true
        }
      })
    }
  }

  renderBuildBtn() {
    const { projectId, projectBranch } = this.state
    const { repoBranchesAndTags } = this.props
    const targetElement = (
      <Button size='large' type='primary' className='buildBtn'>
        <svg className='cicdbuildfast'>
          <use xlinkHref='#cicdbuildfast' />
        </svg>
        <FormattedMessage {...menusText.deloyStart} />
      </Button>
    )
    const tabs = []
    let loading
    const branchesAndTags = repoBranchesAndTags[projectId]
    if (!branchesAndTags) {
      tabs.push(<PopOption key="not_found_branches_tags">未找到分支及标签，点击构建</PopOption>)
    } else {
      const { isFetching, data } = branchesAndTags
      loading = isFetching
      const { branches, tags } = data
      for(let key in data) {
        if (data.hasOwnProperty(key)) {
          tabs.push(
            <PopTab key={key} title={key === 'branches' ? '分支' : '标签'}>
              {
                data[key].map(item => {
                  let name = item.branch || item.tag
                  return <PopOption key={name}>{name}</PopOption>
                })
              }
            </PopTab>
          )
        }
      }
    }

    return (
      <PopTabSelect
        onChange={this.startBuildStage}
        targetElement={targetElement}
        loading={loading}
        getTooltipContainer={() => document.getElementById('TenxFlowDetail')}>
        {tabs}
      </PopTabSelect>
    )
  }

  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    const { flowInfo, isFetching, buildFetching, logs } = this.props;
    if (isFetching || flowInfo == {} || !Boolean(flowInfo)) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const checkImage = this.state.showImage.length > 0 && this.state.showImage.map(list => {
      return (
        <div className="cursor" onClick={() => this.goCheckImage(list)} key={list} style={{ lineHeight: '25px' }}><a>{list}</a></div>
      )
    })
    return (
      <QueueAnim className='TenxFlowDetail'
        type='right'
        >
        <Title title="TenxFlow" />
        <div id='TenxFlowDetail' key='TenxFlowDetail'>
          <Card className='infoBox'>
            <div className='imgBox' >
              <img src={flowImg} />
            </div>
            <p className='title'>{flowInfo.name}</p>
            <div className='msgBox'>
              状态：<span className={'status-' + this.state.statusName}><i className="fa fa-circle" style={{ marginRight: '5px' }}></i>{this.state.status}</span>
              <span className='updateTime'>{flowInfo.update_time ? flowInfo.update_time : flowInfo.create_time}</span>
            </div>
            <div className='btnBox'>
              {this.renderBuildBtn()}
              {/*<Button size='large' type='primary' onClick={this.startBuildStage} className='buildBtn'>
                <svg className='cicdbuildfast'>
                  <use xlinkHref='#cicdbuildfast' />
                </svg>
                <FormattedMessage {...menusText.deloyStart} />
              </Button>*/}
              {this.state.showImage.length > 0 ?
                <Popover placement="topLeft" title="查看镜像" content={checkImage} visible={this.state.showTargeImage} onVisibleChange={(visible)=>this.handleVisibleChange(visible)}>
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
              <Button size='large' type='ghost' onClick={this.refreshStageList}>
                <span><i className='fa fa-refresh'></i>&nbsp;刷新</span>
              </Button>
              <div style={{ clear: 'both' }}></div>
            </div>
            <div style={{ clear: 'both' }}></div>
          </Card>
          <Tabs defaultActiveKey='1' size="small" onChange={(e) => this.handleChange(e)}>
            <TabPane tab={this.state.isBuildImage ? '构建镜像任务' : 'TenxFlow流程定义'} key='1'>
              <TenxFlowDetailFlow
                scope={scope}
                setStatus={this.setStatus}
                otherImage={this.props.otherImage}
                flowId={flowInfo.flowId}
                uniformRepo={flowInfo[camelize('uniform_repo')]}
                stageInfo={flowInfo.stageInfo}
                supportedDependencies={flowInfo.supportedDependencies}
                startBuild={this.state.startBuild}
                buildInfo={this.state.buildInfo}
                refreshFlag={this.state.refreshFlag}
                isBuildImage={this.state.isBuildImage}
              />
            </TabPane>
            {this.state.isBuildImage ? [ <TabPane tab='执行记录' key='2'><TenxFlowDetailLog scope={scope} flowId={flowInfo.flowId} flowName={flowInfo.name} /></TabPane>,
              <TabPane tab='自动部署' key='3'><ImageDeployLogBox scope={scope} flowId={flowInfo.flowId} /></TabPane>,
              <TabPane tab='构建通知' key='4'><TenxFlowDetailAlert scope={scope} notify={flowInfo.notificationConfig} flowId={flowInfo.flowId} /></TabPane>,
              <TabPane tab='设置' key='6'><TenxFlowDetailSetting scope={scope} flowId={flowInfo.flowId} /></TabPane>]
              :
              [ <TabPane tab='TenxFlow执行记录' key='2'><TenxFlowDetailLog scope={scope} flowId={flowInfo.flowId} flowName={flowInfo.name} /></TabPane>,
                <TabPane tab='自动部署' key='3'><ImageDeployLogBox scope={scope} flowId={flowInfo.flowId} /></TabPane>,
                <TabPane tab='构建通知' key='4'><TenxFlowDetailAlert scope={scope} notify={flowInfo.notificationConfig} flowId={flowInfo.flowId} /></TabPane>,
                <TabPane tab='TenxFlow Yaml 描述' key='5'><TenxFlowDetailYaml flowId={flowInfo.flowId} yaml={this.state.yamlContent} /></TabPane>,
                <TabPane tab='设置' key='6'><TenxFlowDetailSetting scope={scope} flowId={flowInfo.flowId} /></TabPane>]}
          </Tabs>
        </div>
        <Modal
          visible={this.state.TenxFlowDeployLogModal}
          className='TenxFlowBuildLogModal'
          onCancel={this.closeTenxFlowDeployLogModal}
          >
          <TenxFlowBuildLog scope={scope} isFetching={buildFetching} logs={logs} flowId={flowInfo.flowId} callback={this.callback(flowInfo.flowId)} visible={this.state.TenxFlowDeployLogModal}/>
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
  const defaultFlowStatus = {
    initType: 0
  }
  const { getTenxflowDetail, getTenxflowBuildLastLogs, getCdImage, repoBranchesAndTags } = state.cicd_flow;
  const { cdImageList } = getCdImage || []
  const { isFetching, flowInfo } = getTenxflowDetail || defaultFlowInfo;
  const { initType } = getTenxFlowStatus || defaultFlowStatus;
  const buildFetching = getTenxflowBuildLastLogs ? getTenxflowBuildLastLogs.isFetching : deafaultFlowLog.isFetching
  const logs = getTenxflowBuildLastLogs ? getTenxflowBuildLastLogs.logs : deafaultFlowLog.logs;
  let otherImage = state.images.otherImages
  if(otherImage){
    otherImage = otherImage.imageRow
  } else {
    otherImage = []
  }
  return {
    isFetching,
    flowInfo,
    buildFetching,
    cdImageList,
    logs,
    buildFetching,
    currentSpace: state.entities.current.space.namespace,
    otherImage,
    repoBranchesAndTags,
  }
}

TenxFlowDetail.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxFlowYAML,
  getTenxFlowDetail,
  getTenxflowBuildLastLogs,
  checkImage,
  deploymentLog,
  getCdInimage,
  getTenxflowBuildLogs,
  changeBuildStatus,
  getTenxFlowStatus,
  LoadOtherImage,
  getRepoBranchesAndTagsByProjectId,
})(injectIntl(TenxFlowDetail, {
  withRef: true,
}));
