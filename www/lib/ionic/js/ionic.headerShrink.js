angular.module('ionic.ion.headerShrink', [])

.directive('headerShrink', function($document) {
  var fadeAmt;

  var shrink = function(header, content, amt, max) {
    amt = Math.min(max, amt);
    fadeAmt = 1 - amt / max;
    ionic.requestAnimationFrame(function() {
      header.style[ionic.CSS.TRANSFORM] = 'translate3d(0, -' + amt + 'px, 0)';
      for(var i = 0, j = header.children.length; i < j; i++) {
        header.children[i].style.opacity = fadeAmt;
      }
    });
  };

  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      var starty = $scope.$eval($attr.headerShrink) || 0;
      var shrinkAmt;

      var amt;

      var y = 0;
      var prevY = 0;
      var scrollDelay = 0.4;

      var fadeAmt;
      
      var header = $document[0].body.querySelector('ion-header-bar');
      var headHeight = header.offsetHeight;
      
      
      var profile = $document[0].body.querySelector('#profile');
      var headerHeight = profile.offsetHeight;
     
      
      var nameCard = $document[0].body.querySelector('#name-card');
      var nameCardHeight = nameCard.offsetHeight;
      

      function onScroll(e) {
        var scrollTop = e.target.scrollTop;

        if(scrollTop >= 0) {
          y = Math.min(headerHeight / scrollDelay, Math.max(0, y + scrollTop - prevY));
        } else {
          y = 0;
        }
        


        ionic.requestAnimationFrame(function() {
          fadeAmt = 1 - (y / headerHeight);
          profile.style[ionic.CSS.TRANSFORM] = 'translate3d(0, ' + -y + 'px, 0)';
          /*for(var i = 0, j = profile.children.length; i < j; i++) {
            profile.children[i].style.opacity = fadeAmt;
          }*/
          $document[0].body.querySelector('#profile .image-profile').style.opacity = fadeAmt;
          //$document[0].body.querySelector('#profile #name-card').style.position = 'fixed !important';
         // $document[0].body.querySelector('#profile #name-card').style.top = '100px';
          
        });

        prevY = scrollTop;
      }

      $element.bind('scroll', onScroll);
    }
  }
})

