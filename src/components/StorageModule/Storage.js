/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 *  Storage list
 * 
 * v0.1 - 2016-09-20
 * @author BaiYu
 */

import React, { Component, PropTypes } from 'react'
import { Checkbox,Card,Menu,Button,Icon ,Modal ,Input, Slider, InputNumber, Row, Col} from 'antd'
import { Link } from 'react-router'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import QueueAnim from 'rc-queue-anim'
import { connect } from 'react-redux'
import { remove } from 'lodash'
import { loadStorageList, deleteStorage } from '../../actions'
import './style/storage.less'


const data = [
  {
    id:"1",
    name:"test1",
    status:"2",
    formet:"ext4",
    forin:"tenxlolud/volue/log",
    appName:"baiyusf",
    size:"122/1024M",
    createTime:"2016-09-09 11:27:27"
  },
	{
    id:"13",
    name:"sfsd",
    status:"1",
    formet:"ext4",
    forin:"12",
    appName:"baiyusf",
    size:"122/1024M",
    createTime:"2016-09-09 11:27:27"
  },
	{
    id:"12",
    name:"www",
    status:"2",
    formet:"ext4",
    forin:"tenxlolud/volue/log",
    appName:"baiyusf",
    size:"122/1024M",
    createTime:"2016-09-09 11:27:27"
  },
	{
    id:"15",
    name:"tenxlolud",
    status:"1",
    formet:"ext4",
    forin:"12",
    appName:"baiyusf",
    size:"122/1024M",
    createTime:"2016-09-09 11:27:27"
  },
	{
    id:"17",
    name:"wwwwwwwfs",
    status:"2",
    formet:"ext4",
    forin:"tenxlolud/volue/log",
    appName:"baiyusf",
    size:"122/1024M",
    createTime:"2016-09-09 11:27:27"
  }
];
const messages = defineMessages({
	name: {
		id: "Storage.modal.name",
		defaultMessage: '名称'
	},
	cancelBtn: {
		id: "Storage.modal.cancelBtn",
		defaultMessage: '取消'
	},
	createBtn: {
		id: "Storage.modal.createBtn",
		defaultMessage: '创建'
	},
	createTitle: {
		id: "Storage.modal.createTitle",
		defaultMessage: '创建存储'
	},
	createModalTitle: {
		id:"Storage.menu.create",
		defaultMessage: "创建存储卷",
	},
	storageName: {
    id: 'Storage.titleRow.name',
    defaultMessage: '存储名称',
  },
	delete: {
    id: 'Storage.menu.delete',
    defaultMessage: '删除',
  },
	status: {
    id: 'Storage.titleRow.status',
    defaultMessage: '状态',
  },
	formats: {
    id: 'Storage.titleRow.formats',
    defaultMessage: '格式',
  },
	forin: {
    id: 'Storage.titleRow.forin',
    defaultMessage: '容器挂载点',
  },
	app: {
    id: 'Storage.titleRow.app',
    defaultMessage: '应用',
  },
	size: {
    id: 'Storage.titleRow.size',
    defaultMessage: '大小',
  },
	createTime: {
    id: 'Storage.titleRow.createTime',
    defaultMessage: '创建时间',
  },
	action: {
    id: 'Storage.titleRow.action',
    defaultMessage: '操作',
  },
	formatting: {
    id: 'Storage.titleRow.formatting',
    defaultMessage: '格式化',
  },
	dilation: {
    id: 'Storage.titleRow.dilation',
    defaultMessage: '扩容',
  },
	okRow: {
    id: 'Storage.titleRow.normal',
    defaultMessage: '正常',
  },
	errorRow: {
    id: 'Storage.titleRow.error',
    defaultMessage: '异常',
  },
  placeholder: {
    id: 'Storage.modal.placeholder',
    defaultMessage: '输入名称',
  },
  inputPlaceholder: {
    id: 'Storage.modal.inputPlaceholder',
    defaultMessage: '输入应用名搜索',
  }

})

