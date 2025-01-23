import React, { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  Upload,
  message,
  InputNumber,
} from "antd";
import {
  InboxOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { saveNews, updateNews } from "../../../store/news/newsSlice";
import { getCategories } from "../../../store/category/categorySlice";
import toast from "react-hot-toast";
import moment from "moment";
import { getImageUrl } from "../../../utils/imageUtils";
import { newsTypeList } from "../../../utils/actionTypes";

const { TextArea } = Input;

const CreateNews = ({
  onClose,
  open,
  data,
  isAdd,
  isView,
  permission,
  onNewsChange,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const categories = useSelector((state) => state.category.categories);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailList, setThumbnailList] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const deletedImageStyle = {
    opacity: 0.5,
    filter: "grayscale(100%)",
  };

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    if (data && !isAdd) {
      if (data.thumbnail_url) {
        setThumbnailList([
          {
            uid: "-1",
            name: data.thumbnail_url.split("/").pop(),
            status: "done",
            url: getImageUrl(data.thumbnail_url),
          },
        ]);
      }

      form.setFieldsValue({
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        category_id: data.category_id,
        publish_date: data.publish_date ? moment(data.publish_date) : null,
        type: data.type || "news",
        tags: data.tags ? JSON.parse(data.tags) : [],
        gallery:
          data.gallery?.map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle,
            image_url: item.image_url,
            sequence_no: item.sequence_no,
            isDeleted: false,
          })) || [],
      });
    }
  }, [data, isAdd, form]);

  const handleSaveClick = (e) => {
    e.preventDefault();
    form.submit();
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleThumbnailChange = (info) => {
    const { file, fileList } = info;

    if (file.status !== "removed") {
      setThumbnailFile(file.originFileObj || file);
      setThumbnailList([
        {
          uid: file.uid,
          name: file.name,
          status: "done",
          url: file instanceof File ? URL.createObjectURL(file) : file.url,
        },
      ]);
    } else {
      setThumbnailFile(null);
      setThumbnailList([]);
    }
  };

  const handleGalleryChange = (info, index) => {
    const { file } = info;

    if (file.status !== "removed") {
      setGalleryFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = file.originFileObj || file;
        return newFiles;
      });

      const currentGallery = form.getFieldValue("gallery") || [];
      currentGallery[index] = {
        ...currentGallery[index],
        isNew: true,
        file: file.originFileObj || file,
        id: currentGallery[index]?.id || null,
        isDeleted: false,
      };
      form.setFieldValue("gallery", currentGallery);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Prepare gallery data
      const galleryData = values.gallery
        ?.map((item, index) => {
          const existingGallery = data?.gallery?.find((g) => g.id === item.id);
          return {
            id: existingGallery?.id,
            title: item.title || "",
            subtitle: item.subtitle || "",
            sequence_no: item.sequence_no || index + 1,
            image_url: existingGallery?.image_url || "",
            isNew: !existingGallery,
            isDeleted: item.isDeleted || false,
          };
        })
        .filter(Boolean);

      const newsData = {
        ...values,
        id: data?.id,
        publish_date: values.publish_date ? moment(values.publish_date) : null,
        tags: JSON.stringify(values.tags || []),
        gallery: galleryData,
      };

      formData.append("data", JSON.stringify(newsData));

      // Add thumbnail if it exists and is a new file
      if (thumbnailFile instanceof File) {
        formData.append("thumbnail", thumbnailFile);
      }

      // Add gallery files
      values.gallery?.forEach((item, index) => {
        if (item?.file instanceof File && !item.isDeleted) {
          formData.append("gallery", item.file);
        }
      });

      if (isAdd) {
        await dispatch(saveNews(formData)).unwrap();
        toast.success("News created successfully");
      } else {
        await dispatch(updateNews({ id: data.id, formData })).unwrap();
        toast.success("News updated successfully");
      }

      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={`${isAdd ? "Create" : isView ? "View" : "Edit"} News`}
      width={"100%"}
      onClose={onClose}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        !isView && (
          <Space>
            <Button loading={loading} type="primary" onClick={handleSaveClick}>
              Save
            </Button>
          </Space>
        )
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish} disabled={isView}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter title" }]}
        >
          <Input placeholder="Enter title" />
        </Form.Item>

        <Form.Item name="subtitle" label="Subtitle">
          <Input placeholder="Enter subtitle" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <TextArea rows={4} placeholder="Enter description" />
        </Form.Item>

        <Form.Item
          name="category_id"
          label="Category"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select placeholder="Select a category">
            {categories.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="publish_date"
          label="Publish Date"
          rules={[{ required: true, message: "Please select a publish date" }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: "Please select a type" }]}
        >
          <Select
            placeholder="Select type"
            options={newsTypeList}
          />
        </Form.Item>

        <Form.Item
          name="tags"
          label="Tags"
          tooltip="Press enter to add new tag"
        >
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder="Add tags"
            open={false}
            tokenSeparators={[","]}
          />
        </Form.Item>

        <Form.Item
          label="Thumbnail"
          required={isAdd}
          tooltip="Upload news thumbnail image"
        >
          <div className="space-y-4">
            <Upload.Dragger
              accept="image/*"
              beforeUpload={beforeUpload}
              onChange={handleThumbnailChange}
              maxCount={1}
              fileList={thumbnailList}
              showUploadList={true}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag thumbnail to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single image upload
              </p>
            </Upload.Dragger>

            {!isAdd && data?.thumbnail_url && (
              <div className="mb-4">
                <span className="text-gray-600 font-medium">
                  Current Thumbnail:
                </span>
                <div className="relative group">
                  <img
                    src={getImageUrl(data.thumbnail_url)}
                    alt="Thumbnail"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              </div>
            )}
          </div>
        </Form.Item>

        <Form.List name="gallery">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="border p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Form.Item
                      {...restField}
                      name={[name, "title"]}
                      label="Image Title"
                    >
                      <Input placeholder="Image title" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "subtitle"]}
                      label="Image Subtitle"
                    >
                      <Input placeholder="Image subtitle" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "sequence_no"]}
                      label="Sequence No"
                      rules={[
                        {
                          required: true,
                          message: "Please enter sequence number",
                        },
                      ]}
                    >
                      <InputNumber className="w-full" min={1} />
                    </Form.Item>
                  </div>

                  {!isAdd && data?.gallery?.[name]?.image_url && (
                    <div className="mb-4">
                      <span className="text-gray-600 font-medium">
                        Current Image:
                      </span>
                      <div className="relative group">
                        <img
                          src={getImageUrl(data.gallery[name].image_url)}
                          alt={`Gallery ${name + 1}`}
                          className="w-32 h-32 object-cover rounded transition-all duration-300"
                          style={
                            form.getFieldValue(["gallery", name, "isDeleted"])
                              ? deletedImageStyle
                              : {}
                          }
                        />
                        {form.getFieldValue(["gallery", name, "isDeleted"]) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-20 rounded">
                            <span className="text-red-600 font-medium">
                              Marked for deletion
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(!data?.gallery?.[name]?.image_url ||
                    !data?.gallery?.[name]?.id) && (
                    <Form.Item
                      label="Upload Image"
                      required={!data?.gallery?.[name]?.image_url}
                    >
                      <Upload.Dragger
                        accept="image/*"
                        beforeUpload={beforeUpload}
                        onChange={(info) => handleGalleryChange(info, name)}
                        maxCount={1}
                        showUploadList={true}
                        fileList={
                          form.getFieldValue(["gallery", name, "file"])
                            ? [form.getFieldValue(["gallery", name, "file"])]
                            : []
                        }
                      >
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">
                          Click or drag image to upload
                        </p>
                      </Upload.Dragger>
                    </Form.Item>
                  )}

                  <Button
                    type="text"
                    className="text-red-500"
                    onClick={() => {
                      const currentGallery =
                        form.getFieldValue("gallery") || [];
                      const currentItem = currentGallery[name];

                      if (currentItem?.id) {
                        currentGallery[name] = {
                          ...currentItem,
                          isDeleted: true,
                        };
                        form.setFieldValue("gallery", currentGallery);
                      } else {
                        remove(name);
                        setGalleryFiles((prev) => {
                          const newFiles = [...prev];
                          newFiles[name] = null;
                          return newFiles;
                        });
                      }
                    }}
                    icon={<MinusCircleOutlined />}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Gallery Image
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Drawer>
  );
};

export default CreateNews;
