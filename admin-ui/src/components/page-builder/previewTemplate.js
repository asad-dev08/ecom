import ReactDOMServer from "react-dom/server";
import Preview from "./Preview";

export const generatePreviewHTML = (elements) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Preview</title>
    <link href="https://cdn.jsdelivr.net/npm/antd/dist/antd.min.css" rel="stylesheet">
    <script src="https://unpkg.com/@ant-design/icons/dist/index.umd.js"></script>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      
      * {
        box-sizing: border-box;
      }
    </style>
</head>
<body>
    <div id="preview-root">
        ${ReactDOMServer.renderToString(<Preview elements={elements} />)}
    </div>
</body>
</html>
`;
};
