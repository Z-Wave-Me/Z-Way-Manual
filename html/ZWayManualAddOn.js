var link = location.href.substr(location.href.lastIndexOf('/') + 1);
var indx = link.indexOf('#');
var chapterName = (indx > -1 ? link.substr(0, indx) : link) || "__FrontPage__";
var sectionName = indx > -1 ? link.substr(indx + 1) : "";

// delete unused br in the TOC
document.querySelectorAll('#TOC > ul > li > br').forEach(function(br) { br.remove(); });
// delete link to TOC from TOC
document.querySelector('#TOC > ul > li a[href="Contents.html"]').parentElement.remove()

// collapse all chapters but current
document.querySelectorAll('#TOC > ul > li').forEach(function(n) {
  if (n.querySelector('a').href.indexOf('/' + chapterName) === -1 ) {
    var ul = n.querySelector('ul');
    if (ul) {
      ul.style.display='none'
    }
  }
});

// mark in bold current item and scroll in the center
function hiliteTOCElement(section) {
  var oldItem = document.querySelector('#TOC ul li a.tocCurrentItem');
  if (oldItem) oldItem.classList.remove("tocCurrentItem");

  var curItem = document.querySelector('#TOC ul li a[href="' + chapterName + '#' + section + '"]');
  if (curItem) {
    curItem.classList.add("tocCurrentItem");
    curItem.scrollIntoView({block: 'center'});
  }

  if (history.pushState) {
    history.pushState(null, null, '#' + section);
  }
}

hiliteTOCElement(sectionName);

// find absolute position of an element
function absTop(element) {
  var top = 0;
  do {
    top += element.offsetTop  || 0;
    element = element.offsetParent;
  } while(element);

  return top;
}

var anchorPositions = {};
// refresh to update positions on images load and window resize
setInterval(function() {
  document.querySelectorAll('a[id]').forEach(function(a) {
    // the link is SECTION and there is a reference in TOC
    if (a.id.startsWith("SECTION") && document.querySelector('#TOC > ul > li a[href="' + chapterName + '#' + a.id + '"]')) {
      anchorPositions[a.id] = absTop(a);
    }
  });
}, 10*1000);

document.addEventListener("scroll", function(){
  var top = document.documentElement.scrollTop + 10; // +10 to make sure the same section is active when we click on it

  var dist = null;
  var closest = "";
  Object.keys(anchorPositions).forEach(function(id) {
    if (dist === null || (0 < top - anchorPositions[id] && top - anchorPositions[id] < dist)) {
      dist = top - anchorPositions[id];
      closest = id;
    }
  });
  hiliteTOCElement(closest);
});

document.addEventListener('DOMContentLoaded', function() {
  var toc = document.querySelector('#TOC');
  var tocOpen = document.querySelector('.toc-open');

  tocOpen.addEventListener('click', function() {
    var isOpen = toc.classList.contains('open');
    if (isOpen) {
      toc.classList.remove('open');
    } else {
      toc.classList.add('open');
    }
  });

  var tocClose = document.querySelector('#CHILD_LINKS');

  tocClose.addEventListener('click', function() {
    var isOpen = toc.classList.contains('open');
    if (isOpen) {
      toc.classList.remove('open');
    } else {
      toc.classList.add('open');
    }
  });

});
