/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * TenxFlowList component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Alert, Menu, Button, Card, Input, Tooltip, Dropdown, Modal, Spin, Icon } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import {
  getTenxFlowList, deleteTenxFlowSingle, getTenxflowBuildLastLogs,
  CreateTenxflowBuild, getTenxflowBuildDetailLogs, changeTenxFlowStatus,
  changeFlowStatus, getRepoBranchesAndTagsByProjectId, getStageBuildLogList,
} from '../../../actions/cicd_flow'
import { DEFAULT_REGISTRY } from '../../../constants'
import CreateTenxFlow from './CreateTenxFlow.js'
import TenxFlowBuildLog from './TenxFlowBuildLog'
import moment from 'moment'
import './style/TenxFlowList.less'
import cloneDeep from 'lodash/cloneDeep'
import findIndex from 'lodash/findIndex'
import NotificationHandler from '../../../components/Notification'
import Socket from '../../Websocket/socketIo'
import PopTabSelect from '../../PopTabSelect'
import Title from '../../Title'
import { parseQueryStringToObject } from '../../../common/tools'

const PopTab = PopTabSelect.Tab;
const PopOption = PopTabSelect.Option;
const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

const menusText = defineMessages({
  search: {
    id: 'CICD.Tenxflow.TenxFlowList.search',
    defaultMessage: '搜索',
  },
  name: {
    id: 'CICD.Tenxflow.TenxFlowList.name',
    defaultMessage: '名称',
  },
  updateTime: {
    id: 'CICD.Tenxflow.TenxFlowList.updateTime',
    defaultMessage: '上次构建时间',
  },
  status: {
    id: 'CICD.Tenxflow.TenxFlowList.status',
    defaultMessage: '构建状态',
  },
  opera: {
    id: 'CICD.Tenxflow.TenxFlowList.opera',
    defaultMessage: '操作',
  },
  tooltips: {
    id: 'CICD.Tenxflow.TenxFlowList.tooltips',
    defaultMessage: 'TenxFlow：这里完成【代码项目构建、编译、测试】等CI/CD流程的定义与执行，每个TenxFlow可以由若干个（≥1）流程化的子项目组成，每个子项目所执行的任务可以通过卡片的方式进行定义和展示。',
  },
  create: {
    id: 'CICD.Tenxflow.TenxFlowList.create',
    defaultMessage: '创建TenxFlow',
  },
  deloyStart: {
    id: 'CICD.Tenxflow.TenxFlowList.deloyStart',
    defaultMessage: '构建记录',
  },
  deloyLog: {
    id: 'CICD.Tenxflow.TenxFlowList.deloyLog',
    defaultMessage: '立即构建',
  },
  delete: {
    id: 'CICD.Tenxflow.TenxFlowList.delete',
    defaultMessage: '删除TenxFlow',
  },
  edit: {
    id: 'CICD.Tenxflow.TenxFlowList.edit',
    defaultMessage: '修改TenxFlow',
  },
  unUpdate: {
    id: 'CICD.Tenxflow.TenxFlowList.unUpdate',
    defaultMessage: '未更新',
  }
})

function dateFormat(dateString) {
  if (!dateString) {
    return '';
  }
  var timeStr = moment(dateString);
  return timeStr.format("YYYY-MM-DD HH:mm:ss")
}

