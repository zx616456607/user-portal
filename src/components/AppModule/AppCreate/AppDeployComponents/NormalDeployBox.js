/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 * 
 * NormalDeployBox component
 * 
 * v0.1 - 2016-09-28
 * @author GaoJian
 */
import React, { Component, PropTypes } from 'react'
import { Form,Select,Input,InputNumber,Modal,Checkbox,Button,Card,Menu,Switch } from 'antd'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import QueueAnim from 'rc-queue-anim'
import "./style/NormalDeployBox.less"

const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;
let uuid = 0;
var MyComponent = React.createClass({
  
  remove(k) {
    const { form } = this.props.parentScope.props;
    let volumeKey = form.getFieldValue('volumeKey');
    volumeKey = volumeKey.filter((key) => {
      return key !== k;
    });
    form.setFieldsValue({
      volumeKey,
    });
  },
  add() {
    uuid++;
    const { form } = this.props.parentScope.props;
    let volumeKey = form.getFieldValue('volumeKey');
    volumeKey = volumeKey.concat(uuid);
    form.setFieldsValue({
      volumeKey,
    });
  },
  render: function () {
    const { getFieldProps, getFieldValue, } = this.props.parentScope.props.form;
    getFieldProps('volumeKey', {
      initialValue: [1],
    });
    const formItems = getFieldValue('volumeKey').map((k) => {
      return (
        <FormItem key={`volume${k}`}>
          <span className="url" {...getFieldProps(`volumePath${k}`,{
            rules: [{
              required: true,
              whitespace: true,
              message: '挂载路径呢?',
            }],
          })}>/var/www/html</span>
          <Select className="imageTag" size="large"
                  defaultValue="我就是最快的SSD"
                  style={{ width: 200 }}
                  {...getFieldProps(`volumeName${k}`, {
                    rules: [{
                      required: true,
                      message: '选择配置组呢?',
                    }],
                  })}>
            <Option value="ext4/volumeName">volumeName ext4 1024M</Option>
          </Select>
          <Checkbox className="readOnlyBtn" { ...getFieldProps(`volumeChecked${k}`,{}) }>
            只读
          </Checkbox>
          <i className="fa fa-refresh"></i>
          <i className="fa fa-trash"></i>
        </FormItem>
      )
    });
    return (
      <div className="serviceOpen" key="had">
        { formItems }
      </div>
    )
  }
})
MyComponent = createForm()(MyComponent);

function loadImageTagConfigs(tag, props) {
	console.log('loadImageTagConfigs-------------------')
	console.log(tag)
}

