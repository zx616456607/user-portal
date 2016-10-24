/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * CreateModel component
 *
 * v0.1 - 2016-09-18
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Card, Button, Form, Dropdown, Select, Menu,} from 'antd'
import { Link } from 'react-router'
import QueueAnim from 'rc-queue-anim'
import './style/CreateModel.less'

const FormItem = Form.Item;
const createForm = Form.create;
const Option = Select.Option;
const operaMenu = (<Menu>
  <Menu.Item key="0">
    重新部署
  </Menu.Item>
  <Menu.Item key="1">
    弹性伸缩
  </Menu.Item>
  <Menu.Item key="2">
    灰度升级
  </Menu.Item>
  <Menu.Item key="3">
    更改配置
  </Menu.Item>
</Menu>);

class CreateModel extends Component {
  constructor(props) {
    super(props)
    this.selectCreateModel = this.selectCreateModel.bind(this)
    this.clusterNameCheck = this.clusterNameCheck.bind(this)
    this.state = {
      createModel: "fast",
      linkUrl: "fast_create",
      disabled: true
    }
  }

  selectCreateModel(currentSelect) {
    //user select current create model,so that current selected model's css will be change
    let linkUrl = "";
    if (currentSelect == "fast") {
      linkUrl = "fast_create"
    } else if (currentSelect == "store") {
      linkUrl = "app_store"
    } else if (currentSelect == "layout") {
      linkUrl = "compose_file"
    }
    const parentScope = this.props.scope;
    this.setState({
      createModel: currentSelect,
      linkUrl: linkUrl
    });
    parentScope.setState({
      createModel: currentSelect
    });
  }
  clusterNameCheck(rule, value, callback){
    if(!value){
      callback([new Error('请选择集群')])
    } else {
      window.localStorage.setItem('cluster',value)
      this.setState({
        disabled: false
      })
      callback()
    }
  }
  render() {
    const { children, form} = this.props
    const { getFieldProps, getFieldValue, getFieldError, isFieldValidating } = form
    const { createModel, linkUrl} = this.state
    const clusterFormCheck = getFieldProps('clusterFormCheck',{
      rules: [
        { validator: this.clusterNameCheck }
      ]
    })
    return (
      <QueueAnim
        id="CreateModel"
        type="right"
        >
        <div className="CreateModel" key="CreateModel">
          <div className="topBox">
            <div className="contentBox">
              <div className={createModel == "fast" ? "fastCreate commonBox selectedBox" : "fastCreate commonBox"} onClick={this.selectCreateModel.bind(this, "fast")}>
                <svg className="commonImg">
                  <use xlinkHref="#appcreatefast" />
                </svg>
                <div className="infoBox">
                  <p>快速创建</p>
                  <span>这是一个快速创建的介绍,怎么说呢,就是创建很快的,然后呢,总之呢,就是很快了!</span>
                </div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div className={createModel == "store" ? "appStore commonBox selectedBox" : "appStore commonBox"} onClick={this.selectCreateModel.bind(this, "store")}>
                <svg className="commonImg">
                  <use xlinkHref="#appstore" />
                </svg>
                <div className="infoBox">
                  <p>应用商城</p>
                  <span>这是一个应用商城的介绍,啥应用都有,要啥有啥,啥啥都有的,就看你能不想到了!</span>
                </div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
              <div className={createModel == "layout" ? "layout commonBox selectedBox" : "layout commonBox"} onClick={this.selectCreateModel.bind(this, "layout")}>
                <svg className="commonImg">
                  <use xlinkHref="#appcreatelayout" />
                </svg>
                <div className="infoBox">
                  <p>编排文件</p>
                  <span>这是一个编排文件的介绍,如果你感觉你可以自己直接写呢,那就选这个好啦,反正我是不会写!</span>
                </div>
                <svg className="commonSelectedImg">
                  <use xlinkHref="#appcreatemodelselect" />
                </svg>
                <i className="fa fa-check"></i>
              </div>
  
              <div className="envirBox">
                <Form>
                  <FormItem hasFeedback>
                    <span>部署环境</span>
                    <Dropdown overlay={operaMenu} trigger={['click']}>
                      <Button size="large" type="ghost">
                        请选择空间
                        <i className="fa fa-caret-down" />
                      </Button>
                    </Dropdown>
                    <Select size="large"
                            defaultValue="请选择集群"
                            style={{ width: 200 }}
                            {...clusterFormCheck}>
                      <Option value="cce1c71ea85a5638b22c15d86c1f61de">test</Option>
                      <Option value="cce1c71ea85a5638b22c15d86c1f61df">产品环境</Option>
                      <Option value="e0e6f297f1b3285fb81d27742255cfcf">k8s 1.4</Option>
                    </Select>
                  </FormItem>
                </Form>
              </div>
              
              <div style={{ clear: "both" }}></div>
            </div>
          </div>
          <div className="bottomBox">
            <Link to="/app_manage">
              <Button size="large">
                取消
              </Button>
            </Link>
            <Link to={`/app_manage/app_create/${linkUrl}`}>
              <Button size="large" type="primary" disabled={this.state.disabled}>
                下一步
                </Button>
            </Link>
          </div>
        </div>
      </QueueAnim>
    )
  }
}

CreateModel.propTypes = {
  // Injected by React Router
}
CreateModel = createForm()(CreateModel)
export default CreateModel