/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Cluster info list component
 *
 * v0.1 - 2017-2-24
 * @author BaiYu
 */
import React from 'react'
import { Icon, Select, Button, Card, Form, Input, Tooltip, Spin, Modal, Dropdown, Menu,Row,Col } from 'antd'
import { updateCluster, loadClusterList, deleteCluster } from '../../actions/cluster'
import NotificationHandler from '../../common/notification_handler'
import { connect } from 'react-redux'
import networkImg from '../../assets/img/integration/network.png'
import { IP_REGEX, HOST_REGEX } from '../../../constants'

let saveBtnDisabled = true
let formadd=1;
let NetworkConfiguration = React.createClass ({
  getInitialState() {
    return {
      editCluster: false, // edit btn
    }
  },
  componentWillMount(){
    const { getFieldProps, getFieldValue } = this.props.form;
    getFieldProps('arr', {
      initialValue: [0],
    });
  }, 
  getItems() {
    const { cluster, form } = this.props
    const { getFieldProps, getFieldValue } = form;
    const { editCluster, saveBtnLoading } = this.state
    let {bindingIPs} = cluster

    const nodeIPsProps = getFieldProps('bindingIPs',{
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
    let arr = form.getFieldValue('arr');
    if(!arr) {
      return <div></div>
    }
    return arr.map(item => {
      return <div key={item}><Form.Item>
        <div className="formItem">
          <Select style={{width:'230px'}} placeholder="Please select a country">
            <Option value="china">China</Option>
            <Option value="use">U.S.A</Option>
          </Select>
        </div>
        <div className="formItem">
          { editCluster ?
          <Input {...nodeIPsProps} style={{width:'240px',margin:'0px 100px'}}  placeholder="输入服务出口 IP" />
          :
          <span className="h5" style={{margin:'0px 100px'}}>123</span>
          }
        </div>
      </Form.Item></div>
    })
  },
  add (){
    formadd++ 
    const {form} = this.props;
    const { getFieldProps, getFieldValue } = form;
    let arr = form.getFieldValue('arr');
    arr.push(formadd);
    form.setFieldsValue({
      arr,
    });
  },
  render (){
    const { cluster, form } = this.props
    const { editCluster, saveBtnLoading } = this.state
    const { getFieldProps } = form
    let {bindingIPs,bindingDomains} = cluster
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
    const dropdown = (
      <Menu style={{ width: "100px" }} >
        <Menu.Item>
          删除配置
        </Menu.Item>
      </Menu>
    );
    return (
      <Card id="Network" className="ClusterInfo">
        <div className="h3">网路配置
          {!editCluster?
            <Dropdown.Button overlay={dropdown} type="ghost" style={{float:'right',marginTop:'6px'}} onClick={()=> this.setState({editCluster: true})}>
              编辑配置
            </Dropdown.Button>
            :
            <div style={{float:'right'}}>
              <Button
                onClick={()=> {
                  this.setState({editCluster: false, saveBtnLoading: false})
                  saveBtnDisabled = true
                }}>
                取消
              </Button>
              <Button
                loading={saveBtnLoading}
                disabled={saveBtnDisabled}
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
          <div style={{width:'40%'}} className="formItem">
            <Form.Item >
              <div className="h4 blod">服务内网IP  <Icon type="question-circle-o" /></div>
            </Form.Item>
              <Row>
                <Col xs={{span:6}}>代理节点</Col><Col xs={{span:10,offset:8}}>节点的网卡IP(多网卡时请确认)</Col>
              </Row>
              {this.getItems()}
              <Form.Item  style={{margin:'15px 0px',color:'#2db7f5',cursor: 'pointer'}}>
                <Icon onClick={this.add} type="plus-circle-o"/> 新增一条内网代理
              </Form.Item>
          </div>

          <div className="formItem" style={{margin:'0px 0px 0px 220px'}}>
            <Form.Item >
              <div className="h4 blod">服务外网IP (可选)  <Icon type="question-circle-o" /></div>
            </Form.Item>
            <Form.Item>
               { editCluster ?
                <Input {...bindingIPsProps} style={{width:'260px'}}  placeholder="请填写服务的外网 IP (如 浮动IP)" />
                :
                <span>{bindingIPs}</span>
                }
            </Form.Item>
            <Form.Item >
              <div className="h4 blod">服务域名配置 (可选)  <Icon type="question-circle-o" /></div>
            </Form.Item>
            <Form.Item>
               { editCluster ?
                <Input {...bindingDomainsProps} style={{width:'260px'}}  placeholder="请填写该集群配置的映射域名" />
                :
                <span>{bindingDomains}</span>
                }
            </Form.Item>
          </div>
        </Form>
      </Card>
    )
  } 
})
export default Form.create()(NetworkConfiguration);