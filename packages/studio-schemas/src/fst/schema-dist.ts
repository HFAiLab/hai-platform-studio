



// @ts-nocheck
import fastJson from 'fast-json-stringify';


export const TaskOverviewStringify = fastJson({
  "title": "TaskOverview",
  "type": "object",
  "properties": {
    "scheduled": {
      "type": "number"
    },
    "queued": {
      "type": "number"
    }
  },
  "required": [
    "scheduled",
    "queued"
  ]
});

export const ExperimentsRespContentStringify = fastJson({
  "title": "ExperimentsRespContent",
  "type": "array",
  "items": {
    "anyOf": [
      {
        "type": "number"
      },
      {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "assigned_nodes": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "backend": {
              "type": "string"
            },
            "begin_at": {
              "type": "string"
            },
            "begin_at_list": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "chain_id": {
              "type": "string"
            },
            "chain_status": {
              "type": "string",
              "enum": [
                "waiting_init",
                "running",
                "suspended",
                "finished"
              ]
            },
            "cluster": {
              "type": "string"
            },
            "code_file": {
              "type": "string"
            },
            "created_at": {
              "type": "string"
            },
            "end_at": {
              "type": "string"
            },
            "end_at_list": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "force_restart1": {
              "type": "number"
            },
            "group": {
              "type": "string"
            },
            "id": {
              "type": "number"
            },
            "job_info": {
              "type": "string"
            },
            "nb_name": {
              "type": "string"
            },
            "nodes": {
              "type": "number"
            },
            "nodes_list": {
              "type": "array",
              "items": {
                "type": "number"
              }
            },
            "pods": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "job_uid": {
                    "type": "string"
                  },
                  "node": {
                    "anyOf": [
                      {
                        "type": "null"
                      },
                      {
                        "type": "string"
                      }
                    ]
                  },
                  "pod_id": {
                    "type": "string"
                  },
                  "role": {
                    "type": "string",
                    "enum": [
                      "master",
                      "worker"
                    ]
                  },
                  "started_at": {
                    "type": "string"
                  },
                  "status": {
                    "type": "string",
                    "enum": [
                      "created",
                      "building",
                      "unschedulable",
                      "scheduled",
                      "running",
                      "succeeded",
                      "failed",
                      "stopped",
                      "unknown",
                      "queued"
                    ]
                  },
                  "exit_code": {
                    "type": "string"
                  }
                },
                "required": [
                  "job_uid",
                  "pod_id",
                  "started_at",
                  "status"
                ]
              }
            },
            "priority": {
              "type": "number"
            },
            "queue_job": {
              "type": "boolean"
            },
            "queue_status": {
              "type": "string",
              "enum": [
                "scheduled",
                "queued",
                "finished"
              ]
            },
            "restart_count": {
              "type": "number"
            },
            "received_stop": {
              "type": "boolean"
            },
            "star": {
              "type": "boolean"
            },
            "suspend_count": {
              "type": "number"
            },
            "suspend_updated_at": {
              "type": "string"
            },
            "user_name": {
              "type": "string"
            },
            "whole_life_state": {
              "type": "number"
            },
            "workspace": {
              "type": "string"
            },
            "instance_updated_at": {
              "type": "string"
            },
            "stop_code": {
              "type": "number"
            },
            "stop_code_list": {
              "type": "array",
              "items": {
                "type": "number"
              }
            },
            "mount_code": {
              "type": "number"
            },
            "config_json": {
              "type": "object",
              "properties": {
                "priority": {
                  "anyOf": [
                    {
                      "type": "null"
                    },
                    {
                      "type": "number"
                    }
                  ]
                },
                "whole_life_state": {
                  "anyOf": [
                    {
                      "type": "null"
                    },
                    {
                      "type": "number"
                    }
                  ]
                },
                "schedule_zone": {
                  "type": "string"
                },
                "client_group": {
                  "type": "string"
                },
                "cpu": {
                  "type": "number"
                },
                "memory": {
                  "type": "number"
                }
              },
              "required": []
            },
            "worker_status": {
              "type": "string",
              "enum": [
                "terminating",
                "failed",
                "stopped",
                "succeeded",
                "unfinished",
                "canceled"
              ]
            },
            "worker_status_list": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "terminating",
                  "failed",
                  "stopped",
                  "succeeded",
                  "unfinished",
                  "canceled"
                ]
              }
            }
          },
          "required": [
            "backend",
            "begin_at",
            "begin_at_list",
            "chain_id",
            "chain_status",
            "cluster",
            "code_file",
            "created_at",
            "end_at",
            "end_at_list",
            "group",
            "id",
            "nb_name",
            "nodes",
            "nodes_list",
            "pods",
            "priority",
            "queue_job",
            "queue_status",
            "restart_count",
            "star",
            "suspend_count",
            "suspend_updated_at",
            "user_name",
            "whole_life_state",
            "workspace",
            "stop_code",
            "stop_code_list",
            "mount_code",
            "config_json",
            "worker_status",
            "worker_status_list"
          ]
        }
      }
    ]
  }
});

