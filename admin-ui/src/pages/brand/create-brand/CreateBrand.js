import { Button, Drawer, Form, Input, Space } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { saveBrand, updateBrand } from "../../../store/brand/brandSlice";
import toast from "react-hot-toast";

const CreateBrand = ({
  onClose,
  open,
  data,
  isAdd,
  isView,
  permission,
  onBrandChange,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  useEffect(() => {
    if (data && !isAdd) {
      form.setFieldsValue({
        name: data.name,
        slug: data.slug,
      });
    }
  }, [data, isAdd, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const brandData = {
        ...values,
        id: isAdd ? 0 : data.id,
      };

      if (isAdd) {
        await dispatch(saveBrand(brandData)).then((response) => {
          if (response?.payload?.statusCode === 201) {
            toast.success(response?.payload?.message);
            form.resetFields();
            setAutoGenerateSlug(true);
            onClose();
            onBrandChange();
          }
        });
      } else {
        await dispatch(updateBrand(brandData)).then((response) => {
          if (response?.payload?.statusCode === 200) {
            toast.success(response?.payload?.message);
            onClose();
            onBrandChange();
          }
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    form.submit();
  };

  const handleNameChange = (e) => {
    if (autoGenerateSlug) {
      const slug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setFieldsValue({ slug });
    }
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
      title={`${isAdd ? "Create" : isView ? "View" : "Edit"} Brand`}
      width={720}
      onClose={onClose}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}
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
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={
          isView ||
          (permission && !permission.can_create && isAdd) ||
          (permission && !permission.can_update && !isAdd)
        }
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter brand name" }]}
        >
          <Input onChange={handleNameChange} />
        </Form.Item>

        <Form.Item
          name="slug"
          label="Slug"
          rules={[{ required: true, message: "Please enter slug" }]}
        >
          <Input onChange={() => setAutoGenerateSlug(false)} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CreateBrand;
