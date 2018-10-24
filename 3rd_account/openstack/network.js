/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 *
 * v0.1 - 2017-07-14
 * @author houxz
 */


'use strict'

const find = require('lodash/find')
const co = require('co')
const common = require('./common')
const wrapHandler = common.wrapHandler
const openstackConfig = require('../../configs/3rd_account/openstack')
const baseUrl = `${openstackConfig.protocol}://${openstackConfig.host}:${openstackConfig.networkPort}`
const vmBaseUrl = `${openstackConfig.protocol}://${openstackConfig.host}:${openstackConfig.vmPort}`

exports.getNetworkList = wrapHandler(function*(send) {
  let requestUrl = baseUrl+'/v2.0/networks'
  const result = yield send(requestUrl, {
    data: this.query,
    dataAsQueryString: true,
    method: 'GET'
  })
  let body = []
  const { openstack } = this.session.loginUser
  if(result.networks && result.networks.length > 0) {
    result.networks.forEach(item => {
      if(item) {
        if(item['provider:network_type']) {
          if(item['provider:network_type'].indexOf('lan') < 0) return
        }
        if(item.shared) return body.push(item)
        if(item.tenant_id != openstack.withProject.currentProjectID) return
        body.push(item)
      }
    })
  }
  this.body = {
    networks: body
  }
})

exports.getNetworkDetail = wrapHandler(function*(send) {
  const networkID = this.params.networkID
  const requestUrl = baseUrl+'/v2.0/networks/'+networkID
  const result = yield send(requestUrl, {
    data: this.query,
    dataAsQueryString: true,
    method: 'GET'
  })
  this.body = result
})

exports.createNetwork = wrapHandler(function*(send) {
  const body = this.request.body
  const requestUrl = baseUrl+'/v2.0/networks'
  const result = yield send(requestUrl, {
    data: body,
    method: 'POST'
  })
  this.body = result
})


exports.deleteByNetwordID = wrapHandler(function*(send) {
  const networkID = this.params.networkID
  const requestUrl = baseUrl+'/v2.0/networks/'+networkID
  const result = yield send(requestUrl, {
    method: 'DELETE'
  })
  this.body = result
})


//ports
exports.getPortsList = wrapHandler(function*(send) {
  const requestUrl = baseUrl+'/v2.0/ports'
  const result = yield send(requestUrl, {
    data: this.query,
    dataAsQueryString: true,
    method: 'GET'
  })
  const body = []
  const { openstack } = this.session.loginUser
  if(result.ports && result.ports.length > 0) {
    result.ports.forEach(item => {
      if(item.tenant_id != openstack.withProject.currentProjectID) return
      body.push(item)
    })
  }
  this.body = {
    ports: body
  }
})

exports.getPortsDetail = wrapHandler(function*(send) {
  const portID = this.params.portID
  const requestUrl = baseUrl+'/v2.0/ports/'+portID
  const result = yield send(requestUrl, {
    data: this.query,
    dataAsQueryString: true,
    method: 'GET'
  })
  this.body = result
})

exports.createPorts = wrapHandler(function*(send) {
  const body = this.request.body
  const requestUrl = baseUrl+'/v2.0/ports'
  const result = yield send(requestUrl, {
    data: body,
    method: 'POST'
  })
  this.body = result
})

exports.putPorts = wrapHandler(function*(send) {
  const body = this.request.body
  const portID = this.params.portID
  const requestUrl = baseUrl+`/v2.0/ports/${portID}`
  const result = yield send(requestUrl, {
    data: body,
    method: 'PUT'
  })
  this.body = result
})

exports.deleteByPortID = wrapHandler(function*(send) {
  const portID = this.params.portID
  const requestUrl = baseUrl+'/v2.0/ports/'+portID
  const result = yield send(requestUrl, {
    method: 'DELETE'
  })
  this.body = result
})

