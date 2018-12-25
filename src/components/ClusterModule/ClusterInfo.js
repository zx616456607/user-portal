/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster info list component
 *
 * v0.1 - 2017-2-24
 * @author BaiYu
 * v0.1 - 2017-4-28
 * @modifier XuLongcheng
 */
import React from 'react'
import { Icon, Button, Card, Form, Input, Tooltip, Spin, Modal, Dropdown, Menu, Checkbox } from 'antd'
import { updateCluster, loadClusterList, deleteCluster, updateClusterConfig } from '../../actions/cluster'
import NotificationHandler from '../../components/Notification'
import { connect } from 'react-redux'
import { getProjectVisibleClusters } from '../../actions/project'
import clusterImg from '../../assets/img/integration/cluster.png'
import { IP_REGEX, HOST_REGEX, EMAIL_REG_EXP } from '../../../constants'
import intlMsg from './ClusterInfoIntl'
import Ellipsis from '@tenx-ui/ellipsis/lib/index'
import '@tenx-ui/ellipsis/assets/index.css'
import { injectIntl, FormattedMessage } from 'react-intl'
import CreateClusterLog from '../../../client/containers/ClusterModule/CreateClusterLog'
import { getDeepValue } from '../../../client/util/util'
import isEmpty from 'lodash/isEmpty'

let saveBtnDisabled = true

