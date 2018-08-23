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
import { Spin, Icon, Card, Alert, Modal, Button, } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { DEFAULT_REGISTRY } from '../../../../constants'
import { getTenxFlowStateList, getProjectList, searchProject, getAvailableImage } from '../../../../actions/cicd_flow'
import { getDockerfileList, CreateTenxflowBuild, StopTenxflowBuild, changeSingleState, getTenxflowBuildLogs } from '../../../../actions/cicd_flow'
import './style/TenxFlowDetailFlow.less'
import CreateTenxFlowModal from './TenxFlowDetailFlow/CreateTenxFlowModal.js'
import TenxFlowDetailFlowCard from './TenxFlowDetailFlow/TenxFlowDetailFlowCard.js'
import Socket from '../../../Websocket/socketIo'
import NotificationHandler from '../../../../components/Notification'
import ContinueIntegration from '../../../SettingModal/GlobalConfig/ContinueIntegration'
import { parseQueryStringToObject } from '../../../../common/tools'


const confirm = Modal.confirm;

const menusText = defineMessages({
  title: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlow.title',
    defaultMessage: '部署记录',
  },
  tooltip: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlow.tooltip',
    defaultMessage: 'TenxFlow流程定义：这里可以定义一个TenxFlow项目的执行流程，每个卡片对应一个子任务，分别执行镜像构建、代码编译、单元测试或者集成测试等子任务，大部分流程以生成应用镜像作为结束。',
  },
  buildImageTooltip: {
    id: 'CICD.Tenxflow.BuildImage.tooltip',
    defaultMessage: '构建镜像是TenxFlow中常被创建的子任务，指可将源代码仓库包括代码GitHub、GitLab、Gogs、SVN中的代码通过代码库中的Dockerfile或云端的Dockerfile 构建成镜像，默认将构建后的镜像存放到镜像仓库--私有空间。',
  },
  add: {
    id: 'CICD.Tenxflow.TenxFlowDetailFlow.add',
    defaultMessage: '添加子任务',
  },
  buildImageAdd: {
    id: 'CICD.Tenxflow.BuildImage.add',
    defaultMessage: '添加构建任务',
  }
})

class TenxFlowDetailFlow extends Component {
  constructor(props) {
    super(props);
    this.createNewFlow = this.createNewFlow.bind(this);
    this.closeCreateNewFlow = this.closeCreateNewFlow.bind(this);
    this.buildFlow = this.buildFlow.bind(this);
    this.refreshStageList = this.refreshStageList.bind(this);
    this.toggleCustomizeBaseImageModal = this.toggleCustomizeBaseImageModal.bind(this);
    this.setCurrentStageAdd = this.setCurrentStageAdd.bind(this)
    const queryObj = parseQueryStringToObject(window.location.search)
    this.state = {
      editTenxFlowModal: false,
      currentModalShowFlow: null,
      currentFlowEdit: null,
      buildingList: [],
      refreshing: false,
      websocket: '',
      forCacheShow: false,
      customizeBaseImageModalVisible: false,
      currentStageAdd: null,
    }
    if(queryObj.showCard == 'true') {
      this.state.createNewFlow = true
    } else {
      this.state.createNewFlow = false
    }
  }

