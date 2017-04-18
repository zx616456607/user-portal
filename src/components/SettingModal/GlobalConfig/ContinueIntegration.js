/**
 * Created by zhangchengzheng on 2017/4/17.
 */
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 * Continue Intergration
 *
 * v0.1 - 2017/4/17
 * @author ZhangChengZheng
 */
import React, { Component } from 'react'
import { Row, Col, Icon, Form, Button, Input, Spin, Checkbox, Table, Select } from 'antd'
import './style/ContinueIntegration.less'

const FormItem = Form.Item
const Option = Select.Option

class ContinueIntegration extends Component {
  constructor(props){
    super(props)
    this.TemplateSelect = this.TemplateSelect.bind(this)
    this.TempoalteTable = this.TempoalteTable.bind(this)
    this.data = this.data.bind(this)
    this.handleAddUserDefinedimage = this.handleAddUserDefinedimage.bind(this)
    this.handledeletecolums = this.handledeletecolums.bind(this)
    this.handleEditcolums = this.handleEditcolums.bind(this)
    this.handleCheckcolums = this.handleCheckcolums.bind(this)
    this.handleCanclecolums = this.handleCanclecolums.bind(this)
    this.state = {
      disableArr:[],
      disable:false,
      dataArr:[]
    }
  }
  componentDidMount(){
    this.setState({
      dataArr:this.data().arr,
      disableArr:this.data().disableArr
    })
  }

  TemplateSelect(arry){
    let tempelteselect = arry.map((item,index)=>{
      return <Option value={item} key={index}>{item}</Option>
    })
    return tempelteselect
  }

  data(){
    let arr = []
    let disableArr = []
    for(let i=0; i<5;i++){
      let itemdisable = {disable : true}
      let item = {
        imageClass:[('类型1'+i),('类型2'+i),('类型3'+i)],
        UserDefinedName:'ant-design-mobile'+i,
        UserDefinedAddress:'www.tenxcloud.com'+i,
        handle:'qweqwe',
      }
      disableArr.push(itemdisable)
      arr.push(item)
    }
    return {arr, disableArr}
  }

  handledeletecolums(key){
    let index = key.substring(0,1)
    let dataArr = this.state.dataArr
    let disableArr = this.state.disableArr
    dataArr.splice(index,1)
    disableArr.splice(index,1)
    this.setState({
      dataArr,
      disableArr
    })
  }

  handleEditcolums(key){
    let index = key.substring(0,1)
    let disableArr = this.state.disableArr
    disableArr[index].disable = false
    this.setState({
      disableArr
    })
  }

  handleCheckcolums(key){
    let index = key.substring(0,1)
    let disableArr = this.state.disableArr
    disableArr[index].disable = true
    this.setState({
      disableArr
    })
  }

  handleCanclecolums(key){
    let index = key.substring(0,1)
    let disableArr = this.state.disableArr
    disableArr[index].disable = true
    this.setState({
      disableArr
    })
  }

  handleAddUserDefinedimage(){
    let dataArr = this.state.dataArr
    let disableArr = this.state.disableArr
    let item = {
      imageClass:['类型1','类型2','类型3'],
      UserDefinedName:'',
      UserDefinedAddress:'',
      handle:''
    }
    let disable = {
      disable:false
    }
    dataArr.push(item)
    disableArr.push(disable)
    this.setState({
      dataArr,
      disableArr
    })
  }

