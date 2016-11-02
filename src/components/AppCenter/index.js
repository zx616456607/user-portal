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
import { Modal, Tabs, Icon, Menu, Button, Card, Form, Input, message } from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import TweenOne from 'rc-tween-one';
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ImageDetailBox from './ImageCenter/ImageDetail'
import ImageSpace from './ImageCenter/ImageSpace.js'
import MyCollection from './ImageCenter/MyCollection.js'
import PublicSpace from './ImageCenter/PublicSpace.js'
import OtherSpace from './ImageCenter/OtherSpace.js'
import "./style/ImageCenter.less"
import { LoadOtherImage, getOtherImageList, addOtherStore, getImageDetailInfo, deleteOtherImage } from '../../actions/app_center'
import { findIndex } from 'lodash'

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
      textareaInput: null,
      pwdInput: null,
      registryInput: null,
      regMoment: null,
      regPaused: true,
      regReverse: false,

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
      case "username":
        this.setState({
          NameReverse: false,
          NamePaused: false,
          NameMoment: null
        });
        break;
      case "password":
        this.setState({
          PwdPaused: false,
          PwdReverse: false,
          PwdMoment: null
        });
        break;
      case "registryName":
        this.setState({
          regPaused: false,
          regReverse: false,
          regMoment: null
        });
        break;
    }
  },
  inputOnBlur(current) {
    //this function for user blur out current input and the title will be add an animate
    let urlInput = this.refs.urlInput;
    let textareaInput = this.refs.textareaInput;
    let nameInput = this.refs.nameInput;
    let pwdInput = this.refs.pwdInput;
    let registryInput = this.refs.registryInput
    switch (current) {
      case "url":
        if (!urlInput.props.value) {
          //it's meaning user hadn't input message in the input box so that the title will be move
          this.setState({
            UrlPaused: false,
            UrlReverse: true,
            UrlMoment: null
          });
        }
        break;
      case "username":
        if (!nameInput.props.value) {
          this.setState({
            NamePaused: false,
            NameReverse: true,
            NameMoment: null
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
      case "registryName":
        if (!!!registryInput.props.value) {
          this.setState({
            regPaused: false,
            regReverse: true,
            regMoment: null
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
      const config = {
        registryName: values.registryName,
        username: values.username,
        password: values.passwd || null,
        url: values.url,
        description: values.description || null
      }
      const self = this
      this.props.addOtherStore(config, {
        success: {
          func: (res) => {
            message.success('添加第三方镜像成功')
            setTimeout(() => {
              scope.props.LoadOtherImage({
                success: {
                  func: (res) => {
                    scope.setState({
                      otherImageHead: res.data
                    })
                    self.props.form.resetFields()
                  }
                }
              })

            }, 500)
          }
        },
        isAsync: true
      })
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
    const emailProps = getFieldProps('description', {
      validate: [{
        rules: [
          { required: false, message: '描述' },
        ]
      }],
    });
    const nameProps = getFieldProps('username', {
      rules: [
        { required: true, message: '请输入用户名' }
      ],
    });
    const passwdProps = getFieldProps('passwd', {
      rules: [
        { required: true, whitespace: true },
      ],
    });
    const registryProps = getFieldProps('registryName', {
      rules: [{ required: true, whitespace: true }]
    })
    return (
      <div className="modalBox">
        <Form className="addForm" horizontal form={this.props.form}>
          <FormItem hasFeedback >
            <TweenOne
              animation={{ top: '-20', duration: 500 }}
              paused={this.state.regPaused}
              reverse={this.state.regReverse}
              moment={this.state.regMoment}
              style={{ position: "absolute", width: "10%", top: "0" }}
              >
              <span className="title" key="name">仓库名</span>
            </TweenOne>
            <Input {...registryProps} ref="registryInput" onFocus={this.inputOnFocus.bind(this, "registryName")} onBlur={this.inputOnBlur.bind(this, "registryName")} />
          </FormItem>
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
              paused={this.state.NamePaused}
              reverse={this.state.NameReverse}
              moment={this.state.NameMoment}
              style={{ position: "absolute", width: "10%", top: "0" }}
              >
              <span className="title">用户名</span>
            </TweenOne>
            <Input {...nameProps} ref="nameInput" onFocus={this.inputOnFocus.bind(this, "username")} onBlur={this.inputOnBlur.bind(this, "username")} />
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
          <FormItem hasFeedback >
            <TweenOne
              animation={{ top: '-20', duration: 500 }}
              paused={this.state.EmailPaused}
              reverse={this.state.EmailReverse}
              moment={this.state.EmailMoment}
              style={{ paddingLeft: '10px' }}
              >
              <span>描述</span>
            </TweenOne>
            <Input {...emailProps} type="textarea" ref="textareaInput" rows="5" />
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

// const otherHead = React.createClass({
//   cosnt otherImageList = this.props.otherImageList
//   let kke = otherImageList.map((list) => {
//    return (
//     <li className={current == "otherSpace" ? "titleSelected" : "titleDetail"}
//       onClick={this.selectCurrentTab.bind(this, "otherSpace", "dockerhub",list.id)}
//       >
//       <span>list.title</span>
//     </li>

//   )
// })
// })
class ImageCenter extends Component {
  constructor(props) {
    super(props);
    this.selectCurrentTab = this.selectCurrentTab.bind(this);
    this.addImageTab = this.addImageTab.bind(this);
    this.closeAddModal = this.closeAddModal.bind(this);
    this.closeImageDetailModal = this.closeImageDetailModal.bind(this);
    this.state = {
      current: "imageSpace",
      // otherSpace: null,
      createModalShow: false,
      otherSpaceType: "1",
      imageDetailModalShow: false,
      otherHead: {},
      otherImageHead:[]
    }
  }
  componentDidMount() {
    this.props.LoadOtherImage({
      success: {
        func: (res) => {
          this.setState({
            otherImageHead: res.data
          })

        }
      }
    });
  }
  selectCurrentTab(current, list, type) {
    //if user select other space is not default space,so that change state
    //this function for user select current show tabs
    this.setState({
      current: current,
    });
    if (type != "default") {
      this.setState({
        otherSpace: type
      });
    }
    if (list.id) {
      const scope = this
      this.props.getOtherImageList(list.id)
      const otherHead = this.state.otherImageHead
      let Index = findIndex(otherHead, item => {
        return item.id === list.id
      })
      this.setState({
        otherHead: otherHead[Index]
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
    const { current, otherSpace } = this.state;
    const { formatMessage } = this.props.intl;
    const scope = this;
    const otherImageHead = this.state.otherImageHead || []
    return (
      <QueueAnim className="ImageCenterBox"
        type="right"
        >
        <div id="ImageCenter" key="ImageCenterBox">
          <Card className="imageList">
            <ul>
              <li className={current == "imageSpace" ? "titleSelected" : "titleDetail"}
                onClick={this.selectCurrentTab.bind(this, "imageSpace")}
                >
                <span>私有空间</span>
              </li>
              <li className={current == "publicSpace" ? "titleSelected" : "titleDetail"}
                onClick={this.selectCurrentTab.bind(this, "publicSpace")}
                >
                <span>公有空间</span>
              </li>
              <li className={current == "myCollection" ? "titleSelected" : "titleDetail"}
                onClick={this.selectCurrentTab.bind(this, "myCollection")}
                >
                <span>我的收藏</span>
              </li>
              <li><div style={{ height: '30px', marginTop: '10px', width: '0', borderLeft: '1px solid #d9d9d9' }}></div></li>
              {otherImageHead.length > 0 && otherImageHead.map(list => {
                return (
                  <li className={otherSpace == list.id ? "titleSelected" : "titleDetail"}
                    onClick={this.selectCurrentTab.bind(this, "otherRegistry", list, list.id)} >
                    <Icon type="shopping-cart" />&nbsp;
                  <span>{list.title}</span>
                  </li>
                )
              })
              }
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
          {current == 'otherRegistry' ? [<OtherSpace scope={scope} otherHead={this.state.otherHead} imageId={this.state.otherHead.id} />] : null}
          <Modal title="添加第三方" className="addOtherSpaceModal" visible={this.state.createModalShow}
            onCancel={this.closeAddModal}
            >
            <MyComponent scope={scope} addOtherStore={this.props.addOtherStore} />
          </Modal>
        </div>
      </QueueAnim>
    )
  }
}

ImageCenter.propTypes = {
  intl: PropTypes.object.isRequired
}
function mapStateToProps(state, props) {
  const defaultConfig = {
    isFetching: false,
    otherImageHead: [],
    server: ''
  }
  const { privateImages, otherImages, imagesInfo } = state.images
  const { registry, imageList, isFetching } = privateImages || defaultConfig
  const { imageRow, server} = otherImages || defaultConfig

  return {
    otherImageHead: imageRow,
    isFetching,
    server
  }
}

function mapDispatchToProps(dispatch) {
  return {
    addOtherStore: (obj, callback) => {
      dispatch(addOtherStore(obj, callback))
    },
    LoadOtherImage: (callback) => {
      dispatch(LoadOtherImage(callback))
    },
    getOtherImageList: (id) => {
      dispatch(getOtherImageList(id))
    },
    deleteOtherImage: (obj, callback) => {
      dispatch(deleteOtherImage(obj, callback))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ImageCenter, {
  withRef: true,
}))