//subnet
exports.getSubnetsList = wrapHandler(function*(send) {
  const requestUrl = baseUrl+'/v2.0/subnets'
  const result = yield send(requestUrl, {
    data: this.query,
    dataAsQueryString: true,
    method: 'GET'
  })
  const body = []
  const { openstack } = this.session.loginUser
  if(result.subnets && result.subnets.length > 0) {
    result.subnets.forEach(item => {
      if(item.tenant_id != openstack.withProject.currentProjectID) return
      body.push(item)
    })
  }

  this.body = {
    subnets: body
  }
})

exports.getSubnetsDetail = wrapHandler(function*(send) {
  const subnetID = this.params.subnetID
  const requestUrl = baseUrl+'/v2.0/subnets/'+subnetID
  const result = yield send(requestUrl, {
    data: this.query,
    dataAsQueryString: true,
    method: 'GET'
  })
  this.body = result
})

exports.createSubnets = wrapHandler(function*(send) {
  const body = this.request.body
  const requestUrl = baseUrl+'/v2.0/subnets'
  const result = yield send(requestUrl, {
    data: body,
    method: 'POST'
  })
  this.body = result
})

exports.updateSubnets = wrapHandler(function*(send) {
  const body = this.request.body
  const subnetID = this.params.subnetID
  const requestUrl = baseUrl+`/v2.0/subnets/${subnetID}`
  const result = yield send(requestUrl, {
    data: body,
    method: 'PUT'
  })
  this.body = result
})


exports.deleteBySubnetID = wrapHandler(function*(send) {
  const subnetID = this.params.subnetID
  const requestUrl = baseUrl+'/v2.0/subnets/'+subnetID
  const result = yield send(requestUrl, {
    method: 'DELETE'
  })
  this.body = result
})

//floatingips
exports.getFloatingipsList = wrapHandler(function*(send) {
  const requestUrl = baseUrl+'/v2.0/floatingips'
  const { openstack } = this.session.loginUser
  let vmUrl = vmBaseUrl +`/v2/${openstack.withProject.currentProjectID}/servers/detail`
  const currentProjectID = this.session.loginUser.openstack.withProject.currentProjectID
  const result = yield send(requestUrl, {
    data: this.query,
    dataAsQueryString: true,
    method: 'GET'
  })
  const options =  {
    dataAsQueryString: true,
    method: 'GET'
  }
  const vmBody = yield send(vmUrl, options)
  const floatIPConsequence = []
  result.floatingips.forEach(item => {
    if(item.tenant_id != currentProjectID) {
      return
    }
    floatIPConsequence.push(item)
    vmBody.servers.every(list => {
      for(let keys in list.addresses) {
        if (list.addresses[keys].length >1 && list.addresses[keys][1].addr == item.floating_ip_address) {
          item.instanceName = list.name
          item.instanceId = list.id
          item.type = 'vm'
          return false
        }
        return true
      }
      return true
    })
    return item
  })

  // const routerBody = yield send(routerUrl, {
  //   method: "GET"
  // })

  // if(routerBody && routerBody.routers) {

  // }

  const results = {
    floatingips: floatIPConsequence,
    vm: vmBody.servers
  }
  this.body = results
})

exports.getFloatingipsDetail = wrapHandler(function*(send) {
  const floatingipID = this.params.floatingipID
  const requestUrl = baseUrl+'/v2.0/floatingips/'+floatingipID
  const result = yield send(requestUrl, {
    data: this.query,
    dataAsQueryString: true,
    method: 'GET'
  })
  this.body = result
})

exports.createFloatingips = wrapHandler(function*(send) {
  const body = this.request.body
  const requestUrl = baseUrl+'/v2.0/floatingips'
  const result = yield send(requestUrl, {
    data: body,
    method: 'POST'
  })
  this.body = result
})


exports.deleteByFloatingipID = wrapHandler(function*(send) {
  const floatingipID = this.params.floatingipID
  const requestUrl = baseUrl+'/v2.0/floatingips/'+floatingipID
  const result = yield send(requestUrl, {
    method: 'DELETE'
  })
  this.body = result
})



