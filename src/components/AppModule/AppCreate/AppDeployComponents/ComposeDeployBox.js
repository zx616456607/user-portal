/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ComposeDeployBox component
 *
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form, Select, Input, InputNumber, Modal, Checkbox, Button, Card, Menu, Switch, Radio, Icon, Spin  } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import merge from 'lodash/merge'
import findIndex from 'lodash/findIndex'
import QueueAnim from 'rc-queue-anim'
import "./style/ComposeDeployBox.less"
import { loadConfigGroup, configGroupName } from '../../../../actions/configs'
const createForm = Form.create;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group
let uuid = 1;

let MyComponent = React.createClass({
  getInitialState() {
    return {
      checkAll: [],
      checkedList:[],
      plainOptions:[],
      cluster: window.localStorage.getItem('cluster'),
      selectValue: [],
    };
  },
  propTypes: {
    config: React.PropTypes.array
  },
  componentWillMount() {
    this.props.loadConfigGroup(this.state.cluster)
  },
  remove(k) {
    const { form } = this.props.parentScope.props;
    // can use data-binding to get
    let volKey = form.getFieldValue('volKey');
    volKey = volKey.filter((key) => {
      return key !== k;
    });
    if(volKey.length <= 0 ) {
      form.setFieldsValue({
        config: false
      });
    }
    // can use data-binding to set
    form.setFieldsValue({
      volKey,
    });
  },
  add() {
    uuid++;
    const { form } = this.props.parentScope.props;
    // can use data-binding to get
    let volKey = form.getFieldValue('volKey');
    volKey = volKey.concat(uuid);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      volKey,
      config: true
    });
  },
  getOptionsList() {
    const cluster = this.state.cluster
    const { isFetching } = this.props.configGroup[cluster]
    if(isFetching) {
      return <Option></Option>
    }
    const configGroup = this.props.configGroup[cluster].configGroup
    const plainOptions = this.state.plainOptions
    if(!configGroup || configGroup.length <= 0) {
      return <Option></Option>
    }
    return configGroup.map((item, index) => { 
      plainOptions[index] = {}
      plainOptions[index].name = item.name
      plainOptions[index].displayName = []   
      plainOptions[index].key = []   
      item.configs.forEach(config => {
        plainOptions[index].displayName.push(config.displayName)
        plainOptions[index].key.push(config.name)
      })
      return (<Option value={item.name}>{item.name}</Option>)
    })
  },
  onChange(checkedList, index) {
    const { form } = this.props
    const { getFieldProps, setFieldsValue } = form
    const oldCheckedList = this.state.checkedList
    if (!checkedList || checkedList.length <= 0) {
      const checkAll = this.state.checkAll
      checkAll[index] = false
      oldCheckedList[index].items = []
      this.setState({
        checkedList: oldCheckedList,
        checkAll
      })
      setFieldsValue({
        [`vol${k}`]: []
      })
      return
    }
    const configName = oldCheckedList[index].name
    const plainOptions = this.state.plainOptions
    let plIndex = findIndex(plainOptions, pl => {
      return pl.name === configName
    })
    const pl = plainOptions[plIndex]
    const nameArray = []
    const displayNames = pl.displayName
    if(checkedList.length === displayNames.length) {
      const checkAll = this.state.checkAll
      checkAll[index] = true
      this.setState({
        checkAll
      })
    }
    checkedList.forEach(item => {
      let index = findIndex(displayNames, displayName => {
        return displayName === item
      })
      nameArray.push(pl.name[index])
    })
    oldCheckedList[index] = {
      name: pl.name,
      items: checkedList.map((item, index) => {
        return {
          key: nameArray[index],
          path: checkedList[index]
        }
      })
    }
    setFieldsValue({
      [`vol${k}`]: oldCheckedList[index]
    })
    this.setState({
      checkedList: oldCheckedList
    })
  },
  onCheckAllChange(e, k) {
    const cluster = this.state.cluster
    const checkAll = this.state.checkAll
    checkAll[k -1] = e.target.checked
    this.setState({
      checkAll
    })
    const { form } = this.props
    const { getFieldProps, setFieldsValue } = form
    const configName = getFieldProps(`volName${k}`)
    let oldCheckedList = this.state.checkedList
    if (!e.target.checked) {
      setFieldsValue({
        [`vol${k}`]: []
      })
      oldCheckedList[k-1].items = []
      this.setState({
        checkedList: oldCheckedList,
      })
      return
    } 
    let configList = this.props.configGroup[cluster].configGroup
    let index = findIndex(configList, c => {
      return c.name === configName.value
    })
    const config = configList[index]
    let newConfig = {
      name: config.name,
      items: config.configs.map(item => {
        return {
          key: item.name,
          path: item.displayName
        }
      })
    }
    oldCheckedList[k - 1] = newConfig
    this.setState({
      checkedList: oldCheckedList,
    }) 
    setFieldsValue({
      [`vol${k}`]: newConfig
    })
  },
  selectChange(name, index) {
    const { form } = this.props
    const { setFieldsValue } = form
    setFieldsValue({
      [`volName${index+1}`]: name
    })
    const checkAll = this.state.checkAll
    checkAll[index] = false
    const selectValue = this.state.selectValue
    selectValue[index] = name
    this.setState({
      selectValue,
      checkAll
    })
    this.state.checkedList[index] = {
      name: name,
      items: []
    }
  },
  getPlainOptions(index) {
    const configName = this.state.checkedList[index].name
    let plIndex = findIndex(this.state.plainOptions, pl => {
      return pl.name === configName
    })
    return this.state.plainOptions[plIndex].displayName
  },
  getInitValue(k) {
    const { form } = this.props
    const { getFieldProps, setFieldsValue } = form
    const configName = getFieldProps(`volName${k}`).value
    if(!configName) return ''
    let index = findIndex(this.state.checkedList, item => {
      return item.name === configName
    })
    if(index <= 0) return ''
     setFieldsValue({
       [`volitem${k}`]: this.state.checkedList[index].items
     })
  },
  getCheckboxValue(index) {
    const checkList = this.state.checkedList[index]
    return checkList.items.map(item => {
      return item.path
    })
  },
  render() {
    const cluster = this.state.cluster
    if(!this.props.configGroup[cluster]) return <div></div>
    const isFetching = this.props.configGroup[cluster].isFetching
    if(isFetching) {
      return (<div className='loadingBox'>
        <Spin size='large' />
      </div>)
    }
    const { form } = this.props
    const { getFieldProps, getFieldValue, } = form
    getFieldProps('volKey', {
      initialValue: [1],
    });
    const formItems = getFieldValue('volKey').map((k) => {
      return (
        <FormItem key={`vol${k}`}>
          <li className="composeDetail">
            <div className="input">
              <Input {...getFieldProps(`volPath${k}`, {})} className="portUrl" type="text" />
            </div>
            <div className="protocol select">
              <div className="portGroupForm">
                <Select
                  placeholder = "请选择配置组"
                  value = {this.state.selectValue[k-1]}
                  className="composeGroup" size="large"  onChange={(value) => this.selectChange(value, k-1)}>
                  {this.getOptionsList()}
                </Select>
              </div>
            </div>
           <div className="check">
              {getFieldProps(`volName${k}`).value ?  <span><Checkbox checked={this.state.checkAll[k-1]} onChange={(e) => this.onCheckAllChange(e, k) } /><span>&nbsp;&nbsp;全选</span><br/>
              <CheckboxGroup options={this.getPlainOptions(k-1)} onChange={(list) => this.onChange(list, k - 1) } value={this.getCheckboxValue(k-1)} /></span> : null}
            </div>
            <div className="opera">
              <i className="fa fa-trash-o" onClick={() => this.remove(k)}/>
            </div>
            <div style={{ clear: "both" }}></div>
          </li>
        </FormItem>
      )
    });
    return (
      <div>
        <ul>
          {formItems}
        </ul>
        <div className="addBtn" onClick={this.add}>
          <Icon type="plus-circle-o" />
          <span>添加</span>
        </div>
      </div>
    );
  }
});

function mapStateToProp(state) {
  return {
    configGroup: state.configReducers.configGroupList
  }
}

MyComponent = connect(mapStateToProp, {
  loadConfigGroup
})(MyComponent)

let ComposeDeployBox = React.createClass({
  render:function () {
    const { form } = this.props
    const parentScope = this.props.scope;
    return (
      <div id="ComposeDeployBox">
        <div className="composeBox">
          <span className="title">配置目录</span>
          <div className="composeList">
            <div className="composeTitle">
              <div className="composeCommonTitle">
                <span>挂载目录</span>
              </div>
              <div className="composeCommonTitle">
                <span>配置组</span>
              </div>
              <div className="composeCommonTitle">
                <span>配置文件</span>
              </div>
              <div className="composeCommonTitle">
                <span>操作</span>
              </div>
              <div style={{ clear: "both" }}></div>
            </div>
            <MyComponent parentScope={parentScope} form={form}/>
          </div>
        </div>
      </div>
    )
  }
})

export default ComposeDeployBox