let MyComponent = React.createClass({
  getInitialState() {
    
    let config = this.props.config;
    let pool = this.props.pool;
    let list = config[pool]
    let check = {}
    if(list) {
      list.storageList.forEach((item) => {
        check[item.id] = false
      })
    }
    return {
      check,
      isAllChecked: false
    }
  },
  onAllChange(e) {
    let check = this.state.check
    if(check){
      let keys = Object.getOwnPropertyNames(check)
      keys.forEach(item => {
        check[item] = e.target.checked
      })
    }
    this.setState({
      isAllChecked: e.target.checked,
      check
    })
  },
  propTypes: {
    config: React.PropTypes.object
  },
  onchange(e, id) {
    let check = this.state.check
    if(e.target.checked) {
      check[id] = 1
    } else {
      check[id] = 0
    }
    this.setState({
      check
    })
    const saveCheckedStorage = this.props.saveCheckedStorage
    saveCheckedStorage(e, id)
  },
  render () {
  const { formatMessage } = this.props.intl
	let config = this.props.config;
  let pool = this.props.pool;
  let list = config[pool]
  if(!list) return (<div></div>)
	let items = list.storageList.map((item) => {
	  return (
	    <div className="appDetail" key={item.name}>
			<div className="selectIconTitle commonData">
			  <Checkbox onChange={(e)=>this.onchange(e, item.id)} checked= { this.state.check[item.id] ? true : false }></Checkbox>
			</div>
			<div className="name commonData">
		      <Link to={`/app_manage/storage/${item.id}`} >
	    	    {item.name}
		      </Link>
			</div>
			<div className="status commonData">
			  <i className={item.status == 1 ? "normal fa fa-circle":"error fa fa-circle"}></i>
			  <span className={item.status == 1 ? "normal":"error"} >{item.status == 1 ? <FormattedMessage {...messages.okRow} />:<FormattedMessage {...messages.errorRow} />}</span>
			</div>
			<div className="formet commonData">{item.formet}</div>
			<div className="forin commonData">{item.forin}</div>
			<div className="appname commonData">{item.appName}</div>
			<div className="size commonData">{item.size}</div>
			<div className="createTime commonData">{item.createTime}</div>
			<div className="actionBtn">
			 <Button className="btn-warning"><Icon type="delete" /><FormattedMessage {...messages.formatting} /></Button>
			 <span className="margin"></span>
			 <Button className="btn-success"><Icon type="scan" /><FormattedMessage {...messages.dilation} /></Button>
			</div>
		</div>
      );
	});
	return (
    <Card className="storageList appBox">
      <div className="appTitle">
        <div className="selectIconTitle commonTitle">
          <Checkbox onChange={(e)=>this.onAllChange(e)} ></Checkbox>
        </div>
        <div className="name commonTitle"><FormattedMessage {...messages.storageName} /></div>
        <div className="status commonTitle"><FormattedMessage {...messages.status} /></div>
        <div className="formet commonTitle"><FormattedMessage {...messages.formats} /></div>
        <div className="forin commonTitle"><FormattedMessage {...messages.forin} /></div>
        <div className="appname commonTitle"><FormattedMessage {...messages.app} /></div>
        <div className="size commonTitle"><FormattedMessage {...messages.size} /></div>
        <div className="createTime commonTitle"><FormattedMessage {...messages.createTime} /></div>
        <div className="actionBox commonTitle"><FormattedMessage {...messages.action} /></div>
      </div>
      <div className="dataBox">
        { items }
	    </div>
    </Card>
    );
  }
});