  TempoalteTable(data,disable){
    if(!data){
      return <div className='nodata'><Spin /></div>
    }
    let tablecolum = data.map((value,index) => {
      return <ul key={index} className='tablecolum'>
        <li className='tablecell imageClass'>
          {this.state.disable ?
            [<span>
            <Select
              defaultValue='类型1'
              style={{width: '100%'}}
              size="large"
              disabled={disable[index].disable}
            >
              {this.TemplateSelect(data[index].imageClass)}
            </Select>
          </span>] :
            [<FormItem className='formitem' key={index+".1"}>
              <Select
                defaultValue='类型1'
                style={{width: '100%'}}
                size="large"
                disabled={disable[index].disable}
              >
                {this.TemplateSelect(data[index].imageClass)}
              </Select>
            </FormItem>]
          }
        </li>
        <li className='tablecell UserDefinedName'>
          {this.state.disable ?
            <span>
            <Input placeholder={data[index].UserDefinedName} size='large' disabled={disable[index].disable} />
          </span>
            :
            [<FormItem className='formitem' key={index+".2"}>
              <Input placeholder={data[index].UserDefinedName} size='large' disabled={disable[index].disable} />
            </FormItem>]
          }
        </li>
        <li className='tablecell UserDefinedAddress'>
          {
            this.state.disable ?
              [<span>
             <Input placeholder={data[index].UserDefinedAddress} size='large' disabled={disable[index].disable}/>
          </span>] :
              [<FormItem className='formitem' key={index+".3"}>
                <Input placeholder={data[index].UserDefinedAddress} size='large' disabled={disable[index].disable}/>
              </FormItem>]
          }
        </li>
        <li className='tablecell handle' key={index+".4"}>
          {disable[index].disable?
            <div>
              <Button icon="edit" className='buttonleft edit' type="dashed" onClick={() => this.handleEditcolums((index+".4.1"))}></Button>
              <Button icon="delete" type="ghost" onClick={() => this.handledeletecolums((index+".4.2"))}></Button>
            </div> :
            <div>
            <Button icon="check" className='buttonleft check' type="primary" onClick={() => this.handleCheckcolums((index+".4.1"))}></Button>
            <Button icon="cross" type="ghost" onClick={() => this.handleCanclecolums((index+".4.2"))}></Button>
            </div>
          }
        </li>
      </ul>
    })
    return tablecolum
  }

  render() {
    const colums = [{
      title:'镜像分类',
      dataIndex:'imageClass',
      key:'imageClass',
      width:'20%',
      render: (text) => (<div className='imageClass'>
          <Select
            defaultValue="类型1"
            style={{width:'100%'}}
            size="large"
          >
            {this.TemplateSelect(text)}
          </Select>
        </div>)
    },{
      title:'自定义名称',
      dataIndex:'UserDefinedName',
      key:'UserDefinedName',
      width:'21%',
      render: (text) => (<div className='imageClass'>
          <Input placeholder={text} size="large"/>
      </div>)
    },{
      title:'自定义镜像地址',
      dataIndex:'UserDefinedAddress',
      key:'UserDefinedAddress',
      width:'45%',
      render: (text) => <div className='UserDefinedAddress'>
        <Input placeholder={text} size="large"/>
      </div>
    },{
      title:'操作',
      dataIndex:'handle',
      ke:'handle',
      width:'9%',
      render: () => <div className='handle'>
        {/*<Button className='buttonleft check' type="primary"><i className="fa fa-check checki" aria-hidden="true"></i></Button>*/}
        {/*<Button icon="cross"></Button>*/}
        <Button icon="edit" className='buttonleft edit' type="dashed"></Button>
        <Button icon="delete" type="ghost"></Button>
      </div>
    }]

    return (
      <div id="ContinueIntegration">
        <div className='table'>
          <div className='tableHeader'>
            <div className='tableHeadertd imageClass'>镜像分类</div>
            <div className='tableHeadertd UserDefinedName'>自定义名称</div>
            <div className='tableHeadertd UserDefinedAddress'>自定义镜像地址</div>
            <div className='tableHeadertd handle'>操作</div>
          </div>
          <div className='tablebody'>
            <Form>
              {this.TempoalteTable(this.state.dataArr,this.state.disableArr)}
            </Form>
          </div>
        </div>
        <div className='clearfloat'></div>
        <div className='tablefooter'>
          <div onClick={this.handleAddUserDefinedimage} className='handlefooter'><Icon type="plus-circle-o" className='footeradd'/><span className='footerspan'>添加一个自定义镜像</span></div>
        </div>

      </div>
    )
  }
}

export default ContinueIntegration