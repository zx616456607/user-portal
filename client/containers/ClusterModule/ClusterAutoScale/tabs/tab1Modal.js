import React from 'react'
import { Modal, Button, Select, Input, Steps, Icon, Tooltip, Radio, Row, Col, Form } from 'antd'
import '../style/tabModal.less'
import classNames from 'classNames'
import * as autoScalerActions from '../../../../actions/clusterAutoScaler';
import { connect } from 'react-redux';
const FormItem = Form.Item;
let randomKey = Math.random();//重置表单

class Tab1Modal extends React.Component {
  clickIcon = (e) => {
    let obj = e.target.parentElement.attributes['data-index'] || e.target.attributes['data-index'];
    if(this.state.disabledIconCon.indexOf(obj.value) > -1){ return; }
    this.setState({currentIcon: obj.value});
  }
  fun1 = () => {

  }
  fun2 = () => {
    this.setState({checkExist: true});
  }
  roleNameChange = (e) => {
    e.target.value = e.target.value.substr(0, 100);
  }
  nextStep = () => {
    this.setState({currentStep: 1});
  }
  constructor() {
    super()
    this.state = {
      currentIcon: "0",
      checkExist: false, //查看已有模块 false默认
      currentStep: 0,//0 第一步 1 第二步（保存）
      disabledIconCon: ["2", "3", "4"],
    }
  }
  render(){
    const iconClass1 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "1",
      'iconConDis': this.state.disabledIconCon.indexOf("1") > -1,
    });
    const iconClass2 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "2",
      'iconConDis': this.state.disabledIconCon.indexOf("2") > -1,
    });
    const iconClass3 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "3",
      'iconConDis': this.state.disabledIconCon.indexOf("3") > -1,
    });
    const iconClass4 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "4",
      'iconConDis': this.state.disabledIconCon.indexOf("4") > -1,
    });
    const footer = (() => {
        return (
          <div>
            {this.state.currentStep === 0 ?
              <Button type="primary" onClick={this.nextStep}>下一步</Button>
              :
              <Button type="primary" onClick={this.props.onOk}>保存</Button>
            }
            <Button onClick={this.props.onCancel}>取消</Button>
          </div>
        )
    }).bind(this)();
    const formItemLargeLayout = {
      labelCol: { span: 6},
      wrapperCol: { span: 14}
    }
    if(!this.props.visible) randomKey = Math.random();//重置表单
    return (
      <div>
        <Modal
          visible={this.props.visible}
          title="弹性伸缩策略"
          onCancel={this.props.onCancel}
          width="550"
          footer={footer}
          key={randomKey}
          maskClosable={true}
          >
          <div className="topIconContainer">
            <div className={iconClass1} data-index="1" onClick={this.clickIcon}>
              <div className="icon"></div>
              <div className="name">vnware</div>
              <svg className="commonSelectedImg">
                <use xlinkHref="#appcreatemodelselect" />
              </svg>
              <i className="fa fa-check"></i>
            </div>
            <div className={iconClass2} data-index="2" onClick={this.clickIcon}>
            <div className="icon"></div>
              <div className="name">aws</div>
              <svg className="commonSelectedImg">
                <use xlinkHref="#appcreatemodelselect" />
              </svg>
              <i className="fa fa-check"></i>
            </div>
            <div className={iconClass3} data-index="3" onClick={this.clickIcon}>
            <div className="icon"></div>
              <div className="name">azure</div>
              <svg className="commonSelectedImg">
                <use xlinkHref="#appcreatemodelselect" />
              </svg>
              <i className="fa fa-check"></i>
            </div>
            <div className={iconClass4} data-index="4" onClick={this.clickIcon}>
            <div className="icon"></div>
              <div className="name">aliyun</div>
              <svg className="commonSelectedImg">
                <use xlinkHref="#appcreatemodelselect" />
              </svg>
              <i className="fa fa-check"></i>
            </div>
            <div style={{clear:"both"}}></div>
          </div>
          <div className="bottom-line"></div>
          <div className="formContainer">
            <div className="panel noBottom">
              <Row key="row2">
                <FormItem
                  {...formItemLargeLayout}
                  label="容器集群"
                >
                  <Select placeholder="请选择容器集群" style={{width: "100%", }}>
                    {/* <Option value="0">请选择容器集群</Option> */}
                    <Select.Option value="1">1.1.1.1</Select.Option>
                    <Select.Option value="2">2.2.2.2</Select.Option>
                  </Select>
                </FormItem>
              </Row>
            </div>
          </div>
          {this.state.checkExist ?
            <div>
              <div className="stepContainer">
                <Steps size="small" current={this.state.currentStep} status="process">
                  <Steps.Step key="0" title="节点自动配置" description="" />
                  <Steps.Step key="1" title="集群伸缩方案" description="" />
                </Steps>
              </div>
              <div className="bottom-line"></div>
              <div className="formContainer">
              {this.state.currentStep === 0 ?
                <div className="panel noBottom">
                  <Row key="row1">
                    <FormItem
                      {...formItemLargeLayout}
                      label="策略名称"
                    >
                      <Input onChange={this.roleNameChange} placeholder="支持 100 字以内的中英文" />
                    </FormItem>
                  </Row>
                  <Row key="row3">
                    <FormItem
                      {...formItemLargeLayout}
                      label="数据中心"
                    >
                      <Select placeholder="请选择数据中心" style={{width: "100%", }}>
                        {/* <Option value="0">请选择容器集群</Option> */}
                        <Select.Option value="1">1.1.1.1</Select.Option>
                        <Select.Option value="2">2.2.2.2</Select.Option>
                      </Select>
                    </FormItem>
                  </Row>
                  <Row key="row33">
                    <FormItem
                      {...formItemLargeLayout}
                      label="选择路径"
                    >
                    <Input placeholder="如 /paas/vms/autoscaling-group" />
                    </FormItem>
                  </Row>
                  <Row key="row4">
                    <FormItem
                      {...formItemLargeLayout}
                      label="选择虚拟机模板"
                    >
                      <Select placeholder="请选择虚拟机模板" style={{width: "100%", }}>
                        {/* <Option value="0">请选择容器集群</Option> */}
                        {/* <Option value={item.path} key={item.path}>
                          <div className='vmTemplateDetail'>
                            <Tooltip placement="right" title={item.path}>
                              <p className='path'>{item.path}</p>
                            </Tooltip>
                            <p className='lowcase'>客户机操作系统：{item.type}</p>
                            <p className='lowcase'>虚拟机版本：{item.version}</p>
                            <p className='lowcase'>CPU/内存：{item.cpuNumber + 'C'}/{diskFormat(item.memoryTotal)}</p>
                          </div>
                        </Option> */}
                        <Option value="xxx" key="1">
                          <div className='vmTemplateDetail'>
                            <Tooltip placement="right" title="xxx">
                              <p className='path'>xxx</p>
                            </Tooltip>
                            <p className='lowcase'>客户机操作系统：xxx</p>
                            <p className='lowcase'>虚拟机版本：xxx</p>
                            <p className='lowcase'>CPU/内存：xxx</p>
                          </div>
                        </Option>
                      </Select>
                    </FormItem>
                  </Row>
                  <Row key="row5">
                    <FormItem
                      {...formItemLargeLayout}
                      label="计算资源池"
                    >
                      <Select placeholder="请选择计算资源池" style={{width: "100%", }}>
                        {/* <Option value="0">请选择容器集群</Option> */}
                        <Select.Option value="1">1.1.1.1</Select.Option>
                        <Select.Option value="2">2.2.2.2</Select.Option>
                      </Select>
                    </FormItem>
                  </Row>
                  <Row key="row6">
                    <FormItem
                      {...formItemLargeLayout}
                      label="存储资源池"
                    >
                      <Select placeholder="请选择存储资源池" style={{width: "100%", }}>
                        {/* <Option value="0">请选择容器集群</Option> */}
                        <Select.Option value="1">1.1.1.1</Select.Option>
                        <Select.Option value="2">2.2.2.2</Select.Option>
                      </Select>
                    </FormItem>
                  </Row>
                </div>
                :
                <div>
                  <div className="panel">
                    <Row key="row7">
                      <FormItem
                        {...formItemLargeLayout}
                        label="节点数量"
                      >
                       <div className="min">
                          <div className="name">最小节点数
                            <Tooltip placement="right" title="注：最小实例数需大于或等于手动添加的实例总数">
                              <Icon style={{marginLeft: "5px", cursor: "pointer"}} type="info-circle-o" />
                            </Tooltip>
                          </div>
                          <div className="formItem">
                            <Input className="item" placeholder="1" /><span className="unit">个</span>
                          </div>
                        </div>
                        <div className="max">
                          <div className="name">最大节点数</div>
                          <div className="formItem">
                            <Input className="item" placeholder="1" /><span className="unit">个</span>
                          </div>
                        </div>
                      </FormItem>
                    </Row>
                    <Row key="row8">
                      <FormItem
                        {...formItemLargeLayout}
                        label="节点伸缩"
                      >
                       <Radio.Group>
                          <Radio checked={true} key="a" value={1}>通过阈值触发</Radio>
                          <Radio key="b" value={2}>定时触发</Radio>
                        </Radio.Group>
                      </FormItem>
                    </Row>
                    <Row key="row9">
                      <FormItem
                        {...formItemLargeLayout}
                        label="减少节点"
                      >
                       <Radio.Group>
                          <Radio checked={true} key="a" value={1}>仅移出集群</Radio>
                          <Radio key="b" value={2}>移出集群并删除节点</Radio>
                        </Radio.Group>
                      </FormItem>
                    </Row>
                  </div>
                  <div className="bottom-line"></div>
                  <div className="panel noBottom">
                    <Row key="row10">
                      <FormItem
                        {...formItemLargeLayout}
                        label="伸缩通知"
                      >
                        <Input placeholder="通知邮件为空，将不发送通知" />
                      </FormItem>
                    </Row>
                    <Row key="row11">
                      <FormItem
                        {...formItemLargeLayout}
                        label="策略冷却时间"
                      >
                        <Input style={{width:"90px"}} placeholder="120" />
                        <span className="unit">秒</span>
                        <span className="hint">策略连续两次触发的最小时间</span>
                      </FormItem>
                    </Row>
                  </div>
                </div>
              }
              </div>
            </div>
            :
            <div className="btnConatainer">
              <Button style={{marginRight: "10px"}} type="primary" onClick={this.fun1}>前往配置 vSphere</Button>
            </div>
          }
        </Modal>
      </div>
    )
  }
};
export default Tab1Modal;
