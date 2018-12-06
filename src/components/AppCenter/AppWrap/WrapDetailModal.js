/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Wrap Manage list component
 *
 * v0.1 - 2017-12-05
 * @author zhangxuan
 */

import React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { Modal, Form, Input, Button, Dropdown, Menu, Icon, Row, Col, Select, Tabs, Upload, Tooltip } from 'antd'
import defaultApp from '../../../../static/img/appstore/defaultapp.png'
import './style/WrapDetailModal.less'
import {
  getWrapDetail, updateWrapDetail, getWrapGroupList,
  deleteWrapManage, publishWrap, deleteWrapDocs
} from '../../../actions/app_center'
import { API_URL_PREFIX } from '../../../constants'
import {formatDate, setBodyScrollbar} from "../../../common/tools";
import isEmpty from 'lodash/isEmpty'
import TenxStatus from '../../TenxStatus/index'
import NotificationHandler from '../../../components/Notification'
import ReleaseAppModal from './ReleaseAppModal'
import WrapDocsModal from './WrapDocsModal'

const FormItem = Form.Item
const Option = Select.Option;
const TabPane = Tabs.TabPane;

class WrapDetailModal extends React.Component {
  constructor(props) {
    super(props)
    this.cancelModal = this.cancelModal.bind(this)
    this.cancelEdit = this.cancelEdit.bind(this)
    this.saveEdit = this.saveEdit.bind(this)
    this.closeRleaseModal = this.closeRleaseModal.bind(this)
    this.loadDetail = this.loadDetail.bind(this)
    this.auditCallback = this.auditCallback.bind(this)
    this.closeDocsModal = this.closeDocsModal.bind(this)
    this.state = {
      visible: false,
      canRename: false,
      activeKey: 'info'
    }
  }
  componentWillReceiveProps(nextProps) {
    const { visible: oldVisible, currentWrap: oldWrap } = this.props
    const { visible: newVisible, currentWrap: newWrap, getWrapGroupList, wrapGroupList: newGroupList, form } = nextProps
    if (!oldVisible && newVisible) {
      this.setState({
        visible: newVisible
      })
      this.loadDetail(newWrap.id)
    }
    if (!oldVisible && newVisible && isEmpty(newGroupList && newGroupList.classifies)) {
      getWrapGroupList()
    }
    if (!newVisible && oldVisible) {
      form.resetFields()
      this.setState({
        isEdit: false,
        canRename: false,
        activeKey: 'info'
      })
    }
  }

  loadDetail(pkgID) {
    const { getWrapDetail } = this.props
    getWrapDetail(pkgID, {
      success: {
        func: res => {
          const pkgDetail = res.data.pkgs
          if (pkgDetail && (pkgDetail.publishStatus !== 0)) {
            this.setState({
              canRename: true
            })
          } else {
            this.setState({
              canRename: false
            })
          }
        }
      }
    })
  }

  cancelModal() {
    const { closeDetailModal } = this.props
    closeDetailModal()
    this.setState({
      visible: false
    })
  }

  cancelEdit() {
    const { form, pkgDetail } = this.props
    form.resetFields()
    this.loadDetail(pkgDetail.id)
    this.setState({
      isEdit: false
    })
  }

  saveEdit() {
    const { updateWrapDetail, form, pkgDetail, callback } = this.props
    const { canRename } = this.state
    const { validateFields } = form
    let notify = new NotificationHandler()
    let validateArr = []
    if (canRename) {
      validateArr = ['description', 'classifyName', 'fileNickName']
    }
    validateFields(validateArr, (errors, values) => {
      if (!!errors) {
        return
      }
      const { classifyName, fileNickName, description } = form.getFieldsValue()

      const pkgID = pkgDetail.id
      const body = {
        description,
        filePkgName: pkgDetail.fileName
      }
      if (canRename) {
        Object.assign(body, {
          classifyName: classifyName[0],
          fileNickName
        })
      }
      notify.spin('保存中')
      updateWrapDetail(pkgID, body, {
        success: {
          func: () => {
            notify.close()
            notify.success('保存成功')
            this.loadDetail(pkgID)
            callback()
            this.setState({
              isEdit: false
            })
          },
          isAsync: true
        },
        failed: {
          func: res => {
            notify.close()
            if (res.statusCode < 500) {
              notify.warn('保存失败', res.message.message)
            } else {
              notify.error('保存失败', res.message.message)
            }
          }
        }
      })
    })
  }

