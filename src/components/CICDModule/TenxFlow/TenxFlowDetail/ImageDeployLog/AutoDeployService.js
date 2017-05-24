/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * AutoDeployService component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Button, Input, Form, Radio, Modal, Select, Spin, Alert, Icon, message ,Popover , Tooltip} from 'antd'
import { Link ,browserHistory} from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { gitCdRules, addCdRules, deleteCdRule, putCdRule, getCdInimage } from '../../../../../actions/cicd_flow'
import { loadAppList } from '../../../../../actions/app_manage'
import './style/AutoDeployService.less'
import NotificationHandler from '../../../../../common/notification_handler'

const Option = Select.Option;
const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;

const menusText = defineMessages({
  match_tag: {
    id: 'CICD.Tenxflow.AutoDeployService.tag',
    defaultMessage: '匹配规则',
  },
  service: {
    id: 'CICD.Tenxflow.AutoDeployService.service',
    defaultMessage: '服务',
  },
  updateType: {
    id: 'CICD.Tenxflow.AutoDeployService.updateType',
    defaultMessage: '升级策略',
  },
  opera: {
    id: 'CICD.Tenxflow.AutoDeployService.opera',
    defaultMessage: '操作',
  },
  confirm: {
    id: 'CICD.Tenxflow.AutoDeployService.confirm',
    defaultMessage: '确定',
  },
  cancel: {
    id: 'CICD.Tenxflow.AutoDeployService.cancel',
    defaultMessage: '取消',
  },
  add: {
    id: 'CICD.Tenxflow.AutoDeployService.add',
    defaultMessage: '添加自动部署配置',
  },
  edit: {
    id: 'CICD.Tenxflow.AutoDeployService.edit',
    defaultMessage: '编辑',
  },
  title: {
    id: 'CICD.Tenxflow.AutoDeployService.title',
    defaultMessage: '自动部署服务',
  },
  tooltips: {
    id: 'CICD.Tenxflow.AutoDeployService.tooltips',
    defaultMessage: '1. 通过服务对应的镜像版本选出要自动部署的服务，并配置好部署升级方式（即：TenxFlow构建出某镜像版本后，将对以下服务升级部署）',
  },
  tooltips2: {
    id: 'CICD.Tenxflow.AutoDeployService.tooltips2',
    defaultMessage: '2. 除当前TenxFlow生成镜像会触发自动部署，其他更新镜像途径只要匹配部署规则（比如Docker push 对应版本镜像到仓库），也可触发自动部署'
  },
  addNow: {
    id: 'CICD.Tenxflow.AutoDeployService.addNow',
    defaultMessage: '立即部署应用',
  },
  tooltipsFirst: {
    id: 'CICD.Tenxflow.AutoDeployService.tooltipsFirst',
    defaultMessage: '检测到当前TenxFlow构建生成的镜像，还未部署过应用或服务，请先使用该镜像直接创建',
  },
  tooltipsSecond: {
    id: 'CICD.Tenxflow.AutoDeployService.tooltipsSecond',
    defaultMessage: '【单服务应用】或者创建其它【多服务应用】使用该镜像创建子服务',
  },
  normalUpdate: {
    id: 'CICD.Tenxflow.AutoDeployService.normalUpdate',
    defaultMessage: '普通升级',
  },
  imageUpdate: {
    id: 'CICD.Tenxflow.AutoDeployService.imageUpdate',
    defaultMessage: '灰度升级',
  },

})

