import React, { useState, useEffect, useCallback } from "react";
import { Input, Select, Table, Pagination } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const PaginatedDataGrid = ({
  columns,
  fetchData,
  defaultSorting = [{ field: "id", order: "desc" }],
  searchValues,
  globalSearchTerm,
  selectionType,
  setSelectedRows,
  isActionCalled,
  isSearchCalled,
  setIsSearchCalled,
  refresh,
  renderKey,
}) => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({});
  const [sorting, setSorting] = useState(defaultSorting);
  const [loading, setLoading] = useState(false);

  // Reset sorting when defaultSorting changes
  useEffect(() => {
    setSorting(defaultSorting);
  }, [defaultSorting]);

  // Add filter components to columns
  const enhancedColumns = columns.map((column) => {
    if (!column.filterable) return column;

    const filterProps = {
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => {
        if (column.filterType === "search") {
          return (
            <div style={{ padding: 8 }}>
              <Input
                placeholder={`Search ${column.title}`}
                value={selectedKeys[0]}
                onChange={(e) =>
                  setSelectedKeys(e.target.value ? [e.target.value] : [])
                }
                onPressEnter={() =>
                  handleFilter(selectedKeys, confirm, column.dataIndex)
                }
                style={{ width: 188, marginBottom: 8, display: "block" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() =>
                    handleFilter(selectedKeys, confirm, column.dataIndex)
                  }
                  type="primary"
                  size="small"
                >
                  Search
                </button>
                <button onClick={clearFilters} size="small">
                  Reset
                </button>
              </div>
            </div>
          );
        }
        if (column.filterType === "select") {
          return (
            <div style={{ padding: 8 }}>
              <Select
                style={{ width: 188, marginBottom: 8 }}
                value={selectedKeys[0]}
                onChange={(value) =>
                  setSelectedKeys(value !== undefined ? [value] : [])
                }
                options={column.filterOptions.map((option) => ({
                  ...option,
                  text: option.text || option.label,
                  label: option.label || option.text,
                }))}
                allowClear
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() =>
                    handleFilter(selectedKeys, confirm, column.dataIndex)
                  }
                  type="primary"
                  size="small"
                >
                  Filter
                </button>
                <button onClick={clearFilters} size="small">
                  Reset
                </button>
              </div>
            </div>
          );
        }
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    };

    return { ...column, ...filterProps };
  });

  const handleFilter = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setFilters((prev) => ({
      ...prev,
      [dataIndex]: selectedKeys[0],
    }));
  };

  const handleTableChange = (pagination, filters, sorter) => {
    // Handle multiple sorters
    const newSorting = Array.isArray(sorter) ? sorter : [sorter];

    // Convert Ant Design's sort orders to backend format
    const formattedSorting = newSorting
      .filter((sort) => sort.order) // Only include columns that are actually sorted
      .map((sort) => ({
        field: sort.field,
        order: sort.order === "ascend" ? "asc" : "desc",
      }));

    setSorting(formattedSorting.length > 0 ? formattedSorting : defaultSorting);
  };

  const loadData = useCallback(async () => {
    if (loading) return; // Prevent multiple simultaneous calls

    let isMounted = true;
    setLoading(true);

    try {
      const response = await fetchData(
        currentPage,
        rowsPerPage,
        filters,
        sorting,
        globalSearchTerm
      );

      if (isMounted) {
        setData(response.data);
        setTotalItems(response.total);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [
    currentPage,
    rowsPerPage,
    filters,
    sorting,
    fetchData,
    globalSearchTerm,
    loading,
  ]);

  useEffect(() => {
    loadData();
  }, [
    currentPage,
    rowsPerPage,
    // Only include stable dependencies that should trigger a refresh
    JSON.stringify(filters),
    JSON.stringify(sorting),
    globalSearchTerm,
    refresh, // If this prop exists
    renderKey, // If this prop exists
  ]);

  const [summaryData, setSummaryData] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows?.(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.status !== 0 && record.status !== 1,
    }),
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const onShowSizeChange = (current, pageSize) => {
    setCurrentPage(current);
    setRowsPerPage(pageSize);
  };

  const tableProps = {
    className: "custom-table",
    size: "middle",
    dataSource: data,
    columns: columns,
    pagination: false,
    scroll: { x: "800px" },
    summary: (pageData) => {
      if (!summaryData) return null;
      return (
        <Table.Summary.Row>
          <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
          {columns.slice(selectionType ? 0 : 1).map((col, index) => {
            return (
              <Table.Summary.Cell key={index} index={index + 1}>
                {summaryData[col.dataIndex] > 0
                  ? parseFloat(summaryData[col.dataIndex]).toLocaleString(
                      undefined,
                      {
                        maximumFractionDigits: 2,
                      }
                    )
                  : ""}
              </Table.Summary.Cell>
            );
          })}
        </Table.Summary.Row>
      );
    },
  };

  if (selectionType) {
    tableProps.rowSelection = { type: selectionType, ...rowSelection };
  }

  return (
    <div>
      <Table
        {...tableProps}
        columns={enhancedColumns}
        onChange={handleTableChange}
      />
      <div className="text-center my-5">
        <Pagination
          showSizeChanger
          onShowSizeChange={onShowSizeChange}
          onChange={handlePageChange}
          current={currentPage}
          total={totalItems}
          defaultPageSize={10}
          pageSizeOptions={[10, 25, 50, 100, 200]}
        />
      </div>
    </div>
  );
};

export default PaginatedDataGrid;
