import React from 'react'
import { Modal, Button, Input, Select, Row, Col, Form } from 'antd'
import '../style/tabModal.less'
import classNames from 'classNames'
const Option = Select.Option;
const FormItem = Form.Item;
let randomKey = Math.random();//重置表单


class Tab1Modal extends React.Component {
  clickIcon = (e) => {
    this.setState({current: e.target.parentElement.attributes['data-index'].value});
  }
  state = {
    current: "0"
  }
  render(){
    const iconClass1 = classNames({
      'iconCon': true,
      'selectedBox': this.state.current == "1",
    });
    const iconClass2 = classNames({
      'iconCon': true,
      'selectedBox': this.state.current == "2",
    });
    const iconClass3 = classNames({
      'iconCon': true,
      'selectedBox': this.state.current == "3",
    });
    const iconClass4 = classNames({
      'iconCon': true,
      'selectedBox': this.state.current == "4",
    });
    const formItemLargeLayout = {
      labelCol: { span: 6},
      wrapperCol: { span: 14}
    }
    if(!this.props.visible) randomKey = Math.random();//重置表单
    return (
      <div>
        <Modal
          visible={this.props.visible}
          onOk={this.props.onOk}
          onCancel={this.props.onCancel}
          title="新建资源池配置"
          okText="保存"
          width="550"
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
            <Row key="row1">
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
            <Row key="row2">
              <FormItem
                {...formItemLargeLayout}
                label="vSphere"
              >
                <Input  placeholder="请输入vSphere" />
              </FormItem>
            </Row>
            <Row key="row3">
              <FormItem
                {...formItemLargeLayout}
                label="登录用户名"
              >
                <Input  placeholder="请输入登录用户名" />
              </FormItem>
            </Row>
            <Row key="row4">
              <FormItem
                {...formItemLargeLayout}
                label="登录密码"
              >
                <Input  placeholder="请输入登录密码" />
              </FormItem>
            </Row>
          </div>
        </Modal>
      </div>
    )
  }
};
export default Tab1Modal;
