import { Button, Checkbox, Drawer, Form, Input, Space, Tabs, Tree } from "antd";
import React, { useEffect, useState } from "react";

import { useDispatch } from "react-redux";
import {
  saveSecurityRule,
  updateSecurityRule,
} from "../../../store/security-rule/securityRuleSlice";
import toast from "react-hot-toast";

const { TabPane } = Tabs;

function convertFlatToNested(items) {
  const map = {};
  const roots = [];

  // Create a mapping of id to item and find root items
  items.forEach((item) => {
    map[item.id] = {
      ...item,
      children: [],
      title: item.title,
      can_view: item.can_view,
      can_create: item.can_create,
      can_update: item.can_update,
      can_delete: item.can_delete,
      can_report: item.can_report,
    };
    if (!item.parent_id) {
      roots.push(map[item.id]);
    }
  });

  // Link child items to their parent
  items.forEach((item) => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.id]);
    }
  });

  return roots;
}

const CreateSecurityRule = ({
  onClose,
  open,
  data,
  isAdd,
  menus,
  isView,
  permission,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [selectedPermissions, setSelectedPermissions] = useState({});

  useEffect(() => {
    if (
      data &&
      data.SecurityRuleWiseMenuPermissions &&
      data.SecurityRuleWiseMenuPermissions.length > 0
    ) {
      const newSelectedPermissions = { ...selectedPermissions };
      for (const per of data.SecurityRuleWiseMenuPermissions) {
        if (!newSelectedPermissions[per.menu_id]) {
          newSelectedPermissions[per.menu_id] = {};
        }
        newSelectedPermissions[per.menu_id]["permission_id"] = per.id;
        newSelectedPermissions[per.menu_id]["can_view"] = !!per.can_view;
        newSelectedPermissions[per.menu_id]["can_create"] = !!per.can_create;
        newSelectedPermissions[per.menu_id]["can_update"] = !!per.can_update;
        newSelectedPermissions[per.menu_id]["can_delete"] = !!per.can_delete;
        newSelectedPermissions[per.menu_id]["can_report"] = !!per.can_report;
      }
      setSelectedPermissions(newSelectedPermissions);
    }
  }, [data]);

  const menuTree = convertFlatToNested(menus);

  const handleSaveClick = (e) => {
    e.preventDefault();
    form.submit();
  };

  const onFinish = async (values) => {
    const model = {
      ...values,
      id: isAdd ? 0 : data.id,
      menuPermissionList: selectedPermissions,
    };

    try {
      if (isAdd) {
        await dispatch(saveSecurityRule(model))
          .then((response) => {
            if (
              response &&
              response.payload &&
              response.payload.statusCode === 201
            ) {
              toast.success(
                response && response.payload && response.payload.message,
                { duration: 3000 }
              );
              form.resetFields();
              setSelectedPermissions({});
            }
          })
          .catch((error) => {
            console.error("Error submitting form:", error);
            toast.error(error, { duration: 3000 });
          });
      } else {
        await dispatch(updateSecurityRule(model))
          .then((response) => {
            if (
              response &&
              response.payload &&
              response.payload.statusCode === 200
            ) {
              toast.success(
                response && response.payload && response.payload.message,
                { duration: 3000 }
              );
            }
          })
          .catch((error) => {
            console.error("Error submitting form:", error);
            toast.error(error, { duration: 3000 });
          });
      }
    } catch (error) {}
  };
  const formItemLayout = {
    labelCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 8,
      },
    },
    wrapperCol: {
      xs: {
        span: 24,
      },
      sm: {
        span: 16,
      },
    },
  };

  const handleCheckboxChange = (e, id, field) => {
    const newSelectedPermissions = { ...selectedPermissions };
    if (!newSelectedPermissions[id]) {
      newSelectedPermissions[id] = {};
    }
    newSelectedPermissions[id][field] = e.target.checked;
    setSelectedPermissions(newSelectedPermissions);
  };

  function generateTreeNodes(menuData) {
    return menuData.map((item) => {
      const selectedPermission = selectedPermissions[item.id] || {};
      if (item.children && item.children.length > 0) {
        return {
          title: (
            <Space>
              <div className="w-[200px]">{item.title}</div>
              <Checkbox
                checked={selectedPermission.can_view}
                onChange={(e) => handleCheckboxChange(e, item.id, "can_view")}
              >
                view
              </Checkbox>
              <Checkbox
                checked={selectedPermission.can_create}
                onChange={(e) => handleCheckboxChange(e, item.id, "can_create")}
              >
                create
              </Checkbox>
              <Checkbox
                checked={selectedPermission.can_update}
                onChange={(e) => handleCheckboxChange(e, item.id, "can_update")}
              >
                update
              </Checkbox>
              <Checkbox
                checked={selectedPermission.can_delete}
                onChange={(e) => handleCheckboxChange(e, item.id, "can_delete")}
              >
                delete
              </Checkbox>
              <Checkbox
                checked={selectedPermission.can_report}
                onChange={(e) => handleCheckboxChange(e, item.id, "can_report")}
              >
                report
              </Checkbox>
            </Space>
          ),
          key: item.id,
          children: generateTreeNodes(item.children),
        };
      } else {
        return {
          title: (
            <Space>
              <div className="w-[200px]">{item.title}</div>
              <Checkbox
                checked={selectedPermission.can_view}
                onChange={(e) => handleCheckboxChange(e, item.id, "can_view")}
              >
                view
              </Checkbox>
              <Checkbox
                checked={selectedPermission.can_create}
                onChange={(e) => handleCheckboxChange(e, item.id, "can_create")}
              >
                create
              </Checkbox>{" "}
              <Checkbox
                checked={selectedPermission.can_update}
                onChange={(e) => handleCheckboxChange(e, item.id, "can_update")}
              >
                update
              </Checkbox>
              <Checkbox
                checked={selectedPermission.can_delete}
                onChange={(e) => handleCheckboxChange(e, item.id, "can_delete")}
              >
                delete
              </Checkbox>
              <Checkbox
                checked={selectedPermission.can_report}
                onChange={(e) => handleCheckboxChange(e, item.id, "can_report")}
              >
                report
              </Checkbox>
            </Space>
          ),
          key: item.id,
        };
      }
    });
  }

  return (
    <Drawer
      title="Add/Edit Security Rule"
      placement="right"
      width={800}
      onClose={onClose}
      open={open}
      maskClosable={false}
      extra={
        <Space>
          {permission &&
          (permission.can_create || permission.can_update) &&
          !isView ? (
            <Button type="primary" htmlType="button" onClick={handleSaveClick}>
              Save
            </Button>
          ) : null}
        </Space>
      }
    >
      <Form
        disabled={isView}
        {...formItemLayout}
        form={form}
        onFinish={onFinish}
        name="user_creation"
        initialValues={{
          id: (data && data.id) || 0,
          name: (data && data.name) || "",
          description: (data && data.description) || "",
        }}
        scrollToFirstError
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Basic Info" key="1">
            <Form.Item
              name="name"
              label="Security Rule Name"
              rules={[
                {
                  required: true,
                  message: "Enter Security Rule Name",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  message: "Enter Description",
                },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </TabPane>
          <TabPane tab="Menu Permission Tree" key="2">
            <Tree
              checkable={false}
              defaultExpandAll
              treeData={generateTreeNodes(menuTree)}
            />
          </TabPane>
        </Tabs>
      </Form>
    </Drawer>
  );
};

export default CreateSecurityRule;
