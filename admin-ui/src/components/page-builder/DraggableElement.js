import React from "react";
import { useDrag } from "react-dnd";
import { Card } from "antd";

const DraggableElement = ({ type, label, icon, defaultProps }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "new-element",
    item: {
      type,
      defaultProps,
      isNew: true,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
        minWidth: 120,
      }}
    >
      <Card
        size="small"
        style={{
          marginBottom: 8,
          transition: "all 0.3s",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          },
        }}
      >
        <div
          style={{
            display: "flex",
            //flex: 1,
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          {icon}
          <span className="text-sm break-all">{label}</span>
        </div>
      </Card>
    </div>
  );
};

export default DraggableElement;
