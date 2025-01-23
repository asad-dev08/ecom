import React from 'react';
import { Button, Form, Input, Space, Table } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const PageSections = ({ sections, setSections, disabled }) => {
  const [form] = Form.useForm();
  const [editingSection, setEditingSection] = React.useState(null);

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      width: '50%',
      render: (content) => (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ),
    },
    {
      title: 'Sequence',
      dataIndex: 'sequence_no',
      key: 'sequence_no',
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_, record, index) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={disabled}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(index)}
            disabled={disabled}
          />
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    form.validateFields().then((values) => {
      setSections([
        ...sections,
        {
          ...values,
          sequence_no: sections.length,
          is_active: true,
        },
      ]);
      form.resetFields();
    });
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    form.setFieldsValue(section);
  };

  const handleUpdate = () => {
    form.validateFields().then((values) => {
      const newSections = sections.map((section) =>
        section === editingSection
          ? { ...values, sequence_no: section.sequence_no, is_active: true }
          : section
      );
      setSections(newSections);
      setEditingSection(null);
      form.resetFields();
    });
  };

  const handleDelete = (index) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    // Update sequence numbers
    newSections.forEach((section, idx) => {
      section.sequence_no = idx;
    });
    setSections(newSections);
  };

  return (
    <div>
      {!disabled && (
        <Form form={form} layout="vertical">
          <Space style={{ width: '100%' }} direction="vertical">
            <Form.Item
              name="title"
              label="Section Title"
              rules={[{ required: true, message: 'Please enter section title' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="content"
              label="Section Content"
              rules={[{ required: true, message: 'Please enter section content' }]}
            >
              <ReactQuill 
                theme="snow"
                style={{ height: '200px', marginBottom: '50px' }}
              />
            </Form.Item>

            <Button 
              type="primary" 
              onClick={editingSection ? handleUpdate : handleAdd}
            >
              {editingSection ? 'Update Section' : 'Add Section'}
            </Button>
            {editingSection && (
              <Button onClick={() => {
                setEditingSection(null);
                form.resetFields();
              }}>
                Cancel Edit
              </Button>
            )}
          </Space>
        </Form>
      )}

      <Table
        style={{ marginTop: '1rem' }}
        columns={columns}
        dataSource={sections}
        rowKey={(record, index) => index}
        pagination={false}
      />
    </div>
  );
};

export default PageSections; 