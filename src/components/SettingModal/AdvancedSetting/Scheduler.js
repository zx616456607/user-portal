/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2018 TenxCloud. All Rights Reserved.
 *
 * Scheduler component
 *
 * v0.1 - 2018-04-17
 * @author lvjunfeng
 */

import React, { Component } from 'react'
import { Checkbox, Spin, Modal, Icon, Form, Radio, Button, Card, Tooltip } from 'antd';
import './style/scheduler.less'
import { connect } from 'react-redux'
import { updateClusterConfig } from '../../../actions/cluster'
import { setCurrent } from '../../../actions/entities'
import { getProjectVisibleClusters } from '../../../actions/project'
import { loadLoginUserDetail } from '../../../actions/entities'
import NotificationHandler from '../../../components/Notification'
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class Scheduler extends Component {
  constructor(props) {
    super(props)
    this.shouldUserSchedulePoint = this.shouldUserSchedulePoint.bind(this)
    this.handleChangeEditionScheduler = this.handleChangeEditionScheduler.bind(this)
    this.handleCandleEditionScheduler = this.handleCandleEditionScheduler.bind(this)
    this.hanldeSaveEditionScheduler = this.hanldeSaveEditionScheduler.bind(this)
    this.handleUtilizationRate = this.handleUtilizationRate.bind(this)
    this.handleResourceCheckBox = this.handleResourceCheckBox.bind(this)
    this.handleSinglePoint = this.handleSinglePoint.bind(this)
    this.handleClassCheckBox = this.handleClassCheckBox.bind(this)
    this.handleTopCheckBox = this.handleTopCheckBox.bind(this)
    this.schedulerClassify = this.schedulerClassify.bind(this)
    this.setInititalStatus = this.setInititalStatus.bind(this)
    // this.hanldeSetScheduler = this.hanldeSetScheduler.bind(this)
    this.state = {
      startEdition: true,
      singleCheckBox: true,
      classCheckBox: true,
      topCheckBox: true,
      resourceCheckBox: true,
      utilizationRate: 'least',
      listNodes: 1, // get的数据 listnodes 是旧的数据， 处理此情况
      // setScheduler: false,
    }
  }
  componentDidMount() {
    this.loadData()
  }

  loadData = () => {
    const { getProjectVisibleClusters, cluster, space } = this.props
    const { clusterID } = cluster
    getProjectVisibleClusters(space.namespace).then( res => {
      const { result } = res.response
      const { clusters } = result.data
      clusters.map( item => {
        if (item.clusterID === clusterID) {
          const { listNodes,  schedulerPolicy } = item
          const { request, balanced } = schedulerPolicy || { request: 'least', balanced: false }
          this.setInititalStatus(listNodes)
          this.setInititalUtilRate(request, balanced)
          return
        }
      })
    })
  }


  handleChangeEditionScheduler() {
    const { resetFields } = this.props.form
    this.setState({
      startEdition: false
    })
  }

  handleCandleEditionScheduler() {
    const { cluster } = this.props
    const { listNodes, schedulerPolicy  } = cluster
    const { request, balanced } = schedulerPolicy || { request: 'least', balanced: false }
    this.setInititalStatus(listNodes)
    this.setInititalUtilRate(request, balanced)
    this.setState({
      startEdition: true
    })
  }

  hanldeSaveEditionScheduler() {
    const { startEdition, singleCheckBox, classCheckBox, topCheckBox, utilizationRate, resourceCheckBox, setScheduler } = this.state
    const { form, saveSchedulerConfig } = this.props
    const { validateFields } = form
    const listData = {singleCheckBox, classCheckBox, topCheckBox, utilizationRate, resourceCheckBox }
    if (!singleCheckBox) {
      switch (classCheckBox) {
        case true:
          switch (topCheckBox) {
            case true:
              this.schedulerClassify(4)
              break;
            case false:
              this.schedulerClassify(3)
              break;
          }
          break;
        case false:
          switch (topCheckBox) {
            case true:
              this.schedulerClassify(2)
              break;
            case false:
              this.schedulerClassify(1)
              break;
          }
          break;
      }
    }else if (singleCheckBox) {
      switch (classCheckBox) {
        case true:
          switch (topCheckBox) {
            case true:
              this.schedulerClassify(8)
              break;
            case false:
              this.schedulerClassify(7)
              break;
          }
          break;
        case false:
          switch (topCheckBox) {
            case true:
              this.schedulerClassify(6)
              break;
            case false:
              this.schedulerClassify(5)
              break;
          }
          break;
      }
    }
    // this.setState({
    //   setScheduler: false
    // })
  }

  handleUtilizationRate(e) {
    const { utilizationRate, resourceCheckBox, listNodes } = this.state
    const { setFieldsValue } = this.props.form
    const newValue = e.target.value
    if (newValue == 'most') {
      this.setState({
        utilizationRate: newValue,
        resourceCheckBox: false
      })
      setFieldsValue( {'utilizationRate': newValue, 'resourceLevel':false,  } )
    }
    if (newValue == 'least') {
      this.setState({
        utilizationRate: newValue,
        resourceCheckBox: true,
      })
      setFieldsValue( {'utilizationRate': newValue, 'resourceLevel':true, } )
    }
  }

  handleResourceCheckBox(e) {
    const { resourceCheckBox } = this.state
    const { setFieldsValue } = this.props.form
    this.setState({
      resourceCheckBox: e.target.checked
    })
    setFieldsValue({ 'resourceLevel': e.target.checked })
  }

  shouldUserSchedulePoint() {
    return (
      <span>允许用户指定节点
        <Tooltip placement="top" title={this.singlePointHover()}>
          <Icon type="question-circle-o"  />
        </Tooltip>
      </span>
    )
  }

  singlePointHover() {
    return <div>
      <p>创建服务时，可以将服务对应</p>
      <p>容器实例，固定在节点或者某</p>
      <p>些标签的节点上来调度</p>
    </div>
  }

  handleSinglePoint(e) {
    const { singleCheckBox } = this.state
    this.setState({
      singleCheckBox: e.target.checked
    })
  }

  handleClassCheckBox(e) {
    const { classCheckBox } = this.state
    this.setState({
      classCheckBox: e.target.checked
    })
  }

  handleTopCheckBox(e) {
    const { topCheckBox } = this.state
    this.setState({
      topCheckBox: e.target.checked
    })
  }

  schedulerClassify(num) {
    const { utilizationRate, resourceCheckBox } = this.state
    const {updateClusterConfig, cluster, setCurrent} = this.props
    const {clusterID} = cluster
    const Notification = new NotificationHandler()
    if (!num) {
      return
    }
    const body = {
      listNodes: num,
      schedulerPolicy: {
        request: utilizationRate,
        balanced: resourceCheckBox
      }
    }
    updateClusterConfig( clusterID, body, {
      success: {
        func: () => {
          cluster.listNodes = num
          setCurrent({
            cluster,
          })
          Notification.spin('正在保存')
          this.setState({
            startEdition: true
          },() => {
            Notification.close()
            Notification.success('保存成功')
            this.loadData()
          })
        },
        isAsync: true
      },
      falied: {
        func: () => {
          Notification.close()
          Notification.falied('保存失败','请重新设置并保存')
        }
      }
    })
  }

  setInititalStatus(status = 0) {
    const { singleCheckBox, classCheckBox, topCheckBox } = this.state
    switch(status) {
      case 0:
      case 1:
        return this.setState({
          singleCheckBox: false,
          classCheckBox: false,
          topCheckBox: false
        })
      case 2:
        return this.setState({
          singleCheckBox: false,
          classCheckBox: false,
          topCheckBox: true
        })
      case 3:
        return this.setState({
          singleCheckBox: false,
          classCheckBox: true,
          topCheckBox: false
        })
      case 4:
        return this.setState({
          singleCheckBox: false,
          classCheckBox: true,
          topCheckBox: true
        })
      case 5:
        return this.setState({
          singleCheckBox: true,
          classCheckBox: false,
          topCheckBox: false
        })
      case 6:
        return this.setState({
          singleCheckBox: true,
          classCheckBox: false,
          topCheckBox: true
        })
      case 7:
        return this.setState({
          singleCheckBox: true,
          classCheckBox: true,
          topCheckBox: false
        })
      case 8:
        return this.setState({
          singleCheckBox: true,
          classCheckBox: true,
          topCheckBox: true
        })
      default:
        return;
    }
  }

  setInititalUtilRate(request, balanced) {
    this.setState({
      utilizationRate: request,
      resourceCheckBox: balanced,
    })
  }

  // hanldeSetScheduler() {
  //   const { startEdition } = this.state
  //   if ( !startEdition ){
  //     this.setState({
  //       setScheduler: !this.state.setScheduler
  //     })
  //   }
  // }
  render() {
    const { startEdition, singleCheckBox, classCheckBox, topCheckBox, utilizationRate, resourceCheckBox } = this.state
    const { form } = this.props
    const { getFieldProps  } = form

    return <div id='scheduler'>
      <div className='contentheader'>容器调度策略设置（所有集群）</div>
      <div className='contentbody firstCont'>
        <div className='contentbodytitle alertRow'>系统默认: 不允许『节点端口』被其他容器实例占用; 不允许容器实例创建在『空闲资源』不足的节点。</div>
        <Form horizontal disabled={ startEdition }>
          <FormItem
            label={this.shouldUserSchedulePoint()}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            className="formAdvance"
          >
            <Checkbox className="ant-checkbox-vertical" key="shouldServerPop"
              disabled = { startEdition }
              onChange = { this.handleSinglePoint }
              checked = { singleCheckBox }
            >允许用户通过『主机名及 IP 』来实现绑定【单个节点】</Checkbox>
          </FormItem>

          <FormItem
            label="允许设置亲和性"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            className="formAdvance "
          >
            <Checkbox className="ant-checkbox-vertical" key="anglePoint"
              disabled={ startEdition }
              onChange={ this.handleClassCheckBox }
              checked={ classCheckBox }
            >用户可通过『主机标签』定义服务实例绑定到【某类节点】</Checkbox>
            <Checkbox className="ant-checkbox-vertical" key="manyPoint"
              disabled={ startEdition }
              onChange={ this.handleTopCheckBox }
              checked={ topCheckBox }
              >允许用户通过『服务标签』定义服务实例可以和哪些服务实例部署在同一主机上 (具有相同的主机标签键)</Checkbox>
          </FormItem>

          {/* <div className='advanceSet' onClick={this.hanldeSetScheduler}>
            {
              this.state.setScheduler?
              <Icon type="minus-square" /> :
              <Icon type="plus-square" />
            }
            高级设置
          </div> */}
          {/* { */}
            {/* // this.state.setScheduler ? */}
            <FormItem
              label="默认调度策略"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              className="formAdvance"
            >
              <RadioGroup disabled={ startEdition }
                defaultValue="优先调度到使用率低的节点"
                onChange = { this.handleUtilizationRate }
                value = { utilizationRate }
              >
                <p className='schedulerTit'>初始为每个容器服务添加下边选择的调度策略，最终通过容器服务所有策略的综合条件优选一个调度的节点。</p>
                <Radio value="least" key="low" >优先调度到使用率<span className="useText">低</span>的节点</Radio>
                <Radio value="most" key="high" >优先调度到使用率<span className="useText">高</span>的节点</Radio>
              </RadioGroup>
              {
                utilizationRate === 'least' ?
                <Checkbox disabled={ startEdition } className="ant-checkbox-vertical"
                  checked = { resourceCheckBox }
                  onChange = { this.handleResourceCheckBox }
                >优先调度到各项资源更均衡的节点上</Checkbox>
              : null
              }
            </FormItem>
          {/* //   : null
          // } */}
          {
            startEdition ? <div className="formAdvance formBtnAdvance">
                <Button type="primary" onClick={ this.handleChangeEditionScheduler }>编辑</Button>
              </div>
            : <div className="formAdvance formBtnAdvance">
                <Button onClick={ this.handleCandleEditionScheduler }>取消</Button>
                <Button type="primary" loading={this.state.enterLoading} onClick={ this.hanldeSaveEditionScheduler }>保存</Button>
              </div>
          }

        </Form>
      </div>
    </div>

  }
}

Scheduler = Form.create()(Scheduler)

function mapPropsToState(state,props) {
  const { cluster, space } = state.entities.current
  return {
    cluster,
    space,
  }
}

export default connect(mapPropsToState,{
  updateClusterConfig,
  setCurrent,
  loadLoginUserDetail,
  getProjectVisibleClusters
})(Scheduler)
