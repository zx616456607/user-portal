/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2016 TenxCloud. All Rights Reserved.
 *
 * Petset Mysql class for petset
 *
 * v0.1 - 2016-10-28
 * @author GaoJian
 */
"use strict"
const TENXCLOUD_PREFIX = "tenxcloud.com/"

class PetsetMysql {
  constructor(name) {
    this.kind = "PetSet"
    this.apiVersion = "apps/v1alpha1"
    this.metadata = {
      name: name,
      namespace: null,
      labels: {
        appType: 'mysql'
      },
    }
    this.spec = {
      serviceName: name,
      replicas: 1,
      template: {
        metadata: {
          labels: {
            app: name,
            appType: 'mysql'
          },
          annotations: {
            "pod.alpha.kubernetes.io/initialized": "true",
            "pod.alpha.kubernetes.io/init-containers": `'[
              {
                  "name": "install",
                  "image": "index.tenxcloud.com/google_containers/galera-install:0.1",
                  "imagePullPolicy": "Always",
                  "args": ["--work-dir=/work-dir"],
                  "volumeMounts": [
                      {
                          "name": "workdir",
                          "mountPath": "/work-dir"
                      },
                      {
                          "name": "config",
                          "mountPath": "/etc/mysql"
                      }
                  ]
              },
              {
                  "name": "bootstrap",
                  "image": "index.tenxcloud.com/docker_library/debian:jessie",
                  "command": ["/work-dir/peer-finder"],
                  "args": ["-on-start=\\"/work-dir/on-start.sh\\"", "-service=${name}"],
                  "env": [
                    {
                        "name": "POD_NAMESPACE",
                        "valueFrom": {
                            "fieldRef": {
                                "apiVersion": "v1",
                                "fieldPath": "metadata.namespace"
                            }
                        }
                     }
                  ],
                  "volumeMounts": [
                      {
                          "name": "workdir",
                          "mountPath": "/work-dir"
                      },
                      {
                          "name": "config",
                          "mountPath": "/etc/mysql"
                      }
                  ]
              }
            ]'`
          }
        },
        spec: {
          terminationGracePeriodSeconds: 0,
           "containers": [
            {
              "name": "mysql",
              "env": [
                {
                  "name": "MYSQL_ROOT_PASSWORD",
                  "value": "xxx"
                }
              ],
              "readinessProbe": {
                "successThreshold": 2,
                "initialDelaySeconds": 15,
                "timeoutSeconds": 5,
                "exec": {
                  "command": [
                    "sh",
                    "-c",
                    'mysql -u root -e "show databases;"'
                  ]
                }
              },
              "image": "index.tenxcloud.com/google_containers/mysql-galera:e2e",
              "args": [
                "--defaults-file=/etc/mysql/my-galera.cnf",
                "--user=root"
              ],
              "volumeMounts": [
                {
                  "mountPath": "/etc/mysql",
                  "name": "config"
                }
              ],
              "ports": [
                {
                  "containerPort": 3306,
                  "name": "mysql"
                },
                {
                  "containerPort": 4444,
                  "name": "sst"
                },
                {
                  "containerPort": 4567,
                  "name": "replication"
                },
                {
                  "containerPort": 4568,
                  "name": "ist"
                }
              ]
            }
          ],
          "volumes": [
            {
              "emptyDir": {},
              "name": "config"
            },
            {
              "emptyDir": {},
              "name": "workdir"
            }
          ]
        }
      }
    }
  }

  createMysqlDatabase( instanceNum, password) {
    this.spec.replicas = instanceNum
    this.spec.template.spec.containers[0].env[0].value = password
    this.metadata.namespace = "zhangpc"
  }
  
}

module.exports = PetsetMysql