MyComponent = injectIntl(MyComponent, {
  withRef: true,
})
class Storage extends Component {
	constructor(props) {
    super(props)
    this.showModal = this.showModal.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
		this.onChange = this.onChange.bind(this)
    this.deleteStorage = this.deleteStorage.bind(this)
    this.state = {
      inputValue: 0,
			visible: false,
      storageIdArray: [],
      isAllChecked: false
    }
  }
	onChange(value) {
    this.setState({
      inputValue: value,
    });
  }
  showModal() {
    this.setState({
      visible: true,
    });
  }
  handleOk() {
    this.setState({
      visible: false,
    });
  }
  handleCancel() {
    this.setState({
      visible: false,
  	});
  }
  deleteStorage() {
    const storageIdArray = this.state.storageIdArray
    this.props.deleteStorage('test', storageIdArray, () => this.props.loadStorageList('test'))
  }
  saveCheckedStorage() {
    const self = this
    const storageIdArray = self.state.storageIdArray
    return (e, storageId) => {
      if(e.target.checked) {
        storageIdArray.push(storageId)
      } else {
        remove(storageIdArray, (item) =>{
          return item === storageId
        })
      }
      self.setState({
        checkedArray:storageIdArray 
      })
    }
  }

  componentWillMount() {
    this.props.loadStorageList('test')
  }

  render() {
		const { formatMessage } = this.props.intl
    return (
        <QueueAnim className ="AppList"  type = "right">
          <div id="AppList" key = "AppList">
      	    <div className="operationBox">
	          <div className="leftBtn">
	      	    <Button type="primary" size="large" onClick={this.showModal}><Icon type="plus" /><FormattedMessage {...messages.createTitle} /></Button>
	      	    <Button type="ghost" className="stopBtn" size="large" onClick={this.deleteStorage}><Icon type="delete" /><FormattedMessage {...messages.delete} /></Button>
							<Modal title={ formatMessage(messages.createModalTitle) } visible={this.state.visible} onOk={this.handleOk} onCancel={this.handleCancel} okText={ formatMessage(messages.createBtn) } cancelText={ formatMessage(messages.cancelBtn) }>
								<Row style={{height:'40px'}}>
									<Col span="3" className="text-center" style={{lineHeight:'30px'}}><FormattedMessage {...messages.name} /></Col>
									<Col span="12"><Input placeholder={ formatMessage(messages.placeholder) } /></Col>
								</Row>
								<Row style={{height:'40px'}}>
									<Col span="3" className="text-center" style={{lineHeight:'30px'}}>{ formatMessage(messages.size) }</Col>
									<Col span="12">
									<Slider min={1} max={1024} onChange={this.onChange} value={this.state.inputValue} />
									</Col>
									<Col span="8">
									<InputNumber min={1} max={1024} style={{ marginLeft: '16px' }} value={this.state.inputValue} onChange={this.onChange}/>
									<span style={{paddingLeft: 10}} >MB</span>
									</Col>
								</Row>
                <Row>
                  <Col span="3" className="text-center" style={{lineHeight:'30px'}}>{ formatMessage(messages.formats) }</Col>
                  <Col span="20" className="action-btns" style={{lineHeight:'30px'}}>
                    <Button type="primary">ext4</Button>
                    <Button type="ghost">xfs</Button>
                    <Button type="ghost">reiserfs</Button>
                  </Col>
                </Row>
							</Modal>
	          </div>
	        <div className="rightBox">
	      	  <div className="littleLeft">
	      	    <i className="fa fa-search"></i>
	      	  </div>
	      	  <div className="littleRight">
	      	    <input placeholder={ formatMessage(messages.inputPlaceholder) } />
	      	  </div>
	        </div>
	        <div className="clearDiv"></div>
      	  </div>
      	    <MyComponent config = {this.props.storageList} pool = {'test'} saveCheckedStorage = {() => this.saveCheckedStorage()} />
        </div>
      </QueueAnim>
    )
  }
}

Storage.propTypes = {
  intl: PropTypes.object.isRequired
}
function mapSateToProp(state) {
  return {
    storageList: state.storage.storageList
  }
}

function mapDispathToProp(dispath) {
  return {
    loadStorageList: (pool) => {
      dispath(loadStorageList(pool))
    },
    deleteStorage: (pool, storageIdArray, callback) => {
      dispath(deleteStorage(pool, storageIdArray, callback))
    }
  }
}


export default connect(mapSateToProp, mapDispathToProp)(injectIntl(Storage, {
  withRef: true,
}))