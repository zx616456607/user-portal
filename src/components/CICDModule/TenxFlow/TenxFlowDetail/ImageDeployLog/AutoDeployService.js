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
import { Button, Input, Form, Radio, Modal , Select, Spin, Alert, Icon , message} from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import { gitCdRules , addCdRules , deleteCdRule} from '../../../../../actions/cicd_flow'
import './style/AutoDeployService.less'
import { browserHistory } from 'react-router';

const Option = Select.Option;
const RadioGroup = Radio.Group;
const createForm = Form.create;
const FormItem = Form.Item;

const menusText = defineMessages({
  tag: {
    id: 'CICD.Tenxflow.AutoDeployService.tag',
    defaultMessage: '镜像版本',
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
    defaultMessage: '注：通过服务对应的镜像版本选出要自动部署的服务，并配置好部署升级方式（即：TenxFlow构建出某镜像版本后，将对以下服务升级部署）',
  },
  addNow: {
    id: 'CICD.Tenxflow.AutoDeployService.addNow',
    defaultMessage: '立即部署应用',
  },
  tooltipsFirst: {
    id: 'CICD.Tenxflow.AutoDeployService.tooltipsFirst',
    defaultMessage: '检测到当前Flow构建生成的镜像，还未部署过应用或服务，请先使用该镜像直接创建',
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
let AutoDeployService = React.createClass({
  getInitialState: function () {
    return {
      tag:'',
      editingList: {tag:''}, 
      value: 1
      }
  },
  componentWillMount() {
    const {gitCdRules,form, flowId} = this.props
    const _this = this
    gitCdRules(flowId, {
      success: {
        func: (res) => {
          const rulesList = res.data.results
          const editingList = {}
          // rulesList.map((item, index) => {
          //   uuid++;
          //   let keys = form.getFieldValue('rulesList');
          //   keys = keys.concat(uuid);
          //   console.log(keys)
          //   form.setFieldsValue({
          //     'rulesList': keys
          //   });
          // });
          for (let i = 0; i < rulesList.length; i++) {
            editingList[rulesList[i].ruleId] = false
          }
          this.setState({
            editingList,
            value:1,
            tag:''
          })
        }, 
        isAsync: true
      }
    })
  },
  changeEdit(index) {
    const editingList = Object.assign({},this.state.editingList)
    editingList[index] = true
    this.setState({
     editingList,
    })
    //this function for user change the edit type
    //if the current edit type is false,then the current type will be change to the true
    //if the current edit type is true,then the form will be submit and change to the false
    // const { editing } = this.state;
    // if (!editing) {
    //   //it's meaning editing is false
    //   this.setState({
    //     editing: true
    //   });
    // } else {
    //   //it's meaning editing is true
    //   // e.preventDefault();
    //   this.props.form.validateFields((errors, values) => {
    //     if (errors) {
    //       return;
    //     }
    //     this.setState({
    //       editing: false
    //     });
    //   });
    // }
  },
  cancelEdit(index) {
    const editingList = Object.assign({},this.state.editingList)
    editingList[index] = false
    this.setState({
     editingList,
    })
  },
  removeRule(ruleId) {
    const flowId = this.props.flowId
    const self = this
    Modal.confirm({
      title: '删除自动部署服务',
      content: '您是否确认要删除这项内容',
      onOk() {
        self.props.deleteCdRule(flowId, ruleId, {
          success: {
            func: ()=>{
              message.success('删除成功')
            }
          }
        })
       
      },
      onCancel() {},
    })
  },
  updateReule(item) {
    console.log('list in', item)
  },
  addDelpoy() {
    uuid++;
    const { form } = this.props;
    // can use data-binding to get
    let keys = form.getFieldValue('rulesList');
    keys = keys.concat(uuid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys,
    });
  },
  setStateValue(types, e) {
    this.setState({
      [types]: e.target.value
    })
  },
  addReule() {
    // @ push reule 
    const config = {
      flowId: this.props.flowId,
      image_name: this.state.image_name,
      tag: this.state.tag,
      binding_service:{
        cluster_id: this.state.cluster_id,
        deployment_name: this.state.deployment_name,
        deployment_id: this.state.deployment_id
      },
      upgrade_strategy: this.state.value,
    }
    if (!config.tag) {
      message.info('请输入镜像版本')
      return
    }
    if (!config.binding_service.cluster_id) {
      message.info('集群Id不能为空')
      return
    }
    if (!config.image_name) {
      message.info('应用名称不能为空')
      return
    }
    if (!config.binding_service.deployment_name) {
      message.info('服务名称不能为空')
      return
    }
    const {addCdRules, gitCdRules ,flowId} = this.props
    addCdRules(config, {
      success:　{
        func:　()=>{
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
                value:1,
                image_name:'',
                cluster_id: '',
                deployment_name:'',
                tag:'',
                deployment_id:''
              })
            }, 
          }
          })
        },
        isAsync: true
      }
    })
  },
  render() {
    const { formatMessage } = this.props.intl;
    const { getFieldProps, getFieldValue } = this.props.form;
    getFieldProps('rulesList', {
      initialValue: [0],
    });
    const haveTag = true;
    const { cdRulesList , isFetching} = this.props
    const self = this
    if(isFetching || cdRulesList == {} || !Boolean(cdRulesList)) {
      return (
        <div> </div>
      )
    }
    let items = cdRulesList.map((item, index) => {
      // rulesList

      // let items = getFieldValue('rulesList').map((i= i-1) => {
      const tagSelect = getFieldProps('tagSelect' + item.ruleId, {
        rules: [
          { required: true, message: '请选择' },
        ],
        // initialValue: item.tag
      });
      const selectProps = getFieldProps('serviceSelect' + item.ruleId, {
        rules: [
          { required: true, message: '请选择' },
        ],
        // initialValue: item.bindingDeploymentName
      });
      const updateType = getFieldProps('radio' + item.ruleId, {
        // initialValue: item.upgradeStrategy
      });
      if (self.state != null && self.state.editingList) {
      return (
        <div className='tagDetail'>
          <Form.Item key={'tag' + item.ruleId} className='tag commonItem'>
            <Input defaultValue={item.tag} disabled={!self.state.editingList[item.ruleId]} />
          </Form.Item>

          <Form.Item key={'name' + item.ruleId} className='service commonItem'>
            <Input defaultValue={item.imageName} disabled={!self.state.editingList[item.ruleId]} />
          </Form.Item>

          <Form.Item key={'cluster' + item.ruleId} className='service commonItem'>
            <Input defaultValue={item.bindingClusterId} disabled={!self.state.editingList[item.ruleId]} />
          </Form.Item>

          <Form.Item key={'binding_service' + item.ruleId} className='service commonItem'>
            <Input defaultValue={item.bindingDeploymentId} disabled={!self.state.editingList[item.ruleId]} />
          </Form.Item>

          <Form.Item key={'select' + item.ruleId} className='service commonItem'>
            <Input defaultValue={item.bindingDeploymentName} disabled={!self.state.editingList[item.ruleId]} />
            
          </Form.Item>


          <Form.Item key={'radio' + item.ruleId} className='updateType commonItem'>
            <RadioGroup {...updateType} disabled={self.state.editingList[item.ruleId] ? false : true} >
              <Radio key='a' value={item.upgradeStrategy == 1 ? 1 : null}><FormattedMessage {...menusText.normalUpdate} /></Radio>
              <Radio key='b' value={item.upgradeStrategy == 2 ? 2 : null}><FormattedMessage {...menusText.imageUpdate} /></Radio>
            </RadioGroup>
          </Form.Item>
          <div className='opera commonItem'>
            <div className='btnBox'>
              {!self.state.editingList[item.ruleId] ? [
                <span><Icon type="edit" onClick={() => self.changeEdit(item.ruleId)} />
                  <Icon type="delete" onClick={() => self.removeRule(item.ruleId)} style={{ marginLeft: '15px' }} />
                </span>
              ] :
                [
                <span>
                  <Button className='cancelBtn' size='large' type='ghost' onClick={()=>self.updateReule(item)}>
                    <FormattedMessage {...menusText.confirm} />
                  </Button>

                  <Button className='cancelBtn' style={{marginLeft:'10px'}} size='large' type='ghost' onClick={()=>self.cancelEdit(item.ruleId)}>
                    <FormattedMessage {...menusText.cancel} />
                  </Button>
                </span>
                ]
              }
            </div>
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      )
      }
      
    })

    return (
      <div id='AutoDeployService' key='AutoDeployService'>
        <div className='title'>
          <FormattedMessage {...menusText.title} />
        </div>
        <div className='paddingBox'>
          <Alert message={<FormattedMessage {...menusText.tooltips} />} type='info' />
          <div className='btnBox'>
            {/* {haveTag ? [
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
            */}
          </div>
          <Form className='tagForm' horizontal form={this.props.form}>
            {haveTag ? [
              <div>
                <div className='tagTitle'>
                  <span className='tag commonTitle'>
                    <FormattedMessage {...menusText.tag} />
                  </span>
                  <span className='service commonTitle'>
                    镜像名称
                  </span>
                  <span className='service commonTitle'>
                    集群
                  </span>
                  <span className='service commonTitle'>
                    服务Id
                  </span>
                  <span className='service commonTitle'>
                    服务名称
                  </span>
                  <span className='updateType commonTitle'>
                    <FormattedMessage {...menusText.updateType} />
                  </span>
                  <span className='opera commonTitle'>
                    <FormattedMessage {...menusText.opera} />
                  </span>
                  <div style={{ clear: 'both' }}></div>
                </div>
                
                {items}
                <div className="tagDetail">
                  <div className='tag commonItem'>
                    <Input size="large" value={this.state.tag} onChange={(e)=>this.setStateValue('tag', e)}  placeholder="输入镜像版本"/>
                  </div>
                  <div className='service commonItem'>
                    <Input size="large" value={this.state.image_name} onChange={(e)=>this.setStateValue('image_name', e)}  placeholder="镜像名称"/>
                  </div>
                  <div key='cluster' className='service commonItem'>
                    <Input size="large" value={this.state.cluster_id} onChange={(e)=>this.setStateValue('cluster_id', e)}  placeholder="输入集群Id" />
                  </div>

                  <div key='select' className='service commonItem'>
                    <Input size="large" value={this.state.deployment_id} onChange={(e)=>this.setStateValue('deployment_id', e)}  placeholder="服务Id" />
                    
                  </div>
                  <div key='imageName' className='service commonItem'>
                    <Input size="large" value={this.state.deployment_name} onChange={(e)=>this.setStateValue('deployment_name', e)}  placeholder="服务名称"/>
                  </div>


                  <div className='updateType commonItem'>
                    <RadioGroup onChange={(e)=>this.setStateValue('value',e)} value={this.state.value}>
                      <Radio key='a' value='1'><FormattedMessage {...menusText.normalUpdate} /></Radio>
                      <Radio key='b' value='2'><FormattedMessage {...menusText.imageUpdate} /></Radio>
                    </RadioGroup>
                  </div>
                  <div className='opera commonItem'>
                    <Button className='cancelBtn' size='large' type='primary' onClick={()=>self.addReule()}>
                      <FormattedMessage {...menusText.confirm} />
                    </Button>
                    
                  </div>

                </div>
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
          {/*
          <div className='addBtn' onClick={this.addDelpoy}>
            <Icon type='plus-circle-o' /><FormattedMessage {...menusText.add} />
          </div>
        */}

        </div>
      </div>
    );
  },
});

function mapStateToProps(state, props) {
  const defaultConfig = {
    isFetching: false,
    cdRulesList: []
  }
  const { getCdRules } = state.cicd_flow
  const { cdRulesList, isFetching } = getCdRules || defaultConfig
  return {
    isFetching,
    cdRulesList
  }
}

AutoDeployService = createForm()(AutoDeployService);

AutoDeployService.propTypes = {
  intl: PropTypes.object.isRequired,
}

export default connect(mapStateToProps, {
  gitCdRules,
  addCdRules,
  deleteCdRule
})(injectIntl(AutoDeployService, {
  withRef: true,
}));

