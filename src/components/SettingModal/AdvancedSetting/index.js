/**
 * Created by zhangchengzheng on 2017/5/5.
 */
import React, { Component, propTypes } from 'react'
import { Switch, Form, Checkbox } from 'antd';
import './style/AdvancedSetting.less'

class AdvancedSetting extends Component{
  constructor(props){
    super(props)
    this.handleSwitch = this.handleSwitch.bind(this)
    this.state = {
      swicthChecked : false
    }
  }

  handleSwitch(){
    this.setState({
      swicthChecked : !this.state.swicthChecked
    })
  }

  render(){
    const { swicthChecked } = this.state
    return (<div id="AdvancedSetting">
      <div className='title'>高级设置</div>
      <div className='content'>
        <div className='contentheader'>允许用户绑定节点</div>
        <div className='contentbody'>
          <div className='contentbodytitle alertRow'>
            即创建服务时，可以将服务对应容器实例，固定在节点或者某些『标签』的节点上来调度
          </div>
          <div className='contentbodycontainers'>
            <span>
              {
                swicthChecked
                ?<span>开启</span>
                :<span>关闭</span>
              }
              绑定节点</span>
            <Switch checked={swicthChecked} onChange={this.handleSwitch} className='switchstyle'/>
          </div>
          {
            swicthChecked
            ? <div className='contentfooter'>
              <Form>
                <Form.Item>
                  <Checkbox>允许用户通过『主机名及IP』来实现绑定【单个节点】</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Checkbox>用户可通过『主机标签』绑定【某类节点】</Checkbox>
                </Form.Item>
              </Form>
            </div>
            : <div></div>
          }

        </div>
      </div>
    </div>)
  }
}
AdvancedSetting = Form.create()(AdvancedSetting)

export default AdvancedSetting