  checkClassify(rule, value, callback) {
    if (!value || !value.length) {
      return callback('请选择或输入分类')
    }
    if (value && value.length > 1) {
      return callback('只能选择一个分类')
    }
    callback()
  }

  releaseNameProps(rule, value, callback) {
    if (!value) {
      return callback('请输入发布名称')
    }
    if (value.length > 20) {
      return callback('发布名称不能超过20个字符')
    }
    callback()
  }

  descCheck(rule, value, callback) {
    const { canRename } = this.state
    if (!canRename) {
      return callback()
    }
    if (!value) {
      return callback('请输入描述信息')
    }
    if (value.length > 128) {
      return callback('描述信息不得超过128个字符')
    }
    callback()
  }
  getStatus(status) {
    if (!status && status !== 0) return
    const { pkgDetail } = this.props
    let phase
    let progress = { status: false };
    switch (status) {
      case 0:
        phase = 'Unpublished'
        break
      case 1:
        phase = 'Published'
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
      case 8:
        phase = 'Checking'
        break
    }
    return <TenxStatus phase={phase} progress={progress} showDesc={status === 3} description={status === 3 && pkgDetail.approveMessage} />
  }

  deleteHint() {
    Modal.info({
      title: '只有未发布和已下架的应用包可以被删除'
    })
  }

  deleteAction(status, id) {
    if (status) {
      id = [id]
      this.setState({ delAll: true, id })
      return
    }
    this.setState({ delAll: false })
  }

  deleteVersion = () => {
    let notificat = new NotificationHandler()
    const { id } = this.state
    const { deleteWrapManage, callback, closeDetailModal } = this.props
    deleteWrapManage({ ids: id }, {
      success: {
        func: () => {
          notificat.success('删除成功')
          callback()
          closeDetailModal()
          this.setState({
            visible: false
          })
        }, isAsync: true
      },
      failed: {
        func: (err) => {
          notificat.error('删除失败', err.message.message || err.message)
        }
      },
      finally: {
        func: () => {
          this.deleteAction(false)
        }
      }
    })
  }

  publishAction(id) {
    const { publishWrap, callback, pkgDetail } = this.props
    let notify = new NotificationHandler()
    notify.spin('发布中')
    publishWrap(id, {
      success: {
        func: () => {
          notify.close()
          notify.success('发布成功')
          callback()
          this.loadDetail(pkgDetail.id)
        },
        isAsync: true
      },
      failed: {
        func: res => {
          notify.close()
          if (res.statusCode < 500) {
            notify.warn('发布失败', res.message || res.message.message)
          } else {
            notify.error('发布失败', res.message || res.message.message)
          }
        }
      }
    })
  }
  handleMenuClick(e, row) {
    const { updateAppStatus, closeDetailModal } = this.props
    switch (e.key) {
      case 'delete':
        if (![0, 4].includes(row.publishStatus)) {
          this.deleteHint()
          return
        }
        this.deleteAction(true, row.id)
        break
      case 'audit':
        this.setState({
          releaseVisible: true
        })
        break
      case 'publish':
        this.publishAction(row.id)
        break
      case 'download':
        break
      case 'offShelf':
        this.setState({
          visible: false
        })
        closeDetailModal()
        updateAppStatus(row.appId)
        break
      case 'vm':
        browserHistory.push(`/app_manage/vm_wrap/create?fileName=${row.fileName}`)
        break
    }
  }

