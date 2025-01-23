import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Drawer, Form, Input, Button, Space, InputNumber, Switch } from "antd";
import { toast } from "react-hot-toast";
import {
  saveShippingCharge,
  updateShippingCharge,
} from "../../../store/shipping-charge/shippingChargeSlice";

const CreateShippingCharge = ({
  onClose,
  open,
  data,
  isAdd,
  isView,
  permission,
  onShippingChargeChange,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data && !isAdd) {
      form.setFieldsValue(data);
    }
  }, [data, isAdd, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const shippingChargeData = {
        ...values,
        id: isAdd ? undefined : data.id,
      };

      if (isAdd) {
        const response = await dispatch(
          saveShippingCharge(shippingChargeData)
        ).unwrap();
        if (response?.statusCode === 201) {
          toast.success(response.message);
          form.resetFields();
          onShippingChargeChange();
          onClose();
        }
      } else {
        const response = await dispatch(
          updateShippingCharge({ id: data.id, data: shippingChargeData })
        ).unwrap();
        if (response?.statusCode === 200) {
          toast.success(response.message);
          onShippingChargeChange();
          onClose();
        }
      }
    } catch (error) {
      const errorMessage =
        error?.message || "An error occurred while saving the shipping charge";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    form.submit();
  };

  const SubmitButton = ({ form }) => {
    const [submittable, setSubmittable] = React.useState(false);
    const values = Form.useWatch([], form);

    React.useEffect(() => {
      form
        .validateFields({ validateOnly: true })
        .then(() => setSubmittable(true))
        .catch(() => setSubmittable(false));
    }, [form, values]);

    return (
      <Button
        type="primary"
        onClick={handleSaveClick}
        disabled={!submittable}
        loading={loading}
      >
        Save
      </Button>
    );
  };

  return (
    <Drawer
      title={`${isAdd ? "Create" : isView ? "View" : "Edit"} Shipping Charge`}
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
            <SubmitButton form={form} />
          ) : null}
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish} disabled={isView}>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: "Please enter name" },
            { max: 100, message: "Name cannot exceed 100 characters" },
          ]}
        >
          <Input placeholder="e.g., Standard Shipping" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Shipping Amount"
          rules={[
            { required: true, message: "Please enter shipping amount" },
            {
              type: "number",
              min: 0,
              message: "Amount must be greater than or equal to 0",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            prefix="$"
            placeholder="0.00"
          />
        </Form.Item>

        <Form.Item name="min_amount" label="Minimum Order Amount">
          <InputNumber
            style={{ width: "100%" }}
            prefix="$"
            placeholder="0.00"
            min={0}
          />
        </Form.Item>

        <Form.Item name="max_amount" label="Maximum Order Amount">
          <InputNumber
            style={{ width: "100%" }}
            prefix="$"
            placeholder="0.00"
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="is_default"
          label="Set as Default"
          valuePropName="checked"
          tooltip="Only one shipping charge can be set as default"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="is_active"
          label="Status"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CreateShippingCharge; 