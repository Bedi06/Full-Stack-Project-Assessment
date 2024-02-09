import React from "react";

function Header({ search, onSearch }) {
  const handleSearch = (event) => {
    const newSearch = event.target.value;
    onSearch(newSearch);
  };

  return (
    <nav
      className="navbar navbar-light  navbar-expand-lg "
      style={{ backgroundColor: "#3F647F" }}
    >
      <span className="navbar-brand">Video Recommendation</span>
      <form className="form-inline">
        <input
          className="form-control mr-sm-2 nav-form"
          type="search"
          placeholder="Search"
          aria-label="Search"
          value={search}
          onChange={handleSearch}
        />
        <button className="btn btn-outline-success my-2 my-sm-0" type="submit">
          Search
        </button>
      </form>
    </nav>
  );
}

export default Header;
