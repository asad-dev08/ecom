import { Button, Drawer, Form, Input, Select, Space } from "antd";
import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  saveSecurityGroup,
  updateSecurityGroup,
} from "../../../store/security-group/securityGroupSlice";
import toast from "react-hot-toast";
import { getSecurityRules } from "../../../store/security-rule/securityRuleSlice";

const manipulateRuleList = (list) => {
  const data =
    list && list.ruleList
      ? list.ruleList.map((obj) => obj.rule_id.toString())
      : [];
  return data;
};

const CreateSecurityGroup = ({
  onClose,
  open,
  data,
  isAdd,
  isView,
  permission,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const securityRules = useSelector(
    (state) => state.securityRule.securityRulesComboList
  );

  const [securityRuleIds, setSecurityRuleIds] = useState("");
  const [securityRuleList, setSecurityRuleList] = useState([]);
  const [securityRuleListFinal, setSecurityRuleListFinal] = useState([]);

  const securityRuleIdsSelected = manipulateRuleList(data);

  useEffect(() => {
    dispatch(getSecurityRules());
  }, []);

  useEffect(() => {
    if (data && data.ruleList && data.ruleList.length > 0) {
      setSecurityRuleList(data.ruleList);
      setSecurityRuleListFinal(data.ruleList);
    }
  }, [data]);

  const handleSaveClick = (e) => {
    e.preventDefault();
    form.submit();
  };

  const onFinish = async (values) => {
    const model = {
      ...values,
      id: isAdd ? 0 : data.id,
      ruleList: securityRuleList || [],
    };

    try {
      if (isAdd) {
        await dispatch(saveSecurityGroup(model))
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
            }
          })
          .catch((error) => {
            console.error("Error submitting form:", error);
            toast.error(error, { duration: 3000 });
          });
      } else {
        await dispatch(updateSecurityGroup(model))
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

  const handleChangeSelect = (value) => {
    setSecurityRuleIds(value);
    let items = value.toString().split(",");

    // Convert the array elements into objects
    let objects = items.map((item) => ({ rule_id: item }));

    let tmpList = [];
    for (const obj of objects) {
      const findExisting = securityRuleListFinal.find(
        (x) => x.rule_id === obj.rule_id
      );

      if (findExisting) {
        let tmpObj = {
          id: findExisting.id,
          rule_id: obj.rule_id,
        };
        tmpList.push(tmpObj);
      } else {
        let tmpObj = {
          id: null,
          rule_id: obj.rule_id,
        };
        tmpList.push(tmpObj);
      }
    }
    setSecurityRuleList(tmpList);
  };

  return (
    <Drawer
      title="Add/Edit Security Group"
      placement="right"
      width={600}
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
          securityRuleIdsSelected: securityRuleIdsSelected || [],
        }}
        scrollToFirstError
      >
        <Form.Item
          name="name"
          label="Security Group Name"
          rules={[
            {
              required: true,
              message: "Enter Security Group Name",
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
        </Form.Item>{" "}
        <Form.Item
          name="securityRuleIdsSelected"
          label="Security Rules"
          rules={[
            {
              required: true,
              message: "Please select one or more security rules!",
            },
          ]}
        >
          <Select
            showSearch
            mode="multiple"
            placeholder="Search to Select Security Rules"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").includes(input)
            }
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? "")
                .toLowerCase()
                .localeCompare((optionB?.label ?? "").toLowerCase())
            }
            options={securityRules}
            value={securityRuleIdsSelected}
            defaultValue={securityRuleIdsSelected}
            onChange={handleChangeSelect}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CreateSecurityGroup;
