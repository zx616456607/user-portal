/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * new mysql cluster class for database_cache
 *
 * v0.1 - 2018-07-17
 * @author zhouhaitao
 */
'use strict'


 class newMysqlCluster {
   constructor (name, replicas, amqpLbGroupID, adminLbGroupID, config, storageCluster, size, username, password) {
     this.apiVersion = 'daas.tenxcloud.com/v1'
     this.kind = 'RabbitmqCluster'
     this.metadata =  {
       annotations: {
         ['admin.system/lbgroup']: adminLbGroupID,
         ['amqp.system/lbgroup']: amqpLbGroupID,
       },
       name,
     }
     this.spec = {
       username,
       password,
       proxy: true,
       replicas,
       resources: config,
       configRef: {
         name: `${name}-config`
       },
       secretRef: {
         name: `${name}-secret`
       },
       volumeClaimTemplate: {
         metadata: {
           name: 'data'
         },
         spec: {
           storageClassName: storageCluster,
           accessModes: ['ReadWriteOnce'],
           resources: {
             requests: {
               storage: size
             }
           }
         }
       }
   }
 }
}
module.exports = newMysqlCluster

