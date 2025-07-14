import * as React from "react";

const Card = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={
      "bg-white border border-gray-200 rounded-[12px] shadow-sm px-6 py-6 " +
      className
    }
    {...props}
  />
));
Card.displayName = "Card";

export { Card }; 