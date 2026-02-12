import React from "react";
import PropTypes from "prop-types";

export const DeliveryCheckbox = ({ checked, onChange }) => (
  <div className="size-row checkbox-row">
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} />{" "}
      ¿Domicilio?
    </label>
  </div>
);

DeliveryCheckbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};
