import ReactDOM from "react-dom/client";
import { ConfigProvider } from "antd";
import App from "./App";
import "./index.css";
import "./styles/custom.css";
import { Provider } from "react-redux";
import store from "./store/store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <Provider store={store}>
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "Roboto, sans-serif",
        },
      }}
    >
      <App />
    </ConfigProvider>
  </Provider>
  // </React.StrictMode>
);
