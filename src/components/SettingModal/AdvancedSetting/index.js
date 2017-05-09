/**
 * Created by zhangchengzheng on 2017/5/5.
 */
import React, { Component, propTypes } from 'react'
import { Switch, Checkbox } from 'antd';
import './style/AdvancedSetting.less'

class AdvancedSetting extends Component{
  constructor(props){
    super(props)
    this.handleSwitch = this.handleSwitch.bind(this)
    this.handleName = this.handleName.bind(this)
    this.handleTag = this.handleTag.bind(this)
    this.state = {
      swicthChecked : false
    }
  }
  componentWillMount() {
    document.title = '高级设置 | 时速云'
  }
  handleSwitch(checked){
    this.setState({
      swicthChecked : checked
    })
  }

  handleName(value){
    let checked = value.target.checked
  }

  handleTag(value){
    let checked = value.target.checked
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
              <div className='item'>
                <Checkbox onChange={this.handleName}>允许用户通过『主机名及IP』来实现绑定【单个节点】</Checkbox>
              </div>
              <div className='item'>
                <Checkbox onChange={this.handleTag}>用户可通过『主机标签』绑定【某类节点】</Checkbox>
              </div>
            </div>
            : <div></div>
          }
        </div>
      </div>
    </div>)
  }
}

export default AdvancedSetting