function getTriggeredInfo(item) {
  let triggeredInfo = item.triggeredInfo
  if(item.status == null) {
    return ''
  }
  if (!triggeredInfo) return '(手动触发)'
  try {
    if (typeof triggeredInfo == 'string') {
      triggeredInfo = JSON.parse(triggeredInfo)
    }
    if (triggeredInfo.type == 'Branch') {
      return '(commit CI触发)'
    }
    if (triggeredInfo.type == 'Tag') {
      return '(新建Tag CI触发)'
    }
    if (triggeredInfo.type == 'merge_request') {
      return '(pull request CI触发)'
    }
  } catch (error) {
  }
}

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  getInitialState() {
    return {
      delFlowModal: false
    }
  },
  operaMenuClick: function (item, Item) {
    const { key } = Item;
    const { openCreateTenxFlowModal, scope } = this.props;
    if (key == 'editFlow') {
      openCreateTenxFlowModal(item.flowId,true)
      return
    }
    //this function for user click the dropdown menu
    this.setState({ delFlowModal: true, item })
    return
  },
  delFlowAction() {
    let { flowId } = this.state.item;
    const { item } = this.state
    const { scope } = this.props;
    const { deleteTenxFlowSingle, getTenxFlowList } = scope.props;
    let notification = new NotificationHandler()
    notification.spin(`删除 TenxFlow ${item.name} 中...`);
    deleteTenxFlowSingle(flowId, {
      success: {
        func: () => {
          notification.close()
          notification.success(`删除 TenxFlow ${item.name} 成功`);
          scope.loadData()
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          let statusCode = res.statusCode;
          switch (statusCode) {
            case 500:
              break;
          }
          notification.close()
          notification.error(`删除 TenxFlow ${item.name} 失败`);
        }
      }
    })
  },
  showDeloyLog: function (item, e) {
    //this function for show user the deploy log of the tenxflow
    const { scope } = this.props;
    scope.setState({
      TenxFlowDeployLogModal: true
    });
  },
  starFlowBuild(item, index) {
    const { flowId, projectId, defaultBranch } = item
    const { getRepoBranchesAndTagsByProjectId } = this.props.scope.props
    const notification = new NotificationHandler()
    if (this.props.config) {
      for (let i in this.props.config) {
        let stage = this.props.config[i]
        if (stage.flowId === flowId) {
          if (typeof (stage.stagesCount) === 'number' && stage.stagesCount < 1) {
            notification.error('请先添加构建子任务')
            return
          }
        }
      }
    }
    if (projectId) {
      getRepoBranchesAndTagsByProjectId(projectId, {
        failed: {
          func: res => {
            if (res.statusCode == 500) {
              return notification.error('代码仓库暂时无法访问，请检查相关配置后重试')
            }
          }
        }
      })
    }
  },
  startBuildStage(item, index, key, tabKey) {
    const { flowId } = item
    const parentScope = this.props.scope
    const { CreateTenxflowBuild, getTenxflowBuildDetailLogs } = parentScope.props
    const options = {}
    if (key && tabKey) {
      options.branch = key
    }
    CreateTenxflowBuild(flowId, { options }, {
      success: {
        func: (res) => {
          getTenxflowBuildDetailLogs(flowId, res.data.results.flowBuildId, {
            success: {
              func: (result) => {
                const flowList = cloneDeep(this.props.config)
                flowList[index].status = result.data.results.results[0].status
                parentScope.setState({
                  flowList
                })
              }
            }
          })
        },
        isAsync: true
      },
      failed: {
        func: (res) => {
          Modal.error({
            title: '构建失败',
            content: (res.message.message)
          });
        }
      }
    })
  },
  renderDropdownBtn(item, index) {
    const { scope } = this.props
    const dropdown = (
      <Menu onClick={(Item)=>{this.operaMenuClick.call(this, item, Item)}}>
        <Menu.Item key='deleteFlow'>
          <i className='fa fa-trash' style={{ marginRight: '5px' }} />&nbsp;
          <FormattedMessage {...menusText.delete} style={{ display: 'inlineBlock' }} />
        </Menu.Item>
        <Menu.Item key='editFlow'>
          <i className="anticon anticon-edit" style={{marginRight: '3px'}}/>&nbsp;
          <FormattedMessage {...menusText.edit} style={{ display: 'inlineBlock' }} />
        </Menu.Item>
      </Menu>
    );
    return (
      <Dropdown.Button
        overlay={dropdown}
        type='ghost'
        size='large'
        onClick={scope.openTenxFlowDeployLogModal.bind(scope, item.flowId)}
      >
        <span>
          <i className='fa fa-wpforms' />&nbsp;
          <FormattedMessage {...menusText.deloyLog} />
        </span>
      </Dropdown.Button>
    )
  },
  renderBuildBtn(item, index) {
    const { projectId, defaultBranch, stagesCount, repoType } = item
    const { repoBranchesAndTags, scope } = this.props
    let targetElement = (
      <Button
        className='logBtn'
        size='large'
        type='primary'
        onClick={() => {
          if (repoType === 'svn') {
            this.startBuildStage(item, index)
            return
          }
          this.starFlowBuild(item, index)
        }}
      >
        <svg className='structure commonImg'>
          <use xlinkHref="#structure"></use>
        </svg> &nbsp;
        <FormattedMessage {...menusText.deloyStart} />
      </Button>
    )
    if (repoType === 'svn') {
      return targetElement
    }
    const tabs = []
    let loading
    const branchesAndTags = repoBranchesAndTags[projectId]
    if (!branchesAndTags || (!branchesAndTags.data.branches && !branchesAndTags.data.tags)) {
      if (stagesCount > 0) {
        tabs.push(<PopOption key="not_found_branches_tags">未找到分支及标签，点击构建</PopOption>)
      }
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
        placeholder="请输入分支或标签"
        style={{float: 'left'}}
        onChange={this.startBuildStage.bind(this, item, index)}
        targetElement={targetElement}
        getTooltipContainer={() => document.body}
        isShowBuildBtn={true}
        loading={loading}>
        {tabs}
      </PopTabSelect>
    )
  },
  render: function () {
    const { config, scope, isFetching } = this.props;
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const items = config.map((item, index) => {
      let status = ''
      switch (item.status) {
        case 0:
          status = '成功'
          break;
        case 1:
          status = "失败"
          break;
        case 2:
          status = "执行中..."
          break;
        case 33:
          status = "审批超时"
          break;
        case 34:
          status = "拒绝执行"
          break;
        default:
          status = "等待中..."
      }
      let isApproving = false
      if (item.waitingApprovalStages && Object.keys(item.waitingApprovalStages).length > 0) {
        isApproving = 'true'
        status = '等待审批'
      }
      return (
        <div className='tenxflowDetail' key={item.name} >
          <div className='name'>
            <Link to={`/ci_cd/tenx_flow/tenx_flow_build?${item.flowId}&${item.status}`}>
              <span>{item.name}</span>
            </Link>
          </div>
          <div className='time' style={{width: '18%'}}>
            <span className='timeSpan' >
              <Tooltip placement='topLeft' title={item.lastBuildTime ? dateFormat(item.lastBuildTime) : '-'}>
                <span>{item.lastBuildTime ? dateFormat(item.lastBuildTime) : '-'}</span>
              </Tooltip>
            </span>
          </div>
          <div className={`status status-${item.status} ${isApproving ? 'status-approving' : ''}`} style={{width: '25%'}}>
            <span>
              <i className="fa fa-circle"></i>
              {status} <span style={{color: '#747474'}}>
              {getTriggeredInfo(item)}
              </span>
            </span>
            {
              isApproving &&
              <Link className="go-approving" to={`/ci_cd/tenx_flow/tenx_flow_build?${item.flowId}&${item.status}#flow-build-logs`}>
                前往审批 <i className="fa fa-arrow-circle-o-right" />
              </Link>
            }
          </div>
          <div className='oprea'>
            {
              this.renderBuildBtn(item, index)
            }
            {
              this.renderDropdownBtn(item, index)
            }
          </div>
        </div>
      );
    });
    return (
      <div className='tenxflowList'>
        {items}
        <Modal title="删除构建任务" visible={this.state.delFlowModal}
          onOk={() => this.delFlowAction()} onCancel={() => this.setState({ delFlowModal: false })}
        >
          <Alert message="请注意，删除 TenxFlow 将清除相关的历史构建数据，且该操作不能被恢复" type="warning" showIcon />
          <div className="modalColor" style={{ lineHeight: '30px' }}><i className="anticon anticon-question-circle-o" style={{ marginRight: '8px', marginLeft: '16px' }}></i>
            您确定要删除?
          </div>
        </Modal>
      </div>
    );
  }
});

