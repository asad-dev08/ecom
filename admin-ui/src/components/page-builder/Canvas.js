import React from "react";
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import {
  addElement,
  updateElement,
} from "../../store/page-bulider/pageBuilderSlice";
import RenderElement from "./RenderElement";
import { selectSortedElements } from "../../store/page-bulider/pageBuilderSlice";
import { Empty } from "antd";

const Canvas = () => {
  const dispatch = useDispatch();
  const elements = useSelector(selectSortedElements);
  const rootElements = elements.filter((el) => !el.parentId);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ["element", "new-element"], // Accept both existing and new elements
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return; // Don't handle drop if a child already handled it
      }

      if (item.isNew) {
        // Handle new element from toolbox
        dispatch(
          addElement({
            type: item.type,
            props: item.defaultProps || {},
            styles: {},
          })
        );
      } else {
        // Handle existing element being moved to root
        dispatch(
          updateElement({
            id: item.id,
            updates: {
              parentId: null,
              columnIndex: 0,
              order: rootElements.length,
            },
          })
        );
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }));

  return (
    <div
      ref={drop}
      style={{
        minHeight: "calc(100vh - 40px)",
        padding: "20px",
        backgroundColor: isOver ? "rgba(0,0,0,0.1)" : "transparent",
        transition: "background-color 0.2s ease",
      }}
    >
      {rootElements.length === 0 ? (
        <Empty
          description={
            <div style={{ textAlign: "center" }}>
              <h3>Welcome to the Page Builder!</h3>
              <p>
                Drag elements from the left sidebar to start building your page.
              </p>
              <p>
                You can drag elements to rearrange them and use the properties
                panel on the right to customize them.
              </p>
            </div>
          }
          style={{
            marginTop: "100px",
            padding: "20px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        />
      ) : (
        rootElements.map((element) => (
          <RenderElement
            key={element.id}
            element={element}
            elements={elements}
          />
        ))
      )}
    </div>
  );
};

export default Canvas;
