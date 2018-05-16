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
import { Button, Table, Modal, Form, Input, Popover, Row, Col, Icon, Tooltip, Radio, Tabs} from 'antd'
import './style/ImageCheck.less'
import CommonSearchInput from '../../CommonSearchInput'
import TenxStatus from '../../TenxStatus/index'
import { imageApprovalList, appStoreApprove, getMarketAndStorageList } from '../../../actions/app_store'
import { formatDate } from '../../../common/tools'
import NotificationHandler from '../../../components/Notification'
import ProjectDetail from '../ImageCenter/ProjectDetail'
import { camelize } from 'humps'
import { ROLE_SYS_ADMIN } from '../../../../constants'

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
  checkImageStatus(record, status, message) {
    const { appStoreApprove, getImagePublishList } = this.props
    let notify = new NotificationHandler()
    const body = {
      id: record.id,
      type: 2,
      status,
      imageTagName: `${record.image}:${record.tag}`
    }
    if (status === 2) {
      Object.assign(body, { origin_id: record.originID })
    }
    if (message) {
      Object.assign(body, { approve_message: message })
    }
    notify.spin('操作中')
    return new Promise((resolve, reject) => {
      appStoreApprove(body, {
        success: {
          func: () => {
            getImagePublishList()
            resolve()
            notify.close()
            notify.success('操作成功')
          },
          isAsync: true
        },
        failed: {
          func: res => {
            reject(res.message)
            notify.close()
            notify.error(`操作失败\n${res.message.message}`)
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
  render() {
    const { imageCheckList, total, form, publish_time, loginUser, location, publishType,  } = this.props
    const { getFieldProps } = form
    const { rejectModal, copyStatus, imageDetailModalShow, currentImage, delModal } = this.state
    const isAdmin = loginUser.role === ROLE_SYS_ADMIN
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
          title: '原镜像名称',
          dataIndex: 'originID',
          key: 'originID',
          width: '15%',
          render: (text, record) => {
            return (
              <Tooltip title={text}>
                <div
                  onClick={() => this.setState({imageDetailModalShow: true, currentImage: record})}
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
                <Tooltip title={text}>
                  <Col className="textoverflow" span={20}>
                    {text}
                  </Col>
                </Tooltip>
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
                  [3, 4].includes(record.publishStatus) &&
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
        }, {
          title: '原镜像名称',
          dataIndex: 'originID',
          key: 'originID',
          width: '15%',
          render: (text, record) => {
            return (
              <Tooltip title={text}>
                <div
                  onClick={() => this.setState({imageDetailModalShow: true, currentImage: record})}
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
                <Tooltip title={text}>
                  <Col className="textoverflow" span={20}>
                    {text}
                  </Col>
                </Tooltip>
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
                  [3, 4].includes(record.publishStatus) &&
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
        />
        <Modal
          title="删除审核记录" visible={delModal}
          onCancel={()=> this.closeDelModal()}
          onOk={() => this.confirmDelModal()}
        >
          <div className="confirmText">确定要删除该记录？</div>
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
          visible={imageDetailModalShow}
          className="AppServiceDetail"
          transitionName="move-right"
          onCancel={()=> this.setState({imageDetailModalShow:false})}
        >
          <ProjectDetail location={location} isAdminAndHarbor={isAdmin} server={serverName} visible={imageDetailModalShow} scope={this} config={currentImage}/>
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
    this.filterListData = this.filterListData.bind(this)
    this.state = {
      current: 1,
      filter: 'type,2',
      filterName: undefined,
      sort: 'd,publish_time',
      publish_time: false,
    }
  }
  componentWillMount() {
    const { activeKey } = this.props
    if (activeKey === 'image') {
      this.getImagePublishList()
    }
  }
  componentDidMount() {
    // this.filterListData()
  }
  filterListData() {
    const { imageCheckList } = this.props
    let marketList = []
    let storeList = []
    if (imageCheckList && imageCheckList.length &&imageCheckList.length>0) {
      storeList = imageCheckList.filter((item) => {
          return item.targetProject.length>0
      })
      marketList = imageCheckList.filter((item) => {
          return item.targetProject.length == 0
      })
      this.setState({
        marketList: marketList,
        storeList: storeList
      })
    }
  }

  getImagePublishList() {
    const { current, filterName, sort, filter } = this.state
    const { imageApprovalList } = this.props
    let query = {
      from: (current - 1) * 10,
      size: 10,
      filter
    }
    if (filterName) {
      Object.assign(query, { filter: `type,2,file_nick_name,${filterName}` })
    }
    if (sort) {
      Object.assign(query, { sort })
    }
    imageApprovalList(query)
  }
  refreshData() {
    this.setState({
      filterName: '',
      sort: 'd,publish_time',
      current: 1,
      publish_time: false
    }, this.getImagePublishList)
  }
  updateParentState(type, value, callback) {
    this.setState({
      [type]: value
    }, callback && this.getImagePublishList)
  }
  render() {
    const { imageCheckList, total, marketTotal, storageTotal, appStoreApprove, loginUser, location, form, marketList, storeList } = this.props
    const { filterName, current, publish_time } = this.state
    const { getFieldProps } = this.props.form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    return(
      <QueueAnim className="imageCheck">
        {/* <FormItem
          {...formItemLayout}
          label="发布类型"
        >
          <RadioGroup
            {...getFieldProps('publishRadio', { initialValue: 'market' })}>
            <Radio value="market">发布到商店</Radio>
            <Radio value="storage">发布到仓库组</Radio>
          </RadioGroup>
        </FormItem>
        {
          form.getFieldValue('publishRadio') === 'market' ? */}
        <Tabs defaultActiveKey="market" className='imageCheckActive'>
          <TabPane tab="发布到商店" key="market">
            <div>
              <div className="wrapCheckHead" key="wrapCheckHead">
                <Button className="refreshBtn" type="primary" size="large" onClick={() => this.refreshData()}>
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
                <span className="total verticalCenter">共 {marketTotal && marketTotal} 条</span>
              </div>
              <ImageCheckTable
                key="wrapCheckTable"
                location={location}
                imageCheckList={marketList}
                current={current}
                publish_time={publish_time}
                loginUser={loginUser}
                total={marketTotal}
                updateParentState={this.updateParentState}
                appStoreApprove={appStoreApprove}
                getImagePublishList={this.getImagePublishList}
                publishType='market'
              />
            </div>
          {/* : */}
          </TabPane>
          <TabPane tab="发布到仓库" key="store">
            <div>
              <div className="wrapCheckHead" key="wrapCheckHead">
                <Button className="refreshBtn" type="primary" size="large" onClick={() => this.refreshData()}>
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
                <span className="total verticalCenter">共 {storageTotal && storageTotal} 条</span>
              </div>
              <ImageCheckTable
                key="wrapCheckTable"
                location={location}
                imageCheckList={storeList}
                current={current}
                publish_time={publish_time}
                loginUser={loginUser}
                total={storageTotal}
                updateParentState={this.updateParentState}
                appStoreApprove={appStoreApprove}
                getImagePublishList={this.getImagePublishList}
                publishType='storage'
              />
            </div>
          </TabPane>
        </Tabs>
      </QueueAnim>
    )
  }
}
ImageCheck = Form.create()(ImageCheck)

function mapStateToProps(state) {
  const { appStore, entities } = state
  const { imageApprovalList } = appStore || { imageApprovalList: {} }
  const { data } = imageApprovalList || { data: {} }
  const { apps, total } = data || { apps: [], total: 0 }
  let marketList = []
  let storeList = []
  if (apps && apps.length && apps.length>0) {
    storeList = apps.filter((item) => {
        return item.targetProject && item.targetProject.length > 0
    })
    marketList = apps.filter((item) => {
        return item.targetProject && item.targetProject.length == 0
    })
  }
  let marketTotal = total - storeList.length
  let storageTotal = storeList.length
  return {
    loginUser: entities.loginUser.info,
    imageCheckList: apps,
    total,
    marketTotal,
    storageTotal,
    marketList,
    storeList,
  }
}

export default connect(mapStateToProps, {
  imageApprovalList,
  appStoreApprove
})(ImageCheck)