class NormalDeployBox extends Component {
  constructor(props) {
    super(props);
    this.selectComposeType = this.selectComposeType.bind(this);
    this.changeInstanceNum = this.changeInstanceNum.bind(this);
    this.changeServiceState = this.changeServiceState.bind(this);
		this.onSelectTagChange = this.onSelectTagChange.bind(this)
    this.state = {
      selectedImageTag: props.imageTags[0]
    }
  }
  userExists(rule, value, callback) {
    if (!value) {
      callback();
    } else {
      setTimeout(() => {
        if (!/[a-z]([-a-z0-9]*[a-z0-9])?/.test(value)) {
          console.log(value);
          console.log(/[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*/.test(value));
          callback([new Error('抱歉，该服务名称不合法.')]);
        } else {
          callback();
        }
      }, 800);
    }
  }
  selectComposeType(type){
  	//the function for change user select compose file type
  	const parentScope = this.props.scope;
  	parentScope.setState({
  		composeType:type
  	});
  }
  changeInstanceNum(e){
  	//the function for user set the max number of instance
  	const parentScope = this.props.scope;
  	parentScope.setState({
  		instanceNum:e
  	});
  }
  changeServiceState(e,parentScope){
    //the function for change user select service status open or not
    /*this.setState({
      volumeSwitch:e
    });*/
    parentScope.setState({
      volumeSwitch: e,
    })
		/*parentScope.props.scope.setState({
      volumeSwitch: e,
    })*/
    console.log('parentScope.props.scope.state',parentScope.props.scope.state);
  }

	onSelectTagChange(tag) {
		const { setFieldsValue } = this.props.scope.props.form
		setFieldsValue({
			imageVersion: tag
		})
	}

	componentWillReceiveProps(nextProps){
		const { imageTags, scope } = nextProps
		const { getFieldValue, setFieldsValue } = scope.props.form
		if (imageTags.length < 1) {
			return
		}
		let tagSelectFiledValue = getFieldValue('imageVersion')
		if (!tagSelectFiledValue) {
			tagSelectFiledValue = imageTags[0]
			setFieldsValue({
				imageVersion: tagSelectFiledValue
			})
		}
		loadImageTagConfigs(tagSelectFiledValue, nextProps)
	}

  render() {
  	const parentScope = this.props.scope;
		const { imageTags, imageTagsIsFetching } = this.props
		const { selectedImageTag } = this.state
    const { getFieldProps, getFieldError, isFieldValidating } = parentScope.props.form;
  	const nameProps = getFieldProps('name', {
      rules: [
        { required: true,},
        { validator: this.userExists },
      ],
    });
    const {registryServer,currentSelectedImage} = this.props
    const imageUrlProps = registryServer+'/'+currentSelectedImage
    
    const selectProps = getFieldProps('imageVersion', {
      rules: [
        { required: true, message: '请选择镜像版本' },
      ],
    });
    const volumeChecked = getFieldProps('volumeChecked', {});
    const volumePath = getFieldProps('volumePath', {});
    const volumeName = getFieldProps('volumeName', {});
    return (
	  <div id="NormalDeployBox">
	  	{/*<Form horizontal form={parentScope.props.form}>*/}
	    	<div className="topBox">
	        <div className="inputBox">
	          <span className="commonSpan">服务名称</span>
	          <FormItem className="serviceNameForm"
                      hasFeedback
                      help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}>
	          	<Input {...nameProps} className="serviceNameInput" size="large" placeholder="起一个萌萌哒的名字吧~" />
	            <div style={{ clear:"both" }}></div>
	          </FormItem>
	          <div style={{ clear:"both" }}></div>
	        </div>
	        <div className="inputBox">
	          <span className="commonSpan">镜像地址</span>
	          <FormItem className="iamgeUrlForm" hasFeedback>
		          <Input className="imageInput" size="large" value={imageUrlProps} />
		          <div style={{ clear:"both" }}></div>
	          </FormItem>
	          <Button className="checkBtn" size="large" type="primary" onClick={this.checkImageUrl}>检查地址</Button>
	          <div style={{ clear:"both" }}></div>
	        </div>
	        <div className="inputBox">
	          <span className="commonSpan">镜像版本</span>
		        <FormItem className="imageTagForm">
		          <Select 
								{...selectProps}
								className="imageTag" size="large" tyle={{ width: 200 }}
								placeholder="请选择镜像版本"
								notFoundContent="镜像版本为空"
								defaultActiveFirstOption={true}
								onSelect={ this.onSelectTagChange }
							>
								{ imageTags.map((tag) => {
									return (
										<Option key={tag} value={tag}>{tag}</Option>
									)
								}) }
			      	</Select>
		        </FormItem>
	          <div style={{ clear:"both" }}></div>
	        </div>
	      </div>
	      <div className="infoBox">
	      	<div className="commonTitle">
	      		<div className="line"></div>
	      	  <span className="titleSpan">基本配置</span>
	      	  <span className="titleIntro">服务的计算资源、服务类型、以及实例个数等设置</span>
	      	  <div style={{ clear:"both" }}></div>
	      	</div>
	      	<div className="operaBox">
	      		<div className="selectCompose">
	           <span className="commonSpan">容器配置</span>
	           <ul className="composeList">
	           	<li className="composeDetail">
	           		<Button type={parentScope.state.composeType == "1" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"1")}>
	           			<div className="topBox">
	           				1X
	           			</div>
	           			<div className="bottomBox">
	           				<span>256M&nbsp;内存</span><br />
	           				<span>1CPU&nbsp;(共享)</span>
	           			</div>
	           		</Button>
	           	</li>
	           	<li className="composeDetail">
	           		<Button type={parentScope.state.composeType == "2" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"2")}>
	           			<div className="topBox">
	           				2X
	           			</div>
	           			<div className="bottomBox">
	           				<span>512M&nbsp;内存</span><br />
	           				<span>1CPU&nbsp;(共享)</span>
	           			</div>
	           		</Button>
	           	</li>
	           	<li className="composeDetail">
	           		<Button type={parentScope.state.composeType == "4" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"4")}>
	           			<div className="topBox">
	           				4X
	           			</div>
	           			<div className="bottomBox">
	           				<span>1GB&nbsp;内存</span><br />
	           				<span>1CPU&nbsp;(共享)</span>
	           			</div>
	           		</Button>
	           	</li>
	           	<li className="composeDetail">
	           		<Button type={parentScope.state.composeType == "8" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"8")}>
	           			<div className="topBox">
	           				8X
	           			</div>
	           			<div className="bottomBox">
	           				<span>2GB&nbsp;内存</span><br />
	           				<span>1CPU&nbsp;(共享)</span>
	           			</div>
	           		</Button>
	           	</li>
	           	<li className="composeDetail">
	           		<Button type={parentScope.state.composeType == "16" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"16")}>
	           			<div className="topBox">
	           				16X
	           			</div>
	           			<div className="bottomBox">
	           				<span>4GB&nbsp;内存</span><br />
	           				<span>1CPU</span>
	           			</div>
	           		</Button>
	           	</li>
	           	<li className="composeDetail">
	           		<Button type={parentScope.state.composeType == "32" ? "primary":"ghost"} onClick={this.selectComposeType.bind(this,"32")}>
	           			<div className="topBox">
	           				32X
	           			</div>
	           			<div className="bottomBox">
	           				<span>8GB&nbsp;内存</span><br />
	           				<span>2CPU</span>
	           			</div>
	           		</Button>
	           	</li>
	           	<div style={{ clear:"both" }}></div>
	          	</ul>
	          	<div style={{ clear:"both" }}></div>
	          </div>
	          <div className="stateService">
	          	<span className="commonSpan">服务类型</span>
	          	<Switch className="changeBtn"
                      value="1"
                      defaultChecked={false}
                      checked={parentScope.state.volumeSwitch}
                      onChange={(e) => this.changeServiceState(e,parentScope)}
              />
	          	<span className="stateSpan">{parentScope.state.volumeSwitch ? "有状态服务":"无状态服务"}</span>
	          	{parentScope.state.volumeSwitch ? [
                <MyComponent parentScope={parentScope}/>
	          	]:null}
	          	<div style={{ clear:"both" }}></div>
	          </div>
		      	<div className="containerNum">
		      	  <span className="commonSpan">容器数量</span>
		      	  <InputNumber className="inputNum" value={parentScope.state.instanceNum} onChange={this.changeInstanceNum}
		      	  	size="large" min={1} max={100} />&nbsp;&nbsp;个
		          <div style={{ clear:"both" }}></div>
		      	</div>
	      	</div>
	      </div>
      {/*</Form>*/}
	  </div>
    )
  }
}

NormalDeployBox.propTypes = {
}

NormalDeployBox = createForm()(NormalDeployBox);

export default NormalDeployBox;