export const ClusterOverviewRespContentStringify = fastJson({
  "title": "ClusterOverviewRespContent",
  "type": "object",
  "properties": {
    "free": {
      "type": "number"
    },
    "locked": {
      "type": "number"
    },
    "not_ready": {
      "type": "number"
    },
    "usage_rate": {
      "type": "number"
    },
    "working": {
      "type": "number"
    }
  },
  "required": [
    "usage_rate"
  ]
});

export const ClusterOverviewDetailStringify = fastJson({
  "title": "ClusterOverviewDetail",
  "type": "object",
  "properties": {
    "usage_rate": {
      "type": "number"
    },
    "total": {
      "type": "number"
    },
    "other": {
      "type": "number"
    },
    "free": {
      "type": "number"
    },
    "working": {
      "type": "number"
    }
  },
  "required": [
    "usage_rate",
    "total",
    "other",
    "free",
    "working"
  ]
});

export const ClusterOverviewRespContent2Stringify = fastJson({
  "title": "ClusterOverviewRespContent2",
  "type": "object",
  "properties": {
    "usage_rate": {
      "type": "number"
    },
    "total": {
      "type": "number"
    },
    "other": {
      "type": "number"
    },
    "free": {
      "type": "number"
    },
    "working": {
      "type": "number"
    }
  },
  "required": [
    "usage_rate",
    "total",
    "other",
    "free",
    "working"
  ]
});

export const RawClusterOverviewRespContent2Stringify = fastJson({
  "title": "RawClusterOverviewRespContent2",
  "type": "object",
  "properties": {
    "usage_rate": {
      "type": "number"
    },
    "total": {
      "type": "number"
    },
    "other": {
      "type": "number"
    },
    "free": {
      "type": "number"
    },
    "working": {
      "type": "number"
    },
    "gpu_detail": {
      "type": "object",
      "properties": {
        "usage_rate": {
          "type": "number"
        },
        "total": {
          "type": "number"
        },
        "other": {
          "type": "number"
        },
        "free": {
          "type": "number"
        },
        "working": {
          "type": "number"
        }
      },
      "required": [
        "usage_rate",
        "total",
        "other",
        "free",
        "working"
      ]
    },
    "cpu_detail": {
      "type": "object",
      "properties": {
        "usage_rate": {
          "type": "number"
        },
        "total": {
          "type": "number"
        },
        "other": {
          "type": "number"
        },
        "free": {
          "type": "number"
        },
        "working": {
          "type": "number"
        }
      },
      "required": [
        "usage_rate",
        "total",
        "other",
        "free",
        "working"
      ]
    }
  },
  "required": [
    "usage_rate",
    "total",
    "other",
    "free",
    "working",
    "gpu_detail",
    "cpu_detail"
  ]
});

export const TaskCurrentPerfRespContentStringify = fastJson({
  "title": "TaskCurrentPerfRespContent",
  "type": "object",
  "properties": {
    "gpu_util": {
      "anyOf": [
        {
          "type": "null"
        },
        {
          "type": "number"
        }
      ]
    },
    "ib_recv": {
      "anyOf": [
        {
          "type": "null"
        },
        {
          "type": "number"
        }
      ]
    },
    "ib_trans": {
      "anyOf": [
        {
          "type": "null"
        },
        {
          "type": "number"
        }
      ]
    }
  },
  "required": [
    "gpu_util",
    "ib_recv",
    "ib_trans"
  ]
});

export const LogLastSeenStringify = fastJson({
  "title": "LogLastSeen",
  "type": "object",
  "properties": {
    "timestamp": {
      "type": "string"
    },
    "offset": {
      "type": "number"
    },
    "mtime": {
      "type": "number"
    }
  },
  "required": [
    "timestamp",
    "offset",
    "mtime"
  ]
});