class TenxFlowList extends Component {
  constructor(props) {
    super(props);
    this.openCreateTenxFlowModal = this.openCreateTenxFlowModal.bind(this);
    this.closeCreateTenxFlowModal = this.closeCreateTenxFlowModal.bind(this);
    this.openTenxFlowDeployLogModal = this.openTenxFlowDeployLogModal.bind(this);
    this.closeTenxFlowDeployLogModal = this.closeTenxFlowDeployLogModal.bind(this);
    this.onSearchFlow = this.onSearchFlow.bind(this);
    this.loadData = this.loadData.bind(this);
    this.state = {
      createTenxFlowModal: false,
      TenxFlowDeployLogModal: false,
      currentTenxFlow: null,
      currentFlowId: null,
      flowList: [],
      searchingFlag: false,
      searchValue:'',
      forEdit: false
    }
    const queryObj = parseQueryStringToObject(window.location.search)
    if (queryObj.showCard == 'true') {
      this.state.createTenxFlowModal = true
    }
  }

  loadData(callback) {
    const { getTenxFlowList } = this.props;
    const self = this
    getTenxFlowList({
      success: {
        func: (res) => {
          self.setState({
            flowList: res.data.results
          })
          if (callback) {
            callback()
          }
        }
      }
    });
  }

  componentWillMount() {
    const { getTenxFlowList } = this.props;
    const self = this
    this.loadData()

  }
  componentDidMount() {
    const { status, buildId, stageId } = this.props.loginUser
    const { flowId, loginUser } = this.props
    const cicdApi = loginUser.info.cicdApi
    this.setState({
      websocket: <Socket url={cicdApi.host} protocol={cicdApi.protocol} path={cicdApi.statusPath} onSetup={(socket) => this.onSetup(socket)} />
    })
  }
  componentWillReceiveProps(nextProps) {
    const { isFetching, flowList, currentSpace } = nextProps;
    if (currentSpace && this.props.currentSpace && currentSpace != this.props.currentSpace) {
      this.loadData()
      return
    }
    // if (!isFetching && !!flowList) {
    //   this.setState({
    //     flowList: flowList
    //   });
    // }
  }

