import * as Controllers from '../../controllers/controller';

export const navigation = {
  props: {
    seen: Boolean,
    menuStatus: String
  },
  methods: Controllers,
  template: `
    <div id="navigation" v-bind:class="menuStatus">
      <nav>
        <span v-on:click="isOpen()" class="icon close__btn"></span>
        <ul class="nav__list">
          <li class="nav__item active"><a href="/">Home</a></li>
          <li class="nav__item"><a href="/aboutus/">About us</a></li>
          <li class="nav__item"><a href="/philosophy/">Philosophy</a></li>
          <li class="nav__item"><a href="/contact/">Contact</a></li>
          <li class="nav__item"><a href="/voice/">Voice</a></li>
          <li class="nav__item"><a href="#">28Blog</a></li>
          <li class="nav__item"><a href="/links/">Links</a></li>
        </ul>
      </nav>
      <div v-if="seen" class="overlay"></div>
    </div>
  `
};

export const searchBox = {
  props: {
  },
  methods: Controllers,
  template: `
    <div class="search-box">
      <input id="js-search" type="text" placeholder="search name">
      <button v-on:click="updateSearchStatus()">Cancel</button>
    </div>
  `
};

export const scrollToTop = {
  props:{},
  methods: Controllers,
  template: `
    <a class="button--top" href="#app"><img src="../img/button/btn_up.png" alt="" width="66" height="66"/></a>
  `
};