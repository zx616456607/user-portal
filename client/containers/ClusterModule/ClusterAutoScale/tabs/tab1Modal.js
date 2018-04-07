import React from 'react'
import { Modal, Button, Select, Input, Steps, Icon, Tooltip, Radio } from 'antd'
import '../style/tab1Modal.less'
import classNames from 'classNames'


class Tab1Modal extends React.Component {
  clickIcon = (e) => {
    let obj = e.target.parentElement.attributes['data-index'] || e.target.attributes['data-index']
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
  state = {
    currentIcon: "0",
    checkExist: true, //查看已有模块 false默认
    currentStep: 1,
  }
  render(){
    const iconClass1 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "1",
    });
    const iconClass2 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "2",
    });
    const iconClass3 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "3",
    });
    const iconClass4 = classNames({
      'iconCon': true,
      'selectedBox': this.state.currentIcon == "4",
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
    return (
      <div>
        <Modal
          visible={this.props.visible}
          title="弹性伸缩策略"
          okText="保存"
          width="550"
          footer={footer}
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
          {this.state.checkExist ?
            <div>
              <div className="stepContainer">
                <Steps size="small" current={this.state.currentStep} status="process">
                  <Steps.Step key="0" title="节点自动配置" description="" />
                  <Steps.Step key="1" title="集群伸缩方案" description="" />
                </Steps>
              </div>
              <div className="formContainer">

              {this.state.currentStep === 0 ?
                <div className="panel">
                  <div className="row">
                    <div className="left">策略名称</div>
                    <div className="right">
                      <Input onChange={this.roleNameChange} placeholder="支持 100 字以内的中英文" />
                    </div>
                    <div className="clearBoth"></div>
                  </div>
                  <div className="row">
                    <div className="left">容器集群</div>
                    <div className="right">
                      <Select placeholder="请选择容器集群" style={{width: "100%", }}>
                        {/* <Option value="0">请选择容器集群</Option> */}
                        <Select.Option value="1">1.1.1.1</Select.Option>
                        <Select.Option value="2">2.2.2.2</Select.Option>
                      </Select>
                    </div>
                    <div className="clearBoth"></div>
                  </div>
                  <div className="row">
                    <div className="left">数据中心</div>
                    <div className="right">
                      <Select placeholder="请选择数据中心" style={{width: "100%", }}>
                        {/* <Option value="0">请选择容器集群</Option> */}
                        <Select.Option value="1">1.1.1.1</Select.Option>
                        <Select.Option value="2">2.2.2.2</Select.Option>
                      </Select>
                    </div>
                    <div className="clearBoth"></div>
                  </div>
                  <div className="row">
                    <div className="left">选择虚拟机模板</div>
                    <div className="right">
                      <Select placeholder="请选择虚拟机模板" style={{width: "100%", }}>
                        {/* <Option value="0">请选择容器集群</Option> */}
                        <Select.Option value="1">1.1.1.1</Select.Option>
                        <Select.Option value="2">2.2.2.2</Select.Option>
                      </Select>
                    </div>
                    <div className="clearBoth"></div>
                  </div>
                  <div className="row">
                    <div className="left">计算资源池</div>
                    <div className="right">
                      <Select placeholder="请选择计算资源池" style={{width: "100%", }}>
                        {/* <Option value="0">请选择容器集群</Option> */}
                        <Select.Option value="1">1.1.1.1</Select.Option>
                        <Select.Option value="2">2.2.2.2</Select.Option>
                      </Select>
                    </div>
                    <div className="clearBoth"></div>
                  </div>
                  <div className="row noMB">
                    <div className="left">存储资源池</div>
                    <div className="right">
                      <Select placeholder="请选择存储资源池" style={{width: "100%", }}>
                        {/* <Option value="0">请选择容器集群</Option> */}
                        <Select.Option value="1">1.1.1.1</Select.Option>
                        <Select.Option value="2">2.2.2.2</Select.Option>
                      </Select>
                    </div>
                    <div className="clearBoth"></div>
                  </div>
                </div>
                :
                <div>
                  <div className="panel">
                    <div className="row">
                      <div className="left">节点数量</div>
                      <div className="right">
                        <div className="min">
                          <div className="name">最小节点数
                            <Tooltip placement="right" title="提示文字">
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
                        <div className="clearBoth"></div>
                      </div>
                      <div className="clearBoth"></div>
                    </div>
                    <div className="row">
                      <div className="left">节点伸缩</div>
                      <div className="right">
                        <Radio.Group>
                          <Radio checked={true} key="a" value={1}>通过阈值触发</Radio>
                          <Radio key="b" value={2}>定时触发</Radio>
                        </Radio.Group>
                      </div>
                      <div className="clearBoth"></div>
                    </div>
                    <div className="row">
                      <div className="left">减少节点</div>
                      <div className="right">
                        <Radio.Group>
                          <Radio checked={true} key="a" value={1}>仅移出集群</Radio>
                          <Radio key="b" value={2}>移出集群并删除节点</Radio>
                        </Radio.Group>
                      </div>
                      <div className="clearBoth"></div>
                    </div>
                  </div>
                  <div className="panel">
                    <div className="row">
                      <div className="left">伸缩通知</div>
                      <div className="right">
                        <Input placeholder="通知邮件为空，将不发送通知" />
                      </div>
                      <div className="clearBoth"></div>
                    </div>
                    <div className="row">
                      <div className="left">策略冷却时间</div>
                      <div className="right">
                        <Input style={{width:"150px"}} placeholder="120" />
                        <span className="unit">秒</span>
                        <span className="hint">策略连续两次触发的最小时间</span>
                      </div>
                      <div className="clearBoth"></div>
                    </div>
                  </div>
                </div>
              }
              </div>
            </div>
            :
            <div className="btnConatainer">
              <Button style={{marginRight: "10px"}} type="primary" onClick={this.fun1}>前往配置 vSphere</Button>
              <Button type="primary" onClick={this.fun2}>查看已有配置 vSphere</Button>
            </div>
          }
        </Modal>
      </div>
    )
  }
};
export default Tab1Modal;