  openCreateTenxFlowModal(flowId,forEdit) {
    //this function for user open the modal of create new tenxflow
    this.setState({
      currentFlowId: flowId ? flowId : null,
      forEdit: forEdit ? forEdit : false
    },()=>{
      this.setState({
        createTenxFlowModal: true,
      },()=>{
        document.getElementById('flowName').focus()
      })
    });
  }

  closeCreateTenxFlowModal() {
    //this function for user close the modal of create new tenxflow
    this.setState({
      createTenxFlowModal: false,
      forEdit: false,
      currentFlowId: null
    });
  }

  openTenxFlowDeployLogModal(flowId) {
    //this function for user open the modal of tenxflow deploy log
    const { getTenxflowBuildLastLogs } = this.props;
    getTenxflowBuildLastLogs(flowId)
    this.setState({
      TenxFlowDeployLogModal: true,
      currentFlowId: flowId
    });
  }

  closeTenxFlowDeployLogModal() {
    //this function for user close the modal of tenxflow deploy log
    this.setState({
      TenxFlowDeployLogModal: false
    });
  }

  onSearchFlow() {
    //this function for user search special flow
    let searchingFlag = false;
    let { searchValue } = this.state
    const { flowList } = this.props;
    let newList = [];
    searchValue = searchValue.trim()
    if (searchValue.length > 0) {
      searchingFlag = true;
    }
    flowList.map((item) => {
      if (item.name.indexOf(searchValue) > -1) {
        newList.push(item);
      }
    });
    this.setState({
      flowList: newList,
      searchingFlag: searchingFlag
    })
  }
  onSetup(socket) {
    if (!socket) {
      socket = this.state.socket
    }
    socket.off('flowBuildStatus')
    const { flowList, changeFlowStatus } = this.props
    const flowId = []
    const flowBuildId = []
    flowList.forEach(item => {
      flowId.push(item.flowId)
      flowBuildId.push(item.lastBuildId)
    })
    this.setState({
      flowId,
      flowBuildId,
      socket
    })
    const self = this
    socket.on('flowBuildStatus', function (data) {
      let index = findIndex(flowId, (item) => {
        return item == data.flowId
      })
      if (flowBuildId[index] != data.flowBuildId) {
        socket.off('flowBuildStatus')
        self.loadData(() => self.onSetUp(socket))
        return
      }
      if (data.status != 200) {
        return
      }
      const result = data.results
      const stateIndex = findIndex(self.props.flowList, flow => {
        return flow.flowId == result.flowId
      })
      changeFlowStatus(result.flowId, result.buildStatus)
    })
    socket.emit('flowBuildStatus', { flows: flowId })
  }
  callback(flowId) {
    const count = this.props.config ? this.props.config.length : 0
    const self = this
    const index = findIndex(this.state.flowList, flow => {
      return flow.flowId == flowId
    })
    return (data) => {
      const { getTenxflowBuildLastLogs, getTenxFlowDetail, changeFlowStatus } = this.props;
      getTenxflowBuildLastLogs(flowId, {
        success: {
          func: (result) => {
            if (index < 0) return
            const status = result.data.results.results.status
            changeFlowStatus(flowId, status)
            const flowList = cloneDeep(this.state.flowList)
            if (index < 0) return
            flowList[index].status = status
            self.setState({
              flowList
            })
          },
          isAsync: true
        },
        failed: {
          func: () => {
            const flowList = cloneDeep(this.state.flowList)
            if (index < 0) return
            flowList[index].status == 1
            self.setState({
              flowList
            })
            changeFlowStatus(flowId, 1)
          }
        }
      })
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const scope = this;
    const { isFetching, buildFetching, logs, cicdApi, repoBranchesAndTags } = this.props;
    const { searchingFlag } = this.state;
    const flowList = this.state.flowList || []
    let message = '';
    if (flowList.length < 1 && !searchingFlag) {
      message = " * 目前还没有添加任何 TenxFlow"
    } else if (flowList.length < 1 && searchingFlag) {
      message = " * 没有匹配到相关TenxFlow"
    }
    return (
      <QueueAnim className='TenxFlowList'
        type='right'
      >
        <Title title="TenxFlow" />
        <div id='TenxFlowList' key='TenxFlowList'>
          <Alert message={<FormattedMessage {...menusText.tooltips} />} type='info' />
          <div className='operaBox'>
            <Button className='createBtn' size='large' type='primary' onClick={()=>this.openCreateTenxFlowModal(null,false)}>
              <i className='fa fa-plus' />&nbsp;
              <FormattedMessage {...menusText.create} />
            </Button>
            <Button className="refreshBtn"  size='large' type="ghost" onClick={this.loadData.bind(this, null)}>
              <i className='fa fa-refresh' /> 刷 新
            </Button>
            <Input className='searchBox' placeholder={formatMessage(menusText.search)} type='text' value={this.state.searchValue}
                   onChange={(e)=> this.setState({searchValue:e.target.value})} onPressEnter={()=>this.onSearchFlow()}
            />
            <i className='fa fa-search' onClick={()=> this.onSearchFlow()}/>
            <div style={{ clear: 'both' }}/>
          </div>
          <Card className='tenxflowBox'>
            <div className='titleBox' >
              <div className='name'>
                <FormattedMessage {...menusText.name} />
              </div>
              <div className='time' style={{width: '18%'}}>
                <FormattedMessage {...menusText.updateTime} />
              </div>
              <div className='status' style={{width: '25%'}}>
                <FormattedMessage {...menusText.status} />
              </div>
              <div className='oprea'>
                <FormattedMessage {...menusText.opera} />
              </div>
            </div>
            {
              (isFetching || !flowList)
                ? <div className='loadingBox'>
                    <Spin size='large' />
                  </div>
                :  <MyComponent
                      scope={scope}
                      config={flowList}
                      isFetching={isFetching}
                      repoBranchesAndTags={repoBranchesAndTags}
                      openCreateTenxFlowModal={this.openCreateTenxFlowModal.bind(this)}
                    />
            }
            {flowList.length < 1 && !searchingFlag ?
              <div className='loadingBox'>暂无数据</div> :
              (flowList.length < 1 && searchingFlag ?
                <div className='loadingBox'>没有找到匹配的 TenxFlow</div> : null)}
          </Card>
        </div>
        <Modal
          visible={this.state.createTenxFlowModal}
          className='AppServiceDetail'
          transitionName='move-right'
          onCancel={this.closeCreateTenxFlowModal}
        >
          <CreateTenxFlow scope={scope}  flowList={flowList} currentFlowId={this.state.currentFlowId} modalShow={this.state.createTenxFlowModal} loadData={this.loadData.bind(this)}/>
        </Modal>
        <Modal
          visible={this.state.TenxFlowDeployLogModal}
          className='TenxFlowBuildLogModal'
          onCancel={this.closeTenxFlowDeployLogModal}
        >
          <TenxFlowBuildLog scope={scope} isFetching={buildFetching} logs={logs} flowId={this.state.currentFlowId} callback={this.callback(this.state.currentFlowId)} visible={this.state.TenxFlowDeployLogModal} />
        </Modal>
        {this.state.websocket}
      </QueueAnim>
    )
  }
}

function mapStateToProps(state, props) {
  const defaultFlowList = {
    isFetching: false,
    flowList: [],
  }
  const defaultBuildLog = {
    buildFetching: false,
    logs: [],
  }
  const { getTenxflowList, repoBranchesAndTags } = state.cicd_flow
  const { isFetching, flowList } = getTenxflowList || defaultFlowList
  const { getTenxflowBuildLastLogs } = state.cicd_flow
  const { logs } = getTenxflowBuildLastLogs || defaultBuildLog
  let buildFetching = getTenxflowBuildLastLogs.isFetching || defaultBuildLog.buildFetching
  return {
    isFetching,
    flowList,
    buildFetching,
    logs,
    currentSpace: state.entities.current.space.namespace,
    loginUser: state.entities.loginUser,
    repoBranchesAndTags,
  }
}

TenxFlowList.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  getTenxFlowList,
  deleteTenxFlowSingle,
  getTenxflowBuildLastLogs,
  CreateTenxflowBuild,
  getTenxflowBuildDetailLogs,
  changeFlowStatus,
  getRepoBranchesAndTagsByProjectId,
  getStageBuildLogList,
})(injectIntl(TenxFlowList, {
  withRef: true,
}));