//bindFloatIps
exports.ManageFloatingips = wrapHandler(function*(send) {
  const { openstack } = this.session.loginUser
  const server_id = this.params.serverID
  const body = this.request.body
  let requestUrl = baseUrl + `/v2/${openstack.withProject.currentProjectID}/servers/${server_id}/action`
  const result = yield send(requestUrl, {
    data: body,
    method: 'POST'
  })
  this.body = result
})






exports.getRoutersList = wrapHandler(function*(send) {
  let requestUrl = baseUrl + `/v2.0/routers`
  const result = yield send(requestUrl, {
    method: 'GET'
  })
  const proOb = {}
  const body = []
  if(result && result.routers) {
    result.routers.forEach(item => {
      if(item.tenant_id != this.session.loginUser.openstack.withProject.currentProjectID) {
        return
      }
      if(item["external_gateway_info"] && item["external_gateway_info"]["network_id"]) {
        const id = item["external_gateway_info"]["network_id"]
        proOb[id] = co(function*() {
          const result =  yield send(baseUrl+'/v2.0/networks/'+id, {
            method: 'GET'
          })
          return result
        })
      }
      body.push(item)
    })
    let network = yield proOb
    body.forEach(item => {
      if(item["external_gateway_info"] && item["external_gateway_info"]["network_id"]) {
        const id = item["external_gateway_info"]["network_id"]
        item.networkInfo = network[id].network
      }
    })
  }
  this.body = {
    routers: body
  }
})




exports.getRouterDetail = wrapHandler(function*(send) {
  const id = this.params.id
  let requestUrl = baseUrl + `/v2.0/routers/` + id
  const result = yield send(requestUrl, {
    method: 'GET'
  })
  this.body = result
})

exports.createRouter = wrapHandler(function*(send) {
  let requestUrl = baseUrl + `/v2.0/routers`
  const result = yield send(requestUrl, {
    method: 'POST',
    data: this.request.body
  })
  this.body = result
})

exports.updateRouter = wrapHandler(function*(send) {
  const id = this.params.id
  let requestUrl = baseUrl + `/v2.0/routers/`+id
  const result = yield send(requestUrl, {
    method: 'PUT',
    data: this.request.body
  })
  this.body = result
})

exports.deleteRouter = wrapHandler(function*(send) {
  let id = this.params.id
  id = id.split(',')
  const arr = []

  id.forEach(() => {
    let requestUrl = baseUrl + `/v2.0/routers/`+id
    arr.push(co(function*() {
      yield send(requestUrl, {
        method: 'DELETE',
      })
    }))
  })
  yield arr
  this.body = {}
})

exports.listOwnAndCanUseSubnet = wrapHandler(function*(send) {
  let requestUrl = baseUrl + `/v2.0/subnets`
  const result = yield send(requestUrl, {
    method: 'GET',
  })
  const subnets = result.subnets
  const proObj = {}
  subnets.forEach(item => {
    proObj[item.network_id] = co(function*() {
      let requestUrl = baseUrl + `/v2.0/networks/` + item.network_id
      const result = yield send(requestUrl, {
        method: "GET"
      })
      if(result && result.network) {
        return result.network
      }
      return {}
    })
  })
  const network = yield proObj
  subnets.forEach(item => {
    item.network = network[item.network_id]
  })

  const body = []
  subnets.forEach(item => {
    if((item.tenant_id == this.session.loginUser.openstack.withProject.currentProjectID ) || (item.network.shared && item.network["provider:physical_network"] == "physnet2")) {
      body.push(item)
    }
  })

  let routerUrl = baseUrl + `/v2.0/routers`
  const routers = yield send(routerUrl, {
    method: 'GET'
  })
  let r = []
  if(routers && routers.routers) {
    const portUrl = baseUrl+'/v2.0/ports'
    const ports = yield send(portUrl, {
      method: 'GET'
    })
    let useed = []
    if (ports.ports) {
      ports.ports.forEach(item => {

        let t = find(routers.routers, r => {
          return r.id == item.device_id
        })
        if (t) {
          item.fixed_ips.forEach(i => {
            useed.push(i.subnet_id)
          })
        }
      })
    }
    body.forEach(item => {
      if(useed.indexOf(item.id) < 0) {
        r.push(item)
      }
    })
  } else {
    r = body
  }

  this.body = {
    subnets: r
  }
})


