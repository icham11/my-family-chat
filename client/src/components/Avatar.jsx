import React from "react";

const Avatar = ({ url, name, size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const finalUrl = url?.startsWith("http")
    ? url
    : `http://localhost:3000${url}`;

  return (
    <div
      className={`relative rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 ${sizeClasses[size]} ${className}`}
    >
      {url ? (
        <img
          src={finalUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={`absolute inset-0 flex items-center justify-center font-bold text-white ${
          url ? "hidden" : "flex"
        }`}
      >
        {getInitials(name)}
      </div>
    </div>
  );
};

export default Avatar;
