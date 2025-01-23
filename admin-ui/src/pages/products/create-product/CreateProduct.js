import React, { useEffect, useState } from "react";
import {
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Upload,
  InputNumber,
  Switch,
  message,
  Divider,
  Tooltip,
  DatePicker,
} from "antd";
import {
  InboxOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  saveProduct,
  updateProduct,
} from "../../../store/product/productSlice";
import {
  getCategories,
  getSubcategoriesByCategory,
} from "../../../store/category/categorySlice";
import { getBrands } from "../../../store/brand/brandSlice";
import toast from "react-hot-toast";

import "swiper/css";

import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import { getSellers } from "../../../store/seller/sellerSlice";
import { BASE_DOC_URL } from "../../../utils/actionTypes";
import dayjs from "dayjs";

const { TextArea } = Input;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const ATTRIBUTE_TYPES = [
  { value: "text", label: "Text" },
  { value: "select", label: "Select Options" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Yes/No" },
  { value: "color", label: "Color" },
  { value: "size", label: "Size" },
  { value: "material", label: "Material" },
  { value: "technical", label: "Technical" },
  { value: "weight", label: "Weight" },
];

const CreateProduct = ({
  onClose,
  open,
  data,
  isAdd,
  isView,
  permission,
  onProductChange,
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const categories = useSelector((state) => state.category.categories);
  const brands = useSelector((state) => state.brand.brands);
  const sellers = useSelector((state) => state.seller.sellers);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [images, setImages] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [hasVariants, setHasVariants] = useState(data?.hasVariants || false);
  const subcategories = useSelector((state) => state.category.subcategories);
  const [variantImageFiles, setVariantImageFiles] = useState({});
  const [variantImageUrls, setVariantImageUrls] = useState({});

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getBrands());
    dispatch(getSellers());
  }, [dispatch]);

  useEffect(() => {
    if (data && !isAdd) {
      setHasVariants(data.hasVariants || false);
      if (data.category?.id) {
        dispatch(getSubcategoriesByCategory(data.category.id));
      }

      // Parse dates with explicit format
      const saleStartDate = data.saleStartDate
        ? dayjs(data.saleStartDate)
        : undefined;
      const saleEndDate = data.saleEndDate
        ? dayjs(data.saleEndDate)
        : undefined;

      // Set form values
      form.setFieldsValue({
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: Number(data.price),
        compareAtPrice: data.compareAtPrice
          ? Number(data.compareAtPrice)
          : undefined,
        stock: Number(data.stock),
        category: { id: data.category?.id },
        subcategory: data.subcategory?.id
          ? { id: data.subcategory.id }
          : undefined,
        brand: { id: data.brand?.id },
        seller: { id: data.seller?.id },
        hasVariants: data.hasVariants,
        variants: data.variants?.map((variant) => ({
          ...variant,
          stock: variant.stock,
          attributes: variant.attributes || [],
        })),
        rating: data.rating,
        reviewCount: data.reviewCount,
        status: data.status,
        isFeatured: data.isFeatured,
        isNew: data.isNew,
        onSale: data.onSale,
        salePrice: data.salePrice ? Number(data.salePrice) : undefined,
        salePercentage: data.salePercentage
          ? Number(data.salePercentage)
          : undefined,
        saleStartDate: saleStartDate,
        saleEndDate: saleEndDate,

        tags: data.tags,
        attributes: data.attributes,
      });

      if (data.thumbnail) {
        setThumbnailUrl(`${BASE_DOC_URL}/${data.thumbnail}`);
      }
      if (data.images?.length) {
        setImageUrls(data.images.map((image) => `${BASE_DOC_URL}/${image}`));
      }

      if (data.variants?.length) {
        const variantImageUrlsObj = {};
        data.variants.forEach((variant, index) => {
          if (variant.images && Array.isArray(variant.images)) {
            variantImageUrlsObj[index] = variant.images.map(
              (image) => `${BASE_DOC_URL}/${image}`
            );
          }
        });
        setVariantImageUrls(variantImageUrlsObj);
      }
    }
  }, [data, isAdd, form, dispatch]);

  const validateImage = (file) => {
    const isAllowedType = ALLOWED_IMAGE_TYPES.includes(file.type);
    if (!isAllowedType) {
      message.error(
        `File type not allowed. Please upload ${ALLOWED_IMAGE_TYPES.map(
          (type) => type.split("/")[1].toUpperCase()
        ).join(", ")} only.`
      );
      return false;
    }

    // const isLt5M = file.size <= MAX_IMAGE_SIZE;
    // if (!isLt5M) {
    //   message.error("Image must be smaller than 5MB!");
    //   return false;
    // }

    return true;
  };

  const beforeUpload = (file) => {
    const isValid = validateImage(file);

    if (!isValid) {
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  const beforeGalleryUpload = (file) => {
    const isValid = validateImage(file);

    if (!isValid) {
      return Upload.LIST_IGNORE;
    }

    if (imageList.length >= 8) {
      message.error("You can only upload up to 8 images!");
      return Upload.LIST_IGNORE;
    }

    return false;
  };
  const handleCategoryChange = async (categoryId) => {
    try {
      // Clear subcategory when category changes
      form.setFieldValue(["subcategory", "id"], undefined);

      if (categoryId) {
        const result = await dispatch(
          getSubcategoriesByCategory(categoryId)
        ).unwrap();
        console.log('result" ', result);
        // If no subcategories, show a message
        if (result && result.data?.length === 0) {
          toast.success("This category has no subcategories");
        }
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      toast.error("Failed to fetch subcategories");
    }
  };
  const handleSaleToggle = (checked) => {
    form.setFieldsValue({
      onSale: checked,
      // Reset sale-related fields when turning off sale
      ...(checked === false && {
        salePrice: null,
        salePercentage: null,
        saleStartDate: null,
        saleEndDate: null,
      }),
    });
  };
  const handleImagesChange = (info) => {
    const { fileList } = info;

    // Handle removal
    if (info.file.status === "removed") {
      const newFiles = imageFiles.filter((_, index) => index !== info.file.uid);
      const newUrls = imageUrls.filter((_, index) => index !== info.file.uid);
      setImageFiles(newFiles);
      setImageUrls(newUrls);
      return;
    }

    // Handle new files
    const newFiles = fileList.filter((file) => {
      // Filter out invalid files
      if (file.status === "removed") return false;
      return validateImage(file.originFileObj);
    });

    // Update files state
    setImageFiles(newFiles.map((file) => file.originFileObj));

    // Update preview URLs
    const newUrls = newFiles.map((file) => {
      if (file.url) return file.url; // Use existing URL if available
      return URL.createObjectURL(file.originFileObj);
    });
    setImageUrls(newUrls);
  };

  const handleThumbnailChange = (info) => {
    if (info.file.status === "removed") {
      setThumbnailFile(null);
      setThumbnailUrl(null);
      return;
    }

    const file = info.file;
    if (file && validateImage(file)) {
      setThumbnailFile(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailUrl(previewUrl);
    }
  };

  const handleVariantImageChange = (info, variantIndex) => {
    const { fileList } = info;

    // Handle removal
    if (info.file.status === "removed") {
      setVariantImageFiles((prev) => {
        const updated = { ...prev };
        if (updated[variantIndex]) {
          updated[variantIndex] = updated[variantIndex].filter(
            (_, i) => i !== fileList.length
          );
          if (updated[variantIndex].length === 0) {
            delete updated[variantIndex];
          }
        }
        return updated;
      });

      setVariantImageUrls((prev) => {
        const updated = { ...prev };
        if (updated[variantIndex]) {
          updated[variantIndex] = updated[variantIndex].filter(
            (_, i) => i !== fileList.length
          );
          if (updated[variantIndex].length === 0) {
            delete updated[variantIndex];
          }
        }
        return updated;
      });
      return;
    }

    // Handle new files
    const validFiles = fileList.filter((file) => {
      if (file.status === "removed") return false;
      return validateImage(file.originFileObj);
    });

    setVariantImageFiles((prev) => ({
      ...prev,
      [variantIndex]: validFiles.map((f) => f.originFileObj),
    }));

    setVariantImageUrls((prev) => ({
      ...prev,
      [variantIndex]: validFiles.map((f) => {
        if (f.url) return f.url;
        return URL.createObjectURL(f.originFileObj);
      }),
    }));
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();

      // Add thumbnail
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      // Add product images
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });
      }

      // Clean up the values object
      const cleanValues = {
        ...values,
        variants: values.variants?.map((variant) => ({
          ...variant,
          attributes: variant.attributes || {},
          images: variant.images || [],
        })),
      };

      // Stringify the data ONCE
      const productDataString = JSON.stringify(cleanValues);

      // Append the data ONCE
      formData.append("data", productDataString);

      // Add variant images with metadata
      Object.entries(variantImageFiles).forEach(([variantIndex, files]) => {
        files.forEach((file) => {
          formData.append("variantImages", file);
          const metadata = { variantIndex: parseInt(variantIndex) };
          formData.append("variantImageMeta", JSON.stringify(metadata));
        });
      });

      // Log FormData for debugging
      for (let pair of formData.entries()) {
        console.log(
          "FormData entry:",
          pair[0],
          pair[0] === "data" ? "DATA_STRING" : pair[1]
        );
      }

      if (isAdd) {
        await dispatch(saveProduct(formData)).unwrap();
        toast.success("Product created successfully");
      } else {
        await dispatch(updateProduct({ id: data.id, formData })).unwrap();
        toast.success("Product updated successfully");
      }

      onProductChange?.();
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (url) => {
    window.open(url, "_blank");
  };

  // Styles
  const imagePreviewStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  const thumbnailStyle = {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #d9d9d9",
    cursor: "pointer",
    transition: "transform 0.2s",
  };

  const imageContainerStyle = {
    position: "relative",
    width: "fit-content",
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.2s",
    borderRadius: "8px",
    cursor: "pointer",
  };

  const deletedImageStyle = {
    opacity: "0.6",
    filter: "grayscale(50%)",
  };

  const deletedItemStyle = {
    backgroundColor: "rgba(254, 226, 226, 0.5)",
    border: "1px solid rgb(252, 165, 165)",
    borderRadius: "4px",
    padding: "4px",
  };

  useEffect(() => {
    return () => {
      // Cleanup thumbnail URL
      if (
        thumbnailUrl &&
        typeof thumbnailUrl === "string" &&
        thumbnailUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(thumbnailUrl);
      }

      // Cleanup image URLs
      imageUrls.forEach((url) => {
        if (url && typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });

      // Cleanup variant image URLs
      Object.values(variantImageUrls).forEach((urlArray) => {
        // Check if urlArray is actually an array
        if (Array.isArray(urlArray)) {
          urlArray.forEach((url) => {
            if (url && typeof url === "string" && url.startsWith("blob:")) {
              URL.revokeObjectURL(url);
            }
          });
        }
      });
    };
  }, [thumbnailUrl, imageUrls, variantImageUrls]);

  const handleVariantsChange = (checked) => {
    setHasVariants(checked);
    if (!checked) {
      form.setFieldValue("variants", undefined);
    }
  };

  return (
    <Drawer
      title={`${isAdd ? "Create" : isView ? "View" : "Edit"} Product`}
      width="100%"
      onClose={onClose}
      open={open}
      maskClosable={false}
      extra={
        !isView && (
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
          >
            {isAdd ? "Create Product" : "Update Product"}
          </Button>
        )
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={isView}
        initialValues={data}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-6">
            {/* Thumbnail Upload */}
            <Form.Item
              label="Thumbnail"
              required={isAdd}
              tooltip="Upload product thumbnail"
              className="mb-8"
            >
              <Upload.Dragger
                accept=".jpg,.jpeg,.png,.webp,.gif"
                maxCount={1}
                beforeUpload={() => false}
                onChange={handleThumbnailChange}
                showUploadList={false}
              >
                {thumbnailUrl ? (
                  <div style={{ padding: "20px" }}>
                    <img
                      src={thumbnailUrl}
                      alt="thumbnail"
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
                    <p className="ant-upload-text">
                      Click or drag thumbnail to upload
                    </p>
                    <p className="ant-upload-hint">
                      Support for JPG, PNG, WebP, GIF. Max size: 5MB
                    </p>
                  </>
                )}
              </Upload.Dragger>
              {thumbnailUrl && (
                <Button
                  type="text"
                  danger
                  onClick={() => {
                    setThumbnailFile(null);
                    setThumbnailUrl(null);
                    form.setFieldsValue({ thumbnail: null });
                  }}
                  icon={<DeleteOutlined />}
                  style={{ marginTop: 8 }}
                >
                  Remove Thumbnail
                </Button>
              )}
            </Form.Item>

            {/* Product Images */}
            <Form.Item
              label="Product Images"
              required={isAdd}
              tooltip="Upload product images (max 8)"
            >
              <Upload.Dragger
                accept=".jpg,.jpeg,.png,.webp,.gif"
                multiple
                maxCount={8}
                beforeUpload={() => false}
                onChange={handleImagesChange}
                showUploadList={false}
                fileList={imageFiles.map((file, index) => ({
                  uid: index,
                  name: file.name,
                  status: "done",
                  originFileObj: file,
                }))}
              >
                {imageUrls.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4 p-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`product-${index}`}
                          style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                        {!isView && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newFiles = imageFiles.filter(
                                (_, i) => i !== index
                              );
                              const newUrls = imageUrls.filter(
                                (_, i) => i !== index
                              );
                              setImageFiles(newFiles);
                              setImageUrls(newUrls);
                            }}
                            style={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              background: "rgba(255,255,255,0.8)",
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag images to upload (max 8)
                    </p>
                    <p className="ant-upload-hint">
                      Support for JPG, PNG, WebP, GIF. Max size: 5MB
                    </p>
                  </>
                )}
              </Upload.Dragger>
            </Form.Item>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-4">
              <Form.Item
                name="name"
                label="Product Name"
                rules={[
                  { required: true, message: "Please enter product name" },
                  { max: 255, message: "Name cannot exceed 255 characters" },
                ]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>

              <Form.Item
                name="slug"
                label="Slug"
                rules={[
                  { required: true, message: "Please enter slug" },
                  { max: 255, message: "Slug cannot exceed 255 characters" },
                ]}
              >
                <Input placeholder="Enter slug" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: "Please enter description" },
                ]}
              >
                <TextArea rows={4} placeholder="Enter description" />
              </Form.Item>
            </div>

            {/* Main Product Price & Stock Section */}
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.hasVariants !== currentValues.hasVariants
              }
            >
              {({ getFieldValue }) => {
                const hasVariants = getFieldValue("hasVariants");

                return (
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      name="price"
                      label="Price"
                      rules={[
                        {
                          required: !hasVariants,
                          message: "Please enter price",
                        },
                        {
                          type: "number",
                          min: 0,
                          message: "Price must be positive",
                        },
                      ]}
                    >
                      <InputNumber
                        className="w-full"
                        disabled={hasVariants}
                        formatter={(value) =>
                          `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      />
                    </Form.Item>

                    <Form.Item
                      name="stock"
                      label="Total Stock"
                      tooltip={
                        hasVariants
                          ? "Stock will be calculated from variants"
                          : "Overall product stock"
                      }
                      rules={[
                        {
                          required: !hasVariants,
                          message: "Please enter total stock",
                        },
                      ]}
                    >
                      <InputNumber
                        className="w-full"
                        disabled={hasVariants}
                        min={0}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  </div>
                );
              }}
            </Form.Item>

            {/* Categories */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name={["category", "id"]}
                label="Category"
                rules={[{ required: true, message: "Please select category" }]}
              >
                <Select
                  placeholder="Select category"
                  options={categories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                  onChange={handleCategoryChange}
                />
              </Form.Item>

              <Form.Item
                name={["subcategory", "id"]}
                label="Subcategory"
                rules={[]}
                tooltip="Optional: Select if category has subcategories"
              >
                <Select
                  placeholder={
                    form.getFieldValue(["category", "id"])
                      ? subcategories?.length
                        ? "Select subcategory"
                        : "No subcategories available"
                      : "Select category first"
                  }
                  options={subcategories?.map((sub) => ({
                    value: sub.id,
                    label: sub.name,
                  }))}
                  disabled={
                    !form.getFieldValue(["category", "id"]) ||
                    !subcategories?.length
                  }
                  allowClear
                  // notFoundContent={
                  //   form.getFieldValue(["category", "id"])
                  //     ? "No subcategories available"
                  //     : "Please select a category first"
                  // }
                />
              </Form.Item>

              <Form.Item
                name={["brand", "id"]}
                label="Brand"
                rules={[{ required: true, message: "Please select brand" }]}
              >
                <Select
                  placeholder="Select brand"
                  options={
                    brands &&
                    brands.length > 0 &&
                    brands?.map((brand) => ({
                      value: brand.id,
                      label: brand.name,
                    }))
                  }
                />
              </Form.Item>
            </div>

            {/* Product Attributes */}
            <div className="border p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Product Attributes</h3>
                <Tooltip title="Product-specific attributes like material, dimensions, etc.">
                  <InfoCircleOutlined />
                </Tooltip>
              </div>

              <Form.List name="attributes">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        className="grid grid-cols-2 gap-4 mb-4 border p-4 rounded"
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "name"]}
                          label="Attribute Name"
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <Input placeholder="e.g. Material, Size, Color" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "type"]}
                          label="Attribute Type"
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <Select
                            placeholder="Select type"
                            options={ATTRIBUTE_TYPES}
                            onChange={(value) => {
                              // Clear options when type changes
                              form.setFieldValue(
                                ["attributes", name, "options"],
                                undefined
                              );
                              form.setFieldValue(
                                ["attributes", name, "unit"],
                                undefined
                              );
                            }}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "value"]}
                          label="Value"
                          rules={[{ required: true, message: "Required" }]}
                        >
                          <Input placeholder="Attribute value" />
                        </Form.Item>

                        {/* Show options field for select, color, size types */}
                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, currentValues) => {
                            return (
                              prevValues?.attributes?.[name]?.type !==
                              currentValues?.attributes?.[name]?.type
                            );
                          }}
                        >
                          {({ getFieldValue }) => {
                            const type = getFieldValue([
                              "attributes",
                              name,
                              "type",
                            ]);
                            if (["select", "color", "size"].includes(type)) {
                              return (
                                <Form.Item
                                  {...restField}
                                  name={[name, "options"]}
                                  label="Options"
                                  tooltip="Enter options separated by commas"
                                >
                                  <Select
                                    mode="tags"
                                    placeholder="Add options"
                                    style={{ width: "100%" }}
                                  />
                                </Form.Item>
                              );
                            }
                            return null;
                          }}
                        </Form.Item>

                        {/* Show unit field for number and weight types */}
                        <Form.Item
                          noStyle
                          shouldUpdate={(prevValues, currentValues) => {
                            return (
                              prevValues?.attributes?.[name]?.type !==
                              currentValues?.attributes?.[name]?.type
                            );
                          }}
                        >
                          {({ getFieldValue }) => {
                            const type = getFieldValue([
                              "attributes",
                              name,
                              "type",
                            ]);
                            if (["number", "weight"].includes(type)) {
                              return (
                                <Form.Item
                                  {...restField}
                                  name={[name, "unit"]}
                                  label="Unit"
                                >
                                  <Input placeholder="e.g. kg, cm" />
                                </Form.Item>
                              );
                            }
                            return null;
                          }}
                        </Form.Item>

                        <Button
                          type="text"
                          onClick={() => remove(name)}
                          danger
                          icon={<MinusCircleOutlined />}
                          className="mt-2"
                        >
                          Remove Attribute
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Product Attribute
                    </Button>
                  </>
                )}
              </Form.List>
            </div>

            {/* Variants Toggle */}
            <Form.Item
              name="hasVariants"
              label="Product Has Variants"
              valuePropName="checked"
            >
              <Switch onChange={handleVariantsChange} />
            </Form.Item>

            {hasVariants && (
              <Form.List name="variants">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="border p-4 rounded-lg mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Form.Item
                            {...restField}
                            name={[name, "sku"]}
                            label="SKU"
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <Input placeholder="Enter SKU" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "price"]}
                            label="Variant Price"
                            rules={[{ required: true, message: "Required" }]}
                          >
                            <InputNumber
                              className="w-full"
                              formatter={(value) =>
                                `$ ${value}`.replace(
                                  /\B(?=(\d{3})+(?!\d))/g,
                                  ","
                                )
                              }
                              parser={(value) =>
                                value.replace(/\$\s?|(,*)/g, "")
                              }
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "stock"]}
                            label="Variant Stock"
                            rules={[{ required: true, message: "Required" }]}
                            tooltip="Stock for this specific variant"
                          >
                            <InputNumber
                              className="w-full"
                              min={0}
                              formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              }
                              parser={(value) =>
                                value.replace(/\$\s?|(,*)/g, "")
                              }
                            />
                          </Form.Item>
                        </div>

                        {/* Variant Attributes */}
                        <Form.List name={[name, "attributes"]}>
                          {(
                            attributeFields,
                            { add: addAttribute, remove: removeAttribute }
                          ) => (
                            <>
                              {attributeFields.map(
                                ({
                                  key: attrKey,
                                  name: attrName,
                                  ...restAttrField
                                }) => (
                                  <div
                                    key={attrKey}
                                    className="grid grid-cols-2 gap-4 mt-4"
                                  >
                                    <Form.Item
                                      {...restAttrField}
                                      name={[attrName, "name"]}
                                      label="Attribute Name"
                                      rules={[
                                        { required: true, message: "Required" },
                                      ]}
                                    >
                                      <Input placeholder="e.g. Color, Size" />
                                    </Form.Item>

                                    <Form.Item
                                      {...restAttrField}
                                      name={[attrName, "value"]}
                                      label="Attribute Value"
                                      rules={[
                                        { required: true, message: "Required" },
                                      ]}
                                    >
                                      <Input placeholder="e.g. Red, XL" />
                                    </Form.Item>

                                    <Button
                                      type="text"
                                      onClick={() => removeAttribute(attrName)}
                                      danger
                                      icon={<MinusCircleOutlined />}
                                    >
                                      Remove Attribute
                                    </Button>
                                  </div>
                                )
                              )}
                              <Button
                                type="dashed"
                                onClick={() => addAttribute()}
                                icon={<PlusOutlined />}
                                className="mt-2"
                              >
                                Add Attribute
                              </Button>
                            </>
                          )}
                        </Form.List>

                        <Form.Item
                          label="Variant Images"
                          tooltip="Upload images for this variant (max 5 images)"
                        >
                          <Upload.Dragger
                            accept=".jpg,.jpeg,.png,.webp,.gif"
                            maxCount={5}
                            multiple={true}
                            beforeUpload={() => false}
                            onChange={(info) =>
                              handleVariantImageChange(info, name)
                            }
                            fileList={
                              variantImageUrls[name]?.map((url, idx) => ({
                                uid: `-${idx}`,
                                name: `variant-${name}-image-${idx}`,
                                status: "done",
                                url: url,
                              })) || []
                            }
                            listType="picture-card"
                          >
                            <div className="p-4">
                              <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                              </p>
                              <p className="ant-upload-text">
                                Click or drag variant images to upload
                              </p>
                              <p className="ant-upload-hint">
                                Support for up to 5 images per variant
                              </p>
                            </div>
                          </Upload.Dragger>
                        </Form.Item>

                        <Button
                          type="text"
                          onClick={() => remove(name)}
                          danger
                          className="mt-4"
                        >
                          Remove Variant
                        </Button>
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()} block>
                      Add Variant
                    </Button>
                  </>
                )}
              </Form.List>
            )}

            {/* Rating & Review Count (read-only in edit mode) */}
            {!isAdd && (
              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="rating" label="Rating">
                  <InputNumber
                    className="w-full"
                    min={0}
                    max={5}
                    step={0.1}
                    disabled
                  />
                </Form.Item>

                <Form.Item name="reviewCount" label="Review Count">
                  <InputNumber className="w-full" min={0} disabled />
                </Form.Item>
              </div>
            )}

            {/* Status */}
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select
                placeholder="Select status"
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "draft", label: "Draft" },
                ]}
              />
            </Form.Item>

            {/* Product Flags */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Form.Item
                name="isFeatured"
                label="Featured"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item name="isNew" label="New" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="onSale" label="On Sale" valuePropName="checked">
                <Switch onChange={handleSaleToggle} />
              </Form.Item>
            </div>

            {/* Sale Information */}
            <div className="border p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Sale Information</h3>
                <Tooltip title="Configure product sale details">
                  <InfoCircleOutlined />
                </Tooltip>
              </div>

              <Form.Item name="onSale" label="On Sale" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.onSale !== currentValues.onSale
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("onSale") && (
                    <div className="grid grid-cols-2 gap-4">
                      <Form.Item
                        name="salePrice"
                        label="Sale Price"
                        rules={[
                          {
                            required: true,
                            message: "Please enter sale price",
                          },
                          {
                            type: "number",
                            min: 0,
                            message: "Sale price must be positive",
                          },
                          {
                            validator: async (_, value) => {
                              const regularPrice = getFieldValue("price");
                              if (value >= regularPrice) {
                                throw new Error(
                                  "Sale price must be less than regular price"
                                );
                              }
                            },
                          },
                        ]}
                      >
                        <InputNumber
                          className="w-full"
                          formatter={(value) =>
                            `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                      </Form.Item>

                      <Form.Item
                        name="salePercentage"
                        label="Sale Percentage"
                        rules={[
                          {
                            type: "number",
                            min: 0,
                            max: 100,
                            message: "Percentage must be between 0 and 100",
                          },
                        ]}
                      >
                        <InputNumber
                          className="w-full"
                          formatter={(value) => `${value}%`}
                          parser={(value) => value.replace("%", "")}
                        />
                      </Form.Item>

                      <Form.Item
                        name="saleStartDate"
                        label="Sale Start Date"
                        rules={[
                          {
                            required: true,
                            message: "Please select sale start date",
                          },
                        ]}
                      >
                        <DatePicker
                          className="w-full"
                          showTime={{ format: "HH:mm:ss" }}
                          format="YYYY-MM-DD HH:mm:ss"
                          placeholder="Select date and time"
                        />
                      </Form.Item>

                      <Form.Item
                        name="saleEndDate"
                        label="Sale End Date"
                        rules={[
                          {
                            required: true,
                            message: "Please select sale end date",
                          },
                          {
                            validator: async (_, value) => {
                              const startDate =
                                form.getFieldValue("saleStartDate");
                              if (
                                startDate &&
                                value &&
                                value.isBefore(startDate)
                              ) {
                                throw new Error(
                                  "End date must be after start date"
                                );
                              }
                            },
                          },
                        ]}
                      >
                        <DatePicker
                          className="w-full"
                          showTime={{ format: "HH:mm:ss" }}
                          format="YYYY-MM-DD HH:mm:ss"
                          placeholder="Select date and time"
                        />
                      </Form.Item>
                    </div>
                  )
                }
              </Form.Item>
            </div>

            {/* Tags */}
            <Form.Item name="tags" label="Tags">
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Add tags"
                open={false}
              />
            </Form.Item>

            {/* Seller Information */}
            <Form.Item
              name={["seller", "id"]}
              label="Seller"
              rules={[{ required: true, message: "Please select seller" }]}
            >
              <Select
                placeholder="Select seller"
                options={
                  sellers &&
                  sellers.length > 0 &&
                  sellers.map((seller) => ({
                    value: seller.id,
                    label: seller.name,
                  }))
                }
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Drawer>
  );
};

export default CreateProduct;
