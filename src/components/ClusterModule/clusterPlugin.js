/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster plugin component
 *
 * v2.2 - 2017-5-3
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Link ,browserHistory} from 'react-router'
import { Menu, Button, InputNumber, Card, Form, Select, Input, Dropdown, Spin, Modal, message, Icon, Checkbox, Switch, Tooltip,  Row, Col, Tabs } from 'antd'
import './style/clusterPlugin.less'
class ClusterPlugin extends Component{
  constructor(props){
    super(props)
    this.state = {

    }
  }
  getInitialState() {
    return {
      setUpa: false,
      setUpb: false,
      setUpc: false,
      setUpd: false,
      deploya: false,
      deployb: false,
      deployc: false,
      deployd: false
    };
  }
  onChange(value) {
    console.log('changed', value);
  }
  render(){
    return <div id="cluster_clusterplugin">
      <div className="alertRow">集群插件：使用以下插件可以分别使平台中的日志、发现服务、监控等可用；在这里可以重新部署插件，可以切换插件所在节点，还可以设置CPU、内存在集群中资源的限制。</div>
      <Card className='ClusterListCard'>
      <div className='dataBox'>
          <div className='titleBox'>
            <div className='name commonTitle'>
              <span>插件名称</span>
            </div>
            <div className='status commonTitle'>
              <span>插件状态</span>
            </div>
            <div className='resources commonTitle'>
              <span>资源限制</span>
            </div>
            <div className='locationNode commonTitle'>
              <span>所在节点</span>
            </div>
            <div className='operation commonTitle'>
              <span>操作</span>
            </div>
           
          </div>
          <div className='datalist'>
            <div className='podDetail'>
              <div className='name commonTitle'>
                <Link>elasticsearch-logging</Link>
              </div>
              <div className='status commonTitle'>
                <span className='runningSpan'><i className='fa fa-circle' />&nbsp;&nbsp;正常</span>
              </div>
              <div className='resources commonTitle'>
                <span>数据</span>
              </div>
              <div className='locationNode commonTitle'>
                <span>数据</span>
              </div>
              <div className='operation commonTitle'>
                <Button type="primary" onClick={()=> this.setState({deploya:true})}>重新部署</Button>
                <Modal
                title="重新部署操作"
                wrapClassName="vertical-center-modal"
                visible={this.state.deploya}
                onOk={() => this.setState({deploya:false})}
                onCancel={() => this.setState({deploya:false})}
                >
                  <p>确定重新部署</p>
                </Modal>
                <Button className="setup" type="ghost" onClick={()=> this.setState({setUpa:true})}>设置</Button>
                <Modal
                title="设置节点及资源限制"
                wrapClassName="vertical-center-modal"
                visible={this.state.setUpa}
                onOk={() => this.setState({setUpa:false})}
                onCancel={() => this.setState({setUpa:false})}
                >
                <div className="alertRow" style={{fontSize:'12px'}}><p>选择插件所在节点并设置该插件在本集群中可用的CPU和内存的限制；系统默认给出的值为最佳设置值，<span style={{fontWeight:'bold'}}>推荐使用默认设置</span>。</p>
                <p>设置为 <span style={{fontWeight:'bold'}}>0</span> 时表示无限制；设置时请参考所选节点的资源上限设置该插件的资源限制；</p></div>
                 <Form.Item
                  id="select"
                  label="选择节点"
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 21 }}
                  style={{borderBottom:'1px solid #ededed',paddingBottom:'30px'}}
                >
                  <Select id="select" size="large" defaultValue="lucy" style={{ width: 200 }}>
                    <Option value="jack">jack</Option>
                    <Option value="lucy">lucy</Option>
                    <Option value="disabled" disabled>disabled</Option>
                    <Option value="yiminghe">yiminghe</Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <span className="setLimit">设置限制</span><span>CPU</span><Button className="recovery" type="ghost" size="small"><Icon type="setting" />恢复默认设置</Button>
                  <p style={{marginLeft:'70px'}}>
                    <InputNumber style={{width: 200}} min={0.1} max={4} step={0.1}/> 核
                  </p>
                  <span style={{marginLeft:'70px'}}>内存</span>
                  <p style={{marginLeft:'70px'}}>
                    <Input style={{width: 200}}/> M
                  </p>
                </Form.Item>
                </Modal>
              </div>
            </div>
            <div className='podDetail'>
              <div className='name commonTitle'>
                <Link>kube-dns</Link>
              </div>
              <div className='status commonTitle'>
                <span className='runningSpan'><i className='fa fa-circle' />&nbsp;&nbsp;正常</span>
              </div>
              <div className='resources commonTitle'>
                <span>数据</span>
              </div>
              <div className='locationNode commonTitle'>
                <span>数据</span>
              </div>
              <div className='operation commonTitle'>
                <Button type="primary" onClick={()=> this.setState({deployb:true})}>重新部署</Button>
                <Modal
                title="重新部署操作"
                wrapClassName="vertical-center-modal"
                visible={this.state.deployb}
                onOk={() => this.setState({deployb:false})}
                onCancel={() => this.setState({deployb:false})}
                >
                  <p>确定重新部署</p>
                </Modal>
                <Button className="setup" type="ghost" onClick={()=> this.setState({setUpb:true})}>设置</Button>
                <Modal
                title="设置节点及资源限制"
                wrapClassName="vertical-center-modal"
                visible={this.state.setUpb}c
                onOk={() => this.setState({setUpb:false})}
                onCancel={() => this.setState({setUpb:false})}
                >
                <div className="alertRow" style={{fontSize:'12px'}}><p>选择插件所在节点并设置该插件在本集群中可用的CPU和内存的限制；系统默认给出的值为最佳设置值，<span style={{fontWeight:'bold'}}>推荐使用默认设置</span>。</p>
                <p>设置为 <span style={{fontWeight:'bold'}}>0</span> 时表示无限制；设置时请参考所选节点的资源上限设置该插件的资源限制；</p></div>
                 <Form.Item
                  id="select"
                  label="选择节点"
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 21 }}
                  style={{borderBottom:'1px solid #ededed',paddingBottom:'30px'}}
                >
                  <Select id="select" size="large" defaultValue="lucy" style={{ width: 200 }}>
                    <Option value="jack">jack</Option>
                    <Option value="lucy">lucy</Option>
                    <Option value="disabled" disabled>disabled</Option>
                    <Option value="yiminghe">yiminghe</Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <span className="setLimit">设置限制</span><span>CPU</span><Button className="recovery" type="ghost" size="small"><Icon type="setting" />恢复默认设置</Button>
                  <p style={{marginLeft:'70px'}}>
                    <InputNumber style={{width: 200}} min={0.1} max={4} step={0.1}/> 核
                  </p>
                  <span style={{marginLeft:'70px'}}>内存</span>
                  <p style={{marginLeft:'70px'}}>
                    <Input style={{width: 200}}/> M
                  </p>
                </Form.Item>
                </Modal>
              </div>
            </div>
            <div className='podDetail'>
              <div className='name commonTitle'>
                <Link>prometheus-monitor</Link>
              </div>
              <div className='status commonTitle'>
                <span className='runningSpan'><i className='fa fa-circle' />&nbsp;&nbsp;正常</span>
              </div>
              <div className='resources commonTitle'>
                <span>数据</span>
              </div>
              <div className='locationNode commonTitle'>
                <span>数据</span>
              </div>
              <div className='operation commonTitle'>
                <Button type="primary" onClick={()=> this.setState({deployc:true})}>重新部署</Button>
                <Modal
                title="重新部署操作"
                wrapClassName="vertical-center-modal"
                visible={this.state.deployc}
                onOk={() => this.setState({deployc:false})}
                onCancel={() => this.setState({deployc:false})}
                >
                  <p>确定重新部署</p>
                </Modal>
                <Button className="setup" type="ghost" onClick={()=> this.setState({setUpc:true})}>设置</Button>
                <Modal
                title="设置节点及资源限制"
                wrapClassName="vertical-center-modal"
                visible={this.state.setUpc}
                onOk={() => this.setState({setUpc:false})}
                onCancel={() => this.setState({setUpc:false})}
                >
                <div className="alertRow" style={{fontSize:'12px'}}><p>选择插件所在节点并设置该插件在本集群中可用的CPU和内存的限制；系统默认给出的值为最佳设置值，<span style={{fontWeight:'bold'}}>推荐使用默认设置</span>。</p>
                <p>设置为 <span style={{fontWeight:'bold'}}>0</span> 时表示无限制；设置时请参考所选节点的资源上限设置该插件的资源限制；</p></div>
                 <Form.Item
                  id="select"
                  label="选择节点"
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 21 }}
                  style={{borderBottom:'1px solid #ededed',paddingBottom:'30px'}}
                >
                  <Select id="select" size="large" defaultValue="lucy" style={{ width: 200 }}>
                    <Option value="jack">jack</Option>
                    <Option value="lucy">lucy</Option>
                    <Option value="disabled" disabled>disabled</Option>
                    <Option value="yiminghe">yiminghe</Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <span className="setLimit">设置限制</span><span>CPU</span><Button className="recovery" type="ghost" size="small"><Icon type="setting" />恢复默认设置</Button>
                  <p style={{marginLeft:'70px'}}>
                    <InputNumber style={{width: 200}} min={0.1} max={4} step={0.1}/> 核
                  </p>
                  <span style={{marginLeft:'70px'}}>内存</span>
                  <p style={{marginLeft:'70px'}}>
                    <Input style={{width: 200}}/> M
                  </p>
                </Form.Item>
                </Modal>
              </div>
            </div>
            <div className='podDetail'>
              <div className='name commonTitle'>
                <Link>heapster</Link>
              </div>
              <div className='status commonTitle'>
                <span className='runningSpan'><i className='fa fa-circle' />&nbsp;&nbsp;正常</span>
              </div>
              <div className='resources commonTitle'>
                <span>数据</span>
              </div>
              <div className='locationNode commonTitle'>
                <span>数据</span>
              </div>
              <div className='operation commonTitle'>
                <Button type="primary" onClick={()=> this.setState({deployd:true})}>重新部署</Button>
                <Modal
                title="重新部署操作"
                wrapClassName="vertical-center-modal"
                visible={this.state.deployd}
                onOk={() => this.setState({deployd:false})}
                onCancel={() => this.setState({deployd:false})}
                >
                  <p>确定重新部署</p>
                </Modal>
                <Button className="setup" type="ghost" onClick={()=> this.setState({setUpd:true})}>设置</Button>
                <Modal
                title="设置节点及资源限制"
                wrapClassName="vertical-center-modal"
                visible={this.state.setUpd}
                onOk={() => this.setState({setUpd:false})}
                onCancel={() => this.setState({setUpd:false})}
                >
                <div className="alertRow" style={{fontSize:'12px'}}><p>选择插件所在节点并设置该插件在本集群中可用的CPU和内存的限制；系统默认给出的值为最佳设置值，<span style={{fontWeight:'bold'}}>推荐使用默认设置</span>。</p>
                <p>设置为 <span style={{fontWeight:'bold'}}>0</span> 时表示无限制；设置时请参考所选节点的资源上限设置该插件的资源限制；</p></div>
                 <Form.Item
                  id="select"
                  label="选择节点"
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 21 }}
                  style={{borderBottom:'1px solid #ededed',paddingBottom:'30px'}}
                >
                  <Select id="select" size="large" defaultValue="lucy" style={{width: 200,marginLeft:'20px'}}>
                    <Option value="jack">jack</Option>
                    <Option value="lucy">lucy</Option>
                    <Option value="disabled" disabled>disabled</Option>
                    <Option value="yiminghe">yiminghe</Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <span className="setLimit">设置限制</span><span>CPU</span><Button className="recovery" type="ghost" size="small"><Icon type="setting" />恢复默认设置</Button>
                  <p style={{marginLeft:'70px'}}>
                    <InputNumber style={{width: 200}} min={0.1} max={4} step={0.1}/> 核
                  </p>
                  <span style={{marginLeft:'70px'}}>内存</span>
                  <p style={{marginLeft:'70px'}}>
                    <Input style={{width: 200}}/> M
                  </p>
                </Form.Item>
                </Modal>
              </div>
            </div>
          </div>
        </div>
        </Card>
    </div>
  }
}

export default ClusterPlugin