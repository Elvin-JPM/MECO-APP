import React from "react";
import Select from "react-select";

function CustomDropdown({
  register, // Assuming you're still using `react-hook-form`
  setValue,
  handlePageReset,
  integratedMeters,
  uniqueMeters,
}) {
  // Transform `uniqueMeters` to match `react-select`'s required format
  const options = uniqueMeters?.map((meter) => ({
    value: meter.id_punto_medicion,
    label: meter.description,
  }));

  return (
    <Select
      id="puntoMedicion"
      options={
        integratedMeters ? options : [{ value: "", label: "Loading..." }]
      }
      placeholder="Seleccione una opción"
      isLoading={!integratedMeters} // Adds a loading spinner
      isClearable={true} // Allows clearing the selection (optional)
      onChange={(selectedOption) => {
        const value = selectedOption?.value || ""; // Extract the selected value
        setValue("puntoMedicion", value); // Update the form value using `react-hook-form`
        handlePageReset(); // Reset the page if needed
      }}
      styles={{
        control: (base) => ({
          ...base,
          backgroundColor: "white", // Example for a "white" type
          borderColor: "#ccc",
        }),
      }}
    />
  );
}

export default CustomDropdown;
