import { Button, Checkbox, Drawer, Form, Input, Select, Space } from "antd";
import React, { useEffect, useState } from "react";
import {
  LoadingOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  checkUsernameAvailability,
  saveUser,
  updateUser,
} from "../../../store/user/userSlice";
import toast from "react-hot-toast";
import { getSecurityGroups } from "../../../store/security-group/securityGroupSlice";
import { getCompanys } from "../../../store/company/companySlice";
import { debounce } from "lodash";
import { UserTypeList } from "../../../utils/actionTypes";

const manipulateGroupList = (list) => {
  const data =
    list && list.UserGroups
      ? list.UserGroups.map((obj) => obj.group_id.toString())
      : [];
  return data;
};
const CreateUser = ({ onClose, open, data, isAdd, isView, permission }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const securityGroups = useSelector(
    (state) => state.securityGroup.securityGroupsComboList
  );
  const companies = useSelector((state) => state.company.companyForComboList);

  const [securityGroupIds, setSecurityGroupIds] = useState("");
  const [securityGroupList, setSecurityGroupList] = useState([]);
  const [securityGroupListFinal, setSecurityGroupListFinal] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const securityGroupIdsSelected = manipulateGroupList(data);

  const [isAdmin, setIsAdmin] = useState(data?.is_admin || false);
  const [userType, setUserType] = useState(data?.user_type || "");

  useEffect(() => {
    dispatch(getSecurityGroups());
    dispatch(getCompanys());
  }, []);

  useEffect(() => {
    if (data && data.UserGroups && data.UserGroups.length > 0) {
      setSecurityGroupList(data.UserGroups);
      setSecurityGroupListFinal(data.UserGroups);
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
      UserGroups: securityGroupList || [],
    };

    try {
      if (isAdd) {
        await dispatch(saveUser(model))
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
        await dispatch(updateUser(model))
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
  const tailFormItemLayout = {
    wrapperCol: {
      xs: {
        span: 24,
        offset: 0,
      },
      sm: {
        span: 16,
        offset: 8,
      },
    },
  };

  const handleChangeSelect = (value) => {
    setSecurityGroupIds(value);
    let items = value.toString().split(",");

    // Convert the array elements into objects
    let objects = items.map((item) => ({ group_id: item }));

    let tmpList = [];
    for (const obj of objects) {
      const findExisting = securityGroupListFinal.find(
        (x) => x.group_id === obj.group_id
      );

      if (findExisting) {
        let tmpObj = {
          id: findExisting.id,
          group_id: obj.group_id,
        };
        tmpList.push(tmpObj);
      } else {
        let tmpObj = {
          id: null,
          group_id: obj.group_id,
        };
        tmpList.push(tmpObj);
      }
    }

    setSecurityGroupList(tmpList);
  };

  const handleChange = (value) => {
    setSelectedCompany(value);
  };
  const handleChangeType = (value) => {
    setSelectedType(value);
    setUserType(value);
  };

  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameLoading, setUsernameLoading] = useState(false);

  const handleUsernameChange = debounce(async (value) => {
    setUsernameLoading(true);
    const response = await dispatch(checkUsernameAvailability({ name: value }));
    setUsernameAvailable(response.payload && response.payload.data);
    setUsernameLoading(false);
  }, 500);
  const [initialUsername, setInitialUsername] = useState(data?.username || "");

  const SubmitButton = ({
    form,
    usernameAvailable,
    handleSaveClick,
    children,
  }) => {
    const [submittable, setSubmittable] = React.useState(false);

    // Watch all values
    const values = Form.useWatch([], form);
    React.useEffect(() => {
      form
        .validateFields({
          validateOnly: true,
        })
        .then(() => setSubmittable(true))
        .catch(() => setSubmittable(false));
    }, [form, values]);

    return (
      <Button
        type="primary"
        htmlType="submit"
        // disabled={!usernameAvailable || !submittable}

        onClick={handleSaveClick}
      >
        {children}
      </Button>
    );
  };

  return (
    <Drawer
      title="Add/Edit User"
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
            // <Button
            //   disabled={
            //     !usernameAvailable &&
            //     form.getFieldsError().some((field) => field.errors.length > 0)
            //   }
            //   type="primary"
            //   htmlType="button"
            //   onClick={handleSaveClick}
            // >
            //   Save
            // </Button>
            <SubmitButton
              form={form}
              usernameAvailable={usernameAvailable}
              handleSaveClick={handleSaveClick}
            >
              Save
            </SubmitButton>
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
          phonePrefix: "880",

          id: (data && data.id) || 0,
          username: (data && data.username) || "",
          password: "",
          email: (data && data.email) || "",
          fullname: (data && data.fullname) || "",
          is_active: data && data.is_active,
          is_admin: data && data.is_admin,
          phone: (data && data.phone) || "",
          address: (data && data.address) || "",
          isPasswordReset: (data && data.isPasswordReset) || false,

          securityGroupIdsSelected: securityGroupIdsSelected || [],
          company_id: (data && data.company_id) || "",
          user_type: (data && data.user_type) || "",
        }}
        scrollToFirstError
      >
        <Form.Item
          name="fullname"
          label="Full Name"
          rules={[
            {
              required: true,
              message: "Enter Full Name",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="username"
          label="Username"
          rules={[
            {
              required: true,
              message: "Enter Username",
            },
          ]}
        >
          <Input
            suffix={
              usernameLoading ? (
                <LoadingOutlined spin />
              ) : usernameAvailable ? (
                <CheckCircleOutlined style={{ color: "green" }} />
              ) : (
                <CloseCircleOutlined style={{ color: "red" }} />
              )
            }
            onChange={(e) => handleUsernameChange(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              type: "email",
              message: "Enter a valid Email",
            },
            {
              required: true,
              message: "Enter Email",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          // extra="When user will log in first time this password need to be reset"
          rules={[
            {
              required: data && data.id !== 0 ? false : true,
              message: "Enter Password",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            {
              required: true,
              message: "Enter Phone Number",
            },
          ]}
        >
          <Input style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
          rules={[
            {
              message: "Enter Address",
            },
          ]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          className="!w-full"
          name="user_type"
          label="User Type"
          rules={[
            {
              required: true,
              message: "Please select the type of this user.",
            },
          ]}
        >
          <Select
            className="w-full"
            options={UserTypeList}
            defaultValue={(data && data.user_type) || null}
            onChange={handleChangeType}
          />
        </Form.Item>
        <Form.Item
          name="securityGroupIdsSelected"
          label="Security Groups"
          rules={[
            {
              required: !isAdmin && userType !== "Admin",
              message: "Please select one or more security groups!",
            },
          ]}
        >
          <Select
            showSearch
            mode="multiple"
            placeholder="Search to Select Security Groups"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").includes(input)
            }
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? "")
                .toLowerCase()
                .localeCompare((optionB?.label ?? "").toLowerCase())
            }
            options={securityGroups}
            value={securityGroupIdsSelected}
            defaultValue={securityGroupIdsSelected}
            onChange={handleChangeSelect}
          />
        </Form.Item>
        <Form.Item
          className="!w-full"
          name="company_id"
          label="Company"
          rules={[
            {
              required: true,
              message: "Please select the company of this user.",
            },
          ]}
        >
          <Select
            className="w-full"
            options={companies}
            defaultValue={(data && data.company_id) || null}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item
          name="is_active"
          valuePropName="checked"
          {...tailFormItemLayout}
        >
          <Checkbox>Active?</Checkbox>
        </Form.Item>
        <Form.Item
          name="is_admin"
          valuePropName="checked"
          {...tailFormItemLayout}
        >
          <Checkbox onChange={(e) => setIsAdmin(e.target.checked)}>
            Admin?
          </Checkbox>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CreateUser;