  toggleCustomizeBaseImageModal(visible) {
    this.setState({
      customizeBaseImageModalVisible: visible,
    })
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
    const { startBuild, buildInfo, getTenxFlowStateList, flowId, CreateTenxflowBuild, scope, refreshFlag, getTenxflowBuildLogs } = nextProps;
    let oldFlowId = this.props.flowId;
    let notification = new NotificationHandler()
    if (startBuild) {
      scope.setState({
        startBuild: false,
        buildInfo: null,
      })
      const options = {}
      if (buildInfo) {
        options.branch = buildInfo.name
      }
      CreateTenxflowBuild(flowId, { options }, {
        success: {
          func: (res) => {
            getTenxflowBuildLogs(flowId)
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
            notification.success("构建流程已刷新")
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

  buildFlow(stageId, options) {
    //this function for user build stage
    //and user can build single one
    const { scope, CreateTenxflowBuild, getTenxFlowStateList, flowId } = this.props;
    let buildFlag = true;
    const _this = this;
    let notification = new NotificationHandler()
    CreateTenxflowBuild(flowId, { stageId, options }, {
      success: {
        func: (res) => {
          _this.props.setStatus(_this.props.scope, 2)
          notification.success('流程正在构建中');
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
          getTenxFlowStateList(flowId, {
            success: {
              func: (res) => {
                const { flowId } = scope.props.location.query
                _this.props.scope.props.getCdInimage(flowId)
              },
              isAsync: true
            }
          });
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
    //confirm({
    //  title: '确定停止构建？',
    //  content: `停止${stageName}构建`,
    //  onOk() {
        buildingList.map((item) => {
          if (item.stageId == stageId) {
            StopTenxflowBuild(flowId, item.stageId, item.buildId, {
              success: {
                func: (res) => {
                  notification.success('构建停止成功');
                  getTenxFlowStateList(flowId);
                },
                isAsync: true
              }
            });
          }
        });
    //  },
    //  onCancel() { },
    //});
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
          notification.success('流程构建已刷新');
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
      } else {
        let lastBuilds = self.state.buildingList
        let notified = self.state.notified || {}
        let notification = new NotificationHandler()
        if (notified && notified[data.results.stageId] !== data.results.stageBuildId) {
          //未提示过
          if (data.results.buildStatus == 0 &&
              lastBuilds[lastBuilds.length - 1].stageId === data.results.stageId &&
              lastBuilds[lastBuilds.length - 1].buildId === data.results.stageBuildId) {
            //最后一个stage构建完成时
            notified[data.results.stageId] = data.results.stageBuildId
            self.setState({
              notified: notified
            })
            self.props.setStatus(self.props.scope, 0)
            notification.close()
            notification.success(`构建完成`)
          } else if (data.results.buildStatus == 1) {
            //构建未成功时
            for(var i in lastBuilds) {
              if (lastBuilds[i].buildId === data.results.stageBuildId) {
                self.props.setStatus(self.props.scope, 1)
                notification.close()
                notification.error(`构建失败`)
                notified[data.results.stageId] = data.results.stageBuildId
                self.setState({
                  notified: notified
                })
                break
              }
            }
          }
        }
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

  setCurrentStageAdd(currentStageAdd) {
    this.setState({
      currentStageAdd,
    })
  }

  render() {
    const {
      flowId, stageInfo, stageList,
      isFetching, projectList, buildFetching,
      logs, supportedDependencies, cicdApi,
      imageList, baseImages, uniformRepo,
    } = this.props;
    const { forCacheShow, currentStageAdd } = this.state;
    let scope = this;
    let { currentFlowEdit } = scope.state;
    if (!Boolean(stageList) || forCacheShow) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const CreateTenxFlowModalEl = <QueueAnim key='creattingCardAnimate'>
    <CreateTenxFlowModal key='CreateTenxFlowModal' stageList={stageList} scope={scope}
      flowId={flowId} stageInfo={stageInfo} codeList={projectList} uniformRepo={uniformRepo}
      supportedDependencies={supportedDependencies} imageList={imageList}
      otherImage={this.props.otherImage} toggleCustomizeBaseImageModal={this.toggleCustomizeBaseImageModal}
      baseImages={baseImages} isBuildImage={this.props.isBuildImage}
      currentStageAdd={currentStageAdd} setCurrentStageAdd={this.setCurrentStageAdd}
    />
  </QueueAnim>
    let preStage = {}
    const cards = stageList.map((item, index) => {
      let content = (
        <TenxFlowDetailFlowCard key={'TenxFlowDetailFlowCard' + index} preStage={preStage} config={item} uniformRepo={uniformRepo}
          scope={scope} index={index} flowId={flowId} currentFlowEdit={currentFlowEdit} totalLength={stageList.length}
          codeList={projectList} supportedDependencies={supportedDependencies} imageList={imageList} baseImages={baseImages}
          otherImage={this.props.otherImage} toggleCustomizeBaseImageModal={this.toggleCustomizeBaseImageModal}
          firstState={stageList[0]} isBuildImage={this.props.isBuildImage}
          currentStageAdd={currentStageAdd} setCurrentStageAdd={this.setCurrentStageAdd}
          CreateTenxFlowModalEl={CreateTenxFlowModalEl}
          flowBuildStatus={this.props.flowBuildStatus}
        />
      )
      preStage = item
      return content
    });
    let buildImageAdd = <FormattedMessage {...menusText.add} />
    if (this.props.flowBuildStatus == 2) {
      buildImageAdd = '流水线正在执行，请稍后添加'
    }
    return (
      <div id='TenxFlowDetailFlow'>
        <div className='paddingBox'>
          {/*<Alert message={ this.props.isBuildImage ? <FormattedMessage {...menusText.buildImageTooltip} /> : <FormattedMessage {...menusText.tooltip} /> } type='info' />*/}
          {cards}
          {cards.length !=0 && this.props.isBuildImage ? '' :
          <div className={this.state.createNewFlow ? 'TenxFlowDetailFlowCardBigDiv commonCardBox createCardBox' : 'commonCardBox createCardBox'}>
              <Card className='commonCard createCard' onClick={this.props.flowBuildStatus != 2 && this.createNewFlow}>
                {
                  !this.state.createNewFlow
                  ? <QueueAnim key='createCardAnimate'>
                    <div className='createInfo' key='createCard'>
                      <svg className='addIcon'>
                        {/*@#create*/}
                        <use xlinkHref='#cicdcreate' />
                      </svg>
                      <p>
                        { this.props.isBuildImage ? <FormattedMessage {...menusText.buildImageAdd} /> : buildImageAdd }
                      </p>
                    </div>
                  </QueueAnim>
                  : null
                }
                {
                  this.state.createNewFlow && CreateTenxFlowModalEl
                }
            </Card>
          </div>}

          <div style={{ clear: 'both' }}></div>
        </div>
        {this.state.websocket}
        <Modal
          onCancel={() => this.setState({customizeBaseImageModalVisible: false})}
          title="自定义基础镜像"
          className='TenxFlowDetailFlowContinueIntegrationModal'
          visible={this.state.customizeBaseImageModalVisible}
          footer={null}
        >
          <ContinueIntegration />
        </Modal>
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
    imageList: availableImage.imageList || [],
    baseImages: availableImage.baseImages || [],
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
  changeSingleState,
  getTenxflowBuildLogs
})(injectIntl(TenxFlowDetailFlow, {
  withRef: true,
}));

