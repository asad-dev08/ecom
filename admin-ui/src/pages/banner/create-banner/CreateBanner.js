import {
  Button,
  Drawer,
  Form,
  Input,
  Space,
  Switch,
  Upload,
  DatePicker,
  Select,
  InputNumber,
} from "antd";
import React, { useEffect, useState } from "react";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { saveBanner, updateBanner } from "../../../store/banner/bannerSlice";
import toast from "react-hot-toast";
import { BASE_DOC_URL } from "../../../utils/actionTypes";
import moment from "moment";
import dayjs from "dayjs";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const CreateBanner = ({ onClose, open, data, isAdd, isView, permission }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (data && !isAdd) {
      form.setFieldsValue({
        title: data.title,
        subtitle: data.subtitle,
        link: data.link,
        type: data.type,
        sequence_no: data.sequence_no,
        is_active: data.is_active,
        start_date: data.start_date ? dayjs(data.start_date) : null,
        end_date: data.end_date ? dayjs(data.end_date) : null,
      });

      if (data.image) {
        const fullImageUrl = data.image.startsWith("http")
          ? data.image
          : `${BASE_DOC_URL}${data.image}`;
        setImageUrl(fullImageUrl);
      } else {
        setImageUrl(null);
      }
    } else {
      form.resetFields();
      setImageUrl(null);
      setImageFile(null);
    }
  }, [data, isAdd, form]);

  const validateImage = (file) => {
    const isAllowedType = ALLOWED_IMAGE_TYPES.includes(file.type);
    if (!isAllowedType) {
      toast.error("You can only upload JPG/PNG/WebP files!");
      return false;
    }

    const isLt5M = file.size <= MAX_IMAGE_SIZE;
    if (!isLt5M) {
      toast.error("Image must be smaller than 5MB!");
      return false;
    }

    return true;
  };

  const handleImageChange = (info) => {
    if (info.file.status === "removed") {
      setImageFile(null);
      setImageUrl(null);
      return;
    }

    const file = info.file;
    if (file && validateImage(file)) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
    }
  };

  const handleSaveClick = (e) => {
    e.preventDefault();
    form.submit();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("subtitle", values.subtitle);
      formData.append("link", values.link);
      formData.append("type", values.type);
      formData.append("sequence_no", values.sequence_no);
      formData.append("is_active", values.is_active);
      formData.append(
        "start_date",
        values.start_date ? values.start_date.toISOString() : null
      );
      formData.append(
        "end_date",
        values.end_date ? values.end_date.toISOString() : null
      );

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isAdd) {
        await dispatch(saveBanner(formData)).unwrap();
        toast.success("Banner created successfully");
      } else {
        await dispatch(updateBanner({ id: data.id, formData })).unwrap();
        toast.success("Banner updated successfully");
      }

      onClose();
    } catch (error) {
      toast.error("Failed to save banner");
    } finally {
      setLoading(false);
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
      title={`${isAdd ? "Create" : isView ? "View" : "Edit"} Banner`}
      placement="right"
      width={720}
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
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter the title" }]}
        >
          <Input placeholder="Enter title" disabled={isView} />
        </Form.Item>

        <Form.Item name="subtitle" label="Subtitle">
          <Input placeholder="Enter subtitle" disabled={isView} />
        </Form.Item>

        <Form.Item name="link" label="Link">
          <Input placeholder="Enter link" disabled={isView} />
        </Form.Item>

        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: "Please select the type" }]}
        >
          <Select placeholder="Select type" disabled={isView}>
            <Select.Option value="main">Main</Select.Option>
            <Select.Option value="offer">Offer</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="sequence_no"
          label="Sequence Number"
          rules={[
            { required: true, message: "Please enter the sequence number" },
          ]}
        >
          <InputNumber
            min={0}
            placeholder="Enter sequence number"
            disabled={isView}
          />
        </Form.Item>

        <Form.Item name="is_active" label="Active" valuePropName="checked">
          <Switch disabled={isView} />
        </Form.Item>

        <Form.Item name="start_date" label="Start Date">
          <DatePicker style={{ width: "100%" }} disabled={isView} />
        </Form.Item>

        <Form.Item name="end_date" label="End Date">
          <DatePicker style={{ width: "100%" }} disabled={isView} />
        </Form.Item>

        <Form.Item name="image" label="Banner Image">
          <Upload.Dragger
            accept=".jpg,.jpeg,.png,.webp"
            maxCount={1}
            beforeUpload={() => false}
            onChange={handleImageChange}
            showUploadList={false}
          >
            {imageUrl ? (
              <div style={{ padding: "20px" }}>
                <img
                  src={imageUrl}
                  alt="banner"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : (
              <>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag image to upload</p>
                <p className="ant-upload-hint">
                  Support for JPG, PNG, WebP. Max size: 5MB
                </p>
              </>
            )}
          </Upload.Dragger>
          {imageUrl && (
            <Button
              type="text"
              danger
              onClick={() => {
                setImageFile(null);
                setImageUrl(null);
                form.setFieldsValue({ image: null });
              }}
              icon={<DeleteOutlined />}
              style={{ marginTop: 8 }}
            >
              Remove Image
            </Button>
          )}
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CreateBanner;
