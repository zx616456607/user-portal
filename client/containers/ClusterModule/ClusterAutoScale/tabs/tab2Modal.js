import React from 'react'
import { Modal, Button, Input, Select } from 'antd'
import '../style/tab2Modal.less'
import classNames from 'classNames'
const Option = Select.Option;


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
    return (
      <div>
        <Modal
          visible={this.props.visible}
          onOk={this.props.onOk}
          onCancel={this.props.onCancel}
          title="新建资源池配置"
          okText="保存"
          width="550"
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
          <div className="formConatainer">
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
              <div className="left">vSphere</div>
              <div className="right">
                <Input  />
              </div>
              <div className="clearBoth"></div>
            </div>
            <div className="row">
              <div className="left">登录用户名</div>
              <div className="right">
                <Input  />
              </div>
              <div className="clearBoth"></div>
            </div>
            <div className="row noMB">
              <div className="left">登录密码</div>
              <div className="right">
                <Input  />
              </div>
              <div className="clearBoth"></div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
};
export default Tab1Modal;
