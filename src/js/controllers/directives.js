import * as Controller from './controller';

export const updateSearchWords = {
  inserted(el, binding) {
    const $searchWord = el.children[0];

    $searchWord.addEventListener('keyup', function() {
      Controller.updateSearchWords($searchWord.value);
    });
  }
};

export const menu = {
  update(el, binding) {
    const $html = document.getElementsByTagName('html')[0];

    if (binding.value === 'opened') {
      $html.style.overflow = 'hidden';
    } else {
      $html.style.overflow = 'auto';
    }
  }
};

export const scroll = {
  update(el, binding) {
    const name = binding.value.toLowerCase();
    const $searchBox = document.getElementById('js-search');
    const $destination = document.getElementById(name);
    const $destinationPosition =
      $destination !== null ? $destination.offsetTop : 0;

    if($searchBox !== null) {
      $searchBox.addEventListener('keydown', function(e) {
        if(e.which == 13) {
          window.scrollTo(0, $destinationPosition);
        }
      });
    }

  }

};
