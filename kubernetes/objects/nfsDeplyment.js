/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * ceph class for k8s
 *
 * v0.1 - 2017-9-20
 * @author Zhangpc
 */
'use strict'
class NfsDeplyment {
  constructor(name, ip, path){
    this.kind = 'Deployment'
    this.apiVersion = 'extensions/v1beta1'
    this.metadata = {
      name,
      namespace: 'kube-system'
    }
    this.spec = {
      replicas: 1,
      strategy: {
        type: 'Recreate'
      },
      template:{
        metadata: {
          labels: {
            app: name,
          }
        },
        spec: {
          serviceAccount: 'nfs-provisioner',
          containers: [
            {
              name,
              image: '192.168.1.55/tenx_containers/nfs-client-provisioner:latest',
              volumeMounts: [
                {
                  "name": "nfs-client-root",
                  "mountPath": "/persistentvolumes"
                }
              ],
              env: [
                {
                  "name": "PROVISIONER_NAME",
                  "value": name,
                },
                {
                  "name": "NFS_SERVER",
                  "value":  ip,
                },
                {
                  "name": "NFS_PATH",
                  "value": path,
                }
              ]
            }
          ],
          volumes: [
            {
              "name": "nfs-client-root",
              "nfs": {
                "server": ip,
                "path": path,
              }
            }
          ]
        }
      },
    }
  }
}

module.exports = NfsDeplyment