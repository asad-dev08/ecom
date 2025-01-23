import { Button, Checkbox, Drawer, Form, Input, Space, Tabs } from "antd";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  saveCompany,
  updateCompany,
} from "../../../store/company/companySlice";
import toast from "react-hot-toast";

const { TextArea } = Input;

const CreateCompany = ({
  onClose,
  open,
  data,
  isAdd,
  isView,
  permission,
  onCompanyChange,
  initialData,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialData && isAdd) {
      form.setFieldsValue({
        ...initialData,
      });
    }
  }, [initialData, isAdd, form]);

  const onFinish = async (values) => {
    console.log(values);
    const model = {
      ...values,
      id: isAdd ? 0 : data.id,
      is_seller: values.is_seller || false,
      seller_id: initialData?.seller_id || null,
      additionalInfo: {
        short_description: values.short_description,
        facebook_link: values.facebook_link,
        twitter_link: values.twitter_link,
        instagram_link: values.instagram_link,
        linkedin_link: values.linkedin_link,
        youtube_link: values.youtube_link,
        whatsapp_number: values.whatsapp_number,
        google_map_link: values.google_map_link,
        vision: values.vision,
        mission: values.mission,
      },
    };

    try {
      if (isAdd) {
        const response = await dispatch(saveCompany(model));
        if (response?.payload?.statusCode === 201) {
          toast.success(response?.payload?.message);
          form.resetFields();
          onCompanyChange(response?.payload?.data);
        }
      } else {
        await dispatch(updateCompany(model)).then((response) => {
          if (response?.payload?.statusCode === 200) {
            toast.success(response?.payload?.message);
            onCompanyChange();
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
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
  const items = [
    {
      key: "1",
      label: "Basic Information",
      children: (
        <>
          <Form.Item
            name="company_name"
            label="Company Name"
            rules={[
              {
                required: true,
                message: "Enter Company Name",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="company_short_name" label="Short Name">
            <Input />
          </Form.Item>
          <Form.Item name="company_code" label="Short Code">
            <Input />
          </Form.Item>

          <Form.Item
            name="registration_number"
            label="Registration No"
            rules={[
              {
                required: true,
                message: "Enter Unique Registration No.",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="tax_id"
            label="TAX ID"
            rules={[
              {
                required: true,
                message: "Enter Unique TAX ID.",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="address" label="Address">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="city" label="City">
            <Input />
          </Form.Item>

          <Form.Item name="state" label="State">
            <Input />
          </Form.Item>

          <Form.Item name="country" label="Country">
            <Input />
          </Form.Item>

          <Form.Item name="postal_code" label="Postal Code">
            <Input />
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

          <Form.Item name="website" label="Website Link">
            <Input />
          </Form.Item>

          {/* <Form.Item name="founded_date" label="Founded Date" className="w-full">
          
          <DatePicker
            className="w-full" //showTime
          />
        </Form.Item> */}

          <Form.Item name="industry" label="Industry">
            <Input type="text" />
          </Form.Item>

          <Form.Item name="number_of_employees" label="No. of Employee">
            <Input type="number" />
          </Form.Item>

          <Form.Item name="annual_revenue" label="Annual Revenue">
            <Input type="number" />
          </Form.Item>

          <Form.Item name="description" label="Description (if any)">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="is_active"
            valuePropName="checked"
            // {...tailFormItemLayout}
          >
            <Checkbox>Active?</Checkbox>
          </Form.Item>
          <Form.Item name="is_seller" valuePropName="checked">
            <Checkbox>Is Seller Company?</Checkbox>
          </Form.Item>
        </>
      ),
    },
    {
      key: "2",
      label: "Additional Information",
      children: (
        <>
          <Form.Item name="short_description" label="Short Description">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="facebook_link" label="Facebook Link">
            <Input />
          </Form.Item>
          <Form.Item name="twitter_link" label="Twitter Link">
            <Input />
          </Form.Item>
          <Form.Item name="instagram_link" label="Instagram Link">
            <Input />
          </Form.Item>
          <Form.Item name="linkedin_link" label="LinkedIn Link">
            <Input />
          </Form.Item>
          <Form.Item name="youtube_link" label="YouTube Link">
            <Input />
          </Form.Item>
          <Form.Item name="whatsapp_number" label="WhatsApp Number">
            <Input />
          </Form.Item>
          <Form.Item name="google_map_link" label="Google Map Link">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item name="vision" label="Vision">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="mission" label="Mission">
            <TextArea rows={3} />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <Drawer
      title="Add/Edit Company"
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
            <Button type="primary" onClick={() => form.submit()}>
              Save
            </Button>
          ) : null}
        </Space>
      }
    >
      <Form
        disabled={isView}
        form={form}
        onFinish={onFinish}
        layout="vertical"
        initialValues={{
          ...data,
          ...data?.CompanyAdditionalInfo?.[0],
        }}
      >
        <Tabs items={items} />
      </Form>
    </Drawer>
  );
};

export default CreateCompany;
