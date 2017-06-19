let Store = {
  state: {
    menuStatus: "closed",
    seen: false,
    searchStatus: "contracted",
    isExpanded: false,
    searchWords: ""
  },

  isOpen() {
    this.state.menuStatus === "closed" ?
      this.state.menuStatus = "opened" :
      this.state.menuStatus = "closed";

    this.state.seen === false ? this.state.seen = true : this.state.seen = false;
  },

  updateSearchStatus() {
    this.state.searchStatus === "contracted" ?
      this.state.searchStatus = "expanded" :
      this.state.searchStatus = "contracted";

    this.state.isExpanded === false ?
      this.state.isExpanded = true :
      this.state.isExpanded = false;
  },

  isExpanded() {
    this.state.searchStatus === "contracted" ?
      this.state.isExpanded = false :
      this.state.isExpanded = true;
  },

  updateSearchWords(name) {
    this.state.searchWords = name;
  }
};

export default Store;
