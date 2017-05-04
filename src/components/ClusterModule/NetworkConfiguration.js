/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * NetworkConfiguration list component
 *
 * v0.1 - 2017-4-24
 * @author XuLongcheng
 */
import React from 'react'
import { camelize } from 'humps'
import { Icon, Select, Button, Card, Form, Input, Tooltip, Spin, Modal, Dropdown, Menu, Row, Col } from 'antd'
import { getProxy, updateProxy, getClusterNodeAddr } from '../../actions/cluster'
import { changeClusterIPsAndDomains } from '../../actions/entities'
import { getAllClusterNodes } from '../../actions/cluster_node'
import NotificationHandler from '../../common/notification_handler'
import { connect } from 'react-redux'
import networkImg from '../../assets/img/integration/network.png'
import mappingImg from '../../assets/img/integration/mapping.svg'
import sketchImg from '../../assets/img/integration/Sketch.png'
import './style/NetworkConfiguration.less'
import { IP_REGEX, HOST_REGEX } from '../../../constants'

let formadd=1;
let validing = false
let NetworkConfiguration = React.createClass ({
  getInitialState() {
    return {
      editCluster: false, // edit btn
      saveBtnDisabled: false,
      showDeleteModal: false,
      visible:false
    }
  },
  componentWillMount(){
    const { getFieldProps, getFieldValue, setFieldsValue } = this.props.form;
    const { getProxy, cluster } = this.props
    getFieldProps('arr', {
      initialValue: [0]
    })
    this.loadData()
  },
  loadData(needFetching) {
    const { getFieldProps, getFieldValue, setFieldsValue } = this.props.form;
    const { getProxy, cluster } = this.props
    getProxy(this.props.cluster.clusterID, needFetching == undefined ? true : needFetching, {
      success: {
        func:(res) => {
          const clusterID = camelize(cluster.clusterID)
          if(res[clusterID]) {
            const keyArr = []
            res[clusterID].data.nodeProxys.forEach((item, index) => {
              keyArr.push(index)
            })
            setFieldsValue({'arr': keyArr})
            return
          }
          setFieldsValue({'arr': [0]})
        }
      }
    })
  },
  getSelectItem() {
    const { nodeList, cluster } = this.props
    const clusterID = cluster.clusterID
    if(nodeList.isEmptyObject) {
      return <div key="null"></div>
    }
    if(nodeList[clusterID].isFetching) {
      return <div key="null" className="loadingBox"><Spin size="large"></Spin></div>
    }
    const nodes = nodeList[clusterID].nodes.clusters.nodes.nodes
    return nodes.map(node => {
      return <Option key={node.objectMeta.name} value={node.objectMeta.name}>{node.objectMeta.name}</Option>
    })
  },
  isExistRepeat(key) {
    const { form } = this.props
    const { getFieldsValue, getFieldValue } = form
    const arr = getFieldValue('arr')
    const currentField = [`nodeSelect${key}`, `nodeIP${key}`]
    const currentValue = getFieldsValue(currentField)
    return arr.some(item => {
      if(item == key) return false
      const keyArr = [`nodeSelect${item}`, `nodeIP${item}`]
      const value = getFieldsValue(keyArr)
      keyArr.every((i, index) => {
      })
      return keyArr.every((i, index) => value[keyArr[index]] == currentValue[currentField[index]])
    })
  },
  validAllField() {
    if(validing) {
      return
    }
    validing = true
    const { form } = this.props
    form.validateFields({force: true}, (err, callback) => {
      validing = false
    })
  },
  handDelete(key) {
    const { form } = this.props
    const { getFieldValue, setFieldsValue } = form
    let keyArr = getFieldValue('arr')
    keyArr.splice(keyArr.indexOf(key), 1)
    setFieldsValue({
      arr: keyArr
    })
  },
  updateCluster() {
    const { form, cluster, updateProxy, getProxy, changeClusterIPsAndDomains } = this.props
    const { getFieldValue } = form
    validing = true
    this.setState({
      saveBtnDisabled: true
    })
    form.validateFields({force: true}, (err, v) => {
      validing = false
      if(err) {
        this.setState({
          saveBtnDisabled: false
        })
        return
      }
      const notify = new NotificationHandler()
      const arr = getFieldValue('arr')
      if(arr.length == 0) {
        this.setState({
          saveBtnDisabled: false
        })
        notify.error('请填入一组代理出口')
        return
      }
      const entity = {
        bindingIPs: getFieldValue('bindingIPs'),
        bindingDomains: getFieldValue('bindingDomains'),
        nodeProxys: []
      }
      const nodeProxys = entity.nodeProxys
      arr.forEach(item => {
        nodeProxys.push({
          host: getFieldValue(`nodeSelect${item}`),
          address: getFieldValue(`nodeIP${item}`)
        })
      })
      updateProxy(cluster.clusterID, entity, {
        success: {
          func: () => {
            notify.close()
            notify.success('代理出口更新成功')
            setTimeout(() => changeClusterIPsAndDomains(entity.bindingIPs ? `["${entity.bindingIPs}"]` : '', entity.bindingDomains ? `["${entity.bindingDomains}"]` : ''),0)
            this.loadData(false)
            this.setState({
              saveBtnDisabled: false,
              editCluster: false
            })
          },
          isAsync: true
        },
        failed: {
          func: () => {
            notify.close()
            notify.error('代理出口更新失败')
            this.setState({
              saveBtnDisabled: false,
              editCluster: false
            })

          }
        }
      })
    })
  },
  cancleEdit() {
    this.setState({editCluster: false, saveBtnLoading: false, saveBtnDisabled: true})
    const { form, cluster, clusterProxy } = this.props
    const clusterID = camelize(cluster.clusterID)
    if(clusterProxy.result[clusterID]) {
      const keyArr = []
      clusterProxy.result[clusterID].data.nodeProxys.forEach((item, index) => {
        keyArr.push(index)
      })
      form.setFieldsValue({
        arr: keyArr
      })
    }
  },
  getItems() {
    const { cluster, form, clusterProxy } = this.props
    const { getFieldProps, getFieldValue } = form;
    const { editCluster, saveBtnLoading } = this.state
    let {bindingIPs} = cluster
    if(clusterProxy.isEmptyObject || !clusterProxy.result) {
      return <div></div>
    }
    let proxy = clusterProxy.result[camelize(cluster.clusterID)]
    if(!proxy) {
      return <div></div>
    }
    proxy = proxy.data
    let arr = form.getFieldValue('arr');
    if(!arr) {
      return <div></div>
    }
    return arr.map(item => {
      return <div key={item} id="error-s" style={{display:'flex'}}>
      
        <Form.Item style={{flex:'5'}}>
          { editCluster ? 
              <Select style={{width:'100%'}} {...getFieldProps(`nodeSelect${item}`, {
                initialValue: proxy.nodeProxys[item] ? proxy.nodeProxys[item].host : '',
                rules: [{
                  validator: (rule, value, callback) => {
                    if(!value) {
                      return callback('请选择节点')
                    }
                    this.validAllField()
                    if(this.isExistRepeat(item)) {
                      return callback('代理信息重复')
                    }
                    callback()
                  }
                }]
              })}  placeholder="Please select a country">
              {this.getSelectItem()}
            </Select> :
            <span className="h5" style={{width: "100%",display:'inline-block'}}>{proxy.nodeProxys[item] ? proxy.nodeProxys[item].host : ''}</span>
          }
          </Form.Item>
          
          <Form.Item style={{flex:'5'}}>
            { editCluster ?
              <Input {...getFieldProps(`nodeIP${item}`,{
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if(!value) {
                        return callback('请填写网卡 IP')
                      }
                      if (!IP_REGEX.test(value)) {
                        return callback([new Error('请填写正确的网卡 IP')])
                      }
                      this.validAllField()
                      if(this.isExistRepeat(item)) {
                        return callback('代理信息重复')
                      }
                      callback()
                    }
                  }
                ],
                initialValue: proxy.nodeProxys[item] ? proxy.nodeProxys[item].address : ''
              })
            } style={{width:'100%',margin:'0px 10px'}}  placeholder="输入服务出口 IP" />
            :
              <span className="h5" style={{display:'inline-block',marginLeft:'-10px'}}>{proxy.nodeProxys[item] ? proxy.nodeProxys[item].address : ''}</span>
            }
        </Form.Item>
        
        {
          editCluster ?  <p className="delete-p"><Icon style={{paddingTop:'5px',paddingLeft:'5px',cursor:'pointer'}}  type="delete" onClick={() => this.handDelete(item)}/></p> : <span></span>
        }

      </div>
    })
  },
  add (){
    const {form} = this.props;
    validing = true
    form.validateFields((err, callback) => {
      validing = false
      if(err) {
        return
      }
      formadd++
      const { getFieldProps, getFieldValue } = form;
      let arr = form.getFieldValue('arr');
      arr.push(formadd);
      form.setFieldsValue({
        arr,
      });
    })
  },
  render (){
    const { cluster, form, clusterProxy } = this.props
    const { editCluster, saveBtnLoading, sketchshow } = this.state
    let bindingIPs = ''
    let bindingDomains = ''
    const { getFieldProps } = form
    if(clusterProxy.isEmptyObject || !clusterProxy.result) {
      return <div className="loadingBox"><Spin size="large"></Spin></div>
    }
    let proxy = clusterProxy.result[camelize(cluster.clusterID)]
    if(!proxy) {
      return <div>暂无代理</div>
    }
    proxy = proxy.data
    let arr = form.getFieldValue('arr');
    if(!arr) {
      return <div>暂无代理</div>
    }
    bindingDomains = proxy.bindingDomains
    bindingIPs = proxy.bindingIPs
    const bindingIPsProps = getFieldProps('bindingIPs',{
      rules: [
        {
          validator: (rule, value, callback) => {
            if (value && !IP_REGEX.test(value)) {
              return callback([new Error('请填写正确的服务外网 IP')])
            }
            callback()
          }
        }
      ],
      initialValue: bindingIPs
    });
    const bindingDomainsProps = getFieldProps('bindingDomains',{
      rules: [
        { message: '输入服务域名' },
        {
          validator: (rule, value, callback) => {
            if (value && !HOST_REGEX.test(value)) {
              return callback([new Error('请填写正确的服务域名')])
            }
            callback()
          }
        }
      ],
      initialValue: bindingDomains
    });
    return (
      <Card id="Network" className="ClusterInfo">
        <div className="h3">网路配置
          {!editCluster?
           <Button type="ghost" style={{float:'right',marginTop:'6px'}} onClick={()=> this.setState({editCluster: true, saveBtnDisabled: false})}>
              编辑配置
              </Button>
            :
            <div style={{float:'right'}}>
              <Button
                onClick={()=> this.cancleEdit()}>
                取消
              </Button>
              <Button
                loading={saveBtnLoading}
                disabled={this.state.saveBtnDisabled}
                type="primary" style={{marginLeft:'8px'}}
                onClick={this.updateCluster}>
                保存
              </Button>
            </div>
          }
        </div>
        <div className="imgBox">
          <img src={networkImg}/>
        </div>
        <Form className="clusterTable" style={{padding:'35px 0'}}>
          <Row style={{height:'100%'}}>
          <Col xs={{span:13}}>
            <div className="formItem inner-mesh">
              <Form.Item >
                <div className="h4 blod" style={{fontSize:'14px'}}>服务内网IP  <Tooltip title="服务内网IP显示在[应用管理-服务地址：内网IP]处，集群内任意节点作为服务的内网出口代理；"><Icon type="question-circle-o" /></Tooltip></div>
              </Form.Item>
              <Row>
                <Col xs={{span:12}}>代理节点</Col><Col style={{margin:'0px 0px 0px -10px'}} xs={{span:12}}>节点的网卡IP(多网卡时请确认)</Col>
              </Row>
                {this.getItems()}
                {editCluster ? 
                <Form.Item className="increase">
                  <span onClick={this.add}><Icon type="plus-circle-o" /> 新增一条内网代理</span>
                </Form.Item>
                : 
                <span></span>
                }
              </div>
            </Col>
            <Col style={{height:'100%'}} xs={{span:3}}>
              <div className="imgBox imgboxa">
                <img style={{width:'100%'}} src={mappingImg}/>
              </div> 
            </Col>
            <Col xs={{span:8}}>
              <div className="formItem extranet">
                <Form.Item style={{width:'100%'}}>
                  <div className="h4 blod" style={{fontSize:'14px',width:'60%'}}>服务外网IP (可选) <Tooltip title="服务外网 IP 显示在『应用管理→服务地址：外网IP』处，服务内网 IP 地
                    址所映射的代理或网关等性质的产品，平台暂无法自动获取，需手动填
                    写，如OpenStack 的浮动 IP、节点绑定的负载均衡器、平台出口高可用的
                    虚拟 IP 等"><Icon type="question-circle-o" /></Tooltip>
                  </div>
                  <div className="h4 blod sketchMap"><span onClick={()=> this.setState({visible:true})}>查看示意图</span>
                    <Modal wrapClassName="vertical-center-modal" width='75%' title="示意图" footer={<Button type="primary" onClick={()=> this.setState({visible:false})}>知道了</Button>} visible={this.state.visible} onCancel={()=> this.setState({visible:false})}>
                      <div className="imgBox">
                        <img style={{width:'100%',height:'100%'}} src={sketchImg}/>
                      </div>
                    </Modal>
                  </div>
                </Form.Item>
                <Form.Item>
                  { editCluster ?
                  <Input {...bindingIPsProps} style={{width:'100%'}}  placeholder="请填写服务的外网 IP (如 浮动IP)" />
                  :
                  <span>{bindingIPs}</span>
                  }
                </Form.Item>
                <Form.Item >
                  <div className="h4 blod" style={{fontSize:'14px'}}>服务域名配置 (可选) <Tooltip title="可以是绑定到服务外网 IP 或内网 IP 上的域名；"><Icon type="question-circle-o" /></Tooltip></div>
                </Form.Item>
                <Form.Item>
                   { editCluster ?
                    <Input {...bindingDomainsProps} style={{width:'100%'}}  placeholder="请填写该集群配置的映射域名" />
                    :
                    <span>{bindingDomains||"-"}</span>
                    }
                </Form.Item>
              </div>
            </Col>
          </Row>                         
        </Form>
      </Card>
    )
  } 
})

function mapStateToProps(state, props) {
  const defaultNodeList = {isFetching: false, isEmptyObject: true}
  const defaultProxy = {isFetching: false, isEmptyObject: true}
  let allNode = state.cluster_nodes.getAllClusterNodes
  if(!allNode) {
    allNode = defaultNodeList
  }
  let clusterProxy = state.cluster.proxy
  if(!clusterProxy) {
    clusterProxy = defaultProxy
  }
  return {
    nodeList: allNode,
    clusterProxy
  }
}

export default connect(mapStateToProps, {
  getProxy,
  updateProxy,
  getClusterNodeAddr,
  getAllClusterNodes,
  changeClusterIPsAndDomains
})(Form.create()(NetworkConfiguration))