let ClusterInfo = React.createClass ({
  getInitialState() {
    return {
      editCluster: false, // edit btn
      saveBtnLoading: false,
      deleteClusterModal: false,
      deleteClusterBtnLoading: false,
      selectBuilderEnvironmentModal: false,
      selectedBuilderEnvironment:false,
      checkbox: true
    }
  },
  checkValue(rule, value, callback) {
    if (!value) {
      callback([new Error('请填写用户名')])
      return
    }
    if (value.indexOf('@') > -1) {
      if (!EMAIL_REG_EXP.test(value)) {
        callback([new Error('邮箱地址填写错误')])
        return
      }
      callback()
      return
    }
    callback()
  },
  APIupdateCluster(clusterID, values){
    const { updateCluster, loadClusterList, form } = this.props
    const notification = new NotificationHandler()
    updateCluster(clusterID, values, {
      success: {
        func: result => {
          notification.success(`更新集群信息成功`)
          loadClusterList(null, {
            finally: {
              func: () => {
                this.setState({
                  saveBtnLoading: false,
                  editCluster: false,
                })
              }
            }
          })
        },
        isAsync: true
      },
      failed: {
        func: err => {
          notification.error(`更新集群信息失败`)
          this.setState({
            saveBtnLoading: false,
          })
        },
        isAsync: true
      },
    })
  },
  updateCluster(e) {
    e.preventDefault()
    const { form, updateCluster, cluster, loadClusterList, updateClusterConfig, clusterList } = this.props
    const { validateFields, resetFields } = form
    const { isBuilder } = cluster
    const notification = new NotificationHandler()
    validateFields((errors, values) => {
      if (!!errors) {
        return
      }
      this.setState({
        saveBtnLoading: true,
      })
      if(values.agreement){
        updateClusterConfig(cluster.clusterID,{IsBuilder:1},{
          success:{
            func : () => {
              let oldBuilder = false
              for(let i=0;i<clusterList.length;i++){
                if(clusterList[i].isBuilder == true){
                  oldBuilder = true
                  updateClusterConfig(clusterList[i].clusterID,{IsBuilder:2},{
                    success:{
                      func:() => {
                        this.APIupdateCluster(cluster.clusterID, values)
                      },
                      isAsync: true,
                    }
                  })
                }
              }
              if (!oldBuilder) {
                notification.success(`更新集群信息成功`)
                loadClusterList(null, {
                  finally: {
                    func: () => {
                      this.setState({
                        saveBtnLoading: false,
                        editCluster: false,
                      })
                    }
                  }
                })
              }
            },
            isAsync: true,
          },
          failed:{
            func: err => {
              notification.error(`更新集群信息失败`)
              this.setState({
                selectedBuilderEnvironment: false,
                saveBtnLoading: false,
                editCluster: false,
              })
            },
            isAsync: true,
          }
        })
        return
      }
      this.APIupdateCluster(cluster.clusterID, values)
    })
  },
  deleteCluster() {
    const { cluster } = this.props
    const { isBuilder } = cluster
    if(isBuilder){
      this.deleteClusterWhenIsBuilderEnvironmentModal()
      return
    }
    this.setState({
      deleteClusterModal: true,
    })
  },
  clearAddingHostsInterval(clusterID) {
    const { addingHostsIntervalData } = this.props
    if (isEmpty(addingHostsIntervalData)) {
      return
    }
    let currentInterval
    addingHostsIntervalData.forEach(item => {
      if (item[clusterID]) {
        currentInterval = item[clusterID]
      }
    })
    if (currentInterval) {
      clearInterval(currentInterval)
    }
  },
  confirmDeleteCluster() {
    const {
      deleteCluster,
      cluster,
      loadClusterList,
      getProjectVisibleClusters,
      current,
    } = this.props
    const notification = new NotificationHandler()
    this.setState({
      deleteClusterBtnLoading: true,
    })
    deleteCluster(cluster.clusterID, {
      success: {
          func: result => {
            notification.success(`删除集群“${cluster.clusterName}”成功`)
            loadClusterList(null, {
              finally: {
                func: () => {
                  this.setState({
                    deleteClusterModal: false,
                    deleteClusterBtnLoading: false,
                  })
                }
              }
            })
            getProjectVisibleClusters(current.space.namespace)
            this.clearAddingHostsInterval(cluster.clusterID)
          },
          isAsync: true
        },
        failed: {
          func: err => {
            let { message } = err
            if (typeof message !== 'string') {
              message = ''
            }
            notification.error(`删除集群“${cluster.clusterName}”失败`, message)
            this.setState({
              deleteClusterBtnLoading: false,
            })
          },
          isAsync: true
        }
    })
  },
  eidtClusterBuilderEnvironment(){
    const { cluster, form } = this.props
    const { getFieldProps, setFieldsValue } = form
    const { isBuilder } = cluster
    const agreementProps = getFieldProps('agreement', {
      rules: [
        { required: false, message: '请选择' },
      ],
      valuePropName: 'checked',
      onChange: e => {
        this.selectBuilderEnvironment()
      }
    })
    /* Don't need to do this in frontend, just show what API returns
    if(this.clusterListLength().length == 1){
      return <span><Checkbox style={{marginRight:'4px' }}  onClick={this.cancleClusterWhenOnlyOneClusterModal} checked={true}></Checkbox>该集群用来作为构建镜像的环境</span>
    }*/
    if(isBuilder){
      return <span><Checkbox style={{marginRight:'4px' }}  onClick={this.checkBuilderEnvironment} checked={this.state.checkbox}></Checkbox>该集群用来作为构建镜像的环境</span>
    }
    return <div><Form.Item style={{width:'18px',float:'left'}}><Checkbox {...agreementProps} checked={this.state.selectedBuilderEnvironment}></Checkbox></Form.Item><span>该集群用来作为构建镜像的环境</span></div>
  },
  deleteClusterWhenIsBuilderEnvironmentModal(){
    Modal.info({
      title: '不可删除该集群',
      content: (
        <div>
          <p>此集群为构建环境集群，需选择另一个集群作为构建环境后方可删除此集群</p>
        </div>
      ),
      onOk() {},
    });
  },
  cancleClusterWhenOnlyOneClusterModal(){
    Modal.info({
      title: '提示',
      content: (
        <div>
          <p>由于目前只有一个集群，不可取消构建环境</p>
        </div>
      ),
      onOk() {},
    });
  },
  selectBuilderEnvironment(){
    const { harbor } = this.props.cluster
    if(!!harbor && harbor.length > 0 && !!harbor[0]){
      this.setState({
        selectBuilderEnvironmentModal: true
      })
    } else {
      Modal.info({
        title: '提示',
        content: (
          <div>
            <p>集群未配置harbor，无法修改为构建集群！</p>
          </div>
        ),
        onOk() {},
      });
    }
  },
  confirmSelectCurrentCluster(){
    this.setState({
      selectBuilderEnvironmentModal: false,
      selectedBuilderEnvironment: true
    })
  },
  cancleSelectCurrentCluster(){
    this.setState({
      selectBuilderEnvironmentModal: false,
      selectedBuilderEnvironment:false
    })
  },
  checkBuilderEnvironment(){
    const { cluster } = this.props
    const { clusterName } = cluster
    Modal.info({
      title: '不可直接取消构建环境',
      content: (
        <div>
          <p>选择其他集群作为构建环境后，即可自动取消该集群 [ {clusterName} ] 作为构建集群</p>
        </div>
      ),
      onOk() {},
    });
  },
  clusterListLength(){
    const { clusterList } = this.props
    let length = 0
    let currentClusterName = ''
    if(clusterList){
      length = clusterList.length
      for(let i=0; i<clusterList.length; i++){
        if(clusterList[i].isBuilder ==true){
          currentClusterName = clusterList[i].clusterName
        }
      }
    }
    return { length, currentClusterName }
  },
  eidtFasleCheckbox(){
    const { cluster } = this.props
    const { isBuilder } = cluster
    if(isBuilder){
      return <Checkbox disabled style={{marginRight:'4px' }} checked={true}></Checkbox>
    }
    return <Checkbox disabled style={{marginRight:'4px' }} checked={false}></Checkbox>
  },
  renderClusterSource() {
    const { cluster,  intl: { formatMessage } } = this.props
    switch (cluster.clusterType) {
      case 1:
        return formatMessage(intlMsg.clusterTypeOne)
      case 2:
        return formatMessage(intlMsg.clusterTypeTwo)
      case 3:
        return formatMessage(intlMsg.clusterTypeThree)
      case 4:
        return formatMessage(intlMsg.clusterTypeFour)
      case 5:
        return formatMessage(intlMsg.clusterTypeFive)
      default:
        break
    }
  },
  toggleLogVisible(clusterID, createStatus) {
    this.setState(({ logVisible }) => ({
      logVisible: !logVisible,
      logClusterID: clusterID,
      createStatus,
    }))
  },
  render () {
    const { cluster, form, clusterList, intl: { formatMessage } } = this.props
    const { editCluster, saveBtnLoading, logVisible, logClusterID, createStatus } = this.state
    const { getFieldProps } = form
    let {
      clusterName, apiHost, apiProtocol,
      apiVersion, bindingIPs,
      description, apiToken, isOk, isBuilder,
    } = cluster
    const apiUrl = `${apiProtocol}://${apiHost}`
    bindingIPs = parseArray(bindingIPs).join(', ')
    const nameProps = getFieldProps('clusterName',{
      rules: [
        {
          required: true,
          message: formatMessage(intlMsg.inputClusterName),
        },
        {
          validator: (rule, value, callback) => {
            if (value && value.length > 30) {
              return callback([new Error('集群名称不能超过30个字符')])
            }
            callback()
          }
        }
      ],
      initialValue: clusterName
    });
    const descProps = getFieldProps('description',{
      rules: [
        { required: false },
      ],
      initialValue: description
    });
    const dropdown = (
      <Menu onClick={this.deleteCluster} style={{ width: "100px" }} className={cluster.createStatus === 3 && 'shinning'}>
        <Menu.Item>
          删除集群
        </Menu.Item>
      </Menu>
    );
    return (
      <Card className="ClusterInfo">
        <div className="h3">集群信息
          { !editCluster ?
          <Dropdown.Button overlay={dropdown} type="ghost" className={cluster.createStatus === 3 && 'shinning'} style={{float:'right',marginTop:'6px'}} onClick={()=> this.setState({editCluster: true,selectedBuilderEnvironment:isBuilder})}>
            <FormattedMessage {...intlMsg.editCluster}/>
          </Dropdown.Button>

          :
          <div style={{float:'right'}}>
            <Button
              onClick={()=> {
                this.setState({editCluster: false, saveBtnLoading: false,selectedBuilderEnvironment:isBuilder})
                saveBtnDisabled = true
              }}>
              <FormattedMessage {...intlMsg.cancel}/>
            </Button>
            <Button
              loading={saveBtnLoading}
              disabled={saveBtnDisabled}
              type="primary" style={{marginLeft:'8px'}}
              onClick={this.updateCluster}>
              <FormattedMessage {...intlMsg.save}/>
            </Button>
          </div>
          }
        </div>
        <div className="imgBox">
          <img src={clusterImg}/>
        </div>
        <Form className="clusterTable" style={{padding:'35px 0',textAlign:'left'}}>
          <div className="formItem">
            <Form.Item >
              <div className="h4 blod"><FormattedMessage {...intlMsg.clusterName}/>：</div>
              { editCluster ?
                <Input {...nameProps} placeholder={formatMessage(intlMsg.inputClusterName)} />
                :
                <div className="blod cluserName textoverflow">{clusterName}</div>
              }
            </Form.Item>
            <Form.Item>
              <div className="h4">API Server：</div>
              <div className="textoverflow">{apiUrl}</div>
            </Form.Item>
            {
              cluster.clusterType === 4 && !apiToken ?
                <Form.Item>
                  <div className="h4">认证方式：</div>
                  <Tooltip title={apiToken} placement="topLeft">
                    <div className="textoverflow" style={{cursor: 'pointer'}}>kubeConfig</div>
                  </Tooltip>
                </Form.Item>
                :
                <Form.Item>
                  <div className="h4">API Token：</div>
                  <Tooltip title={apiToken} placement="topLeft">
                    <div className="textoverflow" style={{cursor: 'pointer'}}>{apiToken}</div>
                  </Tooltip>
                </Form.Item>
            }
          </div>
          <div className="formItem">
            <Form.Item>
              <div className="h4 blod">&nbsp;</div>
            </Form.Item>
            <Form.Item style={{textAlign:'left'}}>
              <span className="h5" style={{verticalAlign:'top',lineHeight:'30px'}}>{formatMessage(intlMsg.status)}：&nbsp;&nbsp;</span>
              {
                isOk
                ? <span style={{ color: '#33b867' }}><i className="fa fa-circle"></i> <FormattedMessage {...intlMsg.normal}/></span>
                : <span style={{ color: '#f23e3f' }}>
                    <i className="fa fa-circle"></i> <FormattedMessage {...intlMsg.abnormal}/>
                  </span>
              }
              {
                [3, 5].includes(cluster.createStatus) &&
                <span className="themeColor pointer" style={{ marginLeft: 8 }} onClick={() => this.toggleLogVisible(cluster.clusterID, cluster.createStatus)}>查看日志</span>
              }
            </Form.Item>
            <Form.Item>
              <div style={{float:'left',height:'40px'}}>{formatMessage(intlMsg.buildEnv)}：</div>
                {
                  editCluster
                    ? this.eidtClusterBuilderEnvironment()
                    : <span>{this.eidtFasleCheckbox()}<FormattedMessage {...intlMsg.clusterForBuildImg}/></span>
                }
            </Form.Item>
          </div>
          <div className="formItem">
            <Form.Item>
              <div className="h4 blod">&nbsp;</div>
            </Form.Item>
            <Form.Item className="clusterSourceBox">
              <span className="h5 clusterSourceLabel">{formatMessage(intlMsg.clusterSource)}：</span>
              <span className="clusterSource"><Ellipsis>{this.renderClusterSource()}</Ellipsis></span>
            </Form.Item>
            <Form.Item>
              <span className="h5" style={{display: 'inline-block',verticalAlign:'top',lineHeight:'30px'}}><FormattedMessage {...intlMsg.description}/>：&nbsp;&nbsp;</span>
              { editCluster ?
              <Input {...descProps} type="textarea" autosize={{minRows: 1, maxRows: 2}} placeholder={formatMessage(intlMsg.addDescription)} defaultValue={description} />
              :
                <span>{description || '-'}</span>
              }
            </Form.Item>
          </div>
        </Form>
        <Modal title={formatMessage(intlMsg.deleteCluster)}
          confirmLoading={this.state.deleteClusterBtnLoading}
          className='deleteClusterModal'
          visible={this.state.deleteClusterModal}
          onOk={this.confirmDeleteCluster}
          onCancel={() => this.setState({deleteClusterModal: false})}>
          <div className="deleteRow">
            <i className="fa fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            <FormattedMessage {...intlMsg.confirmDelete}/>“{clusterName}”？
          </div>
          {
            this.clusterListLength().length == 1
              ? <div>
                  <div className="note"><FormattedMessage {...intlMsg.tip}/>：</div>
                  <div className="note"><span style={{border:'1px solid red',borderRadius:'50%',width:'14px',height:"14px",display:'inline-block',lineHeight:'14px',textAlign:'center'}}>1</span>、该操作会导致将选中的集群与当前控制台Portal解绑，完全脱离当前控制台的管理，但不影响该集群的容器应用等的运行状态。</div>
                  <div className="note"><span style={{border:'1px solid red',borderRadius:'50%',width:'14px',height:"14px",display:'inline-block',lineHeight:'14px',textAlign:'center'}}>2</span>、删除集群后将没有构建环境，导致构建镜像功能无法正常使用。</div>
            </div>
              :  <div className="note"><FormattedMessage {...intlMsg.cautionDeleteCluster}/></div>
          }
        </Modal>
        <Modal
          title={formatMessage(intlMsg.tip)}
          visible={this.state.selectBuilderEnvironmentModal}
          onOk={this.confirmSelectCurrentCluster}
          onCancel={this.cancleSelectCurrentCluster}
        >
          <div style={{color:"#00a0ea"}}>
            <i className="fa fa-question-circle-o" aria-hidden="true" style={{marginRight:'12px'}}></i>
            <FormattedMessage values={{ clusterName }} {...intlMsg.onlySupportOneCluster}/>
            <div><FormattedMessage values={{ clusterName }} {...intlMsg.cicdToNewHarbor}/></div>
            <div><FormattedMessage values={{ clusterName }} {...intlMsg.configPipelineCluster}/></div>
            <div><FormattedMessage values={{ clusterName }} {...intlMsg.sureChangeBuild}/></div>
              {/*目前只支持一个集群作为构建环境，是否确定取消集群 [ {this.clusterListLength().currentClusterName} ] 作为构建环境，并选择集群 [ {clusterName} ] 作为构建环境*/}
            </div>
        </Modal>
        {
          logVisible &&
          <CreateClusterLog
            visible={logVisible}
            logClusterID={logClusterID}
            createStatus={createStatus}
            onCancel={() => this.toggleLogVisible()}
          />
        }
      </Card>
    )
  }
})

function parseArray(array) {
  try {
    array = JSON.parse(array)
  } catch (error) {
    array = []
  }
  return array
}

function formChange(porps, fileds) {
  saveBtnDisabled = false
}

ClusterInfo = Form.create({
  onFieldsChange: formChange
})(ClusterInfo)

function mapStateToProps(state, props) {
  const { cluster, entities } = state
  const { current } = entities
  let clusterList = cluster.clusters.clusterList || []
  const addingHostsIntervalData = getDeepValue(state, ['cluster', 'addingHostsInterval', 'data'])
  return {
    clusterList,
    current,
    addingHostsIntervalData,
  }
}

export default connect(mapStateToProps, {
  updateCluster,
  loadClusterList,
  deleteCluster,
  updateClusterConfig,
  getProjectVisibleClusters,
})(injectIntl(ClusterInfo, {
  withRef: true,
}))