exports.routerBindSubnet = wrapHandler(function*(send) {
  const id = this.params.id
  const subnetID = this.params.subnet
  const requestUrl = baseUrl  + `/v2.0/routers/${id}/add_router_interface`
  const result = yield send(requestUrl, {
    method: "PUT",
    data: {
      subnet_id: subnetID
    }
  })

  this.body = result
})

exports.routerRemoveSubnet = wrapHandler(function*(send) {
  const id = this.params.id
  const subnetID = this.params.subnet
  const requestUrl = baseUrl  + `/v2.0/routers/${id}/remove_router_interface`
  const result = yield send(requestUrl, {
    method: "PUT",
    data: {
      subnet_id: subnetID
    }
  })

  this.body = result
})

exports.getBindSubnet = wrapHandler(function*(send) {
  const id = this.params.id
  let requestUrl = baseUrl + `/v2.0/routers/` + id
  const result = yield send(requestUrl, {
    method: 'GET'
  })

  if(result && result.router) {
    const portUrl = baseUrl+'/v2.0/ports'
    const ports = yield send(portUrl, {
      method: 'GET'
    })
    let useed = []
    if (ports.ports) {
      ports.ports.forEach(item => {
        if(item.device_id == result.router.id) {
          item.fixed_ips.forEach(i => {
            useed.push(i.subnet_id)
          })
        }
      })
    }
    const proObj = {}
    useed.forEach(id => {
      proObj[id] = send(baseUrl+'/v2.0/subnets/'+id, {
        method: "GET"
      })
    })
    const subnets = yield proObj
    result.router.subnet= []
    if(subnets) {
      Object.getOwnPropertyNames(subnets).forEach(i => {
        if(!subnets[i].subnet.enable_dhcp) {
          return
        }
        result.router.subnet.push(subnets[i].subnet)
      })
    }
  }
  this.body = result
})






exports.getRoutersList = wrapHandler(function*(send) {
  let requestUrl = baseUrl + `/v2.0/routers`
  const result = yield send(requestUrl, {
    method: 'GET'
  })
  const proOb = {}
  const body = []
  if(result && result.routers) {
    result.routers.forEach(item => {
      if(item.tenant_id != this.session.loginUser.openstack.withProject.currentProjectID) {
        return
      }
      if(item["external_gateway_info"] && item["external_gateway_info"]["network_id"]) {
        const id = item["external_gateway_info"]["network_id"]
        proOb[id] = co(function*() {
          const result =  yield send(baseUrl+'/v2.0/networks/'+id, {
            method: 'GET'
          })
          return result
        })
      }
      body.push(item)
    })
    let network = yield proOb
    body.forEach(item => {
      if(item["external_gateway_info"] && item["external_gateway_info"]["network_id"]) {
        const id = item["external_gateway_info"]["network_id"]
        item.networkInfo = network[id].network
      }
    })
  }
  this.body = {
    routers: body
  }
})

exports.getRouterDetail = wrapHandler(function*(send) {
  const id = this.params.id
  let requestUrl = baseUrl + `/v2.0/routers/` + id
  const result = yield send(requestUrl, {
    method: 'GET'
  })
  this.body = result
})

exports.createRouter = wrapHandler(function*(send) {
  let requestUrl = baseUrl + `/v2.0/routers`
  const result = yield send(requestUrl, {
    method: 'POST',
    data: this.request.body
  })
  this.body = result
})

exports.updateRouter = wrapHandler(function*(send) {
  const id = this.params.id
  let requestUrl = baseUrl + `/v2.0/routers/`+id
  const result = yield send(requestUrl, {
    method: 'PUT',
    data: this.request.body
  })
  this.body = result
})

