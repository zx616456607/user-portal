/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ImageCenter component
 *
 * v0.1 - 2016-10-08
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Modal, Tabs, Menu, Button, Card, Form, Input } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import TweenOne from 'rc-tween-one';
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ImageDetailBox from './ImageCenter/ImageDetail/Index.js'
import ImageSpace from './ImageCenter/ImageSpace.js'
import MyCollection from './ImageCenter/MyCollection.js'
import PublicSpace from './ImageCenter/PublicSpace.js'
import OtherSpace from './ImageCenter/OtherSpace.js'
import "./style/ImageCenter.less"

let TweenOneGroup = TweenOne.TweenOneGroup;
const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const createForm = Form.create;
const FormItem = Form.Item;



let MyComponent = React.createClass({
  getInitialState: function () {
    //this function for init the state
    return {
      UrlReverse: false,
      UrlPaused: true,
      UrlMoment: null,
      NameReverse: false,
      NamePaused: true,
      NameMoment: null,
      EmailReverse: false,
      EmailPaused: true,
      EmailMoment: null,
      PwdReverse: false,
      PwdPaused: true,
      PwdMoment: null,
      urlInput: null,
      nameInput: null,
      emailInput: null,
      pwdInput: null
    };
  },
  propTypes: {
    config: React.PropTypes.array,
  },
  selectSpaceType(type) {
    //this function for user select new other image space type
    const scope = this.props.scope;
    scope.setState({
      otherSpaceType: type
    });
  },
  inputOnFocus(current) {
    //this function for user focus on current input and the title will be add an animate
    switch (current) {
      case "url":
        this.setState({
          UrlReverse: false,
          UrlPaused: false,
          UrlMoment: null
        });
        break;
      case "name":
        this.setState({
          NameReverse: false,
          NamePaused: false,
          NameMoment: null
        });
        break;
      case "email":
        this.setState({
          EmailPaused: false,
          EmailReverse: false,
          EmailMoment: null
        });
        break;
      case "password":
        this.setState({
          PwdPaused: false,
          PwdReverse: false,
          PwdMoment: null
        });
        break;
    }
  },
  inputOnBlur(current) {
    //this function for user blur out current input and the title will be add an animate
    let urlInput = this.refs.urlInput;
    let emailInput = this.refs.emailInput;
    let nameInput = this.refs.nameInput;
    let pwdInput = this.refs.pwdInput;
    switch (current) {
      case "url":
        if (!!!urlInput.props.value) {
          //it's meaning user hadn't input message in the input box so that the title will be move
          this.setState({
            UrlPaused: false,
            UrlReverse: true,
            UrlMoment: null
          });
        }
        break;
      case "name":
        if (!!!nameInput.props.value) {
          this.setState({
            NamePaused: false,
            NameReverse: true,
            NameMoment: null
          });
        }
        break;
      case "email":
        if (!!!emailInput.props.value) {
          this.setState({
            EmailPaused: false,
            EmailReverse: true,
            EmailMoment: null
          });
        }
        break;
      case "password":
        if (!!!pwdInput.props.value) {
          this.setState({
            PwdPaused: false,
            PwdReverse: true,
            PwdMoment: null
          });
        }
        break;
    }
  },
  handleReset(e) {
    //this function for user close add other image space modal
    e.preventDefault();
    this.props.form.resetFields();
    const scope = this.props.scope;
    scope.setState({
      createModalShow: false
    });
  },
  handleSubmit(e) {
    //this function for user submit add other image space
    e.preventDefault();
    const scope = this.props.scope;
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        //it's mean there are some thing is null,user didn't input

        return;
      }
      //when the code running here,it's meaning user had input all things,
      //and should submit the message to the backend
      scope.setState({
        createModalShow: false
      });
    });
  },
  render() {
    const scope = this.props.scope;
    const { getFieldProps, getFieldError, isFieldValidating } = this.props.form;
    const urlProps = getFieldProps('url', {
      rules: [
        { required: true, message: '请输入地址' }
      ],
    });
    const emailProps = getFieldProps('email', {
      validate: [{
        rules: [
          { required: true, message: '请输入邮箱地址' },
        ],
        trigger: 'onBlur',
      }, {
        rules: [
          { type: 'email', message: '请输入正确的邮箱地址' },
        ],
        trigger: ['onBlur', 'onChange'],
      }],
    });
    const nameProps = getFieldProps('name', {
      rules: [
        { required: true, message: '请输入用户名' }
      ],
    });
    const passwdProps = getFieldProps('passwd', {
      rules: [
        { required: true, whitespace: true, message: '请填写密码' },
      ],
    });
    return (
      <div className="modalBox">
        <div className="selectBox">
          <div className={scope.state.otherSpaceType == "1" ? "selectedType" : "typeDetail"} onClick={this.selectSpaceType.bind(this, "1")}>
            <i className="testIcon fa fa-soundcloud"></i>
            <p>我是来凑热闹的</p>
            <i className="selectedIcon fa fa-check-circle"></i>
          </div>
          <div className={scope.state.otherSpaceType == "2" ? "selectedType" : "typeDetail"} onClick={this.selectSpaceType.bind(this, "2")}>
            <i className="testIcon fa fa-gg"></i>
            <p>我也是来凑热闹的</p>
            <i className="selectedIcon fa fa-check-circle"></i>
          </div>
          <div className={scope.state.otherSpaceType == "3" ? "selectedType" : "typeDetail"} onClick={this.selectSpaceType.bind(this, "3")}>
            <i className="testIcon fa fa-cogs"></i>
            <p>我吃瓜</p>
            <i className="selectedIcon fa fa-check-circle"></i>
          </div>
          <div style={{ clear: "both" }} ></div>
        </div>
        <Form className="addForm" horizontal form={this.props.form}>
          <FormItem hasFeedback >
            <TweenOne
              animation={{ top: '-20', duration: 500 }}
              paused={this.state.UrlPaused}
              reverse={this.state.UrlReverse}
              moment={this.state.UrlMoment}
              style={{ position: "absolute", width: "10%", top: "0" }}
              >
              <span className="title" key="title">地址</span>
            </TweenOne>
            <Input {...urlProps} ref="urlInput" onFocus={this.inputOnFocus.bind(this, "url")} onBlur={this.inputOnBlur.bind(this, "url")} />
          </FormItem>
          <FormItem hasFeedback >
            <TweenOne
              animation={{ top: '-20', duration: 500 }}
              paused={this.state.EmailPaused}
              reverse={this.state.EmailReverse}
              moment={this.state.EmailMoment}
              style={{ position: "absolute", width: "10%", top: "0" }}
              >
              <span className="title">邮箱</span>
            </TweenOne>
            <Input {...emailProps} type="email" ref="emailInput" onFocus={this.inputOnFocus.bind(this, "email")} onBlur={this.inputOnBlur.bind(this, "email")} />
          </FormItem>
          <FormItem hasFeedback >
            <TweenOne
              animation={{ top: '-20', duration: 500 }}
              paused={this.state.NamePaused}
              reverse={this.state.NameReverse}
              moment={this.state.NameMoment}
              style={{ position: "absolute", width: "10%", top: "0" }}
              >
              <span className="title">用户名</span>
            </TweenOne>
            <Input {...nameProps} ref="nameInput" onFocus={this.inputOnFocus.bind(this, "name")} onBlur={this.inputOnBlur.bind(this, "name")} />
          </FormItem>
          <FormItem hasFeedback >
            <TweenOne
              animation={{ top: '-20', duration: 500 }}
              paused={this.state.PwdPaused}
              reverse={this.state.PwdReverse}
              moment={this.state.PwdMoment}
              style={{ position: "absolute", width: "10%", top: "0" }}
              >
              <span className="title">密码</span>
            </TweenOne>
            <Input {...passwdProps} ref="pwdInput" type="password" autoComplete="off" onFocus={this.inputOnFocus.bind(this, "password")} onBlur={this.inputOnBlur.bind(this, "password")} />
          </FormItem>
          <div className="btnBox">
            <Button size="large" type="primary" onClick={this.handleSubmit}>确定</Button>
            &nbsp;&nbsp;&nbsp;
		        <Button size="large" onClick={this.handleReset}>取消</Button>
          </div>
        </Form>
      </div>
    );
  },
});

