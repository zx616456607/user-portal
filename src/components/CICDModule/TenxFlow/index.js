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
import { Alert, Menu, Button, Card, Input, Tooltip, Dropdown, Modal, Spin } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { getTenxFlowList, deleteTenxFlowSingle, getTenxflowBuildLastLogs, CreateTenxflowBuild, getTenxflowBuildDetailLogs, changeTenxFlowStatus, changeFlowStatus } from '../../../actions/cicd_flow'
import { DEFAULT_REGISTRY } from '../../../constants'
import CreateTenxFlow from './CreateTenxFlow.js'
import TenxFlowBuildLog from './TenxFlowBuildLog'
import moment from 'moment'
import './style/TenxFlowList.less'
import cloneDeep from 'lodash/cloneDeep' 
import findIndex from 'lodash/findIndex'
import NotificationHandler from '../../../common/notification_handler'

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
    defaultMessage: '更新时间',
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
  deloyLog: {
    id: 'CICD.Tenxflow.TenxFlowList.deloyLog',
    defaultMessage: '构建记录',
  },
  deloyStart: {
    id: 'CICD.Tenxflow.TenxFlowList.deloyStart',
    defaultMessage: '立即构建',
  },
  delete: {
    id: 'CICD.Tenxflow.TenxFlowList.delete',
    defaultMessage: '删除TenxFlow',
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

let MyComponent = React.createClass({
  propTypes: {
    config: React.PropTypes.array,
    scope: React.PropTypes.object
  },
  operaMenuClick: function (item, e) {
    //this function for user click the dropdown menu
    let key = e.key;
    let { flowId } = item;
    const { scope } = this.props;
    const { deleteTenxFlowSingle, getTenxFlowList } = scope.props;
    let notification = new NotificationHandler()
    Modal.confirm({
      title: `删除TenxFlow （${item.name}） `,
      content: (`请注意，删除TenxFlow，将清除项目的所有历史数据以及相关的镜像，且该操作不能被恢复，您确定要删除?`),
      onOk() {
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
      }
    });

  },
  showDeloyLog: function (item, e) {
    //this function for show user the deploy log of the tenxflow
    const { scope } = this.props;
    scope.setState({
      TenxFlowDeployLogModal: true
    });
  },
  starFlowBuild(flowId, index) {
    const {CreateTenxflowBuild, getTenxflowBuildDetailLogs} = this.props.scope.props
    const parentScope = this.props.scope
    CreateTenxflowBuild(flowId, {}, {
      success: {
        func: (res) => {
          getTenxflowBuildDetailLogs(flowId, res.data.results.flowBuildId, {
            success: {
              func: (result) => {
                const flowListState = cloneDeep(parentScope.state.flowListState)
                flowListState[index].status = result.data.results.results[0].status
                parentScope.setState({
                  flowListState
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
  render: function () {
    const { config, scope, isFetching } = this.props;
    const { flowListState } = this.props.scope.state
    if (isFetching) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }
    const items = config.map((item, index) => {
      let status = ''
      switch (flowListState[index].status) {
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
      const dropdown = (
        <Menu onClick={this.operaMenuClick.bind(this, item)}>
          <Menu.Item key='deleteFlow'>
            <i className='fa fa-trash' style={{ lineHeight: '20px', marginRight: '5px' }} />&nbsp;
            <FormattedMessage {...menusText.delete} style={{ display: 'inlineBlock' }} />
          </Menu.Item>
        </Menu>
      );
      return (
        <div className='tenxflowDetail' key={item.name} >
          <div className='name'>
            <Link to={`/ci_cd/tenx_flow/tenx_flow_build?${item.flowId}&${flowListState[index].status}`}>
              <span>{item.name}</span>
            </Link>
          </div>
          <div className='time'>
            <span className='timeSpan'>
              <Tooltip placement='topLeft' title={item.updateTime ? dateFormat(item.updateTime) : dateFormat(item.createTime)}>
                <span>{item.updateTime ? dateFormat(item.updateTime) : dateFormat(item.createTime)}</span>
              </Tooltip>
            </span>
          </div>
          <div className={`status status-` + `${flowListState[index].status}`}>
            <span><i className="fa fa-circle"></i>{status}</span>
          </div>
          <div className='oprea'>
            <Button className='logBtn' size='large' type='primary' onClick={scope.openTenxFlowDeployLogModal.bind(scope, item.flowId)}>
              <i className='fa fa-wpforms' />&nbsp;
              <FormattedMessage {...menusText.deloyLog} />
            </Button>
            <Dropdown.Button overlay={dropdown} type='ghost' size='large' onClick={() => this.starFlowBuild(item.flowId, index)}>
              <span>
                <i className='fa fa-pencil-square-o' />&nbsp;
                <FormattedMessage {...menusText.deloyStart} />
              </span>
            </Dropdown.Button>
          </div>
        </div>
      );
    });
    return (
      <div className='tenxflowList'>
        {items}
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
      searchingFlag: false
    }
  }

  loadData() {
    const { getTenxFlowList } = this.props;
    const self = this
    getTenxFlowList({
      success: {
        func: (res) => {
          const flowListState = []
          res.data.results.forEach((list, index) => {
            flowListState.push({ status: list.status })
          })
          self.setState({
            flowListState
          })
        }
      }
    });
  }

  componentWillMount() {
    document.title = 'TenxFlow | 时速云';
    const { getTenxFlowList } = this.props;
    const self = this
    this.loadData()
  }

  componentWillReceiveProps(nextProps) {
    const { isFetching, flowList, currentSpace } = nextProps;
    if (currentSpace && this.props.currentSpace && currentSpace != this.props.currentSpace) {
      this.loadData()
      return
    }
    if (!isFetching && !!flowList) {
      this.setState({
        flowList: flowList
      });
    }
  }

  openCreateTenxFlowModal() {
    //this function for user open the modal of create new tenxflow
    this.setState({
      createTenxFlowModal: true
    });
    setTimeout(function() {
      document.getElementById('flowName').focus()
    },500)
  }

  closeCreateTenxFlowModal() {
    //this function for user close the modal of create new tenxflow
    this.setState({
      createTenxFlowModal: false
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

  onSearchFlow(e) {
    //this function for user search special flow
    let keyword = e.target.value;
    let searchingFlag = false;
    if (keyword.length > 0) {
      searchingFlag = true;
    }
    const { flowList } = this.props;
    let newList = [];
    flowList.map((item) => {
      if (item.name.indexOf(keyword) > -1) {
        newList.push(item);
      }
    });
    this.setState({
      flowList: newList,
      searchingFlag: searchingFlag
    })
  }
  callback(flowId) {
    const count = this.props.config ? this.props.config.length : 0
    const self = this
    const flowList = self.props.flowList
    return (data) => {
      const { getTenxflowBuildLastLogs, getTenxFlowDetail, changeFlowStatus } = this.props;
      getTenxflowBuildLastLogs(flowId, {
        success: {
          func: (result) => {
            const flowListState = cloneDeep(this.state.flowListState)
            const index = findIndex(flowList, flow => {
              return flow.flowId == flowId
            })
            if(index < 0 ) return
            const status = result.data.results.results.status
            flowListState[index].status = status
            self.setState({
              flowListState
            })
            changeFlowStatus(flowId, status)
          },
          isAsync: true
        },
        failed: {
          func:() => {
            const flowListState = cloneDeep(this.state.flowListState)
            const index = findIndex(flowListState, flow => {
              return flow.flowId == flowId
            })
            if (index < 0) return
            flowListState[index].status == 1
            self.setState({
              flowListState
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
    const { isFetching, buildFetching, logs, cicdApi } = this.props;
    const { flowList, searchingFlag } = this.state;
    let message = '';
    if (isFetching || !flowList) {
      return (
        <div className='loadingBox'>
          <Spin size='large' />
        </div>
      )
    }

    if (flowList.length < 1 && !searchingFlag) {
      message = " * 目前还没有添加任何 TenxFlow"
    } else if (flowList.length < 1 && searchingFlag) {
      message = " * 没有匹配到相关TenxFlow"
    }
    return (
      <QueueAnim className='TenxFlowList'
        type='right'
        >
        <div id='TenxFlowList' key='TenxFlowList'>
          <Alert message={<FormattedMessage {...menusText.tooltips} />} type='info' />
          <div className='operaBox'>
            <Button className='createBtn' size='large' type='primary' onClick={this.openCreateTenxFlowModal}>
              <i className='fa fa-plus' />&nbsp;
              <FormattedMessage {...menusText.create} />
            </Button>
            <Input className='searchBox' placeholder={formatMessage(menusText.search)} type='text' onChange={this.onSearchFlow} />
            <i className='fa fa-search'></i>
            <div style={{ clear: 'both' }}></div>
          </div>
          <Card className='tenxflowBox'>
            <div className='titleBox' >
              <div className='name'>
                <FormattedMessage {...menusText.name} />
              </div>
              <div className='time'>
                <FormattedMessage {...menusText.updateTime} />
              </div>
              <div className='status'>
                <FormattedMessage {...menusText.status} />
              </div>
              <div className='oprea'>
                <FormattedMessage {...menusText.opera} />
              </div>
            </div>
            <MyComponent scope={scope} config={flowList} isFetching={isFetching} />
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
          <CreateTenxFlow scope={scope} isFetching={isFetching} flowList={flowList} />
        </Modal>
        <Modal
          visible={this.state.TenxFlowDeployLogModal}
          className='TenxFlowBuildLogModal'
          onCancel={this.closeTenxFlowDeployLogModal}
          >
          <TenxFlowBuildLog scope={scope} isFetching={buildFetching} logs={logs} flowId={this.state.currentFlowId} callback={this.callback(this.state.currentFlowId)}/>
        </Modal>
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
  const { getTenxflowList } = state.cicd_flow
  const { isFetching, flowList } = getTenxflowList || defaultFlowList
  const { getTenxflowBuildLastLogs } = state.cicd_flow
  const { logs } = getTenxflowBuildLastLogs || defaultBuildLog
  let buildFetching = getTenxflowBuildLastLogs.isFetching || defaultBuildLog.buildFetching
  return {
    isFetching,
    flowList,
    buildFetching,
    logs,
    currentSpace: state.entities.current.space.namespace
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
  changeFlowStatus
})(injectIntl(TenxFlowList, {
  withRef: true,
}));