exports.deleteRouter = wrapHandler(function*(send) {
  let id = this.params.id
  id = id.split(',')
  const arr = []

  id.forEach(item => {
    let requestUrl = baseUrl + `/v2.0/routers/`+id
    arr.push(co(function*() {
      yield send(requestUrl, {
        method: 'DELETE',
      })
    }))
  })
  yield arr
  this.body = {}
})

exports.listOwnAndCanUseSubnet = wrapHandler(function*(send) {
  const id = this.params.id
  let requestUrl = baseUrl + `/v2.0/subnets`
  const result = yield send(requestUrl, {
    method: 'GET',
  })
  const subnets = result.subnets
  const proObj = {}
  subnets.forEach(item => {
    proObj[item.network_id] = co(function*() {
      let requestUrl = baseUrl + `/v2.0/networks/` + item.network_id
      const result = yield send(requestUrl, {
        method: "GET"
      })
      if(result && result.network) {
        return result.network
      }
      return {}
    })
  })
  const network = yield proObj
  subnets.forEach(item => {
    item.network = network[item.network_id]
  })

  const body = []
  subnets.forEach(item => {
    if((item.tenant_id == this.session.loginUser.openstack.currentProjectID ) || (item.network.shared && item.network["provider:physical_network"] == "physnet2")) {
      body.push(item)
    }
  })

  let routerUrl = baseUrl + `/v2.0/routers`
  const routers = yield send(routerUrl, {
    method: 'GET'
  })
  let r = []
  if(routers && routers.routers) {
    const portUrl = baseUrl+'/v2.0/ports'
    const ports = yield send(portUrl, {
      method: 'GET'
    })
    let useed = []
    if (ports.ports) {
      ports.ports.forEach(item => {

        let t = find(routers.routers, r => {
          return r.id == item.device_id
        })
        if (t) {
          item.fixed_ips.forEach(i => {
            useed.push(i.subnet_id)
          })
        }
      })
    }
    body.forEach(item => {
      if(useed.indexOf(item.id) < 0) {
        r.push(item)
      }
    })
  } else {
    r = body
  }

  this.body = {
    subnets: r
  }
})


exports.routerBindSubnet = wrapHandler(function*(send) {
  const id = this.params.id
  const subnetID = this.params.subnet
  const requestUrl = baseUrl  + `/v2.0/routers/${id}/add_router_interface`
  const result = yield send(requestUrl, {
    method: "PUT",
    data: {
      subnet_id: subnetID
    }
  })

  this.body = result
})

exports.routerRemoveSubnet = wrapHandler(function*(send) {
  const id = this.params.id
  const subnetID = this.params.subnet
  const requestUrl = baseUrl  + `/v2.0/routers/${id}/remove_router_interface`
  const result = yield send(requestUrl, {
    method: "PUT",
    data: {
      subnet_id: subnetID
    }
  })

  this.body = result
})

exports.getBindSubnet = wrapHandler(function*(send) {
  const id = this.params.id
  let requestUrl = baseUrl + `/v2.0/routers/` + id
  const result = yield send(requestUrl, {
    method: 'GET'
  })

  if(result && result.router) {
    const portUrl = baseUrl+'/v2.0/ports'
    const ports = yield send(portUrl, {
      method: 'GET'
    })
    let useed = []
    if (ports.ports) {
      ports.ports.forEach(item => {
        if(item.device_id == result.router.id) {
          item.fixed_ips.forEach(i => {
            useed.push(i.subnet_id)
          })
        }
      })
    }
    const proObj = {}
    useed.forEach(id => {
      proObj[id] = send(baseUrl+'/v2.0/subnets/'+id, {
        method: "GET"
      })
    })
    const subnets = yield proObj
    result.router.subnet= []
    if(subnets) {
      Object.getOwnPropertyNames(subnets).forEach(i => {
        if(!subnets[i].subnet.enable_dhcp) {
          return
        }
        result.router.subnet.push(subnets[i].subnet)
      })
    }
  }
  this.body = result
})