export const LogRespContentStringify = fastJson({
  "title": "LogRespContent",
  "type": "object",
  "properties": {
    "success": {
      "type": "number"
    },
    "msg": {
      "type": "string"
    },
    "chain": {
      "type": "object",
      "properties": {
        "assigned_nodes": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "backend": {
          "type": "string"
        },
        "begin_at": {
          "type": "string"
        },
        "begin_at_list": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "chain_id": {
          "type": "string"
        },
        "chain_status": {
          "type": "string",
          "enum": [
            "waiting_init",
            "running",
            "suspended",
            "finished"
          ]
        },
        "cluster": {
          "type": "string"
        },
        "code_file": {
          "type": "string"
        },
        "created_at": {
          "type": "string"
        },
        "end_at": {
          "type": "string"
        },
        "end_at_list": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "force_restart1": {
          "type": "number"
        },
        "group": {
          "type": "string"
        },
        "id": {
          "type": "number"
        },
        "job_info": {
          "type": "string"
        },
        "nb_name": {
          "type": "string"
        },
        "nodes": {
          "type": "number"
        },
        "nodes_list": {
          "type": "array",
          "items": {
            "type": "number"
          }
        },
        "pods": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "job_uid": {
                "type": "string"
              },
              "node": {
                "anyOf": [
                  {
                    "type": "null"
                  },
                  {
                    "type": "string"
                  }
                ]
              },
              "pod_id": {
                "type": "string"
              },
              "role": {
                "type": "string",
                "enum": [
                  "master",
                  "worker"
                ]
              },
              "started_at": {
                "type": "string"
              },
              "status": {
                "type": "string",
                "enum": [
                  "created",
                  "building",
                  "unschedulable",
                  "scheduled",
                  "running",
                  "succeeded",
                  "failed",
                  "stopped",
                  "unknown",
                  "queued"
                ]
              },
              "exit_code": {
                "type": "string"
              }
            },
            "required": [
              "job_uid",
              "pod_id",
              "started_at",
              "status"
            ]
          }
        },
        "priority": {
          "type": "number"
        },
        "queue_job": {
          "type": "boolean"
        },
        "queue_status": {
          "type": "string",
          "enum": [
            "scheduled",
            "queued",
            "finished"
          ]
        },
        "restart_count": {
          "type": "number"
        },
        "received_stop": {
          "type": "boolean"
        },
        "star": {
          "type": "boolean"
        },
        "suspend_count": {
          "type": "number"
        },
        "suspend_updated_at": {
          "type": "string"
        },
        "user_name": {
          "type": "string"
        },
        "whole_life_state": {
          "type": "number"
        },
        "workspace": {
          "type": "string"
        },
        "instance_updated_at": {
          "type": "string"
        },
        "stop_code": {
          "type": "number"
        },
        "stop_code_list": {
          "type": "array",
          "items": {
            "type": "number"
          }
        },
        "mount_code": {
          "type": "number"
        },
        "config_json": {
          "type": "object",
          "properties": {
            "priority": {
              "anyOf": [
                {
                  "type": "null"
                },
                {
                  "type": "number"
                }
              ]
            },
            "whole_life_state": {
              "anyOf": [
                {
                  "type": "null"
                },
                {
                  "type": "number"
                }
              ]
            },
            "schedule_zone": {
              "type": "string"
            },
            "client_group": {
              "type": "string"
            },
            "cpu": {
              "type": "number"
            },
            "memory": {
              "type": "number"
            }
          },
          "required": []
        },
        "worker_status": {
          "type": "string",
          "enum": [
            "terminating",
            "failed",
            "stopped",
            "succeeded",
            "unfinished",
            "canceled"
          ]
        },
        "worker_status_list": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "terminating",
              "failed",
              "stopped",
              "succeeded",
              "unfinished",
              "canceled"
            ]
          }
        }
      },
      "required": [
        "backend",
        "begin_at",
        "begin_at_list",
        "chain_id",
        "chain_status",
        "cluster",
        "code_file",
        "created_at",
        "end_at",
        "end_at_list",
        "group",
        "id",
        "nb_name",
        "nodes",
        "nodes_list",
        "pods",
        "priority",
        "queue_job",
        "queue_status",
        "restart_count",
        "star",
        "suspend_count",
        "suspend_updated_at",
        "user_name",
        "whole_life_state",
        "workspace",
        "stop_code",
        "stop_code_list",
        "mount_code",
        "config_json",
        "worker_status",
        "worker_status_list"
      ]
    },
    "error_msg": {
      "type": "string"
    },
    "data": {
      "type": "string"
    },
    "fullLog": {
      "type": "string"
    },
    "stop_code": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "number"
        }
      ]
    },
    "last_seen": {
      "type": "object",
      "properties": {
        "timestamp": {
          "type": "string"
        },
        "offset": {
          "type": "number"
        },
        "mtime": {
          "type": "number"
        }
      },
      "required": [
        "timestamp",
        "offset",
        "mtime"
      ]
    }
  },
  "required": [
    "success"
  ]
});

export const SysLogRespContentStringify = fastJson({
  "title": "SysLogRespContent",
  "type": "object",
  "properties": {
    "success": {
      "type": "number"
    },
    "data": {
      "type": "string"
    },
    "msg": {
      "type": "string"
    }
  },
  "required": [
    "success"
  ]
});


