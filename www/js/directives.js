angular.module('starter.directives', [])

.directive('uiSelectAll', ['$filter', function($filter) {
    return {
        restrict: 'E',
        template: '<input type="checkbox">',
        replace: true,
        link: function(scope, iElement, iAttrs) {
            function changeState(checked, indet) {
                iElement.prop('checked', checked).prop('indeterminate', indet);
            }
            function updateItems() {
                angular.forEach(scope.$eval(iAttrs.items), function(el) {
                    el[iAttrs.prop] = iElement.prop('checked');
                });
            }
            iElement.bind('change', function() {
                scope.$apply(function() { updateItems(); });
            });
            scope.$watch(iAttrs.items, function(newValue) {
                var checkedItems = $filter('filter')(newValue, function(el) {
                    return el[iAttrs.prop];
                });
                switch(checkedItems ? checkedItems.length : 0) {
                    case 0:                // none selected
                        changeState(false, false);
                        break;
                    case newValue.length:  // all selected
                        changeState(true, false);
                        break;
                    default:               // some selected
                        changeState(false, true);
                }
            }, true);
            updateItems();
        }
     };
}])
.directive('onValidSubmit', ['$parse', '$timeout', function($parse, $timeout) {
    return {
      require: '^form',
      restrict: 'A',
      link: function(scope, element, attrs, form) {
        form.$submitted = false;
        var fn = $parse(attrs.onValidSubmit);
        element.on('submit', function(event) {
          scope.$apply(function() {
            element.addClass('ng-submitted');
            form.$submitted = true;
            if (form.$valid) {
              if (typeof fn === 'function') {
                fn(scope, {$event: event});
              }
            }
          });
        });
      }
    }

  }])
  .directive('validated', ['$parse', function($parse) {
    return {
      restrict: 'AEC',
      require: '^form',
      link: function(scope, element, attrs, form) {
        var inputs = element.find("*");
        for(var i = 0; i < inputs.length; i++) {
          (function(input){
            var attributes = input.attributes;
            if (attributes.getNamedItem('ng-model') != void 0 && attributes.getNamedItem('name') != void 0) {
              var field = form[attributes.name.value];
              if (field != void 0) {
                scope.$watch(function() {
                  return form.$submitted + "_" + field.$valid;
                }, function() {
                  if (form.$submitted != true) return;
                  var inp = angular.element(input);
                  if (inp.hasClass('ng-invalid')) {
                    element.removeClass('has-success');
                    element.addClass('has-error');
                  } else {
                    element.removeClass('has-error').addClass('has-success');
                  }
                });
              }
            }
          })(inputs[i]);
        }
      }
    }
  }])
;