/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Pop content
 *
 * v0.1 - 2016-11-15
 * @author Zhangpc
 */
import React, { Component, PropTypes } from 'react'
import { Input, Button, Spin, Icon, Select } from 'antd'
import './style/Content.less'
import { MY_SPACE } from '../../constants'
import classNames from 'classnames'
const Option = Select.Option;
const mode = require('../../../configs/model').mode
const standard = require('../../../configs/constants').STANDARD_MODE
import NotificationHandler from '../../common/notification_handler'

class PopSelect extends Component {
  constructor(props) {
    super(props)
    this.handleSearchInput = this.handleSearchInput.bind(this)
    this.state={
      value: '',
      focus: false,
    }
  }

  componentWillMount() {
    const { list } = this.props
    this.setState({
      list,
    })
  }
  componentWillReceiveProps(nextProps) {
    const { list } = nextProps
    this.setState({
      list,
    })
  }
  handleChange(value) {
    this.setState({ value });
    const { list } = this.props
    const notify = new NotificationHandler()
    let last = [];
    if(value=="" || (value.indexOf(" ")!=-1)){
      last = list
    }else {
      for(let i = 0;i < list.length;i++){
        if((list[i].name).indexOf(value)!=-1) {
          last.push(list[i])
        }
      }
    }
    this.setState({
      list:last
    })
  }
  handleSubmit() {
    let input = document.getElementsByClassName('ant-select-search__field')[0];
    const { value } = this.state;
    const { onChange } = this.props;
    const { list } = this.state;
    const notify = new NotificationHandler()
    let space = list.find((item) => { return value === item.spaceName })
    if (space) {
      onChange(space)
      this.setState({ value:'' });
      input.value = ''
    } else {
      notify.info('输入内容有误')
    }
  }
  handleFocusBlur(e) {
    this.setState({
      focus: e.target === document.activeElement,
    });
  }
  handleSearchInput() {
    const searchItem = this.refs.titleInput.refs.input.value
    const { list } = this.props
    let last = [];
    if(searchItem=="" || (searchItem.indexOf(" ")!=-1)){
      last = list
    }else {
      for(let i = 0;i < list.length;i++){
        if((list[i].name).indexOf(searchItem)!=-1) {
          last.push(list[i])
        }
      }
    }
    this.setState({
      list:last
    })
  }

  getSpecial() {
    const { onChange, special, popTeamSelect } = this.props
    if (!special && !popTeamSelect) {
      return
    }
    return (
      <div className="searchInt">
        <div style={{lineHeight:'30px'}}>
          用户
        </div>
        <ul className="searchList">
          <li
            onClick={() => onChange(MY_SPACE)}
            className="myItem">
            {
              popTeamSelect
                ? MY_SPACE.teamName
                : MY_SPACE.name
            }
          </li>
        </ul>
        <div style={{lineHeight:'25px'}}>
          团队空间
        </div>
      </div>
    )
  }
  handleSelect(value) {
    const { onChange } = this.props;
    let input = document.getElementsByClassName('ant-select-search__field')[0];
    const { list } = this.state;
    let space = list.find((item) => { return value === item.spaceName })
    if (space) {
      onChange(space)
      this.setState({ value:'' });
      input.value = '';
    }
  }
  render() {
    const btnCls = classNames({
      'ant-search-btn': true,
      'ant-search-btn-noempty': !!this.state.value.trim(),
    });
    const searchCls = classNames({
      'ant-search-input': true,
      'ant-search-input-focus': this.state.focus,
    });
    const { onChange, loading, special, popTeamSelect, Search } = this.props
    const { list } = this.state
    let searchList = (
      list.length === 0 ?
        <div className='loadingBox'>结果为空</div>
        :
        list.map((item) => {
          let { name, disabled, isOk } = item
          // Only for clusters
          if (disabled === undefined && isOk !== undefined) {
            disabled= !isOk
          }
          let liProps = {
            value: item.spaceName,
            key: name,
            className: classNames({
              searchItem: true,
              itemDisabled: disabled
            })
          }
          if (!disabled) {
            liProps.onClick = () => onChange(item)
          }
          return (
            Search ?
              <Option {...liProps}>
                {
                  popTeamSelect ?
                    item.teamName
                    :
                    item.name
                }
              </Option>
              :
              <li {...liProps}>
                {
                  popTeamSelect ?
                    item.teamName
                    :
                    item.name
                }
              </li>
          )
        })
    )

    if (loading) {
      searchList = (
        <div className='loadingBox'>
          <Spin />
        </div>
      )
    }

    if(Search){
      return (
        <div className="PopSelectContent">
          {this.getSpecial()}
          <div className="ant-search-input-wrapper">
            <Input.Group className={searchCls}>
              <Select
                combobox
                value={this.state.value}
                placeholder="请输入空间名"
                notFoundContent="结果为空"
                defaultActiveFirstOption={true}
                showArrow={true}
                filterOption={false}
                onChange={this.handleChange.bind(this)}
                onFocus={this.handleFocusBlur.bind(this)}
                onBlur={this.handleFocusBlur.bind(this)}
                onSelect={this.handleSelect.bind(this)}
              >
                {searchList}
              </Select>
              <div className="ant-input-group-wrap">
                <Button className={btnCls}>
                  <Icon type="search" onClick={this.handleSubmit.bind(this)}/>
                </Button>
              </div>
            </Input.Group>
          </div>
          {/*<span className='titlesearch'>*/}
            {/*<Input*/}
              {/*placeholder="请输入空间名"*/}
              {/*size="large"*/}
              {/*ref='titleInput'*/}
              {/*id='titleInput'*/}
              {/*onChange={this.handleSearchInput}*/}
              {/*onPressEnter={this.handleSearchInput}*/}
            {/*/>*/}
            {/*<Icon type="search" className='titleicon' onClick={this.handleSearchInput}/>*/}
          {/*</span>*/}
          {/*<ul className="searchList">*/}
            {/*{searchList}*/}
          {/*</ul>*/}
        </div>
      )
    }else{
      return (
        <div className="PopSelectContent">
          {this.getSpecial()}
          <ul className="searchList">
            {searchList}
          </ul>
        </div>
      )
    } 
  }
}

PopSelect.propTypes = {
  list: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  special: PropTypes.bool,
}

export default PopSelect