import React from "react";
import TableStyle from "../css/Table.module.css";
import { useTable } from "react-table";

function ReceiptTable({ data }) {
  const columns = React.useMemo(
    () => [
      {
        Header: "가게명",
        accessor: "s_name",
        className: TableStyle.orderTimeCell,
      },
      {
        Header: "상품명",
        accessor: "f_name",
        className: TableStyle.orderTimeCell,
      },
      {
        Header: "수량",
        accessor: "count",
        className: TableStyle.orderMenusCell,
      },
      {
        Header: "가격",
        accessor: "price",
        className: TableStyle.orderMenusCell,
      },
      //   {
      //     Header: "총 금액",
      //     accessor: "orderPrice",
      //     className: TableStyle.orderPriceCell,
      //     Cell: ({ value }) => <div style={{ textAlign: "right" }}>{value}</div>,
      //   },
    ],
    []
  );

  const tableData = React.useMemo(() => data, [data]);

  const tableInstance = useTable({ columns, data: tableData });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const total = React.useMemo(() => {
    let sum = 0;
    data.forEach((item) => {
      sum += item.price * item.count;
    });
    return sum;
  }, [data]);

  return (
    <table {...getTableProps()} className={TableStyle.orderTable}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()} className={TableStyle.orderTH}>
                {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return (
                  <td {...cell.getCellProps()} className={TableStyle.orderTD}>
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td
            colSpan="3"
            style={{ textAlign: "left", fontFamily: "Hahmlet-Medium" }}
          >
            총합계:
          </td>
          <td style={{ textAlign: "center" }}>{total} 원</td>
        </tr>
      </tfoot>
    </table>
  );
}

export default ReceiptTable;
