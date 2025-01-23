import {
  Modal,
  Tabs,
  Form,
  Radio,
  Switch,
  Slider,
  Select,
  Space,
  Divider,
  Alert,
  message,
} from "antd";
import {
  BulbOutlined,
  BgColorsOutlined,
  LayoutOutlined,
  FontSizeOutlined,
  BorderOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  setThemeMode,
  setColorScheme,
  updateThemeSettings,
  updateUserSettings,
} from "../../store/theme/themeSlice";
import toast from "react-hot-toast";

const FONT_SIZES = {
  xs: "12px",
  sm: "13px",
  base: "14px",
  md: "15px",
  lg: "16px",
  xl: "18px",
  "2xl": "20px",
};

const SettingsDialog = ({ visible, onCancel }) => {
  const dispatch = useDispatch();
  const { mode, scheme, settings } = useSelector((state) => state.theme);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      // Prepare the settings object
      const newSettings = {
        mode: values.mode || mode,
        scheme: values.scheme || scheme,
        settings: {
          ...settings,
          ...values,
        },
      };

      // Dispatch the update action
      await dispatch(updateUserSettings(newSettings)).unwrap();
      window.location.reload();
      toast.success("Settings updated successfully", { duration: 3000 });
      onCancel();
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  return (
    <Modal
      title="Appearance & Layout Settings"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={700}
    >
      <Form
        form={form}
        initialValues={{
          mode,
          scheme,
          // Layout settings
          navigationStyle: settings?.navigationStyle || "sidebar",
          contentWidth: settings?.contentWidth || "fluid",
          fixedHeader: settings?.fixedHeader ?? true,
          fixedSidebar: settings?.fixedSidebar ?? true,
          sidebarCollapsed: settings?.sidebarCollapsed ?? false,
          // Typography settings
          fontSize: settings?.fontSize || "base",
          fontFamily: settings?.fontFamily || "inter",
          // Component settings
          borderRadius: settings?.borderRadius || 6,
          buttonShape: settings?.buttonShape || "default",
          tableSize: settings?.tableSize || "middle",
          // Animation settings
          animations: settings?.animations ?? true,
          pageTransitions: settings?.pageTransitions ?? true,
        }}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Tabs>
          <Tabs.TabPane
            tab={
              <span>
                <BulbOutlined /> Theme
              </span>
            }
            key="theme"
          >
            <Form.Item name="mode" label="Mode">
              <Radio.Group>
                <Radio.Button value="light">Light</Radio.Button>
                <Radio.Button value="dark">Dark</Radio.Button>
                <Radio.Button value="auto">Auto</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="scheme" label="Color Scheme">
              <Radio.Group>
                <Radio.Button value="normal">Normal</Radio.Button>
                <Radio.Button value="ocean">Ocean</Radio.Button>
                <Radio.Button value="forest">Forest</Radio.Button>
                <Radio.Button value="nordic">Nordic</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                <FontSizeOutlined /> Typography
              </span>
            }
            key="typography"
          >
            <Alert
              type="warning"
              message="This will affect the overall text size of the application"
            />
            <Form.Item name="fontSize" label="Base Font Size">
              <Radio.Group buttonStyle="solid">
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  {Object.entries(FONT_SIZES).map(([size, value]) => (
                    <Radio.Button
                      key={size}
                      value={size}
                      style={{
                        minWidth: "80px",
                        textAlign: "center",
                        fontSize: value,
                      }}
                    >
                      {size.toUpperCase()}
                      <div
                        style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)" }}
                      >
                        {value}
                      </div>
                    </Radio.Button>
                  ))}
                </div>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              name="fontFamily"
              label="Font Family"
              extra="Choose the primary font family for the application"
            >
              <Select>
                <Select.Option value="inter">Inter</Select.Option>
                <Select.Option value="roboto">Roboto</Select.Option>
                <Select.Option value="opensans">Open Sans</Select.Option>
                <Select.Option value="poppins">Poppins</Select.Option>
                <Select.Option value="sourcesans">
                  Source Sans Pro
                </Select.Option>
                <Select.Option value="system">System Default</Select.Option>
              </Select>
            </Form.Item>

            <Divider />

            <Form.Item
              name="headingScale"
              label="Heading Scale"
              extra="Adjust the size ratio between different heading levels"
            >
              <Radio.Group>
                <Radio.Button value="compact">Compact</Radio.Button>
                <Radio.Button value="default">Default</Radio.Button>
                <Radio.Button value="large">Large</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                <BorderOutlined /> Components
              </span>
            }
            key="components"
          >
            <Form.Item name="borderRadius" label="Border Radius">
              <Slider
                min={0}
                max={16}
                marks={{
                  0: "0px",
                  4: "4px",
                  8: "8px",
                  16: "16px",
                }}
              />
            </Form.Item>

            <Form.Item name="buttonShape" label="Button Shape">
              <Radio.Group>
                <Radio.Button value="default">Default</Radio.Button>
                <Radio.Button value="round">Round</Radio.Button>
                <Radio.Button value="circle">Circle</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="tableSize" label="Table Size">
              <Radio.Group>
                <Radio.Button value="small">Small</Radio.Button>
                <Radio.Button value="middle">Middle</Radio.Button>
                <Radio.Button value="large">Large</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                <ControlOutlined /> Advanced
              </span>
            }
            key="advanced"
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Form.Item name="animations" valuePropName="checked">
                <Switch
                  checkedChildren="Interface Animations"
                  unCheckedChildren="Interface Animations"
                />
              </Form.Item>

              <Form.Item name="pageTransitions" valuePropName="checked">
                <Switch
                  checkedChildren="Page Transitions"
                  unCheckedChildren="Page Transitions"
                />
              </Form.Item>
            </Space>
          </Tabs.TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default SettingsDialog;
