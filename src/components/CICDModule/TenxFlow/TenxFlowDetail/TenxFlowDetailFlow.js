/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowDetailFlow component
 *
 * v0.1 - 2016-10-25
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Spin, Icon, Card, Alert, Modal, Button, notification } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { getTenxFlowStateList, getProjectList, searchProject, getAvailableImage } from '../../../../actions/cicd_flow'
import { getDockerfileList, CreateTenxflowBuild, StopTenxflowBuild, changeSingleState } from '../../../../actions/cicd_flow'
import './style/TenxFlowDetailFlow.less'
import CreateTenxFlowModal from './TenxFlowDetailFlow/CreateTenxFlowModal.js'
import TenxFlowDetailFlowCard from './TenxFlowDetailFlow/TenxFlowDetailFlowCard.js'
import Socket from '../../../Websocket/socketIo'
import NotificationHandler from '../../../../common/notification_handler'

const confirm = Modal.confirm;

const menusText = defineMessages({
  title: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlow.title',
    defaultMessage: '部署记录',
  },
  tooltip: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlow.tooltip',
    defaultMessage: 'TenxFlow流程定义，这里您可以定义一系列构建所需要的项目执行过程，可以是代码构建，亦或是开发自测，也可以是自动化集成、并实现自动化部署的一个All-In-One Platform',
  },
  add: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlow.add',
    defaultMessage: '添加Flow项目',
  },
})

class TenxFlowDetailFlow extends Component {
  constructor(props) {
    super(props);
    this.createNewFlow = this.createNewFlow.bind(this);
    this.closeCreateNewFlow = this.closeCreateNewFlow.bind(this);
    this.buildFlow = this.buildFlow.bind(this);
    this.refreshStageList = this.refreshStageList.bind(this);
    this.state = {
      editTenxFlowModal: false,
      currentModalShowFlow: null,
      currentFlowEdit: null,
      createNewFlow: false,
      buildingList: [],
      refreshing: false,
      websocket: '',
      forCacheShow: false
    }
  }

