/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 */

/**
 * Deploy manage
 *
 * @author zhangxuan
 * @date 2018-09-06
 */
import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import QueueAnim from 'rc-queue-anim';
import { Button, Select, Input, Pagination, Modal, notification } from 'antd'
import classNames from 'classnames'
import StateBtnModal from './StateBtnModal'
import * as mcActions from '../../../actions/middlewareCenter'
import NOCLUSTER from '../../../../src/assets/img/no-clusters.png'

import DeployList from './DeployList'
import './styles/index.less'

import Title from '../../../../src/components/Title'
const Option = Select.Option;

const mapStateToProps = state => {
  const { cluster } = state.entities.current
  const AppClusterList = state.middlewareCenter.AppClusterList
  return {
    cluster: cluster.clusterID, AppClusterList,
  }
}


@connect(mapStateToProps, {
  loadAppClusterList: mcActions.loadAppClusterList,
  deleteAppsCluster: mcActions.deleteAppsCluster,
  restartAppsCluster: mcActions.restartAppsCluster,
  startApps: mcActions.startApps,
  stopApps: mcActions.stopApps,
})
class DeployMange extends React.PureComponent {
  state = {
    searchFont: 'appName', // 前置条件
    searchInputValue: null, // 搜索内容
    searchFontChoice: 'appName', // 搜索框前的下拉选项
    searchInputDisabled: false, // 搜索期间禁止再次搜索
    filterActive: 'BPM', // 默认筛选条件
    choiceItem: [], // 被选中的列表
    RestarServiceModal: false, // 显示启动Modal
    StopServiceModal: false, // 显示停止Modal
    DeleteServiceModal: false, // 显示删除Modal
    QuickRestarServiceModal: false, // 显示重新部署Modal
  }
  componentDidMount() {
    this.loadData()
  }
  handlestarServiceOk = async name => {
    const { startApps, cluster } = this.props
    try {
      await startApps(cluster, name)
      await this.loadData()
      await notification.success({
        message: '启动应用成功',
      })
      await this.setState({ RestarServiceModal: false })
    } catch (e) {
      await notification.error({
        message: '启动应用失败',
      })
    }
  }
  handleStopServiceOk = async name => {
    const { stopApps, cluster } = this.props
    try {
      await stopApps(cluster, name)
      await this.loadData()
      await notification.success({
        message: '停止应用成功',
      })
      await this.setState({ StopServiceModal: false })
    } catch (e) {
      await notification.error({
        message: '停止应用失败',
      })
    }
  }
  loadData = async () => {
    const { loadAppClusterList, cluster } = this.props
    const result = await loadAppClusterList(cluster, null, { failed: {} })
    const { error } = result
    if (error) {
      notification
        .error({ message: 'bpm-operator插件未安装', description: '请联系基础设施管理员安装！' })
    }
  }
  handleDeleteServiceOk = async name => {
    const { deleteAppsCluster, cluster } = this.props
    try {
      await deleteAppsCluster(cluster, name)
      await this.loadData()
      await notification.success({
        message: '删除应用成功',
      })
      await this.setState({ DeleteServiceModal: false })
    } catch (e) {
      await notification.error({
        message: '删除应用失败',
      })
    }
  }
  handleQuickRestarServiceOk = async name => {
    const { restartAppsCluster, cluster } = this.props
    try {
      await restartAppsCluster(cluster, name)
      await this.loadData()
      await notification.success({
        message: '重新部署应用成功',
      })
      await this.setState({ QuickRestarServiceModal: false })
    } catch (e) {
      await notification.error({
        message: '重新部署应用失败',
      })
    }
  }
  searchFontChoice = value => {
    this.setState({ searchFontChoice: value })
  }
  searchApps = () => {
    // TODO: 接搜索api
    // console.log(this.state.searchFontChoice, this.state.searchInputValue)
  }
  filterClick = type => {
    // TODO:
    this.setState({ filterActive: type })
    // console.log(type)
  }
  render() {
    const { searchInputValue, searchInputDisabled,
      filterActive, choiceItem } = this.state
    const { AppClusterList } = this.props
    const hasData = AppClusterList && AppClusterList.length && AppClusterList.length > 0 || false
    const filterActiveClass = option => classNames({
      option: true,
      filterActive: filterActive === option,
    })
    const { data: { total = 0, items = [] } = {} } = AppClusterList
    // TODO: 这种方式目前默认只能单选删除, 待后端支持多选后需要修改
    const choiceProject = items
      .filter((_, index) => choiceItem.includes(index))
    const choiceName = choiceProject.map(({ clusterName }) => clusterName)
    const buttonFlag = choiceItem.length === 0; // 等于0的时候部分按钮禁止操作
    return (
      <QueueAnim className="DeployManageWrapper layout-content">
        <Title key="title" title={'部署管理'}/>
        <div key="topInfo" className="topInfo">
          服务目录 一个中间件与大数据的完整交付平台，包含云化的中间件、大数据应用的全生命周期管理。
        </div>
        {
          hasData ?
            <div>
              <div className="operationBox" key="operationBox">
                <Button type="ghost" size="large"
                  onClick={() => this.setState({ RestarServiceModal: true })}
                  disabled={buttonFlag || choiceProject.some(({ status }) => status !== 'Stopped')}>
                  <i className="fa fa-play" /> 启动
                </Button>
                <Modal title={'启动'} visible={this.state.RestarServiceModal}
                  onOk={() => this.handlestarServiceOk(choiceName)}
                  onCancel={() => this.setState({ RestarServiceModal: false })}
                >
                  <StateBtnModal AppClusterList={items} choiceItem={choiceItem} operation={'start'}/>
                </Modal>
                <Button type="ghost" size="large" onClick={() => this.setState({ StopServiceModal: true })}
                  disabled={buttonFlag || choiceProject.some(({ status }) => status !== 'Running')}>
                  <i className="fa fa-stop" /> 停止
                </Button>
                <Modal title={'停止'} visible={this.state.StopServiceModal}
                  onOk={() => this.handleStopServiceOk(choiceName)}
                  onCancel={() => this.setState({ StopServiceModal: false })}
                >
                  <StateBtnModal AppClusterList={items} choiceItem={choiceItem} operation={'stop'}/>
                </Modal>
                <Button type="ghost" size="large" onClick={() => this.loadData()}>
                  <i className="fa fa-refresh" /> 刷新
                </Button>
                <Button type="ghost" size="large"
                  onClick={() => this.setState({ DeleteServiceModal: true })} disabled={buttonFlag}>
                  <i className="fa fa-trash-o" /> 删除
                </Button>
                <Modal title={'删除'} visible={this.state.DeleteServiceModal}
                  onOk={() => this.handleDeleteServiceOk(choiceName)}
                  onCancel={() => this.setState({ DeleteServiceModal: false })}
                >
                  <StateBtnModal AppClusterList={items} choiceItem={choiceItem} operation={'delete'}/>
                </Modal>
                <Button type="ghost" size="large"
                  onClick={() => this.setState({ QuickRestarServiceModal: true })}
                  disabled={buttonFlag}>
                  <i className="fa fa-undo" /> 重新部署
                </Button>
                <Modal title={'重新部署'} visible={this.state.QuickRestarServiceModal}
                  onOk={() => this.handleQuickRestarServiceOk(choiceName)}
                  onCancel={() => this.setState({ QuickRestarServiceModal: false })}
                >
                  <StateBtnModal AppClusterList={items} choiceItem={choiceItem} operation={'restart'}/>
                </Modal>
                <div className="searchWraper">
                  <Select defaultValue="appName" style={{ width: 90 }} onChange={this.searchFontChoice}
                    size="large">
                    <Option value="clusterName">集群名称</Option>
                    <Option value="appName">应用名称</Option>
                  </Select>
                  <div className="rightBox">
                    <div className="littleLeft" onClick={this.searchApps}>
                      <i className="fa fa-search" />
                    </div>
                    <div className="littleRight">
                      <Input
                        size="large"
                        onChange={e => {
                          this.setState({
                            searchInputValue: e.target.value,
                          })
                        } }
                        value={searchInputValue}
                        placeholder={'按应用名搜索'}
                        style={{ paddingRight: '28px' }}
                        disabled={searchInputDisabled}
                        onPressEnter={this.searchApps} />
                    </div>
                  </div>
                </div>
                <Pagination simple defaultCurrent={0} total={10} />
                <span className="PaginationInfo">共计: {total} 条</span>
              </div>
              <span className="filter" key="filter">
                <span>筛选:</span>
                <span className={filterActiveClass('BPM')} onClick={ () => { this.filterClick('BPM') } }>炎黄BPM</span>
                <span className={filterActiveClass('HashData')} onClick={ () => { this.filterClick('HashData') } }>HashData</span>
              </span>
              <DeployList className="tab" key="tab" choiceItem={choiceItem => this.setState({ choiceItem })}
                parentSelf = {this} list={AppClusterList}/>
            </div>
            : <div className="showNothing">
              <div>
                <div className="btnPrompt">
                  <img src={NOCLUSTER} title="noclusters" alt="noclusters" />
                </div>
                <div className="btnPrompt">
                  当前还未部署任何服务&nbsp;&nbsp;
                  <Button
                    type="primary"
                    onClick={() => browserHistory.push('middleware_center/app')}
                  >
                    创建
                  </Button>
                </div>
              </div>
            </div>
        }
      </QueueAnim>
    )
  }
}

export default DeployMange