MyComponent = createForm()(MyComponent);

class ImageCenter extends Component {
  constructor(props) {
    super(props);
    this.selectCurrentTab = this.selectCurrentTab.bind(this);
    this.addImageTab = this.addImageTab.bind(this);
    this.closeAddModal = this.closeAddModal.bind(this);
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this);
    this.state = {
      current: "imageSpace",
      otherSpace: null,
      createModalShow: false,
      otherSpaceType: "1",
      imageDetailModalShow: false
    }
  }

  selectCurrentTab(current, type) {
    //this function for user select current show tabs
    this.setState({
      current: current
    });
    //if user select other space is not default space,so that change state
    if (type != "default") {
      this.setState({
        otherSpace: type
      });
    }
  }

  addImageTab() {
    //this function for user add other image store modal
    this.setState({
      createModalShow: true,
      otherSpaceType: "1"
    });
  }

  closeAddModal() {
    //this function for user close add other image store modal
    this.setState({
      createModalShow: false
    });
  }

  closeImageDetailModal() {
    //this function for user close the modal of image detail info
    this.setState({
      imageDetailModalShow: false
    });
  }

  render() {
    const { current } = this.state;
    const { otherSpace } = this.state;
    const { formatMessage } = this.props.intl;
    const scope = this;
    return (
      <QueueAnim className="ImageCenterBox"
        type="right"
        >
        <div id="ImageCenter" key="ImageCenterBox">
          <Card className="imageList">
            <ul>
              <li className={current == "imageSpace" ? "titleSelected" : "titleDetail"}
                onClick={this.selectCurrentTab.bind(this, "imageSpace", "default")}
                >
                <span>镜像空间</span>
              </li>
              <li className={current == "publicSpace" ? "titleSelected" : "titleDetail"}
                onClick={this.selectCurrentTab.bind(this, "publicSpace", "default")}
                >
                <span>公有空间</span>
              </li>
              <li className={current == "myCollection" ? "titleSelected" : "titleDetail"}
                onClick={this.selectCurrentTab.bind(this, "myCollection", "default")}
                >
                <span>我的收藏</span>
              </li>
              <li className={current == "otherSpace" ? "titleSelected" : "titleDetail"}
                onClick={this.selectCurrentTab.bind(this, "otherSpace", "dockerhub")}
                >
                <span>dockerhub</span>
              </li>
              <div style={{ clear: "both" }}></div>
            </ul>
            <Button className="addBtn" size="large" type="primary" onClick={this.addImageTab}>
              <i className="fa fa-plus"></i>&nbsp;
							添加第三方
						</Button>
            <div style={{ clear: "both" }}></div>
          </Card>
          {current == "imageSpace" ? [<ImageSpace scope={scope} />] : null}
          {current == "publicSpace" ? [<PublicSpace scope={scope} />] : null}
          {current == "myCollection" ? [<MyCollection scope={scope} />] : null}
          {current == "otherSpace" ? [<OtherSpace scope={scope} config={otherSpace} />] : null}
          <Modal title="添加第三方" className="addOtherSpaceModal" visible={this.state.createModalShow}
            onCancel={this.closeAddModal}
            >
            <MyComponent scope={scope} />
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

ImageCenter.propTypes = {
  intl: PropTypes.object.isRequired
}

export default connect()(injectIntl(ImageCenter, {
  withRef: true,
}))