import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { saveAs } from 'file-saver';

const API_BASE_URL = "http://localhost:8080/api/rules";

const defaultVisibleFieldsCount = 5;

function App() {
  const [fields, setFields] = useState([]);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [editVisibleFields, setEditVisibleFields] = useState([]);
  const [editDropdownFields, setEditDropdownFields] = useState([]);
  const [editSelectedDropdownFields, setEditSelectedDropdownFields] = useState([]);

  const [addItem, setAddItem] = useState(null);

  const fetchFields = async () => {
    try {
      const res = await axios.get(\`\${API_BASE_URL}/fields\`);
      setFields(res.data);
    } catch (error) {
      console.error("Error fetching fields:", error);
    }
  };

  const fetchData = async (page, size) => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE_URL, {
        params: { page, size },
      });
      setData(res.data.data);
      setTotal(res.data.total);
      setPage(res.data.page);
      setSize(res.data.size);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    if (fields.length > 0) {
      fetchData(page, size);
    }
  }, [fields, page, size]);

  // Pagination handlers
  const totalPages = Math.ceil(total / size);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleSizeChange = (e) => {
    setSize(parseInt(e.target.value));
    setPage(0);
  };

  // Edit handlers
  const openEdit = (item) => {
    setEditItem(item);
    const visible = fields.slice(0, defaultVisibleFieldsCount);
    const dropdown = fields.slice(defaultVisibleFieldsCount);
    setEditVisibleFields(visible);
    setEditDropdownFields(dropdown);
    setEditSelectedDropdownFields([]);
  };

  const closeEdit = () => {
    setEditItem(null);
    setEditSelectedDropdownFields([]);
  };

  const handleEditFieldChange = (field, value) => {
    setEditItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDropdownChange = (selectedOptions) => {
    setEditSelectedDropdownFields(selectedOptions || []);
  };

  const saveEdit = async () => {
    try {
      // Compose updated fields
      const updatedFields = {};
      [...editVisibleFields, ...editSelectedDropdownFields.map((opt) => opt.value)].forEach((field) => {
        updatedFields[field] = editItem[field] || "";
      });

      // Call API to update
      await axios.put(\`\${API_BASE_URL}/\${editItem.id || ""}\`, updatedFields);
      closeEdit();
      fetchData(page, size);
    } catch (error) {
      console.error("Error saving edit:", error);
    }
  };

  // Add handlers
  const openAdd = () => {
    const newItem = {};
    fields.forEach((f) => {
      newItem[f] = "";
    });
    setAddItem(newItem);
  };

  const closeAdd = () => {
    setAddItem(null);
  };

  const handleAddFieldChange = (field, value) => {
    setAddItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveAdd = async () => {
    try {
      await axios.post(API_BASE_URL, addItem);
      closeAdd();
      fetchData(page, size);
    } catch (error) {
      console.error("Error saving add:", error);
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (data.length === 0) return;
    const csvRows = [];
    // Header
    csvRows.push(fields.join(","));
    // Data rows
    data.forEach((row) => {
      const values = fields.map((field) => {
        const val = row[field];
        if (val === null || val === undefined) return "";
        return \`"\${val.toString().replace(/"/g, '""')}"\`;
      });
      csvRows.push(values.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "reguler_rules_export.csv");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">Reguler Rules</h1>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <label htmlFor="pageSize" className="mr-2 font-medium">
            Rows per page:
          </label>
          <select
            id="pageSize"
            value={size}
            onChange={handleSizeChange}
            className="border rounded px-2 py-1"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div>
          <button
            onClick={openAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Add Rule
          </button>
          <button
            onClick={exportCSV}
            className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {fields.map((field) => (
                <th
                  key={field}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {field}
                </th>
              ))}
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={fields.length + 1} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={fields.length + 1} className="text-center py-4">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {fields.map((field) => (
                    <td key={field} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {row[field]}
                    </td>
                  ))}
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEdit(row)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Rule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {editVisibleFields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">{field}</label>
                  <input
                    type="text"
                    value={editItem[field] || ""}
                    onChange={(e) => handleEditFieldChange(field, e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              ))}

              {editSelectedDropdownFields.map((opt) => (
                <div key={opt.value}>
                  <label className="block text-sm font-medium text-gray-700">{opt.value}</label>
                  <input
                    type="text"
                    value={editItem[opt.value] || ""}
                    onChange={(e) => handleEditFieldChange(opt.value, e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Select
                isMulti
                options={editDropdownFields.map((field) => ({ value: field, label: field }))}
                value={editSelectedDropdownFields}
                onChange={handleDropdownChange}
                placeholder="Select additional fields to edit"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={closeEdit}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addItem && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6">
            <h2 className="text-xl font-semibold mb-4">Add Rule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {fields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">{field}</label>
                  <input
                    type="text"
                    value={addItem[field] || ""}
                    onChange={(e) => handleAddFieldChange(field, e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={closeAdd}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
