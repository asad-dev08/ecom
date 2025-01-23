import { Button, Drawer, Form, Input, Select, Space } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  saveSubcategory,
  updateSubcategory,
} from "../../../store/subcategory/subcategorySlice";
import { getCategories } from "../../../store/category/categorySlice";
import toast from "react-hot-toast";

const CreateSubcategory = ({
  onClose,
  open,
  data,
  isAdd,
  isView,
  permission,
  onSubcategoryChange,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const categories = useSelector((state) => state.category.categories);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    if (data && !isAdd) {
      form.setFieldsValue({
        name: data.name,
        slug: data.slug,
        categoryId: data.categoryId,
        productCount: data.productCount,
      });
    }
  }, [data, isAdd, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const subcategoryData = {
        ...values,
        id: isAdd ? 0 : data.id,
      };

      if (isAdd) {
        await dispatch(saveSubcategory(subcategoryData)).then((response) => {
          if (response?.payload?.statusCode === 201) {
            toast.success(response?.payload?.message);
            form.resetFields();
            setAutoGenerateSlug(true);
            onClose();
            onSubcategoryChange();
          }
        });
      } else {
        await dispatch(updateSubcategory(subcategoryData)).then((response) => {
          if (response?.payload?.statusCode === 200) {
            toast.success(response?.payload?.message);
            onClose();
            onSubcategoryChange();
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
      title={`${isAdd ? "Create" : isView ? "View" : "Edit"} Subcategory`}
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
          rules={[{ required: true, message: "Please enter subcategory name" }]}
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

        <Form.Item
          name="categoryId"
          label="Category"
          rules={[{ required: true, message: "Please select category" }]}
        >
          <Select>
            {categories?.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {!isAdd && (
          <Form.Item name="productCount" label="Product Count">
            <Input disabled />
          </Form.Item>
        )}
      </Form>
    </Drawer>
  );
};

export default CreateSubcategory;