let uuid = 0;
let provinceData = []
let AutoDeployService = React.createClass({
  getInitialState: function () {
    return {
      match_tag: '',
      editingList: { match_tag: '' },
      value: 1,
      serviceList: [],
      storageMounted: {},
      addDelpoyRow: false
    }
  },
  componentWillMount() {
    const {gitCdRules, form, flowId, getCdInimage } = this.props
    const _this = this
    gitCdRules(flowId, {
      success: {
        func: (res) => {
          const rulesList = res.data.results
          const editingList = {}
          for (let i = 0; i < rulesList.length; i++) {
            editingList[rulesList[i].ruleId] = false
          }
          this.setState({
            editingList,
            cdRulesList: rulesList,
            value: 1,
            match_tag: ''
          })
        },
        isAsync: true
      }
    })
    getCdInimage(flowId)
  },
  componentDidMount() {
    const { loadAppList, cluster} = this.props
    const self = this
    loadAppList(cluster, { size: 50 }, {
      success: {
        func: (res) => {
          self.setState({
            serviceList: res.data
          })

        }
      }
    })
  },
  changeEdit(index) {
    const editingList = Object.assign({}, this.state.editingList)
    editingList[index] = true
    this.setState({
      editingList,
    })
    //this function for user change the edit type
    //if the current edit type is false,then the current type will be change to the true
    //if the current edit type is true,then the form will be submit and change to the false

  },
  cancelEdit(index) {
    const editingList = Object.assign({}, this.state.editingList)
    editingList[index] = false
    this.setState({
      editingList
    })
    const {form} = this.props
    form.resetFields()
  },
  removeRule() {
    const flowId = this.props.flowId
    const self = this
    this.setState({delAuthModal: false})
    let notification = new NotificationHandler()
    notification.spin(`自动部署服务规则删除中...`)
    self.props.deleteCdRule(flowId, this.state.ruleId, {
      success: {
        func: () => {
          notification.close()
          notification.success(`自动部署服务规则删除成功`)
        }
      },
      failed: {
        func: () => {
          notification.close()
          notification.error(`自动部署服务规则删除失败`)
        }
      }
    })

  },
  updateReule(item) {
    // console.log('list in', item.ruleId)
    const self = this
    const { form } = this.props;
    const body = form.getFieldValue('rulesList')
    form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      let deployName = values[`bindDeploymentName${item.ruleId}`]
      const bindName = deployName.split('&@')[0]
      const config = {
        ruleId: item.ruleId,
        flowId: item.flowId,
        image_name: values[`imageSelect${item.ruleId}`],
        match_tag: values[`tagSelect${item.ruleId}`],
        binding_service: {
          cluster_id: values[`cluster${item.ruleId}`],
          deployment_name: bindName,
          deployment_id: values[`bindDeploymentId${item.ruleId}`],
        },
        upgrade_strategy: values[`radio${item.ruleId}`],
      }
      let notification = new NotificationHandler()
      self.props.putCdRule(config, {
        success: {
          func: () => {
            const editingList = Object.assign({}, this.state.editingList)
            editingList[item.ruleId] = false
            this.setState({
              editingList,
            })
            notification.success('更新成功')
          }
        }
      })

    });
  },
  addDelpoy() {
    if (this.state.serviceList.length ==0) {

    }
    this.setState({ addDelpoyRow: true })
  },
  getAppList(cluster, imageName) {
    const self = this
    const { loadAppList} = this.props
    // const imageName = this.state.image_name
    loadAppList(cluster, { size: 50 }, {
      success: {
        func: (res) => {
          let provinceData = []
          let storageMounted = {}
          if (res.data.length > 0) {
            res.data.forEach((item) => {
              if (item.services.length > 0) {
                item.services.forEach((service) => {
                  if (service.spec.template.spec.volumes && service.spec.template.spec.volumes.length > 0) {
                    service.spec.template.spec.volumes.forEach((vol) => {
                      if (vol.rbd) {
                        storageMounted[service.metadata.name] = true
                      }
                    })
                  }
                  service.spec.template.spec.containers.forEach((container) => {
                    let substrs = container.image.split(imageName)
                    //按imageName分隔
                    if (substrs.length == 2 && substrs[0][substrs[0].length - 1] == '/' && (substrs[1].length == 0 || substrs[1][0] == ':') ) {
                      // 如分隔成两部分且前一部分为‘仓库/’，后一部分为‘:tag’或无tag时
                      provinceData.push({
                        imagename: service.metadata.name,
                        bindId: service.metadata.uid
                      })
                    }
                  })
                })
              }
            })
          }
          // console.log(provinceData)
          self.setState({
            serviceList: provinceData,
            storageMounted,
            deployment_id: provinceData.length > 0 ? provinceData[0].bindId : '',
            deployment_name: provinceData.length > 0 ? provinceData[0].imagename : ''
          })
        }
      }
    })
  },
  setStateValue(types, e) {
    this.setState({
      [types]: e
    })
    const cluster = this.state.cluster_id ? this.state.cluster_id : this.props.cluster
    if (types === 'image_name') {
      this.getAppList(cluster, e)
    }
  },
  setStateCluster(e) {
    this.setState({
      cluster_id: e
    })
    this.getAppList(e, this.state.image_name)

  },
  setStateType(types, e) {
    this.setState({
      [types]: e.target.value
    })
  },
  setStateService(e) {
    const names = e.split('&@')[0]
    const ids = e.split('&@')[1]
    this.setState({
      deployment_name: names,
      deployment_id: ids
    })
  },
  addRule() {
    // @ push reule
    let strategy = this.state.storageMounted[this.state.deployment_name] ? 1 : this.state.value
    const config = {
      flowId: this.props.flowId,
      image_name: this.state.image_name,
      match_tag: this.state.match_tag,
      binding_service: {
        cluster_id: this.state.cluster_id,
        deployment_name: this.state.deployment_name,
        deployment_id: this.state.deployment_id
      },
      upgrade_strategy: strategy,
    }
    let notification = new NotificationHandler()
    if (!config.binding_service.cluster_id) {
      notification.info('请选择集群名称')
      return
    }
    if (!config.image_name) {
      notification.info('请选择镜像名称')
      return
    }
    if (!config.binding_service.deployment_name) {
      notification.info('请选择服务名称')
      return
    }
    if (!config.match_tag) {
      notification.info('请选择镜像版本')
      return
    }
    const {addCdRules, gitCdRules, flowId} = this.props
    addCdRules(config, {
      success: {
        func: () => {
          gitCdRules(flowId, {
            success: {
              func: (res) => {
                const rulesList = res.data.results
                const editingList = {}
                for (let i = 0; i < rulesList.length; i++) {
                  editingList[rulesList[i].ruleId] = false
                }
                this.setState({
                  editingList,
                  value: 1,
                  image_name: '',
                  cluster_id: '',
                  deployment_name: '',
                  match_tag: '',
                  deployment_id: ''
                })
              },
            }
          })
        },
        isAsync: true
      }
    })
  },
  cancelReule() {
    this.setState({
      addDelpoyRow: false,
      value: 1,
      image_name: '',
      cluster_id: '',
      deployment_name: '',
      match_tag: '',
      deployment_id: ''
    })
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { getFieldProps, getFieldValue } = this.props.form;
    getFieldProps('rulesList', {
      initialValue: [0],
    });
    const haveTag = true;
    const { cdRulesList, isFetching} = this.props
    const self = this
    if (isFetching || cdRulesList == {} || !Boolean(cdRulesList)) {
      return (
        <div> </div>
      )
    }
    const content = (
      <a>
        <Button type="primary" onClick={()=> browserHistory.push(`/app_manage/app_create/fast_create?query=${this.state.image_name}`)}>马上创建</Button>
      </a>
    );
    const {clusterList, cdImageList} = this.props

    const imageOptions = cdImageList.map(item => <Option key={item}>{item}</Option>)
    const clusterOptions = clusterList.map(list => <Option key={list.clusterID}>{list.clusterName}</Option>)
    const appListOptions = []
    if (this.state.serviceList.length > 0) {
      this.state.serviceList.forEach((item) => {
        appListOptions.push(<Option key={item.imagename + '&@' + item.bindId}>{item.imagename}</Option>)
      })
    }
    let items = cdRulesList.map((item, index) => {
      // let items = getFieldValue('rulesList').map((i= i-1) => {
      const tagSelect = getFieldProps('tagSelect' + item.ruleId, {
        rules: [
          { required: true, message: "请选择镜像版本" }
        ],
        initialValue: item.matchTag == 1 ? '匹配版本' : '不匹配版本',
      });
      const imageSelect = getFieldProps('imageSelect' + item.ruleId, {
        rules: [
          { required: true, message: "请选择镜像名称" }
        ],
        initialValue: item.imageName
      });
      const clusterSelect = getFieldProps('cluster' + item.ruleId, {
        rules: [
          { required: true, message: "请选择集群" }
        ],
        initialValue: item.bindingClusterId
      });
      const serviceNameSelect = getFieldProps('bindDeploymentName' + item.ruleId, {
        rules: [
          { required: true, message: "请选择服务名称" }
        ],
        initialValue: item.bindingDeploymentName
      });
      const serviceIdSelect = getFieldProps('bindDeploymentId' + item.ruleId, {
        rules: [
          { required: true, message: "请选择服务名称" }
        ],
        initialValue: item.bindingDeploymentId
      });
      const updateType = getFieldProps('radio' + item.ruleId, {
        initialValue: item.upgradeStrategy
      });
      if (self.state != null && self.state.editingList) {
        return (
          <div className='tagDetail' key={item.ruleId}>
            <Form.Item key={'imageSelect' + item.ruleId} className='service commonItem'>
              <Select size="large"  {...imageSelect} disabled={!self.state.editingList[item.ruleId]}>
                {imageOptions}
              </Select>
            </Form.Item>

            <Form.Item key={'cluster' + item.ruleId} className='service commonItem'>
              <Select size="large"  {...clusterSelect} disabled={!self.state.editingList[item.ruleId]}>
                {clusterOptions}
              </Select>
            </Form.Item>

            <Form.Item key={'select' + item.ruleId} className='service commonItem'>
              <Select size="large"  {...serviceNameSelect} disabled={!self.state.editingList[item.ruleId]}>
              </Select>

            </Form.Item>
            <Form.Item key={'selectId' + item.ruleId} className='service commonItem' style={{ display: 'none' }}>
              <Select size="large"  {...serviceIdSelect}>
              </Select>
            </Form.Item>

            <Form.Item key={'match_tag' + item.ruleId} className='tag commonItem'>
              <Select size="large"  {...tagSelect} disabled={!self.state.editingList[item.ruleId]}>
                <Option value="1">匹配版本</Option>
                <Option value="2">不匹配版本</Option>
              </Select>
            </Form.Item>

            <Form.Item key={'radio' + item.ruleId} className='updateType commonItem'>
              <RadioGroup {...updateType} disabled={self.state.editingList[item.ruleId] ? false : true} defaultValue={item.upgradeStrategy == 1 ? 1 : 2}>
                <Radio key='a' value={1} ><FormattedMessage {...menusText.normalUpdate} /></Radio>
                <Radio key='b' value={2} ><FormattedMessage {...menusText.imageUpdate} /></Radio>
              </RadioGroup>
            </Form.Item>
            <div className='opera commonItem'>
              <div className='btnBox'>
                {/*
                <span>
                  <Icon type="edit" onClick={() => self.changeEdit(item.ruleId)} />
                  <Icon type="delete" onClick={() => self.removeRule(item.ruleId)} style={{ marginLeft: '15px' }} />
                </span>
                */}
                {!self.state.editingList[item.ruleId] ? [
                  <Button type="ghost" onClick={() => self.setState({ruleId:item.ruleId, delAuthModal: true})}>删除</Button>
                ] :
                  [
                    <span>
                      <Button className='cancelBtn' style={{ marginRight: '10px' }} size='large' type='ghost' onClick={() => self.updateReule(item)}>
                        <FormattedMessage {...menusText.confirm} />
                      </Button>

                      <Button className='cancelBtn' size='large' type='ghost' onClick={() => self.cancelEdit(item.ruleId)}>
                        <FormattedMessage {...menusText.cancel} />
                      </Button>
                    </span>
                  ]
                }
              </div>
            </div>

          </div>
        )
      }

    })

    let isVolMounted = this.state.storageMounted[this.state.deployment_name]
    let strategyGroup = (
      <div className='updateType commonItem'>
        <RadioGroup disabled={isVolMounted} onChange={(e) => this.setStateType('value', e)} value={this.state.value}>
          <Radio key='a' value={1}><FormattedMessage {...menusText.normalUpdate} /></Radio>
          <Radio key='b' value={2}><FormattedMessage {...menusText.imageUpdate} /></Radio>
        </RadioGroup>
      </div>
    )

    return (
      <div id='AutoDeployService' key='AutoDeployService'>
        <div className='title'>
          <FormattedMessage {...menusText.title} />
        </div>
        <div className='paddingBox'>
          <Alert message={<div><div><FormattedMessage {...menusText.tooltips} /></div><div><FormattedMessage {...menusText.tooltips2} /></div></div>} type='info' />

          {/* {haveTag ? [
          <div className='btnBox'>
              <Button className='editBtn' size='large' type='primary' onClick={this.changeEdit}>
                {this.state.editing ? formatMessage(menusText.confirm) : formatMessage(menusText.edit)}
              </Button>
            ] : null}
            {this.state.editing ? [
              <Button className='cancelBtn' size='large' type='ghost' onClick={this.cancelEdit}>
                <FormattedMessage {...menusText.cancel} />
              </Button>
            ] : null
            }
          </div>
            */}
          <Form className='tagForm' horizontal form={this.props.form}>
            {haveTag ? [
              <div>
                <div className='tagTitle'>
                  <span className='service commonTitle'>
                    镜像名称
                  </span>
                  <span className='service commonTitle'>
                    集群
                  </span>
                  <span className='service commonTitle'>
                    服务名称
                  </span>
                  <span className='tag commonTitle'>
                    <FormattedMessage {...menusText.match_tag} />
                  </span>
                  <span className='updateType commonTitle'>
                    <FormattedMessage {...menusText.updateType} />
                  </span>
                  <span className='opera commonTitle'>
                    <FormattedMessage {...menusText.opera} />
                  </span>
                </div>

                {items}
                {this.state.addDelpoyRow ?

                  <div className="tagDetail">
                    <div className='service commonItem' key='imageName'>
                      <Select size="large" onChange={(e) => this.setStateValue('image_name', e)} placeholder="镜像名称" >
                        {imageOptions}
                      </Select>
                    </div>

                    <div key='cluster' className='service commonItem'>
                      <Select size="large" onChange={(e) => this.setStateCluster(e)} placeholder="选择集群" >
                        {clusterOptions}
                      </Select>
                    </div>
                    <div key='appname' className='service commonItem'>
                      {this.state.deployment_name =='' ?
                       <Popover content={content} placement="rightTop" overlayClassName="autoTipsBox" title="在筛选条件下，无服务实例，您可以用该镜像立即创建一个服务" trigger="click">
                        <Input size="large" placeholder="请先选择镜像" disabled={this.state.cluster_id ? false : true}/>
                      </Popover>
                      :
                      [<Select size="large" value={this.state.deployment_name} disabled={this.state.cluster_id ? false : true} onChange={(e) => this.setStateService(e)} placeholder="服务名称" >
                         { appListOptions }
                      </Select>]
                    }
                    </div>
                    <div className='tag commonItem'>
                      <Select size="large" onChange={(e) => this.setStateValue('match_tag', e)} placeholder="选择镜像版本" >
                        <Option value="1">匹配版本</Option>
                        <Option value="2">不匹配版本</Option>
                      </Select>
                    </div>
                    {
                      isVolMounted ?
                        [<Tooltip placement='top' title="挂载存储卷的服务不支持灰度升级">
                           {strategyGroup}
                         </Tooltip>] :
                        strategyGroup
                    }
                    <div className='opera commonItem'>
                      <Button className='cancelBtn' type='primary' onClick={() => self.addRule()}>
                        添加
                    </Button>
                      <Button style={{ marginLeft: '10px' }} className='cancelBtn' type='ghost' onClick={() => self.cancelReule()}>
                        取消
                    </Button>
                    </div>
                  </div>
                  : null
                }
              </div>
            ] : [
                <div className='noTag'>
                  <Button className='delployBtn' size='large' type='primary'>
                    <FormattedMessage {...menusText.addNow} />
                  </Button>
                  <p><FormattedMessage {...menusText.tooltipsFirst} /></p>
                  <p><FormattedMessage {...menusText.tooltipsSecond} /></p>
                </div>
              ]}
          </Form>
          {this.props.cdImageList.length ==0 ?
          <Tooltip placement="top" title="当前 TenxFlow 没有 Docker 镜像生成，构建镜像后，方可实现自动化部署">
            <div className='addBtn'>
              <Icon type='plus-circle-o' /><FormattedMessage {...menusText.add} />
            </div>
          </Tooltip>
          :
          <div className='addBtn' onClick={this.addDelpoy}>
            <Icon type='plus-circle-o' /><FormattedMessage {...menusText.add} />
          </div>
          }

          <Modal title="删除自动部署操作" visible={this.state.delAuthModal}
          onOk={()=> this.removeRule()} onCancel={()=> this.setState({delAuthModal: false})}
          >
            <div className="modalColor"><i className="anticon anticon-question-circle-o" style={{marginRight: '8px'}}></i>您是否确定要删除自动部署这项操作?</div>
          </Modal>
        </div>
      </div>
    );
  }
});

function mapStateToProps(state, props) {
  const defaultConfig = {
    isFetching: false,
    cdRulesList: []
  }
  const { cluster } = state.entities.current
  const { getCdRules, getCdImage} = state.cicd_flow
  const { cdRulesList, isFetching } = getCdRules || defaultConfig
  const { cdImageList } = getCdImage || []
  const { teamClusters } = state.team
  const { result } = teamClusters

  return {
    isFetching,
    cdRulesList,
    cdImageList,
    cluster: cluster.clusterID,
    clusterList: result.data || [],
  }
}

AutoDeployService = createForm()(AutoDeployService);

AutoDeployService.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  gitCdRules,
  addCdRules,
  deleteCdRule,
  putCdRule,
  getCdInimage,
  loadAppList
})(injectIntl(AutoDeployService, {
  withRef: true,
}));

