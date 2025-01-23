import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Drawer,
  Form,
  Input,
  Button,
  Space,
  DatePicker,
  InputNumber,
  Select,
  Switch,
} from "antd";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import { saveCoupon, updateCoupon } from "../../../store/coupon/couponSlice";

const { RangePicker } = DatePicker;

const CreateCoupon = ({
  onClose,
  open,
  data,
  isAdd,
  isView,
  permission,
  onCouponChange,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState("percentage");

  useEffect(() => {
    if (data && !isAdd) {
      form.setFieldsValue({
        ...data,
        validity:
          data.start_date && data.end_date
            ? [dayjs(data.start_date), dayjs(data.end_date)]
            : null,
      });
      setDiscountType(data.discount_type);
    }
  }, [data, isAdd, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const [startDate, endDate] = values.validity || [];
      const couponData = {
        ...values,
        id: isAdd ? undefined : data.id,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
      };
      delete couponData.validity;

      if (isAdd) {
        const response = await dispatch(saveCoupon(couponData)).unwrap();
        if (response?.statusCode === 201) {
          toast.success(response.message);
          form.resetFields();
          onCouponChange();
          onClose();
        }
      } else {
        const response = await dispatch(
          updateCoupon({ id: data.id, data: couponData })
        ).unwrap();
        if (response?.statusCode === 200) {
          toast.success(response.message);
          onCouponChange();
          onClose();
        }
      }
    } catch (error) {
      const errorMessage =
        error?.message || "An error occurred while saving the coupon";
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
      title={`${isAdd ? "Create" : isView ? "View" : "Edit"} Coupon`}
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
          name="code"
          label="Coupon Code"
          rules={[
            { required: true, message: "Please enter coupon code" },
            { min: 3, message: "Code must be at least 3 characters" },
            { max: 20, message: "Code cannot exceed 20 characters" },
          ]}
        >
          <Input
            placeholder="e.g., SUMMER2024"
            style={{ textTransform: "uppercase" }}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="discount_type"
          label="Discount Type"
          rules={[{ required: true, message: "Please select discount type" }]}
        >
          <Select
            onChange={(value) => setDiscountType(value)}
            options={[
              { value: "percentage", label: "Percentage" },
              { value: "fixed", label: "Fixed Amount" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="discount_amount"
          label="Discount Amount"
          rules={[
            { required: true, message: "Please enter discount amount" },
            {
              type: "number",
              min: 0,
              message: "Amount must be greater than 0",
            },
            {
              type: "number",
              max: discountType === "percentage" ? 100 : 1000000,
              message:
                discountType === "percentage"
                  ? "Percentage cannot exceed 100"
                  : "Amount is too large",
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            prefix={discountType === "fixed" ? "$" : ""}
            suffix={discountType === "percentage" ? "%" : ""}
          />
        </Form.Item>

        <Form.Item name="minimum_purchase" label="Minimum Purchase Amount">
          <InputNumber style={{ width: "100%" }} prefix="$" min={0} />
        </Form.Item>

        <Form.Item name="maximum_discount" label="Maximum Discount Amount">
          <InputNumber style={{ width: "100%" }} prefix="$" min={0} />
        </Form.Item>

        <Form.Item name="usage_limit" label="Usage Limit">
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            placeholder="Leave empty for unlimited"
          />
        </Form.Item>

        <Form.Item
          name="validity"
          label="Validity Period"
          rules={[{ required: true, message: "Please select validity period" }]}
        >
          <RangePicker
            style={{ width: "100%" }}
            showTime
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Form.Item>

        <Form.Item
          name="is_active"
          label="Status"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>

        {!isAdd && (
          <Form.Item name="used_count" label="Times Used">
            <InputNumber disabled style={{ width: "100%" }} />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default CreateCoupon;
