import React from "react";
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import {
  updateElement,
  addElement,
} from "../../store/page-bulider/pageBuilderSlice";
import { PlusOutlined } from "@ant-design/icons";

const DropZone = ({ parentId, columnIndex = 0, index, isEmpty }) => {
  const dispatch = useDispatch();

  const [{ isOver }, drop] = useDrop({
    accept: ["element", "new-element"],
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return;
      }

      if (item.isNew) {
        dispatch(
          addElement({
            type: item.type,
            props: item.defaultProps || {},
            styles: item.defaultStyles || {},
            parentId,
            columnIndex,
            order: index,
          })
        );
      } else {
        dispatch(
          updateElement({
            id: item.id,
            updates: {
              parentId,
              columnIndex,
              order: index,
            },
          })
        );
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  return (
    <div
      ref={drop}
      className={`dropzone ${isOver ? "is-over" : ""} ${
        isEmpty ? "empty" : ""
      }`}
    >
      <div className="dropzone-content">
        <div className="dropzone-icon">
          <PlusOutlined style={{ fontSize: "20px", opacity: 0.5 }} />
        </div>
        <div className="dropzone-text">
          {isEmpty ? "Drag elements here" : "Drop here to add elements"}
        </div>
      </div>
    </div>
  );
};

export default DropZone;
