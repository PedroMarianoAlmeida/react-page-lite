import React from "react";

interface IslandProps {
  children: React.ReactElement;
  [key: string]: any; // Allow any additional props to be passed through as data attributes
}

// Counter for unique IDs
let islandCounter = 0;

export const Island = ({ children, ...dataProps }: IslandProps) => {
  // Automatically derive component name from children
  const getComponentName = (): string => {
    const type = children.type;
    if (typeof type === 'function') {
      const displayName = 'displayName' in type && typeof type.displayName === 'string'
        ? type.displayName
        : undefined;
      return type.name || displayName || 'Unknown';
    }
    return 'Unknown';
  };

  const componentName = getComponentName();

  // Generate unique ID for this island instance
  const instanceId = ++islandCounter;
  const islandId = `island-${instanceId}`;

  // Extract props from children (excluding key, ref, etc.)
  const childProps = children.props && typeof children.props === 'object' && children.props !== null
    ? children.props
    : {};

  // Merge child props with passed props, child props take precedence
  const allProps = {
    ...(typeof dataProps === 'object' && dataProps !== null ? dataProps : {}),
    ...(typeof childProps === 'object' && childProps !== null ? childProps : {})
  };

  return (
    <>
      {/* Server-side rendered component (static) */}
      <div
        id={islandId}
        data-island={componentName}
        data-props={JSON.stringify(allProps)}
      >
        {children}
      </div>
      {/* Island renderer script */}
      <script
        type="module"
        src="./islandRender.js"
        defer
      />
    </>
  );
};
