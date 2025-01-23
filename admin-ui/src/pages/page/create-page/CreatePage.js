import { Button, Drawer, Form, Input, Space, Switch, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { savePage, updatePage } from "../../../store/page/pageSlice";
import toast from "react-hot-toast";
import ReactQuill from 'react-quill';
import PageSections from "./PageSections";
import 'react-quill/dist/quill.snow.css';

const CreatePage = ({
  onClose,
  open,
  data,
  isAdd,
  isView,
  permission,
  onPageChange,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const [activeTab, setActiveTab] = useState("1");
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (data && !isAdd) {
      form.setFieldsValue({
        title: data.title,
        slug: data.slug,
        content: data.content,
        meta_title: data.meta_title,
        meta_desc: data.meta_desc,
        is_active: data.is_active,
      });
      setSections(data.sections || []);
    } else {
      form.resetFields();
      setSections([]);
    }
  }, [data, isAdd, form]);

  const handleNameChange = (e) => {
    if (autoGenerateSlug) {
      const slug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setFieldValue("slug", slug);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const pageData = {
        title: values.title,
        slug: values.slug,
        content: values.content,
        meta_title: values.meta_title,
        meta_desc: values.meta_desc,
        is_active: values.is_active,
        sections: sections.map(section => ({
          title: section.title,
          content: section.content,
          sequence_no: section.sequence_no,
          is_active: section.is_active
        }))
      };

      if (isAdd) {
        const response = await dispatch(savePage(pageData)).unwrap();
        if (response?.statusCode === 201) {
          toast.success(response.message);
          form.resetFields();
          setSections([]);
          onPageChange();
          onClose();
        }
      } else {
        const response = await dispatch(updatePage({ 
          id: data.id, 
          data: pageData
        })).unwrap();
        if (response?.statusCode === 200) {
          toast.success(response.message);
          onPageChange();
          onClose();
        }
      }
    } catch (error) {
      const errorMessage = error?.message || "An error occurred while saving the page";
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

  const items = [
    {
      key: "1",
      label: "Page Details",
      children: (
        <Form form={form} layout="vertical" onFinish={onFinish} disabled={isView}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter title" }]}
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
            name="content"
            label="Content"
            rules={[{ required: true, message: "Please enter content" }]}
          >
            <ReactQuill theme="snow" />
          </Form.Item>

          <Form.Item name="meta_title" label="Meta Title">
            <Input />
          </Form.Item>

          <Form.Item name="meta_desc" label="Meta Description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: "2",
      label: "Page Sections",
      children: (
        <PageSections
          sections={sections}
          setSections={setSections}
          disabled={isView}
        />
      ),
    },
  ];

  return (
    <Drawer
      title={`${isAdd ? "Create" : isView ? "View" : "Edit"} Page`}
      placement="right"
      width={800}
      onClose={onClose}
      open={open}
      maskClosable={false}
      extra={
        <Space>
          {permission &&
            (permission.can_create || permission.can_update) &&
            !isView &&
            activeTab === "1" ? (
            <SubmitButton form={form} />
          ) : null}
        </Space>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
      />
    </Drawer>
  );
};

export default CreatePage; 