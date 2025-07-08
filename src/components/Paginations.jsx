import React, { useState, useEffect } from "react";
import "./Paginations.css";

function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  pageNumberLimit = 5,
}) {
  const [maxPageNumberLimit, setMaxPageNumberLimit] = useState(pageNumberLimit);
  const [minPageNumberLimit, setMinPageNumberLimit] = useState(0);

  // Calculate total pages
  const pages = [];
  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pages.push(i);
  }

  // Handle page click
  const handleClick = (event) => {
    const newPage = Number(event.target.id);
    onPageChange(newPage);
  };

  // Render page numbers with limit
  const renderPageNumbers = pages.map((number) => {
    if (number <= maxPageNumberLimit && number > minPageNumberLimit) {
      return (
        <li
          key={number}
          id={number}
          onClick={handleClick}
          className={currentPage === number ? "active" : ""}
        >
          {number}
        </li>
      );
    }
    return null;
  });

  // Handle Next button
  const handleNextBtn = () => {
    const newPage = currentPage + 1;
    onPageChange(newPage);

    if (newPage > maxPageNumberLimit) {
      setMaxPageNumberLimit(maxPageNumberLimit + pageNumberLimit);
      setMinPageNumberLimit(minPageNumberLimit + pageNumberLimit);
    }
  };

  // Handle Previous button
  const handlePrevBtn = () => {
    const newPage = currentPage - 1;
    onPageChange(newPage);

    if ((newPage - 1) % pageNumberLimit === 0) {
      setMaxPageNumberLimit(maxPageNumberLimit - pageNumberLimit);
      setMinPageNumberLimit(minPageNumberLimit - pageNumberLimit);
    }
  };

  // Ellipsis for page numbers
  let pageIncrementBtn = null;
  if (pages.length > maxPageNumberLimit) {
    pageIncrementBtn = <li onClick={handleNextBtn}> … </li>;
  }

  let pageDecrementBtn = null;
  if (minPageNumberLimit >= 1) {
    pageDecrementBtn = <li onClick={handlePrevBtn}> … </li>;
  }

  // Reset page limits when itemsPerPage or totalItems change
  useEffect(() => {
    setMaxPageNumberLimit(pageNumberLimit);
    setMinPageNumberLimit(0);
  }, [itemsPerPage, totalItems, pageNumberLimit]);

  return (
    <ul className="pageNumbers">
      <li>
        <button
          onClick={handlePrevBtn}
          disabled={currentPage === pages[0]}
        >
          Prev
        </button>
      </li>
      {pageDecrementBtn}
      {renderPageNumbers}
      {pageIncrementBtn}
      <li>
        <button
          onClick={handleNextBtn}
          disabled={currentPage === pages[pages.length - 1]}
        >
          Next
        </button>
      </li>
    </ul>
  );
}

export default Pagination;