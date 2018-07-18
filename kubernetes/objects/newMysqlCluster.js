/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Deployment class for k8s
 *
 * v0.1 - 2018-07-17
 * @author zhouhaitao
 */
'use strict'


 class newMysqlCluster {
   constructor (name, replicas, lbgroup, config, storageCluster, size) {
     this.apiVersion = 'daas.tenxcloud.com/v1'
     this.kind = 'MySQLCluster'
     this.metadata = lbgroup === 'none'? {name}: {
       annotations: {
         ['system/lbgroup']: lbgroup,
         ['tenxcloud.com/schemaPortname']: `${name}-0/TCP`
       },
       name,
     }
     this.spec = {
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