  componentWillMount() {
    const { getTenxFlowStateList, flowId, getProjectList, getDockerfileList, getAvailableImage } = this.props;
    const _this = this;
    let buildingList = [];
    //when different tenxflow should be show
    //sometimes the last message still in the html
    //when the new message recevice, the old message will be refrash
    this.setState({
      forCacheShow: true
    });
    const cicdApi = this.props.cicdApi;
    getAvailableImage()
    getTenxFlowStateList(flowId, {
      success: {
        func: (res) => {
          res.data.results.map((item) => {
            let buildId = null;
            if (!Boolean(item.lastBuildStatus)) {
              buildId = null;
            } else {
              buildId = item.lastBuildStatus.buildId;
            }
            let buildItem = {
              buildId: buildId,
              stageId: item.metadata.id
            }
            if (item.lastBuildStatus) {
              buildItem.status = item.lastBuildStatus.status
            }
            buildingList.push(buildItem)
          })
          _this.setState({
            buildingList: buildingList,
            websocket: <Socket url={cicdApi.host} path={cicdApi.statusPath} protocol={cicdApi.protocol} onSetup={(socket) => _this.onSetup(socket)} />
          });
          getProjectList({
            success: {
              func: () => {
                _this.setState({
                  forCacheShow: false
                })
              },
              isAsync: true
            }
          });
        },
        isAsync: true
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    //this function for user click the top box and build all stages
    const { startBuild, getTenxFlowStateList, flowId, CreateTenxflowBuild, scope, refreshFlag } = nextProps;
    let oldFlowId = this.props.flowId;
    let notification = new NotificationHandler()
    if (startBuild) {
      scope.setState({
        startBuild: false
      })
      CreateTenxflowBuild(flowId, {}, {
        success: {
          func: (res) => {

          },
          isAsync: true
        }
      })
    }
    if(refreshFlag) {
      scope.setState({
        refreshFlag: false
      });
      getTenxFlowStateList(flowId, {
        success: {
          func: () => {
            notification.success('流程构建', '流程构建已刷新');
          },
          isAsync: true
        }
      });
    }
  }

  createNewFlow() {
    //this function only for user create an new flow show the edit modal
    this.setState({
      currentFlowEdit: null,
      createNewFlow: true,
    });
  }

  closeCreateNewFlow() {
    //this function only for user close the modal of  create an new flow
    this.setState({
      currentFlowEdit: null,
      createNewFlow: false
    });
  }

  buildFlow(stageId) {
    //this function for user build stage
    //and user can build single one
    const { CreateTenxflowBuild, getTenxFlowStateList, flowId } = this.props;
    let buildFlag = true;
    const _this = this;
    let notification = new NotificationHandler()
    CreateTenxflowBuild(flowId, { stageId: stageId }, {
      success: {
        func: (res) => {
          notification.success('流程构建', '流程构建成功');
          let buildingList = _this.state.buildingList;
          buildingList.map((item) => {
            if (item.stageId == stageId) {
              buildFlag = false;
              item.buildId = res.data.results.stageBuildId;
              item.status = 2
            }
          });
          if (buildFlag) {
            buildingList.push({
              stageId: stageId,
              buildId: res.data.results.stageBuildId,
              status: 2
            });
          }
          _this.onSetup(_this.state.socket, buildingList)
          _this.setState({
            buildingList: buildingList
          });
          getTenxFlowStateList(flowId);
        },
        isAsync: true
      }
    })
  }

  stopBuildFlow(stageId, stageName) {
    //this function for user stop building stage
    const { StopTenxflowBuild, getTenxFlowStateList, flowId } = this.props;
    const { buildingList } = this.state;
    let notification = new NotificationHandler()
    confirm({
      title: '确定停止构建？',
      content: `停止${stageName}构建`,
      onOk() {
        buildingList.map((item) => {
          if (item.stageId == stageId) {
            StopTenxflowBuild(flowId, item.stageId, item.buildId, {
              success: {
                func: (res) => {
                  notification.success('构建停止成功', '构建停止成功');
                  getTenxFlowStateList(flowId);
                },
                isAsync: true
              }
            });
          }
        });
      },
      onCancel() { },
    });
  }

  refreshStageList() {
    //this function for temp refresh stage list
    //it will be instead of  using websocket get stage list for native
    const { getTenxFlowStateList, flowId } = this.props;
    let notification = new NotificationHandler()
    this.setState({
      refreshing: true
    })
    getTenxFlowStateList(flowId, {
      success: {
        func: () => {
          notification.success('流程构建', '流程构建已刷新');
          this.setState({
            refreshing: false
          })
        },
        isAsync: true
      }
    });
  }
  onSetup(socket, buildList) {
    const buildingList = buildList || this.state.buildingList
    const flowId = this.props.flowId
    const self = this
    const watchedBuilds = []
    self.setState({
      socket
    })
    buildingList.forEach(item => {
      if (item.status === 0 || item.status === 1) {
        item.buildId = null
      }
      watchedBuilds.push({
        stageBuildId: item.buildId,
        stageId: item.stageId
      })
    })
    if (watchedBuilds.length <= 0) {
      return
    }
    const watchCondition = {
      flowId: flowId,
      watchedBuilds
    }
    this.setState({
      watchCondition: watchCondition
    })
    const { getTenxFlowStateList } = this.props
    socket.emit("stageBuildStatus", watchCondition)
    socket.on("stageBuildStatus", function (data) {
      if (data.status !== 200) { return }
      if (data.results.buildStatus == 2) {
        let buildingList = []
        getTenxFlowStateList(flowId, {
          success: {
            func: (res) => {
              res.data.results.map((item) => {
                let buildId = null;
                if (!Boolean(item.lastBuildStatus)) {
                  buildId = null;
                } else {
                  buildId = item.lastBuildStatus.buildId;
                }
                let buildItem = {
                  buildId: buildId,
                  stageId: item.metadata.id
                }
                if (item.lastBuildStatus) {
                  buildItem.status = item.lastBuildStatus.status
                }
                buildingList.push(buildItem)
              })
              self.setState({
                buildingList
              })
              socket.off("stageBuildStatus")
              self.onSetup(self.state.socket, buildingList)
            },
            isAsync: false
          }
        })
      }
      const { changeSingleState } = self.props
      changeSingleState(data.results)
    })
  }
  addWatch(buildId, stageBuildId) {
    const { socket, watchCondition } = this.state
    watchCondition.watchedBuilds.push({
      stageBuildId: stageBuildId,
      stageId: item.stageId
    })
    socket.emit('stageBuildStage', watchCondition)
  }
  render() {
    const { flowId, stageInfo, stageList, isFetching, projectList, buildFetching, logs, supportedDependencies, cicdApi, imageList } = this.props;
    const { forCacheShow } = this.state;
    let scope = this;
    let { currentFlowEdit } = scope.state;
    let cards = null;
    if (!Boolean(stageList) || forCacheShow) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    } else {
      cards = stageList.map((item, index) => {
        return (
          <TenxFlowDetailFlowCard key={'TenxFlowDetailFlowCard' + index} config={item}
            scope={scope} index={index} flowId={flowId} currentFlowEdit={currentFlowEdit} totalLength={stageList.length}
            codeList={projectList} supportedDependencies={supportedDependencies} imageList={imageList} />
        )
      });
    }
    return (
      <div id='TenxFlowDetailFlow'>
        <div className='paddingBox'>
          <Alert message={<FormattedMessage {...menusText.tooltip} />} type='info' />
          {cards}
          <div className={this.state.createNewFlow ? 'TenxFlowDetailFlowCardBigDiv commonCardBox createCardBox' : 'commonCardBox createCardBox'}>
            <Card className='commonCard createCard' onClick={this.createNewFlow}>
              {!this.state.createNewFlow ? [
                <QueueAnim key='createCardAnimate'>
                  <div className='createInfo' key='createCard'>
                    <svg className='addIcon'>
                      <use xlinkHref='#cicdcreate' />
                    </svg>
                    <p>
                      <FormattedMessage {...menusText.add} />
                    </p>
                  </div>
                </QueueAnim>
              ] : null}
              {
                this.state.createNewFlow ? [
                  <QueueAnim key='creattingCardAnimate'>
                    <CreateTenxFlowModal key='CreateTenxFlowModal' stageList={stageList} scope={scope}
                      flowId={flowId} stageInfo={stageInfo} codeList={projectList}
                      supportedDependencies={supportedDependencies} imageList={imageList} />
                  </QueueAnim>
                ] : null
              }
            </Card>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
        {this.state.websocket}
      </div>

    )
  }
}

function mapStateToProps(state, props) {
  const defaultStageList = {
    isFetching: false,
    stageList: []
  }
  const defaultStatus = {
    projectList: []
  }
  const { getTenxflowStageList, availableImage } = state.cicd_flow;
  const { isFetching, stageList } = getTenxflowStageList || defaultStageList;
  const { managed } = state.cicd_flow;
  const {projectList} = managed || defaultStatus;
  const cicdApi = state.entities.loginUser.info.cicdApi
  return {
    isFetching,
    stageList,
    projectList,
    cicdApi,
    imageList: availableImage.imageList || []
  }
}

TenxFlowDetailFlow.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxFlowStateList,
  getProjectList,
  searchProject,
  getDockerfileList,
  CreateTenxflowBuild,
  StopTenxflowBuild,
  getAvailableImage,
  changeSingleState
})(injectIntl(TenxFlowDetailFlow, {
  withRef: true,
}));

