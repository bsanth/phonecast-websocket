angular.module("bora", [])
   .controller('TestResultController', function ($scope, $location) {
      var len = $location.search().i;
      $scope.diffs = new Array(len);
      $scope.filterPercent = 0;
      $scope.src = [];
      $scope.results = [];
      $scope.percents = [];
      for(var i = 0; i < len; i++) {
        $scope.src.push("../screenshots/test/" + i + ".jpeg");
        $scope.results.push("../screenshots/run/" + i + ".jpeg");
      }
      for (var i=0; i < len; i++) {
         console.log($scope.src[i], $scope.results[i]);
         (function(cntr){
           resemble($scope.src[i]).compareTo($scope.results[i]).onComplete(function(data){
             console.log("yay", cntr);
             var diffImage = new Image();
             $scope.$apply(function(){
               $scope.diffs[cntr] = data.getImageDataUrl();
               $scope.percents[cntr] = data.misMatchPercentage;
             });
           });
      })(i);
    }
  });
