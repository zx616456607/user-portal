/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Image Check
 *
 * v0.1 - 2017-11-18
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import { Button, Table, Modal, Form, Input, Popover, Row, Col, Icon, Tooltip, Radio, Tabs, Checkbox} from 'antd'
import isEmpty from 'lodash/isEmpty'
import './style/ImageCheck.less'
import CommonSearchInput from '../../CommonSearchInput'
import TenxStatus from '../../TenxStatus/index'
import { imageApprovalList, appStoreApprove, }  from '../../../actions/app_store'
import * as harborActions from '../../../actions/harbor'
import { formatDate, encodeImageFullname } from '../../../common/tools'
import NotificationHandler from '../../../components/Notification'
import ProjectDetail from '../ImageCenter/ProjectDetail'
import { camelize } from 'humps'
import { ROLE_SYS_ADMIN, ROLE_BASE_ADMIN, ROLE_PLATFORM_ADMIN } from '../../../../constants'
import { DEFAULT_REGISTRY } from '../../../constants'
import getDeepValue from '@tenx-ui/utils/lib/getDeepValue'
import TimeHover from '@tenx-ui/time-hover/lib'

const FormItem = Form.Item
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane

class ImageCheckTable extends React.Component {
  constructor(props) {
    super(props)
    this.getImageStatus = this.getImageStatus.bind(this)
    this.openRejectModal = this.openRejectModal.bind(this)
    this.confirmModal = this.confirmModal.bind(this)
    this.cancelModal = this.cancelModal.bind(this)
    this.checkApprove = this.checkApprove.bind(this)
    this.onTableChange = this.onTableChange.bind(this)
    this.startCopy = this.startCopy.bind(this)
    this.copyOperate = this.copyOperate.bind(this)
    this.copyEnd = this.copyEnd.bind(this)
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this)
    this.state = {
      checkImageStatusParams: [],
      imageExistModal: false,
      existImage: '',
      passLoading: {},
    }
  }
  getImageStatus(status){
    let phase
    let progress = {status: false};
    switch(status) {
      case 1:
        phase = 'WaitForCheck'
        break
      case 2:
        phase = 'CheckPass'
        break
      case 3:
        phase = 'CheckReject'
        break
      case 4:
        phase = 'OffShelf'
        break
      case 5:
        phase = 'ImageCopy'
        progress = {status: true}
        break
      case 6:
        phase = 'ImageCopyFailed'
        break
      case 7:
        phase = 'Deleted'
        break
    }
    return <TenxStatus phase={phase} progress={progress}/>
  }
  onTableChange(pagination) {
    const { updateParentState } = this.props
    updateParentState('current', pagination.current, true)
  }
  handleSort(type) {
    const { updateParentState, publish_time } = this.props
    const sort = this.getSortOrder(publish_time, type)
    updateParentState('publish_time', !publish_time, false)
    updateParentState('sort', sort, true)
  }
  getSortOrder(flag, type) {
    let str = 'a'
    if (flag) {
      str = 'd'
    }
    return `${str},${type}`
  }
  async checkImageStatus(record, status, message) {
    const { appStoreApprove, getImagePublishList, loadRepositoriesTags, publishType } = this.props
    let notify = new NotificationHandler()
    const body = {
      id: record.id,
      type: 2,
      status,
      imageTagName: `${record.image}:${record.tag}`,
      targetCluster: record.targetCluster || record.TargetCluster || "",
    }
    if (status === 2) {
      Object.assign(body, { origin_id: record.originID })
    }
    if (message) {
      Object.assign(body, { approve_message: message })
    }
    this.setState({ passLoading: { [record.id]: true } })
    if (publishType === 'storage' && this.state.checkImageStatusParams.length === 0) {
      const checkImageStatusParams = [ record, status, message ]
      this.setState({ checkImageStatusParams })
      // imageExistModal
      const { resource, image, originID } = record
      const harbor = resource.replace(image, '')
      const originIDArray = originID.split(':')
      const imageTag = originIDArray[originIDArray.length - 1] || 'latest'
      const res = await loadRepositoriesTags(harbor, DEFAULT_REGISTRY, encodeImageFullname(image))
      if (res.error) {
        notify.error('操作失败', '加载镜像信息失败')
        return
      }
      const existTags = getDeepValue(res, [ 'response', 'result', 'data' ]) || []
      if (existTags.indexOf(imageTag) > -1) {
        this.setState({
          imageExistModal: true,
          existImage: `${image.split('/')[1]}/${imageTag}`
        })
        return
      }
    }
    return new Promise((resolve, reject) => {
      appStoreApprove(body, {
        success: {
          func: () => {
            getImagePublishList()
            resolve()
            notify.success('操作成功')
            this.setState({
              passLoading: { [record.id]: true },
              checkImageStatusParams: [],
            })
          },
          isAsync: true
        },
        failed: {
          func: res => {
            reject(res.message)
            notify.error(`操作失败`, res.message.message)
            this.setState({
              passLoading: { [record.id]: true },
              checkImageStatusParams: [],
            })
          }
        }
      })
    })
  }
  openRejectModal(record) {
    this.setState({
      currentImage: record,
      rejectModal: true
    }, () => {
      let input = document.getElementById('approve')
      input && input.focus()
    })
  }
  confirmModal() {
    const { form } = this.props
    const { currentImage } = this.state
    let notify = new NotificationHandler()
    form.validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      const { approve } = values
      this.checkImageStatus(currentImage, 3, approve).then(() => {
        notify.close()
        this.setState({
          rejectModal: false,
          currentImage: ''
        })
        form.resetFields()
      }).catch(() => {
        this.setState({
          rejectModal: false,
          currentImage: ''
        })
        form.resetFields()
      })
    })
  }
  cancelModal() {
    const { form } = this.props
    this.setState({
      rejectModal: false,
      currentImage: null
    })
    form.resetFields()
  }
  checkApprove(rule, value, callback) {
    let newValue = value && value.trim()
    if (!newValue) {
      return callback('请输入拒绝理由')
    }
    callback()
  }
  startCopy(value) {
    const target = document.getElementsByClassName('imageIDCopyInput')[0]
    target.value = value
  }
  copyOperate() {
    let target = document.getElementsByClassName('imageIDCopyInput')[0];
    target.select()
    document.execCommand("Copy", false);
    this.setState({
      copyStatus: true
    })
  }
  copyEnd() {
    this.setState({
      copyStatus: false
    })
  }
  closeImageDetailModal(){
    this.setState({imageDetailModalShow:false})
  }

  getServeAndName(origin) {
    const arr = origin && origin.split('/')
    const [server, ...nameArr] = arr
    let name
    if (nameArr.length > 1) {
      for (let i = 0; i < nameArr.length; i++) {
        if (i === nameArr.length - 1) {
          nameArr[i] = nameArr[i].split(':')[0]
        }
      }
      name = nameArr.join('/')
    } else {
      name = nameArr.split(':')[0]
    }
    return { server, name }
  }

  openDelModal(record) {
    this.setState({
      currentImage: record,
      delModal: true
    })
  }

  closeDelModal() {
    this.setState({
      currentImage: null,
      delModal: false
    })
  }

  confirmDelModal() {
    const { currentImage } = this.state
    this.checkImageStatus(currentImage, 7).then(() => {
      this.setState({
        delModal: false,
        currentImage: null
      })
    }).catch(() => {
      this.setState({
        delModal: false,
        currentImage: null
      })
    })
  }

  openDetailModal = async record => {
    const { loadProjectMembers, harbor } = this.props
    await loadProjectMembers(DEFAULT_REGISTRY, record.targetProjectID, { harbor })
    this.setState({imageDetailModalShow: true, currentImage: record})
  }
  render() {
    const { imageCheckList, total, form, publish_time, loginUser, location, publishType, harborMembers } = this.props
    const { getFieldProps } = form
    const { rejectModal, copyStatus, imageDetailModalShow, currentImage, delModal } = this.state
    const isAdmin = loginUser.role === ROLE_SYS_ADMIN || loginUser.role === ROLE_BASE_ADMIN || loginUser.role === ROLE_PLATFORM_ADMIN
    let currentMember = {}
    const members = harborMembers.list || []
    members.every(member => {
      if (member.entityName === loginUser.userName) {
        currentMember = member
        return false
      }
      return true
    })
    const currentUserRole = currentMember[camelize('role_id')]
    const pagination = {
      simple: true,
      defaultCurrent: 1,
      defaultPageSize: 10,
      total,
    }
    let columns = []
    if (publishType==='market') {
      columns = [{
        title: '状态',
        dataIndex: 'publishStatus',
        key: 'publishStatus',
        width: '9%',
        render: this.getImageStatus
        }, {
          title: '提交信息',
          dataIndex: 'requestMessage',
          key: 'requestMessage',
          width: '8%',
          render: text => <Tooltip title={text}><div style={{ maxWidth: 90 }} className="textoverflow">{text}</div></Tooltip>
        }, {
          title: '分类名称',
          dataIndex: 'classifyName',
          key: 'classifyName',
          width: '8%',
        }, {
          title: '发布名称',
          dataIndex: 'fileNickName',
          key: 'fileNickName',
          width: '8%',
        }, {
          title: '目标集群',
          dataIndex: 'clusterName',
          key: 'clusterName',
          width: '12%',
        }, {
          title: '原镜像名称',
          dataIndex: 'originID',
          key: 'originID',
          width: '15%',
          render: (text, record) => {
            return (
              <Tooltip title={text}>
                <div
                  onClick={() => this.openDetailModal(record)}
                  style={{ maxWidth: 150 }}
                  className="textoverflow themeColor pointer"
                >
                  {text}
                  </div>
              </Tooltip>
            )
          }
        }, {
          title: '镜像地址',
          dataIndex: 'resource',
          key: 'resource',
          width: '10%',
          render: (text, record) => {
            const content = (
              <div className="imageIDBox">
                <div>原地址</div>
                <input type="text" className="imageIDCopyInput" style={{ position: "absolute", opacity: "0", top:'0'}}/>
                <p className="address">{record.originID}
                  <Tooltip title={copyStatus ? '复制成功' : '点击复制'}>
                    <Icon
                      type="copy"
                      onMouseEnter={() => this.startCopy(record.originID)}
                      onClick={this.copyOperate}
                      onMouseLeave={this.copyEnd}
                    />
                  </Tooltip>
                </p>
                <div>发布地址</div>
                <p className="address">{record.resource}:{record.tag}
                  <Tooltip title={copyStatus ? '复制成功' : '点击复制'}>
                    <Icon
                      type="copy"
                      onMouseEnter={() => this.startCopy(`${record.resource}:${record.tag}`)}
                      onClick={this.copyOperate}
                      onMouseLeave={this.copyEnd}
                    />
                  </Tooltip>
                </p>
              </div>
            );
            return(
              <Row style={{ maxWidth: 120 }}>
                {/* <Tooltip title={text}> */}
                  <Col className="textoverflow" span={20}>
                    {text}
                  </Col>
                {/* </Tooltip> */}
                <Col span={4}>
                  <Popover content={content} trigger="click">
                    <Icon type="plus-square" />
                  </Popover>
                </Col>
              </Row>
            )
          }
        }, {
          title: '发布者',
          dataIndex: 'userName',
          key: 'userName',
          width: '8%',
        }, {
          title: (
            <div onClick={() => this.handleSort('publish_time')}>
              提交时间
              <div className="ant-table-column-sorter">
                <span
                  className={publish_time === true ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'}
                  title="↑">
                  <i className="anticon anticon-caret-up"/>
                </span>
                <span
                  className={publish_time === false ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'}
                  title="↓">
                  <i className="anticon anticon-caret-down"/>
                </span>
              </div>
            </div>
          ),
          dataIndex: 'publishTime',
          key: 'publishTime',
          width: '17%',
          render: text => <TimeHover time={text} />
        }, {
          title: '操作',
          key: 'operation',
          width: '17%',
          render: (text, record, index) => {
            return(
              <div className="operateBtn">
                {
                  [1, 6].includes(record.publishStatus) &&
                    [
                      <Button
                        key="pass"
                        type="primary"
                        className="passBtn"
                        onClick={() => this.checkImageStatus(record, 2)}
                        disabled={!isAdmin}
                      >
                        {record.publishStatus === 1 ? '通过' : '重试'}
                      </Button>,
                      <Button
                        disabled={!isAdmin}
                        key="reject"
                        onClick={() => this.openRejectModal(record)}
                      >
                        拒绝
                      </Button>
                    ]
                }
                {
                  [3, 4, 5].includes(record.publishStatus) &&
                    <Button
                      disabled={!isAdmin}
                      onClick={() => this.openDelModal(record)}
                    >
                      删除记录
                    </Button>
                }
                {
                  ![1, 3, 4, 6].includes(record.publishStatus) && <span style={{ marginLeft: 28 }}>-</span>
                }
              </div>
            )
          }
        }]
    }else {
      columns = [{
        title: '状态',
        dataIndex: 'publishStatus',
        key: 'publishStatus',
        width: '9%',
        render: this.getImageStatus
        }, {
          title: '提交信息',
          dataIndex: 'requestMessage',
          key: 'requestMessage',
          width: '8%',
          render: text => <Tooltip title={text}><div style={{ maxWidth: 90 }} className="textoverflow">{text}</div></Tooltip>
        }, {
          title: '目标仓库组',
          dataIndex: 'targetProject',
          key: 'targetProject',
          width: '12%',
        },{
          title: '目标集群',
          dataIndex: 'clusterName',
          key: 'clusterName',
          width: '12%',
        }, {
          title: '原镜像名称',
          dataIndex: 'originID',
          key: 'originID',
          width: '15%',
          render: (text, record) => {
            return (
              <Tooltip title={text}>
                <div
                  onClick={() => this.openDetailModal(record)}
                  style={{ maxWidth: 150 }}
                  className="textoverflow themeColor pointer"
                >
                  {text}
                  </div>
              </Tooltip>
            )
          }
        }, {
          title: '镜像地址',
          dataIndex: 'resource',
          key: 'resource',
          width: '10%',
          render: (text, record) => {
            const content = (
              <div className="imageIDBox">
                <div>原地址</div>
                <input type="text" className="imageIDCopyInput" style={{ position: "absolute", opacity: "0", top:'0'}}/>
                <p className="address">{record.originID}
                  <Tooltip title={copyStatus ? '复制成功' : '点击复制'}>
                    <Icon
                      type="copy"
                      onMouseEnter={() => this.startCopy(record.originID)}
                      onClick={this.copyOperate}
                      onMouseLeave={this.copyEnd}
                    />
                  </Tooltip>
                </p>
                <div>发布地址</div>
                <p className="address">{record.resource}:{record.tag}
                  <Tooltip title={copyStatus ? '复制成功' : '点击复制'}>
                    <Icon
                      type="copy"
                      onMouseEnter={() => this.startCopy(`${record.resource}:${record.tag}`)}
                      onClick={this.copyOperate}
                      onMouseLeave={this.copyEnd}
                    />
                  </Tooltip>
                </p>
              </div>
            );
            return(
              <Row style={{ maxWidth: 120 }}>
                {/* <Tooltip title={text}> */}
                  <Col className="textoverflow" span={20}>
                    {text}
                  </Col>
                {/* </Tooltip> */}
                <Col span={4}>
                  <Popover content={content} trigger="click">
                    <Icon type="plus-square" />
                  </Popover>
                </Col>
              </Row>
            )
          }
        }, {
          title: '发布者',
          dataIndex: 'userName',
          key: 'userName',
          width: '8%',
        }, {
          title: (
            <div onClick={() => this.handleSort('publish_time')}>
              提交时间
              <div className="ant-table-column-sorter">
                <span
                  className={publish_time === true ? 'ant-table-column-sorter-up on' : 'ant-table-column-sorter-up off'}
                  title="↑">
                  <i className="anticon anticon-caret-up"/>
                </span>
                <span
                  className={publish_time === false ? 'ant-table-column-sorter-down on' : 'ant-table-column-sorter-down off'}
                  title="↓">
                  <i className="anticon anticon-caret-down"/>
                </span>
              </div>
            </div>
          ),
          dataIndex: 'publishTime',
          key: 'publishTime',
          width: '17%',
          render: text => formatDate(text)
        }, {
          title: '操作',
          key: 'operation',
          width: '17%',
          render: (text, record, index) => {
            return(
              <div className="operateBtn">
                {
                  [1, 6].includes(record.publishStatus) &&
                    [
                      <Button
                        key="pass"
                        type="primary"
                        className="passBtn"
                        onClick={() => this.checkImageStatus(record, 2)}
                        disabled={!isAdmin}
                        loading={this.state.passLoading[record.id]}
                      >
                        {record.publishStatus === 1 ? '通过' : '重试'}
                      </Button>,
                      <Button
                        disabled={!isAdmin}
                        key="reject"
                        onClick={() => this.openRejectModal(record)}
                      >
                        拒绝
                      </Button>
                    ]
                }
                {
                  [3, 4, 5].includes(record.publishStatus) &&
                    <Button
                      disabled={!isAdmin}
                      onClick={() => this.openDelModal(record)}
                    >
                      删除记录
                    </Button>
                }
                {
                  ![1, 3, 4, 6].includes(record.publishStatus) && <span style={{ marginLeft: 28 }}>-</span>
                }
              </div>
            )
          }
        }]
    }
    let serverName
    if (currentImage) {
      const { server, name } = this.getServeAndName(currentImage.originID)
      serverName = server
      Object.assign(currentImage, { name })
    }
    return(
      <div className="imageCheckTableBox">
        <Table
          className="wrapCheckTable"
          dataSource={imageCheckList}
          columns={columns}
          onChange={this.onTableChange}
          pagination={pagination}
          loading={this.props.loading}
        />
        <Modal
          title="删除审核记录" visible={delModal}
          onCancel={()=> this.closeDelModal()}
          onOk={() => this.confirmDelModal()}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            确定要删除该记录？
          </div>
        </Modal>
        <Modal
          title="拒绝理由"
          visible={rejectModal}
          onOk={this.confirmModal}
          onCancel={this.cancelModal}
        >
          <Form
            horizontal
            form={form}
          >
            <FormItem>
              <Input
                {...getFieldProps('approve', {
                  rules: [
                    {
                      validator: this.checkApprove
                    }
                  ]
                })}
                type="textarea"
                rows={4}
                placeholder="请输入拒绝理由"/>
            </FormItem>
          </Form>
        </Modal>
        <Modal
          title="镜像版本重复"
          visible={this.state.imageExistModal}
          onOk={() => {
            this.setState({ imageExistModal: false })
            this.checkImageStatus(...this.state.checkImageStatusParams)
          }}
          onCancel={() => this.setState({ imageExistModal: false, passLoading: false })}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" />
            目标仓库组已存在镜像 {this.state.existImage} ，通过之后会覆盖原镜像版本，是否确定？
          </div>
        </Modal>
        <Modal
          visible={imageDetailModalShow}
          className="AppServiceDetail"
          transitionName="move-right"
          onCancel={()=> this.setState({imageDetailModalShow:false})}
        >
          {
            imageDetailModalShow &&
            <ProjectDetail
              location={location}
              isAdminAndHarbor={isAdmin}
              server={serverName}
              visible={imageDetailModalShow}
              scope={this}
              config={currentImage}
              project_id={currentImage && currentImage.targetProjectID}
              currentUserRole={currentUserRole}
            />
          }
        </Modal>
      </div>
    )
  }
}

ImageCheckTable = Form.create()(ImageCheckTable)

class ImageCheck extends React.Component {
  constructor(props) {
    super(props)
    this.getImagePublishList = this.getImagePublishList.bind(this)
    this.updateParentState = this.updateParentState.bind(this)
    this.handleChangeTabs = this.handleChangeTabs.bind(this)
    this.state = {
      current: 1,
      filterName: undefined,
      targetProject: '',
      sort: 'd,publish_time',
      publish_time: false,
      filter: 'type,2,target_project__eq,',
      pushlishTarget: 'market',
      loading: false,
    }
  }
  componentWillMount() {
    const { activeKey } = this.props
    if (activeKey === 'image') {
      this.getImagePublishList()
    }
  }
  handleChangeTabs(key) {
    switch (key) {
      case 'market':
        this.setState({
          filter: 'type,2,target_project__eq,',
          targetProject: '',
          current: 1,
          pushlishTarget: 'market'
        },this.getImagePublishList)
        break
      case 'store':
        this.setState({
          filter: 'type,2,target_project__neq,',
          filterName: '',
          current: 1,
          pushlishTarget: 'store'
        },this.getImagePublishList)
        break
      default:
        break
    }
  }
  getImagePublishList() {
    this.setState({
      loading: true,
    }, () => {
      const { current, filterName, targetProject, sort, filter } = this.state
      const { imageApprovalList } = this.props
      let query = {
        from: (current - 1) * 10,
        size: 10,
        filter
      }
      if (filterName) {
        Object.assign(query, { filter: `file_nick_name,${filterName},${filter}` })
      }
      if (targetProject) {
        Object.assign(query, { filter: `target_project,${targetProject},${filter}` })
      }
      if (sort) {
        Object.assign(query, { sort })
      }
      imageApprovalList(query, {
        finally: {
          func: () => {
            this.setState({
              loading: false
            })
          }
        }
      })
    })
  }
  refreshData(type) {
    this.setState({
      [type]: '',
      sort: 'd,publish_time',
      current: 1,
      publish_time: false,
      // pushlishTarget: 'market'
    }, this.getImagePublishList)
  }
  updateParentState(type, value, callback) {
    this.setState({
      [type]: value
    }, callback && this.getImagePublishList)
  }
  render() {
    const {
      imageCheckList, total,  appStoreApprove, loginUser, location,
      loadProjectMembers, clusterHarbor, harborMembers, loadRepositoriesTags,
    } = this.props
    const { filterName, targetProject, current, publish_time } = this.state
    return(
      <QueueAnim className="imageCheck">
        <div className='titleContainer'>
          <div>分类:</div>
          {
            [ {groupId: 'market', groupName: '发布到商店'} , { groupId: 'store', groupName: '发布到仓库' } ].map( item=>{
              return (
                <div
                  key={item.groupId}
                  className={ this.state.pushlishTarget === item.groupId ? 'group active' : 'group' }
                  onClick={() => this.handleChangeTabs(item.groupId)}
                  >
                  {item.groupName}
                </div>
              )
            })
          }
        </div>
        {
          this.state.pushlishTarget==='market'?
          <div>
            <div className="wrapCheckHead" key="wrapCheckHead">
              <Button className="refreshBtn" type="primary" size="large" onClick={() => this.refreshData('filterName')}>
                <i className='fa fa-refresh'/> 刷新
              </Button>
              <CommonSearchInput
                ref="tableChild"
                size="large"
                placeholder="按发布名称搜索"
                style={{ width: 200 }}
                value={filterName}
                onSearch={value => this.updateParentState('filterName', value, true)}
              />
              <span className="total verticalCenter">共 {total && total} 条</span>
            </div>
            <ImageCheckTable
              key="wrapCheckTable"
              location={location}
              imageCheckList={imageCheckList}
              current={current}
              publish_time={publish_time}
              loginUser={loginUser}
              total={total}
              updateParentState={this.updateParentState}
              appStoreApprove={appStoreApprove}
              getImagePublishList={this.getImagePublishList}
              publishType='market'
              loadProjectMembers={loadProjectMembers}
              harbor={clusterHarbor}
              harborMembers={harborMembers}
              loading={this.state.loading}
              loadRepositoriesTags={loadRepositoriesTags}
            />
          </div>
          :
          <div>
            <div className="wrapCheckHead" key="wrapCheckHead">
              <Button className="refreshBtn" type="primary" size="large" onClick={() => this.refreshData('targetProject')}>
                <i className='fa fa-refresh'/> 刷新
              </Button>
              <CommonSearchInput
                ref="tableChild"
                size="large"
                placeholder="按目标仓库组搜索"
                style={{ width: 200 }}
                value={targetProject}
                onSearch={value => this.updateParentState('targetProject', value, true)}
              />
              <span className="total verticalCenter">共 {total && total} 条</span>
            </div>
            <ImageCheckTable
              key="wrapCheckTable"
              location={location}
              imageCheckList={imageCheckList}
              current={current}
              publish_time={publish_time}
              loginUser={loginUser}
              total={total}
              updateParentState={this.updateParentState}
              appStoreApprove={appStoreApprove}
              getImagePublishList={this.getImagePublishList}
              publishType='storage'
              loadProjectMembers={loadProjectMembers}
              harbor={clusterHarbor}
              harborMembers={harborMembers}
              loading={this.state.loading}
              loadRepositoriesTags={loadRepositoriesTags}
            />
          </div>
        }
      </QueueAnim>
    )
  }
}
ImageCheck = Form.create()(ImageCheck)

function mapStateToProps(state) {
  const { appStore, entities, harbor: stateHarbor } = state
  const { imageApprovalList } = appStore || { imageApprovalList: {} }
  const { data } = imageApprovalList || { data: {} }
  const { apps, total } = data || { apps: [], total: 0 }
  const { cluster } = entities.current
  const { harbor } = cluster
  const clusterHarbor = isEmpty(harbor) ? '' : harbor[0]
  const harborMembers = stateHarbor.members || {}
  return {
    loginUser: entities.loginUser.info,
    imageCheckList: apps,
    total,
    clusterHarbor,
    harborMembers,
  }
}

export default connect(mapStateToProps, {
  imageApprovalList,
  appStoreApprove,
  loadProjectMembers: harborActions.loadProjectMembers,
  loadRepositoriesTags: harborActions.loadRepositoriesTags,
})(ImageCheck)