  handleButtonClick() {
    const { deploy, pkgDetail } = this.props
    deploy(pkgDetail.fileName)
  }
  renderDeployBtn() {
    const { pkgDetail, isStore, isAdmin, vmWrapConfig, updateDownloadCount } = this.props
    const { enabled } = vmWrapConfig
    const menu = (
      <Menu onClick={e => this.handleMenuClick(e, pkgDetail)} style={{ width: 110 }}>
        {
          enabled ?
            <Menu.Item key="vm">
              传统部署
            </Menu.Item>
            :
            <Menu.Item key="vmnone" style={{ display: 'none' }}/>
        }
        {
          !isStore ?
            [

              <Menu.Item key="audit" disabled={[1, 2, 8].includes(pkgDetail && pkgDetail.publishStatus)}>
                提交审核
              </Menu.Item>,
              <Menu.Item key="publish" disabled={![2].includes(pkgDetail && pkgDetail.publishStatus)}>
                发布
              </Menu.Item>
            ]
            :
            <Menu.Item key="none" style={{ display: 'none' }} />
        }
        <Menu.Item key="download">
          <a target="_blank" href={`${API_URL_PREFIX}/pkg/${pkgDetail && pkgDetail.id}`}
             onClick={() => updateDownloadCount && updateDownloadCount(pkgDetail.id)}
          >
            下载
          </a>
        </Menu.Item>
        {
          !isStore ?
            <Menu.Item key="delete">
              删除
            </Menu.Item>
            :
            isAdmin ?
              <Menu.Item key="offShelf">
                下架
              </Menu.Item>
              :
              <Menu.Item key="noneAdmin" style={{ display: 'none' }} />
        }
      </Menu>

    )
    return (
      <Dropdown.Button onClick={() => this.handleButtonClick()} overlay={menu} type="ghost" className="dropDownBox">
        <span><Icon type="appstore-o" /> 容器部署</span>
      </Dropdown.Button>
    )
  }

  closeRleaseModal() {
    this.setState({
      releaseVisible: false
    })
  }

  auditCallback() {
    const { pkgDetail, callback } = this.props
    this.loadDetail(pkgDetail.id)
    callback()
  }

  closeModal() {
    const { closeDetailModal } = this.props
    this.setState({
      visible: false
    })
    closeDetailModal()
  }

  confirmDeleteModal() {
    const { currentFile } = this.state
    const { deleteWrapDocs, pkgDetail } = this.props
    let notify = new NotificationHandler()
    this.setState({
      deleteLoading: true
    })
    notify.spin('删除中')
    deleteWrapDocs(pkgDetail.id, {
      name: currentFile
    }, {
        success: {
          func: () => {
            notify.close()
            notify.success('删除成功')
            this.loadDetail(pkgDetail.id)
            this.closeDeleteModal()
            this.setState({
              deleteLoading: false
            })
          },
          isAsync: true
        },
        failed: {
          func: res => {
            notify.close()
            if (res.statusCode < 500) {
              notify.warn('删除失败', res.message.message)
              this.setState({
                deleteLoading: false
              })
              return
            }
            notify.error('删除失败', res.message)
          }
        },
        finally: {
          func: () => {
            notify.close()
            this.setState({
              deleteLoading: false
            })
            this.closeDeleteModal()
          }
        }
      })
  }

  openDeleteModal(name) {
    this.setState({
      currentFile: name,
      deleteModal: true
    })
  }

  closeDeleteModal() {
    this.setState({
      currentFile: '',
      deleteModal: false
    })
  }
  renderDocsList() {
    const { pkgDetail } = this.props
    if (!pkgDetail || !pkgDetail.documents || !JSON.parse(pkgDetail.documents).length) {
      return <div className="docsList" style={{ textAlign: 'center' }}>暂无附件</div>
    }
    const docs = JSON.parse(pkgDetail.documents)
    return docs.map(item => {
      return <div className="docsList" key={item}>
        <Icon type="file-text" />
        {item}
        <a target="_blank" href={`${API_URL_PREFIX}/pkg/${pkgDetail.id}/docs/download?file=${encodeURIComponent(item)}`}><Icon type="download" /></a>
        <Icon type="delete" onClick={() => this.openDeleteModal(item)} /></div>
    })
  }

  closeDocsModal() {
    this.setState({
      docsModal: false
    })
  }

  changeTabs(key) {
    this.setState({
      activeKey: key
    })
  }
  render() {
    const { form, pkgDetail, wrapGroupList, isWrapStore } = this.props
    const { visible, isEdit, releaseVisible, canRename, deleteLoading, docsModal, activeKey } = this.state
    const { getFieldProps } = form
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10 },
    }
    const children = [];
    wrapGroupList &&
      wrapGroupList.classifies &&
      wrapGroupList.classifies.length &&
      wrapGroupList.classifies.forEach(item => {
        children.push(<Option value={item.classifyName} key={item.classifyName}>{item.classifyName}</Option>)
      })
    const classifyProps = getFieldProps('classifyName', {
      rules: [
        {
          validator: this.checkClassify,
        }
      ],
      initialValue: pkgDetail && pkgDetail.classifyName ? [pkgDetail.classifyName] : []
    })
    const releaseNameProps = getFieldProps('fileNickName', {
      rules: [
        {
          validator: this.releaseNameProps,
        }
      ],
      initialValue: pkgDetail && pkgDetail.fileNickName ? pkgDetail.fileNickName : ''
    })
    const descProps = getFieldProps('description', {
      rules: [
        {
          validator: this.descCheck.bind(this)
        }
      ],
      initialValue: pkgDetail && pkgDetail.description ? pkgDetail.description : ''
    })
    return (
      <Modal
        className="wrapDetail AppServiceDetail"
        transitionName="move-right"
        visible={visible}
        onCancel={this.cancelModal}
      >
        <Modal title="删除操作" visible={this.state.delAll}
          onCancel={() => this.deleteAction(false)}
          onOk={this.deleteVersion}
        >
          <div className="confirmText">确定要删除所选版本？</div>
        </Modal>
        <Modal title="删除操作" visible={this.state.deleteModal}
          onCancel={() => this.closeDeleteModal()}
          onOk={() => this.confirmDeleteModal()}
          confirmLoading={deleteLoading}
        >
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle"/>
            确定要删除所选附件？
          </div>
        </Modal>
        <ReleaseAppModal
          currentApp={pkgDetail}
          visible={releaseVisible}
          closeRleaseModal={this.closeRleaseModal}
          callback={this.auditCallback}
        />
        {
          docsModal &&
          <WrapDocsModal
            visible={docsModal}
            closeModal={this.closeDocsModal}
            currentWrap={pkgDetail}
            callback={() => this.loadDetail(pkgDetail.id)}
          />
        }
        <div className="wrapDetailHeader">
          <img
            className="appLogo"
            src={
              pkgDetail && pkgDetail.pkgIconID ?
                `${API_URL_PREFIX}/pkg/icon/${pkgDetail.pkgIconID}`
                :
                defaultApp
            }
          />
          {
            visible && <VisibleScrollbar/>
          }
          <div className="nameAndTag">
            <Tooltip title={pkgDetail && pkgDetail.fileName}>
              <div key="name" className="name">{pkgDetail && pkgDetail.fileName}</div>
            </Tooltip>
            <div key="tag" className="tag">版本：{pkgDetail && pkgDetail.fileTag}</div>
          </div>
          <div className="dropDown">
            <Icon
              type='cross' className='cursor'
              style={{ fontSize: '18px', position: 'absolute', top: '-38px', right: '0px' }}
              onClick={() => this.closeModal()}
            />
            {this.renderDeployBtn()}
          </div>
        </div>
        <Tabs className="wrapDetailBody" activeKey={activeKey} onChange={this.changeTabs.bind(this)}>
          <TabPane
            key="info" tab="基本信息"
          >
            <div>
              <div className="btnBox">
                {
                  isEdit ?
                    [
                      <Button className="cancelBtn" key="cancel" size="large" onClick={this.cancelEdit}>取消</Button>,
                      <Button key="save" size="large" type="primary" onClick={this.saveEdit}>保存</Button>
                    ] :
                    <Button type="primary" size="large" onClick={() => this.setState({ isEdit: true })}>编辑</Button>
                }
              </div>
              <div className="dataBox">
                <Row className="rowLabel">
                  <Col span={3}>
                    版本标签
                  </Col>
                  <Col span={10}>
                    {pkgDetail && pkgDetail.fileTag}
                  </Col>
                </Row>
                <FormItem
                  label="分类名称"
                  {...formItemLayout}
                >
                  <Select
                    showSearch={true}
                    disabled={!isEdit || !canRename}
                    tags
                    searchPlaceholder="请选择分类"
                    style={{ width: '100%' }}
                    {...classifyProps}
                  >
                    {children}
                  </Select>
                </FormItem>
                <FormItem
                  label="发布名称"
                  {...formItemLayout}
                >
                  <Input disabled={!isEdit || !canRename} {...releaseNameProps} />
                </FormItem>
                <Row className="rowLabel" type="flex" align="middle">
                  <Col span={3}>
                    应用商店
                  </Col>
                  <Col span={10} className="successColor">
                    {this.getStatus(pkgDetail && pkgDetail.publishStatus)}
                  </Col>
                </Row>
                <Row className="rowLabel">
                  <Col span={3}>
                    包类型
                  </Col>
                  <Col span={10}>
                    {pkgDetail && pkgDetail.fileType}
                  </Col>
                </Row>
                <FormItem
                  label="描述"
                  {...formItemLayout}
                >
                  <Input disabled={!isEdit} {...descProps} type="textarea" />
                </FormItem>
                <Row className="rowLabel">
                  <Col span={3}>
                    上传时间
                  </Col>
                  <Col span={10}>
                    {formatDate(pkgDetail && pkgDetail.creationTime)}
                  </Col>
                </Row>
              </div>
            </div>
          </TabPane>
          {
            !isWrapStore ?
              <TabPane
                key="docs"
                tab="相关附件"
              >
                <Button type="primary" size="large" icon="upload" onClick={() => this.setState({ docsModal: true })}>上传附件</Button>
                <div className="docsBox">
                  {this.renderDocsList()}
                </div>
              </TabPane> : <TabPane key="none" disabled/>
          }
        </Tabs>
      </Modal>
    )
  }
}

function mapStateToProps(state, props) {
  const { images, entities } = state
  const { wrapDetail, wrapGroupList } = images || { wrapDetail: {} }
  const { result } = wrapDetail || { result: {} }
  const { data } = result || { data: {} }
  const { pkgs } = data || { pkgs: {} }
  const { result: groupList } = wrapGroupList || { result: {} }
  const { data: groupData } = groupList || { data: [] }
  const { location } = props
  const { pathname } = location || { pathname: '' }
  const { vmWrapConfig } = entities.loginUser.info
  let isWrapStore = false
  if (pathname === '/app_center/wrap_store') {
    isWrapStore = true
  }
  return {
    wrapGroupList: groupData,
    pkgDetail: pkgs,
    isWrapStore,
    vmWrapConfig,
  }
}

export default connect(mapStateToProps, {
  getWrapDetail,
  updateWrapDetail,
  getWrapGroupList,
  deleteWrapManage,
  publishWrap,
  deleteWrapDocs
})(Form.create()(WrapDetailModal))

class VisibleScrollbar extends React.PureComponent{
  componentDidMount() {
    setBodyScrollbar()
  }
  componentWillUnmount() {
    setBodyScrollbar(true)
  }
  render() {
    return null
  }
}
